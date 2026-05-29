"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import supabase from "@/lib/supabase"
import { getMalaysiaDateString } from "@/lib/pickup-scheduling"

export type AdminParcel = {
  id: string
  tracking_id?: string | null
  sender?: string | null
  receiver?: string | null
  receiver_phone?: string | null
  receiver_email?: string | null
  status?: string | null
  priority?: string | null
  weight?: string | null
  dimensions?: string | null
  location?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type AdminPickupBooking = {
  id?: string | null
  pickup_code: string
  pickup_date?: string | null
  time_slot?: string | null
  queue_number?: string | null
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  pickup_address?: string | null
  parcel_details?: string | null
  tracking_ids?: string[] | null
  status?: string | null
  preparation_status?: string | null
  estimated_minutes?: number | null
  estimated_wait_minutes?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export type AdminNotification = {
  id: string
  title: string
  message: string
  type: string
  related_id: string | null
  related_booking_id?: string | null
  related_tracking_id?: string | null
  related_queue_number?: string | null
  audience?: string | null
  role_target?: string | null
  user_id?: string | null
  is_read: boolean
  created_at: string
}

const completedParcelStatuses = new Set(["completed", "delivered", "collected"])
const readyParcelStatuses = new Set(["ready", "ready-for-pickup"])
const cancelledStatuses = new Set(["cancelled", "canceled"])
const activePickupStatuses = new Set(["booked", "upcoming", "checked_in"])
const completedPickupStatuses = new Set(["completed", "collected"])

const sortByNewest = <T extends { created_at?: string | null; updated_at?: string | null }>(
  items: T[]
) =>
  [...items].sort(
    (a, b) =>
      new Date(b.created_at ?? b.updated_at ?? 0).getTime() -
      new Date(a.created_at ?? a.updated_at ?? 0).getTime()
  )

export const formatRelativeTime = (value?: string | null) => {
  if (!value) return "No date"

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return "No date"

  const diff = Date.now() - timestamp
  const minutes = Math.max(0, Math.floor(diff / 60000))

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`

  return new Date(value).toLocaleDateString()
}

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "No date"

export const toTitle = (value?: string | null) =>
  (value || "unknown")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

export const isTodayInMalaysia = (value?: string | null) =>
  Boolean(value) && getMalaysiaDateString(new Date(value as string)) === getMalaysiaDateString()

const getRecordId = (item: AdminParcel | AdminPickupBooking) =>
  "pickup_code" in item ? item.pickup_code : item.id

const upsertById = <T extends AdminParcel | AdminPickupBooking>(items: T[], next: T) =>
  sortByNewest([
    next,
    ...items.filter((item) => getRecordId(item) !== getRecordId(next)),
  ])

const normalizeAdminNotification = (item: Partial<AdminNotification>): AdminNotification => ({
  id: String(item.id ?? crypto.randomUUID()),
  title: item.title ?? "Operational Update",
  message: item.message ?? "A system record was updated.",
  type: item.type ?? "system",
  related_id: item.related_id ?? null,
  related_booking_id: item.related_booking_id ?? null,
  related_tracking_id: item.related_tracking_id ?? null,
  related_queue_number: item.related_queue_number ?? null,
  audience: item.audience ?? null,
  role_target: item.role_target ?? null,
  user_id: item.user_id ?? null,
  is_read: Boolean(item.is_read),
  created_at: item.created_at ?? new Date().toISOString(),
})

const isAdminNotification = (item: Partial<AdminNotification>) =>
  item.audience === "admin" ||
  item.audience === "staff" ||
  item.role_target === "admin" ||
  item.role_target === "staff" ||
  (!item.user_id && item.audience !== "customer")

const buildOperationalNotifications = (
  parcels: AdminParcel[],
  pickups: AdminPickupBooking[]
): AdminNotification[] => {
  const parcelAlerts = sortByNewest(parcels)
    .slice(0, 8)
    .map((parcel) => {
      const trackingId = parcel.tracking_id ?? parcel.id
      const status = parcel.status ?? "registered"

      return normalizeAdminNotification({
        id: `parcel-${parcel.id}-${parcel.updated_at ?? parcel.created_at ?? ""}`,
        title: readyParcelStatuses.has(status)
          ? "Parcel Ready to Pickup"
          : completedParcelStatuses.has(status)
            ? "Parcel Collected"
            : "Parcel Status Updated",
        message: `${trackingId} is ${toTitle(status)}${parcel.receiver ? ` for ${parcel.receiver}` : ""}.`,
        type: "parcel_status",
        related_id: trackingId,
        created_at: parcel.updated_at ?? parcel.created_at ?? new Date().toISOString(),
      })
    })

  const pickupAlerts = sortByNewest(pickups)
    .slice(0, 8)
    .map((pickup) =>
      normalizeAdminNotification({
        id: `pickup-${pickup.pickup_code}-${pickup.updated_at ?? pickup.created_at ?? ""}`,
        title: cancelledStatuses.has(pickup.status ?? "")
          ? "Pickup Booking Cancelled"
          : "Pickup Booking Updated",
        message: `${pickup.customer_name ?? "Customer"} ${toTitle(
          pickup.status
        ).toLowerCase()} ${pickup.queue_number ? `with queue ${pickup.queue_number}` : "a pickup booking"}.`,
        type: cancelledStatuses.has(pickup.status ?? "") ? "booking_cancelled" : "queue_update",
        related_id: pickup.pickup_code,
        created_at: pickup.updated_at ?? pickup.created_at ?? new Date().toISOString(),
      })
    )

  return sortByNewest([...parcelAlerts, ...pickupAlerts]).slice(0, 20)
}

export function useAdminRealtimeData({
  parcels: includeParcels = true,
  pickups: includePickups = true,
  notifications: includeNotifications = true,
}: {
  parcels?: boolean
  pickups?: boolean
  notifications?: boolean
} = {}) {
  const [parcels, setParcels] = useState<AdminParcel[]>([])
  const [pickups, setPickups] = useState<AdminPickupBooking[]>([])
  const [dbNotifications, setDbNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setError(null)

    const parcelRequest = includeParcels
      ? supabase
          .from("parcels")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500)
      : Promise.resolve({ data: [], error: null })
    const pickupRequest = includePickups
      ? supabase
          .from("pickup_bookings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500)
      : Promise.resolve({ data: [], error: null })

    const [parcelResult, pickupResult] = await Promise.all([
      parcelRequest,
      pickupRequest,
    ])

    if (includeParcels) {
      if (parcelResult.error) {
        setError(parcelResult.error.message)
        setParcels([])
      } else {
        setParcels(sortByNewest((parcelResult.data ?? []) as AdminParcel[]))
      }
    }

    if (includePickups) {
      if (pickupResult.error) {
        setError((current) => current ?? pickupResult.error.message)
        setPickups([])
      } else {
        setPickups(sortByNewest((pickupResult.data ?? []) as AdminPickupBooking[]))
      }
    }

    if (includeNotifications) {
      const adminNotifications = await supabase
        .from("notifications")
        .select("*")
        .or("audience.in.(admin,staff),role_target.in.(admin,staff),user_id.is.null")
        .order("created_at", { ascending: false })
        .limit(50)

      if (!adminNotifications.error) {
        setDbNotifications(
          sortByNewest(
            (adminNotifications.data ?? [])
              .filter(isAdminNotification)
              .map(normalizeAdminNotification)
          )
        )
      } else {
        const globalNotifications = await supabase
          .from("notifications")
          .select("*")
          .is("user_id", null)
          .order("created_at", { ascending: false })
          .limit(50)

        if (!globalNotifications.error) {
          setDbNotifications(
            sortByNewest(
              (globalNotifications.data ?? [])
                .filter(isAdminNotification)
                .map(normalizeAdminNotification)
            )
          )
        } else {
          setError((current) => current ?? globalNotifications.error.message)
        }
      }
    }

    setLoading(false)
  }, [includeNotifications, includeParcels, includePickups])

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      await loadData()
    }

    load()

    const channels: ReturnType<typeof supabase.channel>[] = []

    if (includeParcels) {
      channels.push(
        supabase
          .channel("admin-dashboard-parcels")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "parcels" },
            (payload) => {
              if (!active) return

              if (payload.eventType === "DELETE") {
                const oldRow = payload.old as Partial<AdminParcel>
                setParcels((prev) => prev.filter((parcel) => parcel.id !== oldRow.id))
                return
              }

              setParcels((prev) => upsertById(prev, payload.new as AdminParcel))
            }
          )
          .subscribe()
      )
    }

    if (includePickups) {
      channels.push(
        supabase
          .channel("admin-dashboard-pickups")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "pickup_bookings" },
            (payload) => {
              if (!active) return

              if (payload.eventType === "DELETE") {
                const oldRow = payload.old as Partial<AdminPickupBooking>
                setPickups((prev) =>
                  prev.filter((pickup) => pickup.pickup_code !== oldRow.pickup_code)
                )
                return
              }

              setPickups((prev) =>
                upsertById(prev, payload.new as AdminPickupBooking)
              )
            }
          )
          .subscribe()
      )
    }

    if (includeNotifications) {
      channels.push(
        supabase
          .channel("admin-dashboard-notifications")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "notifications" },
            (payload) => {
              if (!active) return

              if (payload.eventType === "DELETE") {
                const oldNotification = payload.old as Partial<AdminNotification>
                setDbNotifications((prev) =>
                  prev.filter((item) => item.id !== oldNotification.id)
                )
                return
              }

              const nextNotification = payload.new as Partial<AdminNotification>
              if (!isAdminNotification(nextNotification)) return

              setDbNotifications((prev) => {
                const normalized = normalizeAdminNotification(nextNotification)
                return sortByNewest([
                  normalized,
                  ...prev.filter((item) => item.id !== normalized.id),
                ])
              })
            }
          )
          .subscribe()
      )
    }

    return () => {
      active = false
      channels.forEach((channel) => supabase.removeChannel(channel))
    }
  }, [includeNotifications, includeParcels, includePickups, loadData])

  const notifications = useMemo(
    () =>
      sortByNewest([
        ...dbNotifications,
        ...buildOperationalNotifications(parcels, pickups),
      ]).filter(
        (notification, index, items) =>
          items.findIndex((item) => item.id === notification.id) === index
      ),
    [dbNotifications, parcels, pickups]
  )

  const markNotificationAsRead = useCallback(async (id: string) => {
    setDbNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification
      )
    )

    await supabase.from("notifications").update({ is_read: true }).eq("id", id)
  }, [])

  const markAllNotificationsAsRead = useCallback(async () => {
    setDbNotifications((prev) =>
      prev.map((notification) => ({ ...notification, is_read: true }))
    )

    const ids = dbNotifications
      .filter((notification) => !notification.is_read)
      .map((notification) => notification.id)

    if (ids.length > 0) {
      await supabase.from("notifications").update({ is_read: true }).in("id", ids)
    }
  }, [dbNotifications])

  const deleteNotification = useCallback(async (id: string) => {
    setDbNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    )

    await supabase.from("notifications").delete().eq("id", id)
  }, [])

  const clearNotifications = useCallback(async () => {
    const ids = dbNotifications.map((notification) => notification.id)
    setDbNotifications([])

    if (ids.length > 0) {
      await supabase.from("notifications").delete().in("id", ids)
    }
  }, [dbNotifications])

  return {
    parcels,
    pickups,
    notifications,
    unreadAdminNotifications: notifications.filter((item) => !item.is_read).length,
    loading,
    error,
    reload: loadData,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearNotifications,
  }
}

export const getAdminDashboardMetrics = (
  parcels: AdminParcel[],
  pickups: AdminPickupBooking[]
) => {
  const completedParcels = parcels.filter((parcel) =>
    completedParcelStatuses.has(parcel.status ?? "")
  ).length
  const readyParcels = parcels.filter((parcel) =>
    readyParcelStatuses.has(parcel.status ?? "")
  ).length
  const completedPickups = pickups.filter((pickup) =>
    completedPickupStatuses.has(pickup.status ?? "")
  ).length
  const cancelledPickups = pickups.filter((pickup) =>
    cancelledStatuses.has(pickup.status ?? "")
  ).length
  const activePickups = pickups.filter((pickup) =>
    activePickupStatuses.has(pickup.status ?? "")
  ).length
  const successRate =
    pickups.length > 0 ? Math.round((completedPickups / pickups.length) * 100) : 0
  const noShowRate =
    pickups.length > 0
      ? Math.round(
          (pickups.filter((pickup) => pickup.status === "no_show").length /
            pickups.length) *
            100
        )
      : 0
  const processingHours =
    completedParcels > 0
      ? parcels
          .filter(
            (parcel) =>
              completedParcelStatuses.has(parcel.status ?? "") &&
              parcel.created_at &&
              parcel.updated_at
          )
          .reduce((total, parcel) => {
            const created = new Date(parcel.created_at as string).getTime()
            const updated = new Date(parcel.updated_at as string).getTime()
            return total + Math.max(updated - created, 0) / 3600000
          }, 0) / Math.max(completedParcels, 1)
      : 0

  return {
    totalParcels: parcels.length,
    readyParcels,
    completedParcels,
    cancelledParcels: parcels.filter((parcel) =>
      cancelledStatuses.has(parcel.status ?? "")
    ).length,
    totalPickups: pickups.length,
    activePickups,
    completedPickups,
    cancelledPickups,
    successRate,
    noShowRate,
    queueEfficiency:
      pickups.length > 0
        ? Math.round(((completedPickups + activePickups) / pickups.length) * 100)
        : 0,
    onTimeRate:
      pickups.length > 0
        ? Math.round(
            (pickups.filter((pickup) => pickup.status !== "no_show").length /
              pickups.length) *
              100
          )
        : 0,
    processingHours,
  }
}
