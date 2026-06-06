"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import supabase from "@/lib/supabase"

export const AVERAGE_QUEUE_WAIT_MINUTES = 5

const ACTIVE_QUEUE_STATUSES = ["booked", "upcoming", "checked_in"] as const

type ActiveQueueStatus = (typeof ACTIVE_QUEUE_STATUSES)[number]

export type LiveQueueItem = {
  id: string
  pickupDate: string
  timeSlot: string
  queueNumber: string
  status: ActiveQueueStatus
  preparationStatus: string | null
  queuePosition: number | null
  peopleInSlot: number
  estimatedWaitMinutes: number
  createdAt: string | null
  updatedAt: string | null
}

type PickupBookingRow = {
  id?: string | null
  user_id?: string | null
  pickup_code: string
  pickup_date: string
  time_slot: string
  queue_number: string | null
  customer_email: string | null
  status: string
  preparation_status: string | null
  created_at: string | null
  updated_at: string | null
}

const getMalaysiaDateString = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

const isActiveQueueStatus = (status: string): status is ActiveQueueStatus =>
  ACTIVE_QUEUE_STATUSES.includes(status as ActiveQueueStatus)

const isMissingUserIdColumnError = (message?: string | null) =>
  Boolean(
    message?.toLowerCase().includes("user_id") &&
      (message.toLowerCase().includes("schema cache") ||
        message.toLowerCase().includes("column"))
  )

const getQueueIndex = (queueNumber: string) =>
  Number.parseInt(queueNumber.replace(/\D/g, ""), 10) || Number.MAX_SAFE_INTEGER

type SlotQueueRow = {
  id?: string | null
  user_id?: string | null
  pickup_code: string
  queue_number: string | null
  customer_email?: string | null
  status: string
  created_at?: string | null
  updated_at?: string | null
}

type QueueGroupableRow = Pick<
  PickupBookingRow,
  "id" | "pickup_code" | "user_id"
> & {
  customer_email?: string | null
}

const getQueueSortValue = (row: {
  queue_number?: string | null
  created_at?: string | null
}) => {
  const queueIndex = getQueueIndex(row.queue_number ?? "-")
  if (queueIndex !== Number.MAX_SAFE_INTEGER) return queueIndex

  return new Date(row.created_at ?? 0).getTime()
}

const getQueueGroupingKey = (
  row: QueueGroupableRow,
  currentUserId: string | null,
  currentUserEmail: string | null
) => {
  if (row.user_id) return `user:${row.user_id}`

  if (
    currentUserId &&
    currentUserEmail &&
    row.customer_email?.toLowerCase() === currentUserEmail.toLowerCase()
  ) {
    return `user:${currentUserId}`
  }

  return `booking:${row.id ?? row.pickup_code}`
}

const buildUniqueSlotQueue = (
  slotQueue: SlotQueueRow[],
  currentUserId: string | null,
  currentUserEmail: string | null
) => {
  const grouped = new Map<string, SlotQueueRow>()

  slotQueue
    .filter((item) => isActiveQueueStatus(item.status))
    .sort((a, b) => getQueueSortValue(a) - getQueueSortValue(b))
    .forEach((item) => {
      const key = getQueueGroupingKey(item, currentUserId, currentUserEmail)
      if (!grouped.has(key)) {
        grouped.set(key, item)
      }
    })

  return Array.from(grouped.values())
}

