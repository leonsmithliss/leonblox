import { Router } from "express";
import { getUncachableStripeClient } from "../stripeClient";

const router = Router();

const PRODUCTS = [
  { name: "FAN Message", key: "fan", amount: 200 },
  { name: "VIP Message", key: "vip", amount: 500 },
  { name: "LEGEND Message", key: "legend", amount: 2000 },
  { name: "Sound Effect", key: "sound", amount: 100 },
];

router.post("/stripe/seed-products", async (req, res) => {
  const secret = req.headers["x-admin-secret"];
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const stripe = await getUncachableStripeClient();
  const results: Record<string, string> = {};

  for (const p of PRODUCTS) {
    const existing = await stripe.products.search({
      query: `metadata['key']:'${p.key}' AND active:'true'`,
    });

    if (existing.data.length > 0) {
      const prices = await stripe.prices.list({ product: existing.data[0].id, active: true, limit: 1 });
      results[p.key] = prices.data[0]?.id ?? "no-price";
      continue;
    }

    const product = await stripe.products.create({
      name: p.name,
      metadata: { key: p.key },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.amount,
      currency: "usd",
    });

    results[p.key] = price.id;
  }

  res.json({ ok: true, priceIds: results });
});

export default router;
