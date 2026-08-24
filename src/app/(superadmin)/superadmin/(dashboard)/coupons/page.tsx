import { db } from '@/db';
import { coupons } from '@/db/schema';
import { CouponsClient } from './CouponsClient';

export default async function CouponsPage() {
  const couponsList = await db.select().from(coupons).orderBy(coupons.createdAt);

  return (
    <div className="max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Coupons & Promotions</h1>
        <p className="text-zinc-400 mb-6">Create and manage discount codes for users.</p>
      </div>
      
      <CouponsClient initialCoupons={couponsList} />
    </div>
  );
}
