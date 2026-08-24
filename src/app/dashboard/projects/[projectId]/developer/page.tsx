"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Key, Webhook, Loader2, Copy, Trash2, CheckCircle2, Play, Terminal } from 'lucide-react';
import { getDeveloperData, generateApiKey, revokeApiKey, createWebhook, deleteWebhook, testWebhook } from './actions';
import { Badge } from '@/components/ui/badge';

export default function DeveloperPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isCreatingHook, setIsCreatingHook] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    setIsLoading(true);
    const result = await getDeveloperData(projectId);
    if (result.success) {
      setApiKeys(result.apiKeys || []);
      setWebhooks(result.webhooks || []);
    }
    setIsLoading(false);
  };

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) return toast.error("Please enter a key name");
    setIsGenerating(true);
    const result = await generateApiKey(projectId, newKeyName);
    if (result.success && result.rawKey) {
      setGeneratedKey(result.rawKey);
      setNewKeyName('');
      toast.success("API Key generated");
      loadData();
    } else {
      toast.error(result.error || "Failed to generate key");
    }
    setIsGenerating(false);
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      toast.success("API Key copied to clipboard!");
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (confirm("Are you sure you want to revoke this key? Any connected agents will lose access immediately.")) {
      const result = await revokeApiKey(id, projectId);
      if (result.success) {
        toast.success("API Key revoked");
        loadData();
      }
    }
  };

  const handleCreateWebhook = async () => {
    if (!webhookName.trim() || !webhookUrl.trim()) return toast.error("Name and URL are required");
    if (!webhookUrl.startsWith("http")) return toast.error("URL must start with http or https");
    
    setIsCreatingHook(true);
    const result = await createWebhook(projectId, webhookName, webhookUrl, webhookSecret);
    if (result.success) {
      toast.success("Webhook created");
      setWebhookName('');
      setWebhookUrl('');
      setWebhookSecret('');
      loadData();
    } else {
      toast.error(result.error || "Failed to create webhook");
    }
    setIsCreatingHook(false);
  };

  const handleDeleteWebhook = async (id: string) => {
    if (confirm("Delete this webhook?")) {
      const result = await deleteWebhook(id, projectId);
      if (result.success) {
        toast.success("Webhook deleted");
        loadData();
      }
    }
  };

  const handleTestWebhook = async (id: string) => {
    toast.info("Sending test ping...");
    const result = await testWebhook(id, projectId);
    if (result.success) {
      toast.success("Test ping successful! Check your receiver.");
    } else {
      toast.error(result.error || "Webhook test failed");
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Developer & Automation</h1>
        <p className="text-zinc-500">Connect Plyxo to your AI agents or internal CI/CD workflows.</p>
      </div>

      <Tabs defaultValue="mcp" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="mcp" className="flex items-center gap-2"><Terminal className="w-4 h-4"/> MCP Server Connection</TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2"><Webhook className="w-4 h-4"/> Webhooks</TabsTrigger>
        </TabsList>

        {/* MCP Server Tab */}
        <TabsContent value="mcp" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate API Key</CardTitle>
                  <CardDescription>Create a secure token for your AI agents to access this project's audits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Key Name</Label>
                    <Input placeholder="e.g. Cursor IDE MacBook" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
                  </div>
                  {generatedKey && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900 rounded-lg p-4 mt-4">
                      <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4"/> Key Generated Successfully
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-500 mb-3">Copy this key now. You will not be able to see it again.</p>
                      <div className="flex gap-2">
                        <Input readOnly value={generatedKey} className="font-mono text-xs bg-white dark:bg-black" />
                        <Button variant="outline" onClick={handleCopyKey}><Copy className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleGenerateKey} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                    Create Secret Key
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active API Keys</CardTitle>
                </CardHeader>
                <CardContent>
                  {apiKeys.length === 0 ? (
                    <p className="text-sm text-zinc-500">No active keys.</p>
                  ) : (
                    <div className="space-y-4">
                      {apiKeys.map(key => (
                        <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                          <div>
                            <p className="font-medium text-sm">{key.name}</p>
                            <p className="text-xs text-zinc-500">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleRevokeKey(key.id)}>
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-zinc-950 border-zinc-800 text-zinc-300">
              <CardHeader>
                <CardTitle className="text-white">MCP Connection Guide</CardTitle>
                <CardDescription className="text-zinc-400">Add this to your IDE to connect the Plyxo MCP Server.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-2">1. Cursor IDE Configuration (Standard I/O)</h4>
                  <p className="mb-2 text-zinc-400">Go to Cursor Settings &gt; Features &gt; MCP &gt; Add New MCP Server:</p>
                  <pre className="bg-black p-3 rounded-md font-mono text-xs overflow-x-auto border border-zinc-800 text-emerald-400">
{`{
  "name": "plyxo-mcp-server",
  "command": "npx",
  "args": ["-y", "@plyxo/mcp-server"],
  "env": {
    "PLYXO_API_KEY": "YOUR_API_KEY_HERE",
    "PLYXO_HOST": "https://www.plyxo.org"
  }
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">2. Claude Desktop &amp; Windsurf Configuration</h4>
                  <p className="mb-2 text-zinc-400">Add this to your <code className="bg-zinc-800 px-1 rounded">claude_desktop_config.json</code> or Windsurf MCP config:</p>
                  <pre className="bg-black p-3 rounded-md font-mono text-xs overflow-x-auto border border-zinc-800 text-blue-400">
{`"mcpServers": {
  "plyxo": {
    "command": "npx",
    "args": ["-y", "@plyxo/mcp-server"],
    "env": {
      "PLYXO_API_KEY": "YOUR_API_KEY_HERE",
      "PLYXO_HOST": "https://www.plyxo.org"
    }
  }
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">3. Streamable HTTP / SSE Endpoint (Remote Hosted)</h4>
                  <p className="mb-2 text-zinc-400">For agent platforms supporting HTTP MCP transports (e.g. LibreChat, Google Antigravity, Custom Agents):</p>
                  <pre className="bg-black p-3 rounded-md font-mono text-xs overflow-x-auto border border-zinc-800 text-amber-400">
{`Endpoint: https://www.plyxo.org/api/mcp
Header: Authorization: Bearer YOUR_API_KEY_HERE`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Register Webhook</CardTitle>
              <CardDescription>Automatically push scan results to n8n, Zapier, or your CI/CD pipelines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <Label>Webhook Name</Label>
                <Input placeholder="e.g. n8n SEO Alert Trigger" value={webhookName} onChange={e => setWebhookName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Payload URL</Label>
                <Input placeholder="https://..." value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Secret (Optional)</Label>
                <Input placeholder="Used for X-Plyxo-Signature header" value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateWebhook} disabled={isCreatingHook}>
                {isCreatingHook ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Webhook className="w-4 h-4 mr-2" />}
                Add Webhook
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <p className="text-sm text-zinc-500">No active webhooks.</p>
              ) : (
                <div className="space-y-4">
                  {webhooks.map(hook => (
                    <div key={hook.id} className="flex items-center justify-between p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{hook.name}</p>
                          <Badge variant="outline" className="text-[10px] h-5 bg-emerald-50 text-emerald-600 border-emerald-200">Active</Badge>
                        </div>
                        <p className="text-xs font-mono text-zinc-500">{hook.url}</p>
                        <p className="text-xs text-zinc-400 mt-2">Triggers on: {(hook.events || []).join(', ')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleTestWebhook(hook.id)}>
                          <Play className="w-3 h-3 mr-2" /> Ping
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteWebhook(hook.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
