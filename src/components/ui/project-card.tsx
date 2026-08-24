"use client";

import React from 'react'
import Link from 'next/link'
import { Globe, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface ProjectCardProps {
  project: {
    id: string
    name: string
    websiteUrl: string
    industry?: string | null
    isUp?: boolean | null
    createdAt?: Date | null
  }
  actionLabel: string
  actionUrl: string
  actionIcon?: 'arrow-right' | 'arrow-up-right'
}

export function ProjectCard({ project, actionLabel, actionUrl, actionIcon = 'arrow-right' }: ProjectCardProps) {
  const Icon = actionIcon === 'arrow-right' ? ArrowRight : ArrowUpRight

  return (
    <Card className="flex flex-col justify-between hover:border-primary/50 transition-all hover:-translate-y-0.5 group bg-card border-border shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="font-serif text-[20px] font-normal tracking-tight text-card-foreground truncate max-w-[200px]">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-mono">
              <Globe className="h-3.5 w-3.5 text-primary/70" />
              <a 
                href={project.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary transition-colors truncate max-w-[180px]"
                onClick={(e) => e.stopPropagation()}
              >
                {project.websiteUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
          
          {typeof project.isUp === 'boolean' && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase border ${
              project.isUp 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50' 
                : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${project.isUp ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              {project.isUp ? 'Operational' : 'Failing'}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="p-3 rounded-md bg-muted/50 border border-border/50 text-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Target Sector:</span>
            <span className="font-medium text-foreground">{project.industry || 'General / Tech'}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>AI Engine:</span>
            <span className="text-primary font-medium font-mono">Plyxo Intelligence</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-border flex items-center justify-between mt-auto bg-muted/20">
        <span className="text-xs font-mono text-muted-foreground" suppressHydrationWarning>
          {project.createdAt ? `Added ${new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Added recently'}
        </span>
        <Link href={actionUrl} className="shrink-0">
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 text-xs font-medium bg-background hover:bg-muted group-hover:border-primary/50 group-hover:text-primary transition-all"
          >
            {actionLabel} <Icon className="ml-1.5 h-3.5 w-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
