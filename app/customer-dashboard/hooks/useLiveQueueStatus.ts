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

const getQueueIndex = (queueNumber: string) =>
  Number.parseInt(queueNumber.replace(/\D/g, ""), 10) || Number.MAX_SAFE_INTEGER

type SlotQueueRow = {
  pickup_code: string
  queue_number: string | null
  status: string
}

const mapQueueRow = (
  row: PickupBookingRow,
  slotQueue: SlotQueueRow[] = []
): LiveQueueItem | null => {
  if (!isActiveQueueStatus(row.status)) return null

  const activeSlotQueue = slotQueue
    .filter((item) => isActiveQueueStatus(item.status))
    .sort(
      (a, b) =>
        getQueueIndex(a.queue_number ?? "-") - getQueueIndex(b.queue_number ?? "-")
    )
  const queuePosition =
    activeSlotQueue.findIndex((item) => item.pickup_code === row.pickup_code) + 1
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshQueue = useCallback(async (email?: string | null) => {
    setLoading(true)
    setError(null)

    if (!email) {
      setQueueItems([])
      setPeopleInQueue(0)
      setLoading(false)
      return
    }

    const { data, error: queueError } = await supabase
      .from("pickup_bookings")
      .select(
        "pickup_code, pickup_date, time_slot, queue_number, customer_email, status, preparation_status, created_at, updated_at"
      )
      .eq("customer_email", email)
      .gte("pickup_date", getMalaysiaDateString())
      .in("status", [...ACTIVE_QUEUE_STATUSES])
      .order("pickup_date", { ascending: true })
      .order("time_slot", { ascending: true })

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
        const { data: slotData, error: slotError } = await supabase
          .from("pickup_bookings")
          .select("pickup_code, queue_number, status")
          .eq("pickup_date", pickupDate)
          .eq("time_slot", timeSlot)
          .in("status", [...ACTIVE_QUEUE_STATUSES])

        if (slotError) {
          setError(slotError.message)
          slotQueues.set(key, [])
          return
        }

        slotQueues.set(key, (slotData ?? []) as SlotQueueRow[])
      })
    )

    const mapped = customerRows
      .map((row) => mapQueueRow(row, slotQueues.get(`${row.pickup_date}|||${row.time_slot}`)))
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
      setUserEmail(email)
      await refreshQueue(email)

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
            refreshQueue(email)
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
          refreshQueue(userEmail)
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
  }, [queueItems, refreshQueue, userEmail])

  const currentWaitMinutes =
    queueItems[0]?.estimatedWaitMinutes ??
    Math.max((queueItems[0]?.queuePosition ?? 1) - 1, 0) *
      AVERAGE_QUEUE_WAIT_MINUTES
  const userQueueItem = useMemo(
    () => (userEmail ? queueItems[0] ?? null : null),
    [queueItems, userEmail]
  )

  const refreshCurrentQueue = useCallback(
    () => refreshQueue(userEmail),
    [refreshQueue, userEmail]
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
