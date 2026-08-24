"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function ConsentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authorization_id = searchParams.get("authorization_id");
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authorization_id) {
      if (process.env.NODE_ENV === 'development') {
        setDetails({ client: { client_name: "Claude (Dev Preview)" } });
      }
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }

        const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorization_id);
        
        if (error) {
          toast.error("Failed to load authorization details");
        } else {
          setDetails(data);
        }
      } catch (err) {
        toast.error("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [authorization_id, router, supabase]);

  const handleApprove = async () => {
    if (!authorization_id) return;
    setActionLoading(true);
    const { data, error } = await supabase.auth.oauth.approveAuthorization(authorization_id);
    setActionLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else if ((data as any)?.redirect_to || (data as any)?.url) {
      window.location.href = (data as any)?.redirect_to || (data as any)?.url;
    }
  };

  const handleDeny = async () => {
    if (!authorization_id) return;
    setActionLoading(true);
    const { data, error } = await supabase.auth.oauth.denyAuthorization(authorization_id);
    setActionLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else if ((data as any)?.redirect_to || (data as any)?.url) {
      window.location.href = (data as any)?.redirect_to || (data as any)?.url;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>Missing or invalid authorization parameters.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authorize Request</CardTitle>
          <CardDescription>
            <strong>{details?.client?.client_name || details?.client_name || "An application"}</strong> is requesting access to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <p>By approving this request, you are allowing the application to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Access your basic profile information</li>
              <li>Read and execute MCP tool calls on your behalf</li>
              <li>Access data permitted by your projects</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleDeny} disabled={actionLoading}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={actionLoading}>
            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Approve Access
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ConsentForm />
    </Suspense>
  );
}
