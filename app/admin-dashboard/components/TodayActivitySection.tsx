"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Truck, AlertCircle, ArrowUpRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminParcel, AdminPickupBooking } from "@/lib/admin-realtime";
import { formatDateTime, isTodayInMalaysia, toTitle } from "@/lib/admin-realtime";

type TodayActivity = {
  id: string;
  type: string;
  description: string;
  parcelId: string;
  time: string;
  status: "completed" | "in-progress" | "warning" | "info";
  icon: typeof Activity;
  color: string;
  createdAt: string;
};

const getTodayActivities = (
  parcels: AdminParcel[],
  pickups: AdminPickupBooking[]
): TodayActivity[] => {
  const parcelActivities = parcels
    .filter((parcel) => isTodayInMalaysia(parcel.created_at ?? parcel.updated_at))
    .map((parcel) => {
      const status = parcel.status ?? "registered";
      const isCompleted = ["completed", "delivered", "collected"].includes(status);
      const isReady = ["ready", "ready-for-pickup"].includes(status);

      return {
        id: `parcel-${parcel.id}`,
        type: isReady
          ? "Parcel Ready"
          : isCompleted
            ? "Parcel Collected"
            : "Parcel Registered",
        description: `${parcel.tracking_id ?? parcel.id} ${toTitle(status).toLowerCase()}${
          parcel.receiver ? ` for ${parcel.receiver}` : ""
        }`,
        parcelId: parcel.tracking_id ?? parcel.id,
        time: formatDateTime(parcel.updated_at ?? parcel.created_at),
        status: isCompleted ? "completed" : isReady ? "in-progress" : "info",
        icon: isCompleted ? CheckCircle : isReady ? Truck : ArrowUpRight,
        color: isCompleted
          ? "text-green-600 bg-green-50"
          : isReady
            ? "text-blue-600 bg-blue-50"
            : "text-purple-600 bg-purple-50",
        createdAt: parcel.updated_at ?? parcel.created_at ?? "",
      } satisfies TodayActivity;
    });

  const pickupActivities = pickups
    .filter((pickup) => isTodayInMalaysia(pickup.created_at ?? pickup.updated_at))
    .map((pickup) => {
      const status = pickup.status ?? "booked";
      const isCancelled = ["cancelled", "canceled", "no_show"].includes(status);
      const isCompleted = ["completed", "collected"].includes(status);

      return {
        id: `pickup-${pickup.pickup_code}`,
        type: isCancelled
          ? "Pickup Alert"
          : isCompleted
            ? "Pickup Completed"
            : "Pickup Booking",
        description: `${pickup.customer_name ?? "Customer"} - ${
          pickup.queue_number ?? "No queue"
        } on ${pickup.pickup_date ?? "unscheduled"} ${pickup.time_slot ?? ""}`,
        parcelId: pickup.tracking_ids?.[0] ?? pickup.pickup_code,
        time: formatDateTime(pickup.updated_at ?? pickup.created_at),
        status: isCancelled ? "warning" : isCompleted ? "completed" : "in-progress",
        icon: isCancelled ? AlertCircle : isCompleted ? CheckCircle : Clock,
        color: isCancelled
          ? "text-amber-600 bg-amber-50"
          : isCompleted
            ? "text-green-600 bg-green-50"
            : "text-blue-600 bg-blue-50",
        createdAt: pickup.updated_at ?? pickup.created_at ?? "",
      } satisfies TodayActivity;
    });

  return [...parcelActivities, ...pickupActivities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);
};

export function TodayActivitySection({
  parcels,
  pickups,
  loading,
}: {
  parcels: AdminParcel[];
  pickups: AdminPickupBooking[];
  loading?: boolean;
}) {
  const todayActivities = getTodayActivities(parcels, pickups);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Today Activity
            </CardTitle>
            <CardDescription>Malaysia-time operational activity for today</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Clock className="mr-2 h-4 w-4" />
              Live Updates
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              Loading live activity...
            </div>
          ) : todayActivities.length === 0 ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              No activity recorded for today yet.
            </div>
          ) : todayActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className={`rounded-full p-2 ${activity.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{activity.type}</h4>
                    <Badge 
                      variant={
                        activity.status === "completed" ? "default" :
                        activity.status === "in-progress" ? "secondary" :
                        activity.status === "warning" ? "destructive" :
                        "outline"
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <span className="text-xs font-medium">Parcel: {activity.parcelId}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">Warning</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View All Activities
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
