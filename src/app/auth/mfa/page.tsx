"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Suspense } from "react";

function MFAChallengeForm() {
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";

  useEffect(() => {
    // Check if the user actually needs to complete MFA
    const checkAAL = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (error) throw error;

        // If they already have AAL2 or don't need it, redirect them back
        if (data.currentLevel === data.nextLevel) {
          router.push(redirectedFrom);
        }
      } catch (err) {
        console.error("Failed to check AAL level:", err);
      } finally {
        setChecking(false);
      }
    };

    checkAAL();
  }, [supabase, router, redirectedFrom]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode) return;
    
    setLoading(true);
    
    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;

      const totpFactor = factors.data.totp[0];

      if (!totpFactor) {
        throw new Error("No TOTP factors found!");
      }

      const factorId = totpFactor.id;

      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const challengeId = challenge.data.id;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verifyCode,
      });
      
      if (verify.error) throw verify.error;

      toast.success("Authentication successful");
      router.push(redirectedFrom);
      router.refresh();
      
    } catch (err: any) {
      toast.error(err.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app to continue.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Authentication Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-xl tracking-widest"
                required
                autoComplete="one-time-code"
                maxLength={6}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading || verifyCode.length !== 6}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function MFAChallengePage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-muted/30"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <MFAChallengeForm />
    </Suspense>
  );
}
