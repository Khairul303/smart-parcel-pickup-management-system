"use client"

import {
  AlertTriangle,
  Bell,
  Clock,
  Info,
  Package,
  RefreshCw,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { AdminNotification } from "@/lib/admin-realtime"
import { formatDateTime } from "@/lib/admin-realtime"

const notificationConfig: Record<
  string,
  {
    icon: typeof Bell
    color: string
    bg: string
    label: string
  }
> = {
  new_booking: {
    icon: Clock,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    label: "Booking",
  },
  queue_updated: {
    icon: Clock,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    label: "Queue",
  },
  parcel_status_updated: {
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Parcel",
  },
  parcel_collected: {
    icon: Package,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Collected",
  },
  booking_cancelled: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Cancelled",
  },
  pickup_booking_cancelled: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Cancelled",
  },
  booking_update: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Booking",
  },
  pickup_booking_updated: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Booking",
  },
  booking_confirmation: {
    icon: Clock,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    label: "Booking",
  },
  pickup_booking_created: {
    icon: Clock,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    label: "Booking",
  },
  parcel_registered: {
    icon: Package,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Parcel",
  },
  parcel_status: {
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Parcel",
  },
  queue_update: {
    icon: Clock,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    label: "Queue",
  },
  pickup_queue_updated: {
    icon: Clock,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    label: "Queue",
  },
  alert: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Alert",
  },
  system: {
    icon: Info,
    color: "text-purple-600",
    bg: "bg-purple-50",
    label: "System",
  },
}

export function AdminNotificationsDialog({
  notifications,
  unreadCount,
  loading,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onReload,
}: {
  notifications: AdminNotification[]
  unreadCount: number
  loading?: boolean
  error?: string | null
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onClearAll: () => void
  onReload: () => void
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90svh] w-[95vw] max-w-[560px] flex-col p-0">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Admin Notifications
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={onReload} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={notifications.length === 0}
                onClick={onClearAll}
              >
                Clear all
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 rounded-lg border bg-muted/40" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
              No admin notifications yet.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const config =
                  notificationConfig[notification.type] ?? notificationConfig.system
                const Icon = config.icon

                return (
                  <div
                    key={notification.id}
                    role="button"
                    tabIndex={0}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      notification.is_read
                        ? "bg-white hover:bg-gray-50"
                        : "border-blue-100 bg-blue-50"
                    }`}
                    onClick={() => onMarkAsRead(notification.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        onMarkAsRead(notification.id)
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold">{notification.title}</h4>
                            <Badge variant="outline" className="mt-1 text-[10px]">
                              {config.label}
                            </Badge>
                          </div>
                          <span className="shrink-0 text-xs text-gray-500">
                            {formatDateTime(notification.created_at)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <div className="mt-2 space-y-1 break-all text-xs text-gray-500">
                          {notification.related_id && (
                            <p>Ref: {notification.related_id}</p>
                          )}
                          {notification.related_booking_id && (
                            <p>Booking: {notification.related_booking_id}</p>
                          )}
                          {notification.related_queue_number && (
                            <p>Queue: {notification.related_queue_number}</p>
                          )}
                          {notification.related_tracking_id && (
                            <p>Tracking: {notification.related_tracking_id}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {!notification.is_read && (
                          <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                        )}
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={(event) => {
                            event.stopPropagation()
                            onDelete(notification.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <Separator />
        <div className="bg-gray-50 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          Staff alerts are generated from operational parcel, pickup, queue, and admin notification records.
          {unreadCount > 0 && (
            <button className="ml-2 font-medium text-blue-600" onClick={onMarkAllAsRead}>
              Mark all read
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
