"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import supabase from "@/lib/supabase"

export const AVERAGE_QUEUE_WAIT_MINUTES = 5

const ACTIVE_QUEUE_STATUSES = ["booked", "checked_in"] as const

type ActiveQueueStatus = (typeof ACTIVE_QUEUE_STATUSES)[number]

export type LiveQueueItem = {
  id: string
  pickupDate: string
  timeSlot: string
  queueNumber: string
  customerEmail: string | null
  customerName: string | null
  status: ActiveQueueStatus
  preparationStatus: string | null
  trackingIds: string[]
  createdAt: string | null
  updatedAt: string | null
}

type PickupBookingRow = {
  pickup_code: string
  pickup_date: string
  time_slot: string
  queue_number: string | null
  customer_email: string | null
  customer_name: string | null
  status: string
  preparation_status: string | null
  tracking_ids: string[] | null
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

const mapQueueRow = (row: PickupBookingRow): LiveQueueItem | null => {
  if (!isActiveQueueStatus(row.status)) return null

  return {
    id: row.pickup_code,
    pickupDate: row.pickup_date,
    timeSlot: row.time_slot,
    queueNumber: row.queue_number ?? "-",
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    status: row.status,
    preparationStatus: row.preparation_status,
    trackingIds: row.tracking_ids ?? [],
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
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshQueue = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: queueError } = await supabase
      .from("pickup_bookings")
      .select(
        "pickup_code, pickup_date, time_slot, queue_number, customer_email, customer_name, status, preparation_status, tracking_ids, created_at, updated_at"
      )
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

    const mapped = ((data ?? []) as PickupBookingRow[])
      .map(mapQueueRow)
      .filter((item): item is LiveQueueItem => Boolean(item))

    setQueueItems(sortQueueItems(mapped))
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (active) setUserEmail(user?.email ?? null)
    }

    loadUser()
    Promise.resolve().then(refreshQueue)

    const channel = supabase
      .channel("customer-dashboard-live-queue")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pickup_bookings",
        },
        (payload) => {
          const eventType = payload.eventType

          if (eventType === "DELETE") {
            const oldRow = payload.old as Partial<PickupBookingRow>
            setQueueItems((prev) =>
              prev.filter((item) => item.id !== oldRow.pickup_code)
            )
            return
          }

          const nextItem = mapQueueRow(payload.new as PickupBookingRow)

          setQueueItems((prev) => {
            const withoutCurrent = prev.filter(
              (item) =>
                item.id !==
                ((payload.new as Partial<PickupBookingRow>).pickup_code ?? "")
            )

            if (!nextItem) return sortQueueItems(withoutCurrent)
            return sortQueueItems([nextItem, ...withoutCurrent])
          })
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          setError("Unable to connect to live queue updates.")
        }
      })

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [refreshQueue])

  const peopleInQueue = queueItems.length
  const currentWaitMinutes = peopleInQueue * AVERAGE_QUEUE_WAIT_MINUTES
  const userQueueItem = useMemo(
    () =>
      userEmail
        ? queueItems.find(
            (item) =>
              item.customerEmail?.toLowerCase() === userEmail.toLowerCase()
          ) ?? null
        : null,
    [queueItems, userEmail]
  )

  return {
    queueItems,
    peopleInQueue,
    currentWaitMinutes,
    userQueueItem,
    loading,
    error,
    refreshQueue,
  }
}
