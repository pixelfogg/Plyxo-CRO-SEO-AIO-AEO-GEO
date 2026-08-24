"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ComplianceActions({ 
  logs, 
  metrics 
}: { 
  logs: any[];
  metrics: { soc2Score: number; gdprScore: number; activeThreats: number; events30d: number };
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      if (!logs || logs.length === 0) {
        toast.error("No logs available to export.");
        return;
      }

      const headers = ["ID", "Actor Email", "Action", "Resource", "Status", "IP Address", "Created At"];
      const csvContent = [
        headers.join(","),
        ...logs.map(log => 
          [
            log.id, 
            log.actorEmail, 
            log.action, 
            log.resource, 
            log.status, 
            log.ipAddress || "N/A",
            new Date(log.createdAt).toISOString()
          ].map(val => `"${val}"`).join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV exported successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      toast.info("Generating compliance report...");
      
      // Dynamic import of jspdf to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      doc.setFontSize(20);
      doc.text("Compliance & Audit Report", pageWidth / 2, 20, { align: "center" });
      
      // Meta
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: "center" });
      
      // Metrics Section
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Executive Summary", 14, 45);
      
      doc.setFontSize(12);
      doc.text(`SOC 2 Type II Readiness: ${metrics.soc2Score}%`, 14, 55);
      doc.text(`GDPR Readiness: ${metrics.gdprScore}%`, 14, 62);
      doc.text(`Active Threats (24h): ${metrics.activeThreats}`, 14, 69);
      doc.text(`Total Events (30d): ${metrics.events30d}`, 14, 76);
      
      // Logs Section
      doc.setFontSize(14);
      doc.text("Recent Audit Logs", 14, 95);
      
      doc.setFontSize(10);
      let yPos = 105;
      const recentLogs = logs.slice(0, 15);
      
      recentLogs.forEach((log, index) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        
        const dateStr = new Date(log.createdAt).toLocaleString();
        const statusStr = log.status.toUpperCase();
        const logText = `${dateStr} | ${statusStr} | ${log.actorEmail} | ${log.action} on ${log.resource}`;
        
        // Truncate if too long
        const truncatedText = logText.length > 90 ? logText.substring(0, 87) + '...' : logText;
        doc.text(truncatedText, 14, yPos);
        yPos += 7;
      });
      
      if (logs.length > 15) {
        doc.setTextColor(150);
        doc.text(`... and ${logs.length - 15} more events. Export CSV for full logs.`, 14, yPos + 5);
      }
      
      doc.save(`compliance_report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Compliance report generated.");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate compliance report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        className="h-9 px-4 border-[#e6dfd8] dark:border-[#2e2b27] bg-white dark:bg-[#1a1918]"
        onClick={handleExportCSV}
        disabled={isExporting}
      >
        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4 text-[#cc785c]" />}
        Export CSV
      </Button>
      <Button 
        className="h-9 px-4 bg-[#cc785c] hover:bg-[#b5654a] text-white border-0"
        onClick={handleGenerateReport}
        disabled={isGenerating}
      >
        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
        Generate Compliance Report
      </Button>
    </div>
  );
}

