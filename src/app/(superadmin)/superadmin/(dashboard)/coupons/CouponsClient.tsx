"use client";

import { useState } from "react";
import { saveCoupon } from "../../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";

export function CouponsClient({ initialCoupons }: { initialCoupons: any[] }) {
  const [code, setCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveCoupon({
        code,
        discountAmount: parseFloat(discountAmount),
        discountType,
        maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : undefined
      });
      toast.success("Coupon created successfully");
      setCode("");
      setDiscountAmount("");
      setMaxRedemptions("");
    } catch (err) {
      toast.error("Failed to create coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-zinc-950 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle>Create New Coupon</CardTitle>
          <CardDescription className="text-zinc-400">Generate discount codes for promotions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input 
                id="code"
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                className="bg-zinc-950 border-zinc-800 uppercase"
                placeholder="SUMMER20"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountAmount">Discount Amount</Label>
                <Input 
                  id="discountAmount"
                  type="number"
                  value={discountAmount} 
                  onChange={(e) => setDiscountAmount(e.target.value)} 
                  className="bg-zinc-950 border-zinc-800"
                  placeholder="20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <select 
                  id="discountType"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={discountType} 
                  onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRedemptions">Max Redemptions (Optional)</Label>
              <Input 
                id="maxRedemptions"
                type="number"
                value={maxRedemptions} 
                onChange={(e) => setMaxRedemptions(e.target.value)} 
                className="bg-zinc-950 border-zinc-800"
                placeholder="100"
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Coupon"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
          <CardDescription className="text-zinc-400">Manage your active discount codes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {initialCoupons.length === 0 ? (
              <p className="text-zinc-500 text-sm">No coupons created yet.</p>
            ) : (
              initialCoupons.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {c.code}
                      {c.isActive ? 
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Active</span> :
                        <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">Inactive</span>
                      }
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {c.discountAmount}{c.discountType === 'percentage' ? '%' : '$'} Off
                      {c.maxRedemptions && ` • Max ${c.maxRedemptions} redemptions`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
