import { db } from '@/db';
import { subscriptionPlans } from '@/db/schema';
import { PlansClient } from './PlansClient';
import { eq } from 'drizzle-orm';

export default async function SubscriptionsPage() {
  let plansList = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.createdAt);

  // Auto-seed default Free (Card Required) and Pro plans if they don't exist yet
  const hasFree = plansList.some(p => p.price === 0 || p.name.toLowerCase().includes('free'));
  const hasPro = plansList.some(p => p.name.toLowerCase().includes('pro'));

  if (!hasFree) {
    const [freePlan] = await db.insert(subscriptionPlans).values({
      name: "Free Tier (Card Required)",
      description: "Free tier access activated via credit card verification on Dodo Payments.",
      price: 0,
      currency: "USD",
      interval: "month",
      dodoProductId: process.env.DODO_PAYMENTS_PRODUCT_ID_FREE || "",
      isActive: true,
      features: {
        maxProjects: 1,
        maxScans: 10,
        tokensAllowed: 100000,
      }
    }).returning();
    plansList.push(freePlan);
  }

  if (!hasPro && plansList.length === 0) {
    const [proPlan] = await db.insert(subscriptionPlans).values({
      name: "Pro Plan",
      description: "Full conversion optimization suite for scaling teams and agencies.",
      price: 49,
      currency: "USD",
      interval: "month",
      dodoProductId: process.env.DODO_PAYMENTS_PRODUCT_ID_PRO || "pdt_0NlsvrJWYngUz9vWy02Dm",
      isActive: true,
      features: {
        maxProjects: null,
        maxScans: 500,
        tokensAllowed: 500000,
      }
    }).returning();
    plansList.push(proPlan);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Subscriptions & Plans</h1>
        <p className="text-zinc-400">
          Manage your active subscription tiers, link Dodo Payments Product IDs, and configure usage quotas.
        </p>
      </div>
      
      <PlansClient initialPlans={plansList} />
    </div>
  );
}
