"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AdminParcel, AdminPickupBooking } from "@/lib/admin-realtime";
import { getAdminDashboardMetrics } from "@/lib/admin-realtime";

export function PerformanceMetricsSection({
  parcels,
  pickups,
  loading,
}: {
  parcels: AdminParcel[];
  pickups: AdminPickupBooking[];
  loading?: boolean;
}) {
  const metrics = getAdminDashboardMetrics(parcels, pickups);
  const processingLabel =
    metrics.processingHours > 0 ? `${metrics.processingHours.toFixed(1)}h avg` : "0h avg";
  const processingProgress = Math.max(0, Math.min(100, 100 - metrics.processingHours * 8));

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
            <span className="text-sm font-medium">{loading ? "..." : `${metrics.onTimeRate}%`}</span>
          </div>
          <Progress value={metrics.onTimeRate} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Customer Satisfaction</span>
            <span className="text-sm font-medium">
              {loading ? "..." : `${Math.max(0, (5 - metrics.noShowRate / 20)).toFixed(1)}/5`}
            </span>
          </div>
          <Progress value={Math.max(0, 100 - metrics.noShowRate)} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Processing Speed</span>
            <span className="text-sm font-medium">{loading ? "..." : processingLabel}</span>
          </div>
          <Progress value={processingProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
