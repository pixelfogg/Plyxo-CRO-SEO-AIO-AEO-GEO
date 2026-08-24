"use client";

import { useState } from "react";
import { saveGateway, toggleGatewayStatus } from "../../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";

export function GatewaysClient({ initialGateways }: { initialGateways: any[] }) {
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveGateway({
        provider: "dodo",
        apiKey,
        secretKey: apiKey,
        webhookSecret,
        isDefault,
      });
      toast.success("Dodo Payments gateway saved successfully");
    } catch (err) {
      toast.error("Failed to save gateway");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleGatewayStatus(id, !currentStatus);
      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-zinc-950 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle>Configure Dodo Payments Gateway</CardTitle>
          <CardDescription className="text-zinc-400">
            Set up your Dodo Payments API Key and Webhook Secret to enable subscription billing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Dodo Payments API Key (Bearer Token)</Label>
              <Input 
                id="apiKey"
                type="password"
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                className="bg-zinc-950 border-zinc-800"
                placeholder="test_... or live_..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookSecret">Webhook Signing Secret</Label>
              <Input 
                id="webhookSecret"
                type="password"
                value={webhookSecret} 
                onChange={(e) => setWebhookSecret(e.target.value)} 
                className="bg-zinc-950 border-zinc-800"
                placeholder="whsec_..."
              />
            </div>

            <div className="flex items-center space-x-2 py-4">
              <Switch 
                id="isDefault" 
                checked={isDefault} 
                onCheckedChange={setIsDefault} 
              />
              <Label htmlFor="isDefault">Set as default gateway</Label>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Configuration"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle>Configured Gateways</CardTitle>
          <CardDescription className="text-zinc-400">Manage active payment gateways on your platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {initialGateways.length === 0 ? (
              <p className="text-zinc-500 text-sm">No gateways configured yet. Fill out the form above to activate Dodo Payments.</p>
            ) : (
              initialGateways.map(g => (
                <div key={g.id} className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg">
                  <div>
                    <p className="font-medium capitalize flex items-center gap-2">
                      {g.provider === 'dodo' ? 'Dodo Payments' : g.provider}
                      {g.isDefault && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Default</span>}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {g.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`active-${g.id}`} className="text-xs">Active</Label>
                      <Switch 
                        id={`active-${g.id}`} 
                        checked={g.isActive} 
                        onCheckedChange={() => handleToggle(g.id, g.isActive)} 
                      />
                    </div>
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
