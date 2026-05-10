"use client"

import { AdminNotificationsDialog } from "./AdminNotificationsDialog"
import { useAdminRealtimeData } from "@/lib/admin-realtime"

export function AdminNotificationButton() {
  const adminNotifications = useAdminRealtimeData({
    parcels: false,
    pickups: false,
  })

  return (
    <AdminNotificationsDialog
      notifications={adminNotifications.notifications}
      unreadCount={adminNotifications.unreadAdminNotifications}
      loading={adminNotifications.loading}
      error={adminNotifications.error}
      onMarkAsRead={adminNotifications.markNotificationAsRead}
      onMarkAllAsRead={adminNotifications.markAllNotificationsAsRead}
      onDelete={adminNotifications.deleteNotification}
      onClearAll={adminNotifications.clearNotifications}
      onReload={adminNotifications.reload}
    />
  )
}
