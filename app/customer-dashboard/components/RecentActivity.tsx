"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Clock, Package } from "lucide-react"
import { useRecentActivity } from "../hooks/useRecentActivity"

const getActivityMeta = (status: string) => {
  switch (status) {
    case "ready":
    case "ready-for-pickup":
      return {
        icon: CheckCircle,
        iconColor: "text-blue-600",
        bgColor: "bg-blue-100",
        title: "Ready for pickup",
      }
    case "completed":
    case "delivered":
      return {
        icon: CheckCircle,
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-100",
        title: "Parcel completed",
      }
    case "in-transit":
      return {
        icon: Clock,
        iconColor: "text-amber-600",
        bgColor: "bg-amber-100",
        title: "Parcel in transit",
      }
    default:
      return {
        icon: Package,
        iconColor: "text-green-600",
        bgColor: "bg-green-100",
        title: "Parcel registered",
      }
  }
}

const formatActivityTime = (date?: string | null) => {
  if (!date) return "Just now"

  const timestamp = new Date(date)
  const today = new Date()
  const isToday = timestamp.toDateString() === today.toDateString()

  if (isToday) {
    return timestamp.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return timestamp.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function RecentActivity() {
  const { activities, loading, error } = useRecentActivity()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            No recent parcel activity yet.
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const meta = getActivityMeta(activity.status)
              const Icon = meta.icon

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${meta.bgColor}`}
                  >
                    <Icon className={`h-4 w-4 ${meta.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{meta.title}</div>
                    <div className="truncate text-sm text-gray-600">
                      {activity.tracking_id}
                      {activity.sender ? ` from ${activity.sender}` : ""}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatActivityTime(
                        activity.updated_at ?? activity.created_at
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
