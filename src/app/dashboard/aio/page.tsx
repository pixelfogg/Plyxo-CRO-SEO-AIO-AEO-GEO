"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProjectCard } from "@/components/ui/project-card";
import { getProjects } from "./actions";
import { Loader2, Sparkles, FolderOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { RadialSpike } from '@/components/claude/RadialSpike';

export default function AioProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getProjects();
      if (result.success && result.projects) {
        setProjects(result.projects);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-[#e6dfd8] dark:border-[#2e2b27] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#efe9de] dark:bg-[#252320] text-amber-600 dark:text-amber-500 text-[12px] font-mono mb-2">
            <RadialSpike size={14} />
            <span>ARTIFICIAL INTELLIGENCE OPTIMIZATION</span>
          </div>
          <h1 className="font-serif text-[36px] font-normal tracking-[-0.5px] text-[#141413] dark:text-[#faf9f5]">
            AIO Intelligence
          </h1>
          <p className="text-[15px] text-[#3d3d3a] dark:text-[#a09d96] mt-1">
            Select a project to perform Artificial Intelligence Optimization (AIO) scans and see how LLMs interpret your content.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
          <FolderOpen className="w-12 h-12 text-zinc-300 mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No Projects Found</h3>
          <p className="text-sm text-zinc-500 max-w-sm mt-2 mb-6">
            You need to create a project first before running AIO Analysis.
          </p>
          <Link href="/dashboard/projects" className={buttonVariants()}>Go to Projects</Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id}
              project={project}
              actionLabel="Open AIO Dashboard"
              actionUrl={`/dashboard/aio/${project.id}`}
              actionIcon="arrow-right"
            />
          ))}
        </div>
      )}
    </div>
  );
}
