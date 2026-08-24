'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateOverallScore } from '@/lib/scanner/score';

interface TrendChartProps {
  scans: any[];
}

export function TrendChart({ scans }: TrendChartProps) {
  if (!scans || scans.length === 0) {
    return null; // Don't show trend chart if there are no scans
  }

  // Reverse to show chronological order
  const data = [...scans].reverse().map(scan => {
    const overallScore = calculateOverallScore(scan);

    return {
      name: `Scan ${scan.id.split('-')[0]}`,
      score: overallScore,
      date: new Date(scan.createdAt).toLocaleDateString()
    };
  });

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Score Trends</CardTitle>
        <CardDescription>Overall CRO score across recent scans</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#111827' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
