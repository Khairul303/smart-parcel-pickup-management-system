"use client"

import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Info,
  Package,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCustomerNotifications } from "../hooks/useCustomerNotifications"
import type {
  CustomerNotification,
  CustomerNotificationType,
} from "@/lib/customer-notifications"

const notificationConfig: Record<
  CustomerNotificationType,
  {
    icon: typeof Bell
    color: string
    bg: string
    label: string
  }
> = {
  booking_confirmation: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Booking",
  },
  booking_update: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Booking",
  },
  booking_cancelled: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Cancelled",
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

const formatNotificationTime = (date: string) =>
  new Date(date).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

const NotificationItem = ({
  notification,
  onMarkAsRead,
}: {
  notification: CustomerNotification
  onMarkAsRead: (id: string) => void
}) => {
  const config =
    notificationConfig[notification.type] ?? notificationConfig.system
  const Icon = config.icon

  return (
    <button
      type="button"
      className={`w-full rounded-lg border p-4 text-left transition ${
        notification.is_read
          ? "bg-white hover:bg-gray-50"
          : "border-blue-100 bg-blue-50"
      }`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <Badge variant="outline" className="mt-1 text-[10px]">
                {config.label}
              </Badge>
            </div>
            <span className="shrink-0 text-xs text-gray-500">
              {formatNotificationTime(notification.created_at)}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            {notification.message}
          </p>

          {notification.related_id && (
            <p className="mt-2 break-all text-xs text-gray-500">
              Ref: {notification.related_id}
            </p>
          )}
        </div>

        {!notification.is_read && (
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
        )}
      </div>
    </button>
  )
}

export const NotificationsDialog = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    reload,
  } = useCustomerNotifications()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
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
              Notifications
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={reload}
                disabled={loading || !reload}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={unreadCount === 0}
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
              No notifications yet.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </div>

        <Separator />
        <div className="bg-gray-50 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          New notifications appear automatically when they are related to your account.
        </div>
      </DialogContent>
    </Dialog>
  )
}
