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
  const preparationLabel =
    metrics.averagePreparationMinutes > 0
      ? `${metrics.averagePreparationMinutes.toFixed(1)}m avg`
      : "0m avg";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Pickup readiness and collection efficiency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pickup Rate</span>
            <span className="text-sm font-medium">{loading ? "..." : `${metrics.pickupRate}%`}</span>
          </div>
          <Progress value={metrics.pickupRate} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Preparation Speed</span>
            <span className="text-sm font-medium">{loading ? "..." : preparationLabel}</span>
          </div>
          <Progress value={metrics.preparationSpeedProgress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">On-time Pickup</span>
            <span className="text-sm font-medium">
              {loading ? "..." : `${metrics.onTimePickupRate}%`}
            </span>
          </div>
          <Progress value={metrics.onTimePickupRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
