import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SmtpPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Email & SMTP Settings</h1>
        <p className="text-zinc-400">Configure transactional email delivery providers.</p>
      </div>
      
      <Card className="bg-zinc-950 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription className="text-zinc-400">Set up Resend, SendGrid, or custom SMTP server details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 border border-dashed border-zinc-800 rounded-lg text-center text-zinc-500">
            Email configuration module coming soon.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
