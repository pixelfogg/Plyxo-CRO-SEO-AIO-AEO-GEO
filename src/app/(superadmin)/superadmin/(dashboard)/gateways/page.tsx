import { db } from '@/db';
import { paymentGateways } from '@/db/schema';
import { GatewaysClient } from './GatewaysClient';

export default async function GatewaysPage() {
  const gateways = await db.select().from(paymentGateways).orderBy(paymentGateways.createdAt);

  return (
    <div className="max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold mb-2">Payment Gateways</h1>
        <p className="text-zinc-400 mb-6">Configure Dodo Payments merchant gateway for user subscriptions.</p>
      </div>
      
      <GatewaysClient initialGateways={gateways} />
    </div>
  );
}
