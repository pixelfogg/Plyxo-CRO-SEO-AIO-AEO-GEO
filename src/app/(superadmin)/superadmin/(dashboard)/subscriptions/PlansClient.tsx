"use client";

import { useState, useRef } from "react";
import { savePlan, updatePlan, togglePlanStatus, deletePlan } from "../../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Pencil, Sparkles, CreditCard, X, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function PlansClient({ initialPlans }: { initialPlans: any[] }) {
  const formRef = useRef<HTMLDivElement>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [maxProjects, setMaxProjects] = useState("");
  const [maxScans, setMaxScans] = useState("");
  const [tokensAllowed, setTokensAllowed] = useState("");
  const [dodoProductId, setDodoProductId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEditingPlanId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCurrency("USD");
    setInterval("month");
    setMaxProjects("");
    setMaxScans("");
    setTokensAllowed("");
    setDodoProductId("");
  };

  const applyPresetFree = () => {
    setEditingPlanId(null);
    setName("Free Tier (Card Required)");
    setDescription("Free tier access activated via credit card verification on Dodo Payments.");
    setPrice("0");
    setCurrency("USD");
    setInterval("month");
    setMaxProjects("1");
    setMaxScans("10");
    setTokensAllowed("100000");
    if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
    toast.info("Free Plan template loaded. Enter your Dodo $0 Product ID.");
  };

  const applyPresetPro = () => {
    setEditingPlanId(null);
    setName("Pro Plan");
    setDescription("Full conversion optimization suite for scaling teams and agencies.");
    setPrice("49");
    setCurrency("USD");
    setInterval("month");
    setMaxProjects("");
    setMaxScans("500");
    setTokensAllowed("500000");
    if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
    toast.info("Pro Plan template loaded. Enter your Dodo Pro Product ID.");
  };

  const handleEdit = (p: any) => {
    setEditingPlanId(p.id);
    setName(p.name || "");
    setDescription(p.description || "");
    setPrice(String(p.price ?? "0"));
    setCurrency(p.currency || "USD");
    setInterval((p.interval as "month" | "year") || "month");
    setMaxProjects(p.features?.maxProjects !== undefined && p.features?.maxProjects !== null ? String(p.features.maxProjects) : "");
    setMaxScans(p.features?.maxScans !== undefined && p.features?.maxScans !== null ? String(p.features.maxScans) : "");
    
    const t = p.features?.tokensAllowed ?? p.features?.maxTokens;
    setTokensAllowed(t !== undefined && t !== null ? String(t) : "");
    setDodoProductId(p.dodoProductId || "");
    
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    toast.info(`Editing plan: ${p.name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description,
        price: parseFloat(price) || 0,
        currency,
        interval,
        dodoProductId: dodoProductId || undefined,
        features: {
          maxProjects: maxProjects ? parseInt(maxProjects, 10) : undefined,
          maxScans: maxScans ? parseInt(maxScans, 10) : undefined,
          tokensAllowed: tokensAllowed ? parseInt(tokensAllowed, 10) : undefined
        }
      };

      if (editingPlanId) {
        await updatePlan(editingPlanId, payload);
        toast.success(`Plan "${name}" updated successfully`);
      } else {
        await savePlan(payload);
        toast.success(`Plan "${name}" created successfully`);
      }
      resetForm();
    } catch (err) {
      toast.error(editingPlanId ? "Failed to update plan" : "Failed to create plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await togglePlanStatus(id, !currentStatus);
      toast.success("Plan status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await deletePlan(id);
      if (editingPlanId === id) resetForm();
      toast.success("Plan deleted");
    } catch (err) {
      toast.error("Failed to delete plan");
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. AVAILABLE PLANS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Active Subscription Plans</h2>
            <p className="text-sm text-zinc-400">Plans currently configured and available in your platform.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={applyPresetFree} 
              className="text-xs bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white"
            >
              <CreditCard className="mr-1.5 h-3.5 w-3.5 text-[#cc785c]" />
              + Add Free (Card Required)
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={applyPresetPro} 
              className="text-xs bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              + Add Pro Tier
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialPlans.map(p => {
            const isFreeCard = p.price === 0 || p.name.toLowerCase().includes('free');
            const isEditingThis = editingPlanId === p.id;
            
            return (
              <Card 
                key={p.id} 
                className={`bg-zinc-950 border transition-all text-white flex flex-col justify-between ${
                  isEditingThis 
                    ? 'border-amber-500 ring-1 ring-amber-500/50 shadow-lg' 
                    : isFreeCard 
                    ? 'border-[#cc785c]/40 hover:border-[#cc785c]/70' 
                    : 'border-indigo-500/40 hover:border-indigo-500/70'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {p.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isFreeCard && (
                        <span className="text-[11px] font-medium bg-[#cc785c]/20 text-[#cc785c] border border-[#cc785c]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CreditCard className="h-3 w-3" /> Card Required
                        </span>
                      )}
                      {p.isActive ? (
                        <span className="text-[11px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-2xl font-bold tracking-tight">
                      ${p.price}
                    </span>
                    <span className="text-xs text-zinc-400 ml-1">
                      {p.currency} / {p.interval}
                    </span>
                  </div>

                  {p.description && (
                    <CardDescription className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {p.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-md bg-zinc-900/60 border border-zinc-800 space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-500">Max Projects:</span>
                      <span>{p.features?.maxProjects ?? "Unlimited"}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-500">Scans / Month:</span>
                      <span>{p.features?.maxScans ?? "Unlimited"}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-500">AI Tokens / Month:</span>
                      <span>
                        {p.features?.tokensAllowed 
                          ? new Intl.NumberFormat().format(p.features.tokensAllowed) 
                          : (p.features?.maxTokens ? new Intl.NumberFormat().format(p.features.maxTokens) : "Unlimited")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-md bg-zinc-900/40 border border-zinc-800/80">
                    <span className="text-zinc-500 text-[11px] shrink-0">Dodo Product ID:</span>
                    {p.dodoProductId ? (
                      <span className="font-mono text-[11px] text-zinc-200 truncate bg-zinc-800 px-1.5 py-0.5 rounded">
                        {p.dodoProductId}
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1 font-sans">
                        <AlertCircle className="h-3 w-3 shrink-0" /> Not linked (uses default)
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-zinc-800/60 flex items-center justify-between bg-zinc-900/20">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`active-toggle-${p.id}`} className="text-xs text-zinc-400">Active</Label>
                    <Switch 
                      id={`active-toggle-${p.id}`} 
                      checked={p.isActive} 
                      onCheckedChange={() => handleToggle(p.id, p.isActive)} 
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(p)}
                      className={`text-xs h-8 ${isEditingThis ? 'bg-amber-600 text-white border-amber-500' : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:text-white'}`}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      {isEditingThis ? 'Editing' : 'Edit Plan'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(p.id)}
                      className="text-xs h-8 text-zinc-400 hover:text-red-400 px-2"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 2. PLAN EDITOR / CREATOR FORM */}
      <div ref={formRef} className="pt-4">
        <Card className="bg-zinc-950 border-zinc-800 text-white shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">
                    {editingPlanId ? `Edit Plan: ${name || 'Selected Plan'}` : "Create New Subscription Plan"}
                  </CardTitle>
                  {editingPlanId && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
                      Editing Mode
                    </span>
                  )}
                </div>
                <CardDescription className="text-zinc-400 mt-1">
                  {editingPlanId 
                    ? "Update the plan name, pricing, quotas, and Dodo Payments Product ID below." 
                    : "Fill out the form below or choose a template above to add a new subscription tier."}
                </CardDescription>
              </div>

              {editingPlanId && (
                <Button type="button" variant="outline" size="sm" onClick={resetForm} className="text-xs bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white">
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Cancel Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input 
                    id="name"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="bg-zinc-950 border-zinc-800"
                    placeholder="e.g. Free Tier (Card Required) or Enterprise"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="bg-zinc-950 border-zinc-800"
                    placeholder="Short description displayed to users..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="bg-zinc-950 border-zinc-800"
                    placeholder="0.00 for Free Tier"
                    required
                  />
                  <p className="text-[11px] text-zinc-500">Enter 0 for card-verified free tier.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input 
                    id="currency"
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)} 
                    className="bg-zinc-950 border-zinc-800"
                    placeholder="USD"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">Billing Cycle</Label>
                  <select 
                    id="interval"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
                    value={interval} 
                    onChange={(e) => setInterval(e.target.value as "month" | "year")}
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-semibold mb-3 text-zinc-200">Plan Quotas &amp; Restrictions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxProjects">Max Projects</Label>
                    <Input 
                      id="maxProjects"
                      type="number"
                      value={maxProjects} 
                      onChange={(e) => setMaxProjects(e.target.value)} 
                      className="bg-zinc-950 border-zinc-800"
                      placeholder="e.g. 1 (Leave empty for unlimited)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxScans">Max Scans / Month</Label>
                    <Input 
                      id="maxScans"
                      type="number"
                      value={maxScans} 
                      onChange={(e) => setMaxScans(e.target.value)} 
                      className="bg-zinc-950 border-zinc-800"
                      placeholder="e.g. 10 (Leave empty for unlimited)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokensAllowed">AI Tokens / Month</Label>
                    <Input 
                      id="tokensAllowed"
                      type="number"
                      value={tokensAllowed} 
                      onChange={(e) => setTokensAllowed(e.target.value)} 
                      className="bg-zinc-950 border-zinc-800"
                      placeholder="e.g. 100000 (Leave empty for unlimited)"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <h4 className="text-sm font-semibold text-zinc-200">Dodo Payments Configuration</h4>
                <div className="space-y-2">
                  <Label htmlFor="dodoProductId">Dodo Product ID</Label>
                  <Input 
                    id="dodoProductId"
                    value={dodoProductId} 
                    onChange={(e) => setDodoProductId(e.target.value)} 
                    className="bg-zinc-950 border-zinc-800 font-mono text-sm"
                    placeholder="pdt_0Nls... (created in Dodo Payments Dashboard)"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Enter the Product ID from your Dodo Payments dashboard for this subscription (e.g. a $0 recurring product or Pro tier).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={editingPlanId ? "bg-amber-600 hover:bg-amber-700 text-white font-medium" : "bg-primary text-primary-foreground font-medium"}
                >
                  {isSubmitting ? (editingPlanId ? "Saving Changes..." : "Creating Plan...") : (editingPlanId ? "Save Changes" : "Create Plan")}
                </Button>
                {editingPlanId && (
                  <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
