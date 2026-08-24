"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Bot, User, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

type AuditLog = {
  id: string;
  actorEmail: string;
  action: string;
  resource: string;
  status: string;
  createdAt: Date;
};

export function ActivityFeedTable({ logs, currentPage, totalPages }: { logs: AuditLog[], currentPage?: number, totalPages?: number }) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      (log.actorEmail && log.actorEmail.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.resource && log.resource.toLowerCase().includes(term))
    );
  });

  return (
    <Card className="border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm bg-white dark:bg-[#1a1918]">
      <div className="p-4 border-b border-[#e6dfd8] dark:border-[#2e2b27]">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8e8b82]" />
          <Input
            placeholder="Search activities, users, or resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#252320]"
          />
        </div>
      </div>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#faf9f5] dark:bg-[#252320]">
              <TableRow className="border-[#e6dfd8] dark:border-[#2e2b27] hover:bg-transparent">
                <TableHead className="w-[300px] font-medium text-[#6c6a64] dark:text-[#8e8b82] pl-6">Actor / Source</TableHead>
                <TableHead className="font-medium text-[#6c6a64] dark:text-[#8e8b82] px-4">Action Performed</TableHead>
                <TableHead className="font-medium text-[#6c6a64] dark:text-[#8e8b82] px-4">Resource</TableHead>
                <TableHead className="font-medium text-[#6c6a64] dark:text-[#8e8b82] px-4">Date & Time</TableHead>
                <TableHead className="font-medium text-[#6c6a64] dark:text-[#8e8b82] text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-[#8e8b82]">
                    No activities found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map(log => {
                  // Infer if the log is MCP related
                  const isMcp = log.actorEmail?.toLowerCase().includes('mcp') || log.action?.toLowerCase().includes('mcp') || log.actorEmail === 'system';
                  
                  return (
                    <TableRow key={log.id} className="border-[#e6dfd8] dark:border-[#2e2b27] hover:bg-[#faf9f5] dark:hover:bg-[#252320]/50 transition-colors">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded-md ${isMcp ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {isMcp ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-[#141413] dark:text-[#faf9f5] truncate">{log.actorEmail}</div>
                            <div className="text-xs text-[#8e8b82]">{isMcp ? 'MCP Agent' : 'Team Member'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <span className="text-sm font-medium text-[#141413] dark:text-[#faf9f5]">{log.action}</span>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Badge variant="outline" className="bg-[#efe9de] dark:bg-[#252320] border-[#e6dfd8] dark:border-[#2e2b27] text-[#141413] dark:text-[#faf9f5] font-medium">
                          {log.resource}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-sm text-[#6c6a64] dark:text-[#8e8b82]" suppressHydrationWarning>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        {log.status === 'success' ? (
                          <div className="inline-flex items-center justify-end w-full text-xs font-medium text-[#5db872]">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Success
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-end w-full text-xs font-medium text-[#e85a5a]">
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Error
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {currentPage && totalPages && totalPages > 1 && (
          <div className="p-4 border-t border-[#e6dfd8] dark:border-[#2e2b27] flex items-center justify-between">
            <div className="text-sm text-[#8e8b82]">
              Showing page <span className="font-medium text-[#141413] dark:text-[#faf9f5]">{currentPage}</span> of <span className="font-medium text-[#141413] dark:text-[#faf9f5]">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#252320]"
                disabled={currentPage <= 1}
                onClick={() => router.push(`/dashboard/activity-feed?page=${currentPage - 1}`)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#252320]"
                disabled={currentPage >= totalPages}
                onClick={() => router.push(`/dashboard/activity-feed?page=${currentPage + 1}`)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
