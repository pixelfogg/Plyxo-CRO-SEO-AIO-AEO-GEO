"use client";

import React, { useState } from 'react';
import { Search, Filter, AlertCircle, CheckCircle2, Server } from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AuditLog = {
  id: string;
  actorEmail: string;
  action: string;
  resource: string;
  ipAddress: string | null;
  status: string;
  frameworks: string[] | null;
  createdAt: Date | null;
};

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("all");

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (log.actorEmail && log.actorEmail.toLowerCase().includes(term)) || 
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.resource && log.resource.toLowerCase().includes(term));
    
    const matchesFramework = frameworkFilter === "all" || 
      (log.frameworks && log.frameworks.some(f => f.toLowerCase().includes(frameworkFilter.toLowerCase())));

    return matchesSearch && matchesFramework;
  });

  return (
    <Card className="border-[#e6dfd8] dark:border-[#2e2b27] shadow-sm bg-white dark:bg-[#1a1918]">
      <CardHeader>
        <CardTitle className="text-lg text-[#141413] dark:text-[#faf9f5]">System Audit Log</CardTitle>
        <CardDescription className="text-[#6c6a64] dark:text-[#8e8b82]">
          A complete, immutable record of administrative actions and access events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8e8b82]" />
            <Input
              placeholder="Search actor, action, or resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#252320]"
            />
          </div>
          
          <Select value={frameworkFilter} onValueChange={(v) => setFrameworkFilter(v ?? 'all')}>
            <SelectTrigger className="w-[180px] border-[#e6dfd8] dark:border-[#2e2b27] bg-[#faf9f5] dark:bg-[#252320]">
              <Filter className="mr-2 h-4 w-4 text-[#8e8b82]" />
              <SelectValue placeholder="All Frameworks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frameworks</SelectItem>
              <SelectItem value="soc 2">SOC 2</SelectItem>
              <SelectItem value="gdpr">GDPR</SelectItem>
              <SelectItem value="hipaa">HIPAA</SelectItem>
              <SelectItem value="iso 27001">ISO 27001</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border border-[#e6dfd8] dark:border-[#2e2b27] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#faf9f5] dark:bg-[#252320]">
              <TableRow className="border-[#e6dfd8] dark:border-[#2e2b27]">
                <TableHead className="font-medium text-[#6c6a64] dark:text-[#8e8b82]">Event</TableHead>
                <TableHead className="font-medium text-[#6c6a64] dark:text-[#8e8b82]">Actor & Resource</TableHead>
                <TableHead className="font-medium text-[#6c6a64] dark:text-[#8e8b82]">Compliance Mapping</TableHead>
                <TableHead className="font-medium text-[#6c6a64] dark:text-[#8e8b82]">Date / IP</TableHead>
                <TableHead className="text-right font-medium text-[#6c6a64] dark:text-[#8e8b82]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-[#6c6a64] dark:text-[#8e8b82]">
                    No audit logs found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-[#e6dfd8] dark:border-[#2e2b27] hover:bg-[#faf9f5] dark:hover:bg-[#252320]/50 transition-colors">
                    <TableCell className="align-top py-4">
                      <div className="font-medium text-[#141413] dark:text-[#faf9f5]">{log.action}</div>
                      <div className="text-xs text-[#8e8b82] font-mono mt-1">ID: {log.id}</div>
                    </TableCell>
                    
                    <TableCell className="align-top py-4">
                      <div className="text-sm font-medium text-[#cc785c]">{log.actorEmail}</div>
                      <div className="text-xs text-[#6c6a64] dark:text-[#8e8b82] mt-1 flex items-center">
                        <Server className="h-3 w-3 mr-1 inline" />
                        {log.resource}
                      </div>
                    </TableCell>
                    
                    <TableCell className="align-top py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(log.frameworks || []).map(fw => (
                          <Badge 
                            key={fw} 
                            variant="outline" 
                            className="text-[10px] font-mono border-[#e6dfd8] dark:border-[#2e2b27] bg-white dark:bg-[#1a1918] text-[#6c6a64] dark:text-[#8e8b82]"
                          >
                            {fw}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-4">
                      <div className="text-sm text-[#141413] dark:text-[#faf9f5]" suppressHydrationWarning>
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-US') : 'N/A'}{' '}
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                      <div className="text-xs text-[#8e8b82] font-mono mt-1">
                        {log.ipAddress || 'Internal'}
                      </div>
                    </TableCell>

                    <TableCell className="text-right align-top py-4">
                      {log.status === 'success' ? (
                        <div className="flex items-center justify-end text-xs font-medium text-[#5db872]">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Success
                        </div>
                      ) : (
                        <div className="flex items-center justify-end text-xs font-medium text-[#e85a5a]">
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                          Failed
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

