import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { Parcel } from "./types";

interface RecentActivityPanelProps {
  parcels: Parcel[];
}

export function RecentActivityPanel({ parcels }: RecentActivityPanelProps) {
  const activities = parcels
    .flatMap((parcel) => {
      const base = {
        trackingId: parcel.tracking_id,
        customer: parcel.receiver,
        status: parcel.status,
      };

      return [
        parcel.dateCreated ?? parcel.created_at
          ? {
              ...base,
              key: `${parcel.id}-created`,
              label: "New parcel registered",
              at: parcel.dateCreated ?? parcel.created_at ?? "",
            }
          : null,
        parcel.lastUpdated ?? parcel.updated_at
          ? {
              ...base,
              key: `${parcel.id}-updated`,
              label:
                parcel.status === "ready"
                  ? "Parcel ready to pickup"
                  : ["delivered", "completed", "collected"].includes(parcel.status)
                    ? "Parcel collected/completed"
                    : parcel.status === "cancelled"
                      ? "Parcel cancelled"
                      : "Parcel status updated",
              at: parcel.lastUpdated ?? parcel.updated_at ?? "",
            }
          : null,
      ];
    })
    .filter((activity): activity is NonNullable<typeof activity> =>
      Boolean(activity)
    )
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-900">Recent Activity</CardTitle>
          <Badge variant="outline">{activities.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
          {activities.length === 0 ? (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              No parcel activity found for this filter.
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.key} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{activity.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.trackingId} {activity.customer ? `- ${activity.customer}` : ""}
                    </p>
                  </div>
                  {activity.status === "cancelled" ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Badge variant="secondary" className="capitalize">
                      {activity.status}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(activity.at).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
