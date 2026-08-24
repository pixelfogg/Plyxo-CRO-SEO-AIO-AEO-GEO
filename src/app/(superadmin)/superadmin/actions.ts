"use server"

import { db } from "@/db";
import { paymentGateways, subscriptionPlans, coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveGateway(data: {
  provider: string;
  apiKey: string;
  secretKey: string;
  webhookSecret: string;
  isDefault: boolean;
}) {
  // If this is set to default, unset others
  if (data.isDefault) {
    await db.update(paymentGateways).set({ isDefault: false });
  }

  const existing = await db.query.paymentGateways.findFirst({
    where: eq(paymentGateways.provider, data.provider)
  });

  if (existing) {
    await db.update(paymentGateways)
      .set(data)
      .where(eq(paymentGateways.id, existing.id));
  } else {
    await db.insert(paymentGateways).values(data);
  }

  revalidatePath("/superadmin/gateways");
  return { success: true };
}

export async function savePlan(data: {
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  dodoProductId?: string;
  features?: any;
}) {
  await db.insert(subscriptionPlans).values({
    name: data.name,
    description: data.description,
    price: data.price,
    currency: data.currency,
    interval: data.interval,
    dodoProductId: data.dodoProductId,
    features: data.features,
    isActive: true,
  });
  revalidatePath("/superadmin/subscriptions");
  return { success: true };
}

export async function updatePlan(id: string, data: {
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  dodoProductId?: string;
  features?: any;
}) {
  await db.update(subscriptionPlans).set({
    name: data.name,
    description: data.description,
    price: data.price,
    currency: data.currency,
    interval: data.interval,
    dodoProductId: data.dodoProductId,
    features: data.features,
    updatedAt: new Date(),
  }).where(eq(subscriptionPlans.id, id));
  revalidatePath("/superadmin/subscriptions");
  return { success: true };
}

export async function togglePlanStatus(id: string, isActive: boolean) {
  await db.update(subscriptionPlans).set({ isActive }).where(eq(subscriptionPlans.id, id));
  revalidatePath("/superadmin/subscriptions");
  return { success: true };
}

export async function deletePlan(id: string) {
  await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  revalidatePath("/superadmin/subscriptions");
  return { success: true };
}

export async function saveCoupon(data: {
  code: string;
  discountAmount: number;
  discountType: "percentage" | "fixed";
  maxRedemptions?: number;
}) {
  await db.insert(coupons).values(data);
  revalidatePath("/superadmin/coupons");
  return { success: true };
}

export async function toggleGatewayStatus(id: string, isActive: boolean) {
  await db.update(paymentGateways).set({ isActive }).where(eq(paymentGateways.id, id));
  revalidatePath("/superadmin/gateways");
  return { success: true };
}
