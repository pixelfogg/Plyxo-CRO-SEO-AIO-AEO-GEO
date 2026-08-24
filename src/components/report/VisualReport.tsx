'use client';
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, X, AlertTriangle, Crosshair, Eye, ArrowRight, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface VisualReportProps {
  scanId: string;
  hasScreenshot?: boolean;
  issues: any[];
}

export function VisualReport({ scanId, hasScreenshot = true, issues }: VisualReportProps) {
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [hoveredIssueId, setHoveredIssueId] = useState<string | null>(null);
  const [isFullHeight, setIsFullHeight] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter issues that actually have valid, non-degenerate bounding boxes
  const visualIssues = issues.map((i, originalIdx) => {
    let bbox = i.boundingBox;
    if (typeof bbox === 'string') {
      try { bbox = JSON.parse(bbox); } catch (e) {}
    }
    return {
      ...i,
      parsedBbox: bbox,
      indexNumber: originalIdx + 1
    };
  }).filter(i => {
    if (!i.parsedBbox || !Array.isArray(i.parsedBbox) || i.parsedBbox.length !== 4) return false;
    const [ymin, xmin, ymax, xmax] = i.parsedBbox;
    const yminNum = Number(ymin);
    const xminNum = Number(xmin);
    const ymaxNum = Number(ymax);
    const xmaxNum = Number(xmax);
    if (isNaN(yminNum) || isNaN(xminNum) || isNaN(ymaxNum) || isNaN(xmaxNum)) return false;
    // Exclude placeholder or offscreen values like [1000, 0, 1000, 0] or [0, 0, 0, 0]
    if (yminNum >= 990 && ymaxNum >= 990 && xminNum <= 10 && xmaxNum <= 10) return false;
    if (ymaxNum <= yminNum && xmaxNum <= xminNum) return false;
    return true;
  });

  const handleSelectIssue = (issue: any) => {
    setSelectedIssue(issue);
    if (issue.parsedBbox && scrollContainerRef.current) {
      const [ymin] = issue.parsedBbox;
      const topPct = Number(ymin) / 1000;
      const scrollHeight = scrollContainerRef.current.scrollHeight;
      scrollContainerRef.current.scrollTo({
        top: Math.max(0, (topPct * scrollHeight) - 150),
        behavior: 'smooth'
      });
    }
  };

  if (!hasScreenshot) {
    return (
      <div className="p-12 text-center border rounded-xl border-dashed bg-zinc-50 dark:bg-zinc-900/20">
        <AlertTriangle className="h-10 w-10 text-zinc-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">No Screenshot Available</h3>
        <p className="text-zinc-500">This scan did not capture a screenshot, or the visual analysis API was skipped.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">
              Desktop Viewport Visual CRO Analysis (1440px)
            </h3>
            <p className="text-xs text-indigo-700/80 dark:text-indigo-300/70">
              {visualIssues.length} high-impact conversion hotspots and visual friction areas mapped directly on your live UI.
            </p>
          </div>
        </div>
        
        {/* Controls Toolbar */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => { setZoomLevel(1); setIsFullHeight(false); }}
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => setIsFullHeight(!isFullHeight)}
            title={isFullHeight ? "Collapse View" : "Full Height View"}
          >
            {isFullHeight ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullHeight ? "Fit View" : "Full Height"}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side: Image container with precise bounding box overlays */}
        <div className="w-full lg:w-2/3 border rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-inner flex flex-col">
          <div 
            ref={scrollContainerRef}
            className={`w-full overflow-y-auto custom-scrollbar relative transition-all ${
              isFullHeight ? 'max-h-none' : 'max-h-[82vh]'
            }`}
          >
            <div 
              className="relative w-full block select-none transition-transform duration-150 origin-top-left"
              style={{ transform: `scale(${zoomLevel})`, width: `${100 / zoomLevel}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`/api/scans/${scanId}/screenshot`} 
                alt="Desktop Website Screenshot (1440px Viewport)" 
                className="w-full block"
              />
              
              {/* Bounding Box Highlights and Precise Numbered Pointers */}
              {visualIssues.map((issue, idx) => {
                const [ymin, xmin, ymax, xmax] = issue.parsedBbox;
                
                const yminNum = Math.max(0, Math.min(1000, Number(ymin)));
                const xminNum = Math.max(0, Math.min(1000, Number(xmin)));
                const ymaxNum = Math.max(0, Math.min(1000, Number(ymax)));
                const xmaxNum = Math.max(0, Math.min(1000, Number(xmax)));

                const top = (yminNum / 1000) * 100;
                const left = (xminNum / 1000) * 100;
                const width = Math.max(2, ((xmaxNum - xminNum) / 1000) * 100);
                const height = Math.max(2, ((ymaxNum - yminNum) / 1000) * 100);

                const isSelected = selectedIssue?.id === issue.id;
                const isHovered = hoveredIssueId === issue.id;

                const isCritical = issue.priority === 'critical' || issue.severity === 'critical';
                const isHigh = issue.priority === 'high' || issue.severity === 'high';

                let borderColor = isCritical ? 'border-red-500' : (isHigh ? 'border-amber-500' : 'border-indigo-500');
                let badgeBg = isCritical ? 'bg-red-600' : (isHigh ? 'bg-amber-600' : 'bg-indigo-600');

                if (isSelected) {
                  borderColor = 'border-indigo-500 ring-4 ring-indigo-500/30';
                  badgeBg = 'bg-indigo-600 ring-4 ring-indigo-600/30 scale-110';
                }

                return (
                  <div
                    key={issue.id || idx}
                    onClick={() => handleSelectIssue(issue)}
                    onMouseEnter={() => setHoveredIssueId(issue.id)}
                    onMouseLeave={() => setHoveredIssueId(null)}
                    className="absolute cursor-pointer group"
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      zIndex: isSelected ? 30 : (isHovered ? 25 : 10),
                    }}
                  >
                    {/* Bounding Box Rectangle Overlay */}
                    <div 
                      className={`w-full h-full border-2 rounded transition-all duration-200 ${borderColor} ${
                        isSelected 
                          ? 'bg-indigo-500/20 backdrop-blur-[0.5px]' 
                          : isHovered 
                            ? 'bg-amber-500/15' 
                            : 'bg-red-500/10 hover:bg-indigo-500/15'
                      }`}
                    />

                    {/* Precise Numbered Indicator Badge */}
                    <div 
                      className={`absolute -top-3 -left-3 flex items-center justify-center rounded-full shadow-lg text-white font-bold text-xs transition-transform duration-200 z-10 w-6 h-6 ${badgeBg} ${
                        isSelected || isHovered ? 'scale-125' : 'group-hover:scale-110'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side: Details panel */}
        <div className="w-full lg:w-1/3">
          {selectedIssue ? (
            <Card className="sticky top-6 shadow-md border-indigo-100 dark:border-indigo-900/40 overflow-hidden">
              <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-indigo-50 dark:border-indigo-900/30 pb-4 relative">
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 mb-2 pr-6">
                  <Badge variant={selectedIssue.priority === 'critical' || selectedIssue.priority === 'high' ? 'destructive' : 'secondary'} className="uppercase text-[10px]">
                    {selectedIssue.priority || selectedIssue.severity} Priority
                  </Badge>
                  <span className="text-xs font-medium text-zinc-500 uppercase">{selectedIssue.category}</span>
                </div>
                <CardTitle className="text-lg leading-tight pr-4">{selectedIssue.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {selectedIssue.description}
                </p>

                {selectedIssue.expectedConversionGain && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>Projected Conversion Lift:</strong> {selectedIssue.expectedConversionGain}</span>
                  </div>
                )}
                
                {selectedIssue.aiGeneratedExample && (
                  <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3"/> AI Copy / Design Recommendation
                    </p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 italic">
                      "{selectedIssue.aiGeneratedExample}"
                    </p>
                  </div>
                )}
                
                {selectedIssue.implementationSteps && selectedIssue.implementationSteps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Step-by-Step Fix</p>
                    <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {selectedIssue.implementationSteps.map((step: string, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-zinc-400 select-none font-mono text-xs mt-0.5">{i + 1}.</span>
                          <span className="leading-snug">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <Sparkles className="h-10 w-10 text-indigo-300 mb-4 opacity-50" />
              <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Interactive Visual Report</h3>
              <p className="text-sm text-zinc-500 max-w-[250px] leading-relaxed">
                Click on any of the numbered markers or highlighted bounding boxes on the screenshot to view the exact heuristic analysis and CRO recommendations.
              </p>
              {visualIssues.length === 0 && hasScreenshot && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-4 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-900/50">
                  No bounding box markers were detected in this scan. Try running a new scan.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Visual Issues Index List */}
      {visualIssues.length > 0 && (
        <div className="pt-2">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <span>Visual Hotspot Index ({visualIssues.length} Elements)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visualIssues.map((issue, idx) => {
              const isSelected = selectedIssue?.id === issue.id;
              const isHovered = hoveredIssueId === issue.id;
              return (
                <div
                  key={issue.id || idx}
                  onClick={() => handleSelectIssue(issue)}
                  onMouseEnter={() => setHoveredIssueId(issue.id)}
                  onMouseLeave={() => setHoveredIssueId(null)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 text-left ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20' 
                      : isHovered 
                        ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50' 
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-indigo-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5 ${
                    isSelected ? 'bg-indigo-600' : 'bg-red-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{issue.category}</span>
                      <Badge variant="outline" className="text-[9px] uppercase px-1 py-0">{issue.priority || 'medium'}</Badge>
                    </div>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{issue.title}</p>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 text-zinc-400 mt-1 transition-transform ${isSelected ? 'translate-x-0.5 text-indigo-600' : ''}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
