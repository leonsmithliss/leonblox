import { Router } from "express";
import { getUncachableStripeClient } from "../stripeClient";
import { supabaseAdmin } from "../lib/supabaseAdmin";



const router = Router();

const TIER_KEY: Record<string, string> = {
  fan: "fan",
  vip: "vip",
  legend: "legend",
};

router.post("/stripe/create-checkout", async (req, res) => {
  const { type, tierKey, soundKey, name, message, successPath } = req.body as {
    type: "message" | "sound";
    tierKey?: string;
    soundKey?: string;
    name?: string;
    message?: string;
    successPath?: string;
  };

  if (!type) return res.status(400).json({ error: "Missing type" });

  const stripe = await getUncachableStripeClient();

  const productKey = type === "sound" ? "sound" : TIER_KEY[tierKey ?? ""];
  if (!productKey) return res.status(400).json({ error: "Invalid tier" });

  const allProducts = await stripe.products.list({ active: true, limit: 100 });
  const product = allProducts.data.find((p) => p.metadata?.key === productKey);

  if (!product) {
    return res.status(500).json({ error: `Product '${productKey}' not found in Stripe. Run seed script.` });
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
  if (!prices.data.length) {
    return res.status(500).json({ error: "No active price found for product." });
  }

  const host = `${req.protocol}://${req.get("host")}`;
  const baseSuccess = successPath ?? "/message/success";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: prices.data[0].id, quantity: 1 }],
    mode: "payment",
    success_url: `${host}${baseSuccess}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${host}/message`,
    metadata: {
      type,
      tierKey: tierKey ?? "",
      soundKey: soundKey ?? "",
      name: name ?? "",
      message: message ?? "",
    },
  });

  res.json({ url: session.url });
});

router.get("/stripe/verify-payment", async (req, res) => {
  const { session_id } = req.query as { session_id?: string };
  if (!session_id) return res.status(400).json({ error: "Missing session_id" });

  const stripe = await getUncachableStripeClient();
  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") {
    return res.status(402).json({ error: "Payment not completed" });
  }

  const meta = session.metadata ?? {};
  const { type, soundKey, name, message } = meta;

  if (type === "message" && name && message) {
    const { error } = await supabaseAdmin
      .from("messages")
      .insert([{ msg: message + ". From " + name, played: false }]);
    if (error) req.log.error({ error }, "Supabase insert failed after payment");
  } else if (type === "sound" && soundKey) {
    const { error } = await supabaseAdmin
      .from("messages")
      .insert([{ msg: "", sound: soundKey, played: false }]);
    if (error) req.log.error({ error }, "Supabase insert failed after payment");
  }

  res.json({ ok: true, type, meta });
});

export default router;
