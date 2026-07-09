import { Router } from "express";
import { getUncachableStripeClient } from "../stripeClient";

const router = Router();

router.post("/stripe/donate", async (req, res) => {
  const { amount } = req.body as { amount?: number };

  if (!amount || amount < 1) {
    return res.status(400).json({ error: "Amount must be at least $1" });
  }

  const stripe = await getUncachableStripeClient();
  const host = `${req.protocol}://${req.get("host")}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Donation to LeonBlox",
            description: "Thank you for supporting LeonBlox!",
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${host}/donate/thanks`,
    cancel_url: `${host}/donate`,
    metadata: { type: "donation", amount: String(amount) },
  });

  res.json({ url: session.url });
});

export default router;
