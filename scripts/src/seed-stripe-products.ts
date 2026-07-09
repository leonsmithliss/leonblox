import { getUncachableStripeClient } from './stripeClient';

const PRODUCTS = [
  { name: 'FAN Message', key: 'fan', amount: 200 },
  { name: 'VIP Message', key: 'vip', amount: 500 },
  { name: 'LEGEND Message', key: 'legend', amount: 2000 },
  { name: 'Sound Effect', key: 'sound', amount: 100 },
];

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  for (const p of PRODUCTS) {
    const existing = await stripe.products.search({
      query: `metadata['key']:'${p.key}' AND active:'true'`,
    });

    if (existing.data.length > 0) {
      const prod = existing.data[0];
      const prices = await stripe.prices.list({ product: prod.id, active: true });
      console.log(`Already exists: ${p.name} → price ${prices.data[0]?.id}`);
      continue;
    }

    const product = await stripe.products.create({
      name: p.name,
      metadata: { key: p.key },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.amount,
      currency: 'usd',
    });

    console.log(`Created: ${p.name} ($${p.amount / 100}) → price ${price.id}`);
  }

  console.log('Done.');
}

seedProducts().catch((e) => { console.error(e); process.exit(1); });
