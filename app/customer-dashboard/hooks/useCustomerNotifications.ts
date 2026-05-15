"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import supabase from "@/lib/supabase"
import type { CustomerNotification } from "@/lib/customer-notifications"

const isMissingNotificationsTableError = (message?: string | null) =>
  message?.toLowerCase().includes("public.notifications") &&
  message.toLowerCase().includes("schema cache")

const isMissingAudienceColumnError = (message?: string | null) =>
  message?.toLowerCase().includes("audience") &&
  (message.toLowerCase().includes("schema cache") ||
    message.toLowerCase().includes("column"))

const sortNotifications = (items: CustomerNotification[]) =>
  [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

export function useCustomerNotifications() {
  const [userId, setUserId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<CustomerNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  )

  const loadNotifications = useCallback(async (ownerId: string) => {
    setLoading(true)
    setError(null)

    let { data, error: notificationsError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", ownerId)
      .eq("audience", "customer")
      .order("created_at", { ascending: false })
      .limit(50)

    if (notificationsError && isMissingAudienceColumnError(notificationsError.message)) {
      const fallback = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", ownerId)
        .order("created_at", { ascending: false })
        .limit(50)

      data = fallback.data
      notificationsError = fallback.error
    }

    if (notificationsError) {
      if (isMissingNotificationsTableError(notificationsError.message)) {
        setNotifications([])
        setLoading(false)
        return false
      }

      setError(notificationsError.message)
      setNotifications([])
      setLoading(false)
      return false
    }

    setNotifications(sortNotifications((data ?? []) as CustomerNotification[]))
    setLoading(false)
    return true
  }, [])

  useEffect(() => {
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    const load = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        if (active) {
          setError(authError.message)
          setLoading(false)
        }
        return
      }

      if (!user) {
        if (active) {
          setUserId(null)
          setNotifications([])
          setLoading(false)
        }
        return
      }

      if (!active) return

      setUserId(user.id)
      const available = await loadNotifications(user.id)

      if (!active || !available) return

      channel = supabase
        .channel(`customer-notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === "DELETE") {
              const oldNotification = payload.old as Partial<CustomerNotification>
              setNotifications((prev) =>
                prev.filter((item) => item.id !== oldNotification.id)
              )
              return
            }

            const nextNotification = payload.new as CustomerNotification
            if (nextNotification.user_id !== user.id) return
            if (nextNotification.audience && nextNotification.audience !== "customer") return

            setNotifications((prev) => {
              const withoutCurrent = prev.filter(
                (item) => item.id !== nextNotification.id
              )
              return sortNotifications([nextNotification, ...withoutCurrent])
            })
          }
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            setError("Unable to connect to notification updates.")
          }
        })
    }

    load()

    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [loadNotifications])

  const markAsRead = useCallback(
    async (id: string) => {
      if (!userId) return

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      )

      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", userId)

      if (updateError) {
        if (isMissingNotificationsTableError(updateError.message)) {
          setError(null)
          return
        }

        setError(updateError.message)
      }
    },
    [userId]
  )

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!userId) return
      if (!confirm("Delete this notification?")) return

      const previousNotifications = notifications
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      )
      setError(null)

      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)

      if (deleteError) {
        setNotifications(previousNotifications)

        if (isMissingNotificationsTableError(deleteError.message)) {
          setError(null)
          return
        }

        setError(deleteError.message || "Unable to delete this notification.")
      }
    },
    [notifications, userId]
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, is_read: true }))
    )

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (updateError) {
      if (isMissingNotificationsTableError(updateError.message)) {
        setError(null)
        return
      }

      setError(updateError.message)
    }
  }, [unreadCount, userId])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reload: userId ? () => loadNotifications(userId) : undefined,
  }
}