const mapQueueRow = (
  row: PickupBookingRow,
  slotQueue: SlotQueueRow[] = [],
  currentUserId: string | null,
  currentUserEmail: string | null
): LiveQueueItem | null => {
  if (!isActiveQueueStatus(row.status)) return null

  const activeSlotQueue = buildUniqueSlotQueue(
    slotQueue,
    currentUserId,
    currentUserEmail
  )
  const rowGroupingKey = getQueueGroupingKey(row, currentUserId, currentUserEmail)
  const queuePosition =
    activeSlotQueue.findIndex(
      (item) =>
        getQueueGroupingKey(item, currentUserId, currentUserEmail) ===
        rowGroupingKey
    ) + 1
  const normalizedPosition = queuePosition > 0 ? queuePosition : null

  return {
    id: row.pickup_code,
    pickupDate: row.pickup_date,
    timeSlot: row.time_slot,
    queueNumber: row.queue_number ?? "-",
    status: row.status,
    preparationStatus: row.preparation_status,
    queuePosition: normalizedPosition,
    peopleInSlot: activeSlotQueue.length,
    estimatedWaitMinutes:
      Math.max((normalizedPosition ?? 1) - 1, 0) * AVERAGE_QUEUE_WAIT_MINUTES,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const sortQueueItems = (items: LiveQueueItem[]) =>
  [...items].sort((a, b) => {
    const dateSort = a.pickupDate.localeCompare(b.pickupDate)
    if (dateSort !== 0) return dateSort

    const slotSort = a.timeSlot.localeCompare(b.timeSlot)
    if (slotSort !== 0) return slotSort

    return getQueueIndex(a.queueNumber) - getQueueIndex(b.queueNumber)
  })

export function useLiveQueueStatus() {
  const [queueItems, setQueueItems] = useState<LiveQueueItem[]>([])
  const [peopleInQueue, setPeopleInQueue] = useState(0)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshQueue = useCallback(async (
    email?: string | null,
    currentUserId?: string | null
  ) => {
    setLoading(true)
    setError(null)

    if (!email) {
      setQueueItems([])
      setPeopleInQueue(0)
      setLoading(false)
      return
    }

    const queueResult = await supabase
      .from("pickup_bookings")
      .select(
        "id, user_id, pickup_code, pickup_date, time_slot, queue_number, customer_email, status, preparation_status, created_at, updated_at"
      )
      .eq("customer_email", email)
      .gte("pickup_date", getMalaysiaDateString())
      .in("status", [...ACTIVE_QUEUE_STATUSES])
      .order("pickup_date", { ascending: true })
      .order("time_slot", { ascending: true })

    let data = queueResult.data as PickupBookingRow[] | null
    let queueError = queueResult.error

    if (queueError && isMissingUserIdColumnError(queueError.message)) {
      const fallback = await supabase
        .from("pickup_bookings")
        .select(
          "id, pickup_code, pickup_date, time_slot, queue_number, customer_email, status, preparation_status, created_at, updated_at"
        )
        .eq("customer_email", email)
        .gte("pickup_date", getMalaysiaDateString())
        .in("status", [...ACTIVE_QUEUE_STATUSES])
        .order("pickup_date", { ascending: true })
        .order("time_slot", { ascending: true })

      data = fallback.data as PickupBookingRow[] | null
      queueError = fallback.error
    }

    if (queueError) {
      setError(queueError.message)
      setQueueItems([])
      setLoading(false)
      return
    }

    const customerRows = ((data ?? []) as PickupBookingRow[]).filter((row) =>
      isActiveQueueStatus(row.status)
    )

    const slotKeys = Array.from(
      new Set(customerRows.map((row) => `${row.pickup_date}|||${row.time_slot}`))
    )
    const slotQueues = new Map<string, SlotQueueRow[]>()

    await Promise.all(
      slotKeys.map(async (key) => {
        const [pickupDate, timeSlot] = key.split("|||")
        const slotResult = await supabase
          .from("pickup_bookings")
          .select("id, user_id, pickup_code, queue_number, customer_email, status, created_at, updated_at")
          .eq("pickup_date", pickupDate)
          .eq("time_slot", timeSlot)
          .in("status", [...ACTIVE_QUEUE_STATUSES])

        let slotData = slotResult.data as SlotQueueRow[] | null
        let slotError = slotResult.error

        if (slotError && isMissingUserIdColumnError(slotError.message)) {
          const fallback = await supabase
            .from("pickup_bookings")
            .select("id, pickup_code, queue_number, customer_email, status, created_at, updated_at")
            .eq("pickup_date", pickupDate)
            .eq("time_slot", timeSlot)
            .in("status", [...ACTIVE_QUEUE_STATUSES])

          slotData = fallback.data as SlotQueueRow[] | null
          slotError = fallback.error
        }

        if (slotError) {
          setError(slotError.message)
          slotQueues.set(key, [])
          return
        }

        slotQueues.set(key, (slotData ?? []) as SlotQueueRow[])
      })
    )

    const mapped = customerRows
      .map((row) =>
        mapQueueRow(
          row,
          slotQueues.get(`${row.pickup_date}|||${row.time_slot}`),
          currentUserId ?? null,
          email
        )
      )
      .filter((item): item is LiveQueueItem => Boolean(item))

    const sorted = sortQueueItems(mapped)
    setQueueItems(sorted)
    setPeopleInQueue(sorted[0]?.peopleInSlot ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!active) return

      const email = user?.email ?? null
      const currentUserId = user?.id ?? null
      setUserEmail(email)
      setUserId(currentUserId)
      await refreshQueue(email, currentUserId)

      if (!email || !active) return

      const safeEmail = email.replaceAll(",", "")

      channel = supabase
        .channel("customer-dashboard-live-queue")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "pickup_bookings",
            filter: `customer_email=eq.${safeEmail}`,
          },
          () => {
            refreshQueue(email, currentUserId)
          }
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            setError("Unable to connect to live queue updates.")
          }
        })
    }

    loadUser()

    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [refreshQueue])

  useEffect(() => {
    if (!userEmail || !queueItems[0]) return

    const watchedDate = queueItems[0].pickupDate
    const watchedTimeSlot = queueItems[0].timeSlot
    const channel = supabase
      .channel(`customer-slot-queue-${watchedDate}-${watchedTimeSlot}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pickup_bookings",
          filter: `pickup_date=eq.${watchedDate}`,
        },
        (payload) => {
          const row = (payload.eventType === "DELETE" ? payload.old : payload.new) as
            | Partial<PickupBookingRow>
            | undefined

          if (row?.time_slot && row.time_slot !== watchedTimeSlot) return
          refreshQueue(userEmail, userId)
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          setError("Unable to connect to this time slot's queue updates.")
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queueItems, refreshQueue, userEmail, userId])

  const currentWaitMinutes =
    queueItems[0]?.estimatedWaitMinutes ??
    Math.max((queueItems[0]?.queuePosition ?? 1) - 1, 0) *
      AVERAGE_QUEUE_WAIT_MINUTES
  const userQueueItem = useMemo(
    () => (userEmail ? queueItems[0] ?? null : null),
    [queueItems, userEmail]
  )

  const refreshCurrentQueue = useCallback(
    () => refreshQueue(userEmail, userId),
    [refreshQueue, userEmail, userId]
  )

  return {
    queueItems,
    peopleInQueue,
    currentWaitMinutes,
    userQueueItem,
    loading,
    error,
    refreshQueue: refreshCurrentQueue,
  }
}
