"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function AnimatedSkeleton({ className, ...props }: React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1,
        ease: "easeInOut",
      }}
      className={cn("bg-zinc-200 dark:bg-zinc-800 rounded-md", className)}
      {...props}
    />
  );
}

// Default generic page skeleton
export function SkeletonPage() {
  return (
    <div className="space-y-6 w-full p-4 lg:p-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <AnimatedSkeleton className="h-10 w-1/3 max-w-[300px]" />
        <AnimatedSkeleton className="h-5 w-1/4 max-w-[200px]" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedSkeleton className="h-32 w-full rounded-xl" />
        <AnimatedSkeleton className="h-32 w-full rounded-xl" />
        <AnimatedSkeleton className="h-32 w-full rounded-xl" />
      </div>

      <div className="space-y-4">
        <AnimatedSkeleton className="h-12 w-full rounded-lg" />
        <AnimatedSkeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  );
}

// Structural skeleton matching the SEO/Site Audit page
export function SeoReportSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AnimatedSkeleton className="h-8 w-64" />
            <AnimatedSkeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <AnimatedSkeleton className="h-4 w-32" />
            <AnimatedSkeleton className="h-4 w-24" />
            <AnimatedSkeleton className="h-4 w-16" />
            <AnimatedSkeleton className="h-4 w-32" />
            <AnimatedSkeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Simulator Control Panel */}
      <Card className="border-dashed shadow-none bg-zinc-50/50 dark:bg-zinc-900/20">
        <CardContent className="p-4 flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <AnimatedSkeleton className="h-4 w-32" />
            <AnimatedSkeleton className="h-9 w-full" />
          </div>
          <AnimatedSkeleton className="h-9 w-32" />
        </CardContent>
      </Card>

      {/* Empty State / Tabs loading */}
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <AnimatedSkeleton className="h-24 w-24 rounded-full mb-6 ring-8 ring-zinc-50 dark:ring-zinc-900/50" />
        <AnimatedSkeleton className="h-8 w-64 mb-3 mx-auto" />
        <AnimatedSkeleton className="h-4 w-96 mx-auto" />
      </div>
    </div>
  );
}

// Structural skeleton matching the AIO Intelligence page
export function AioReportSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <AnimatedSkeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-2">
          <AnimatedSkeleton className="h-6 w-64" />
          <AnimatedSkeleton className="h-4 w-96" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-4">
              <AnimatedSkeleton className="h-6 w-32 mb-4" />
              <div className="space-y-2"><AnimatedSkeleton className="h-4 w-20" /><AnimatedSkeleton className="h-9 w-full" /></div>
              <div className="space-y-2"><AnimatedSkeleton className="h-4 w-24" /><AnimatedSkeleton className="h-9 w-full" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><AnimatedSkeleton className="h-4 w-24" /><AnimatedSkeleton className="h-9 w-full" /></div>
                <div className="space-y-2"><AnimatedSkeleton className="h-4 w-24" /><AnimatedSkeleton className="h-9 w-full" /></div>
              </div>
              <AnimatedSkeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
           <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
             <AnimatedSkeleton className="h-12 w-12 rounded-full mb-4 mx-auto" />
             <AnimatedSkeleton className="h-6 w-48 mb-2 mx-auto" />
             <AnimatedSkeleton className="h-4 w-64 mx-auto" />
           </Card>
        </div>
      </div>
    </div>
  );
}

