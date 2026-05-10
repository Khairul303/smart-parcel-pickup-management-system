"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminParcel } from "@/lib/admin-realtime";
import { formatRelativeTime, toTitle } from "@/lib/admin-realtime";

export function RecentParcelsSection({
  parcels,
  loading,
}: {
  parcels: AdminParcel[];
  loading?: boolean;
}) {
  const recentParcels = [...parcels]
    .sort(
      (a, b) =>
        new Date(b.created_at ?? b.updated_at ?? 0).getTime() -
        new Date(a.created_at ?? a.updated_at ?? 0).getTime()
    )
    .slice(0, 5);

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardTitle>Recent Parcels</CardTitle>
            <CardDescription>Latest parcel activities and status</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              Loading recent parcels...
            </div>
          ) : recentParcels.length === 0 ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              No parcels have been registered yet.
            </div>
          ) : recentParcels.map((parcel) => {
            const status = parcel.status ?? "unknown";

            return (
            <div key={parcel.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{parcel.tracking_id ?? parcel.id}</span>
                  <Badge 
                    variant={
                      ["completed", "delivered", "collected"].includes(status) ? "default" :
                      ["ready", "ready-for-pickup", "in-transit"].includes(status) ? "secondary" :
                      "outline"
                    }
                  >
                    {toTitle(status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {parcel.receiver ?? parcel.sender ?? "Customer not recorded"}
                </p>
              </div>
              <div className="min-w-0 text-left sm:text-right">
                <p className="text-sm font-medium">
                  Updated {formatRelativeTime(parcel.updated_at ?? parcel.created_at)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Registered {formatRelativeTime(parcel.created_at)}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
