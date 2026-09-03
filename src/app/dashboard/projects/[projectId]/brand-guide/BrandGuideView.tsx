"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateBrandGuide } from "../../actions";
import { Loader2, Palette, FileText, Type, Droplet, Box, Fingerprint, Code, Copy, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BrandGuideView({ projectId, initialProject }: { projectId: string, initialProject: any }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandData, setBrandData] = useState<any>(initialProject.brandColors);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [key]: true });
    setTimeout(() => setCopiedStates({ ...copiedStates, [key]: false }), 2000);
  };

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const data = await generateBrandGuide(projectId);
      setBrandData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  if (!brandData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl border-dashed">
        <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-full mb-4">
          <Palette className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">No Brand Guide Extracted</h3>
        <p className="text-zinc-500 max-w-md mb-6">
          We haven't extracted the design tokens and visual rules for this website yet. Click below to analyze the site and generate a comprehensive brand guide.
        </p>
        <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
          {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Palette className="w-4 h-4 mr-2" />}
          {isGenerating ? "Analyzing Website..." : "Extract Design Tokens"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      <Tabs defaultValue="visual" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList variant="pill" className="overflow-x-auto flex-wrap sm:flex-nowrap h-auto">
            <TabsTrigger value="identity" className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#cc785c]" /> Brand Identity
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#cc785c]" /> Design System
            </TabsTrigger>
            <TabsTrigger value="exports" className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#cc785c]" /> Code Exports
            </TabsTrigger>
            <TabsTrigger value="markdown" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#cc785c]" /> design.md
            </TabsTrigger>
          </TabsList>
          
          <Button onClick={handleGenerate} disabled={isGenerating} variant="outline" size="sm" className="shrink-0 h-8 gap-1.5 text-xs bg-[#faf9f5] dark:bg-[#181715] border-[#e6dfd8] dark:border-[#2e2b27] hover:border-[#cc785c]/40 hover:text-[#cc785c]">
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Palette className="w-3.5 h-3.5" />}
            {isGenerating ? "Regenerating..." : "Regenerate Guide"}
          </Button>
        </div>
        
        <TabsContent value="identity" className="space-y-8 animate-in fade-in-50 duration-500">
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Overview</CardTitle>
                  <CardDescription>Core semantics extracted from the site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Archetype</p>
                    <p className="font-semibold text-lg">{brandData.overview?.archetype || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Tone of Voice</p>
                    <p className="font-medium">{brandData.overview?.tone || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Domain</p>
                    <p className="font-medium">{brandData.overview?.domain || "Unknown"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personality Traits</CardTitle>
                  <CardDescription>Algorithmic prediction (0-100%)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {brandData.overview?.personality && Object.entries(brandData.overview.personality).map(([trait, score]: [string, any]) => (
                    <div key={trait}>
                      <div className="flex justify-between mb-2 text-sm">
                        <span className="font-medium">{trait}</span>
                        <span className="text-zinc-500">{score}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="visual" className="space-y-8 animate-in fade-in-50 duration-500">
          {/* Colors Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-5 h-5 text-zinc-400" />
              <h2 className="text-xl font-bold">Color System</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Object.entries(brandData.colors).map(([name, value]: [string, any]) => (
                <div key={name} className="group relative overflow-hidden rounded-xl border bg-card">
                  <div 
                    className="h-24 w-full transition-transform group-hover:scale-105" 
                    style={{ backgroundColor: value }}
                  />
                  <div className="p-3 bg-card z-10 relative border-t">
                    <p className="font-medium capitalize mb-1 text-sm">{name.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-xs text-zinc-500 font-mono uppercase">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 mt-12 gap-2">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-zinc-400" />
                <h2 className="text-xl font-bold">Typography</h2>
              </div>
              <div className="text-sm font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full w-fit">
                Family: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{brandData.typography.headingFont}</span>
              </div>
            </div>
            <Card className="overflow-hidden">
              <div className="divide-y divide-border">
                {Object.entries(brandData.typography).map(([level, styles]: [string, any]) => {
                  if (typeof styles !== 'object') return null;
                  return (
                    <div key={level} className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <div className="w-32 shrink-0">
                        <span className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono text-xs font-bold uppercase rounded-md px-2.5 py-1">
                          {level}
                        </span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p 
                          className="truncate text-foreground"
                          style={{ 
                            fontSize: styles.size, 
                            fontWeight: styles.weight,
                            lineHeight: styles.lineHeight,
                            fontFamily: brandData.typography.headingFont
                          }}
                        >
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </div>
                      <div className="w-full md:w-48 shrink-0 flex flex-col items-start md:items-end text-sm text-zinc-500 font-mono">
                        <span>{styles.size} / {styles.weight}</span>
                        <span>Line height: {styles.lineHeight}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>

          {/* Components Section */}
          {brandData.buttons && (
            <section>
              <div className="flex items-center gap-2 mb-4 mt-12">
                <Box className="w-5 h-5 text-zinc-400" />
                <h2 className="text-xl font-bold">Components & Shapes</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Primary Button</CardTitle>
                    <CardDescription>Live preview of extracted button styles</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center py-12 bg-zinc-50 dark:bg-zinc-950 rounded-b-xl border-t">
                    <button 
                      style={{
                        backgroundColor: brandData.colors.primary,
                        color: "#fff",
                        borderRadius: brandData.buttons.borderRadius,
                        border: brandData.buttons.border !== "none" ? brandData.buttons.border : "none",
                        padding: brandData.buttons.padding,
                        fontFamily: brandData.typography.headingFont,
                        fontWeight: 600
                      }}
                    >
                      Primary Action
                    </button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extracted CSS Rules</CardTitle>
                    <CardDescription>Used to build the component on the left</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 font-mono text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-zinc-500">border-radius</span>
                        <span>{brandData.buttons.borderRadius}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-zinc-500">border</span>
                        <span>{brandData.buttons.border}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-zinc-500">padding</span>
                        <span>{brandData.buttons.padding}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">background-color</span>
                        <span>{brandData.colors.primary}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
        </TabsContent>

        <TabsContent value="exports" className="space-y-6 animate-in fade-in-50 duration-500">
          {brandData.exports && Object.entries(brandData.exports).map(([key, code]: [string, any]) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{key === 'cssVariables' ? 'CSS Variables' : key === 'tailwindTheme' ? 'Tailwind Config' : 'Design Tokens (JSON)'}</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(code, key)}>
                  {copiedStates[key] ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-zinc-950 p-4 rounded-xl overflow-x-auto border border-zinc-800">
                  <pre className="text-sm font-mono text-zinc-300">
                    {code}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="markdown" className="animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Executive Summary (design.md)</CardTitle>
                <CardDescription>Raw markdown overview based on 35-point enterprise framework.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleCopy(brandData.designMd, 'md')}>
                {copiedStates['md'] ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedStates['md'] ? 'Copied' : 'Copy Raw'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-950 p-6 rounded-xl overflow-x-auto border border-zinc-800">
                <pre className="text-sm font-mono text-zinc-300 leading-relaxed">
                  {brandData.designMd}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
