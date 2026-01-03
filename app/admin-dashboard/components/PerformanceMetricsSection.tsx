"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function PerformanceMetricsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Delivery success rate & efficiency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">On-time Delivery</span>
            <span className="text-sm font-medium">94%</span>
          </div>
          <Progress value={94} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Customer Satisfaction</span>
            <span className="text-sm font-medium">4.8/5</span>
          </div>
          <Progress value={96} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Processing Speed</span>
            <span className="text-sm font-medium">2.4h avg</span>
          </div>
          <Progress value={88} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}