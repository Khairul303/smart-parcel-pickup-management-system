"use client"

import { useCallback, useEffect, useState } from "react"
import supabase from "@/lib/supabase"
import { PickupCalendar } from "./PickupCalendar"
import { PickupHistory } from "./PickupHistory"
import { CustomerInfo } from "./CustomerInfo"
import { PickupStats } from "./PickupStats"
import { BookingDialog } from "./BookingDialog"
import { EditDialog } from "./EditDialog"
import {
  isUpcomingPickupStatus,
  normalizePickupStatus,
} from "@/lib/pickup-status"
import type { PickupStatus } from "@/lib/pickup-status"
import { createNotificationForCurrentUser } from "@/lib/customer-notifications"
import { createAdminNotification } from "@/lib/admin-notifications"
import {
  getEstimatedMinutes,
  getParcelCount,
  getTimeSlotUnavailableReason,
} from "@/lib/pickup-scheduling"

const PICKUP_HISTORY_PAGE_SIZE = 5

const getPickupStatusFilterValues = (status: string) => {
  if (status === "all") return null
  if (status === "upcoming") return ["booked", "upcoming", "pending"]
  if (status === "collected") return ["collected", "completed"]
  return [status]
}

// ======================
// TYPES
// ======================
export interface PickupSchedule {
  id: string
  date: string
  timeSlot: string
  status: PickupStatus
  customerName: string
  customerPhone: string
  customerEmail: string
  pickupAddress: string
  parcelDetails: string
  specialInstructions?: string
  trackingIds?: string[]
  relatedParcels?: {
    id: string
    tracking_id?: string | null
    status?: string | null
    sender?: string | null
    receiver?: string | null
  }[]
  queueNumber?: string
  estimatedWaitMinutes?: number
  createdAt: string
  updatedAt: string
}

export interface NewPickupPayload {
  date: string
  timeSlot: string
  customerName: string
  customerPhone: string
  customerEmail: string
  pickupAddress: string
  parcelDetails: string
  specialInstructions?: string
  trackingIds?: string[]
  bookingParcels?: BookingParcelEntry[]
  estimatedMinutes?: number
  estimatedWaitMinutes?: number
}

export type BookingParcelEntry = {
  parcelId: string
  trackingId: string
  source: "registered" | "manual"
}

interface PickupBookingRow {
  pickup_code: string
  pickup_date: string
  time_slot: string
  status: string
  customer_name: string
  customer_phone: string
  customer_email: string
  pickup_address: string
  parcel_details: string
  special_instructions?: string | null
  tracking_ids?: string[] | null
  queue_number?: string | null
  estimated_wait_minutes?: number | null
  created_at: string
  updated_at: string
}

interface ConfirmedPickupResult {
  pickup_code: string
  queue_number: string | null
  tracking_ids: string[] | null
}

type SupabaseErrorDetails = {
  message?: string
  details?: string
  hint?: string
  code?: string
}

type BookPickupRpcPayload = {
  p_date: string
  p_time_slot: string
  p_customer_name: string
  p_customer_phone: string
  p_customer_email: string
  p_pickup_address: string
  p_parcel_details: string
  p_tracking_ids: string[]
}

const logSupabaseError = (error: SupabaseErrorDetails) => {
  console.warn({
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  })
}

const isMissingBookingRpcSignature = (error: SupabaseErrorDetails) =>
  error.code === "PGRST202" ||
  error.message?.includes("Could not find the function") ||
  error.message?.includes("schema cache")

interface PickupSchedulingProps {
  isBookingDialogOpen?: boolean
  onBookingDialogChange?: (open: boolean) => void
}

// ======================
// COMPONENT
// ======================
export function PickupScheduling({
  isBookingDialogOpen = false,
  onBookingDialogChange,
}: PickupSchedulingProps) {
  const [pickupHistory, setPickupHistory] = useState<PickupSchedule[]>([])
  const [pickupStatsHistory, setPickupStatsHistory] = useState<PickupSchedule[]>([])
  const [pickupHistoryTotal, setPickupHistoryTotal] = useState(0)
  const [pickupHistoryPage, setPickupHistoryPage] = useState(1)
  const [pickupHistorySearch, setPickupHistorySearch] = useState("")
  const [pickupHistoryStatus, setPickupHistoryStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPickup, setEditingPickup] = useState<PickupSchedule | null>(null)

  // 🔐 Logged-in user email
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // 🔄 Refresh key
  const [refreshKey, setRefreshKey] = useState(0)

  const upcomingCount = pickupStatsHistory.filter((p) =>
    isUpcomingPickupStatus(p.status)
  ).length
  const collectedCount = pickupStatsHistory.filter(
    (p) => normalizePickupStatus(p.status) === "collected"
  ).length
  const cancelledCount = pickupStatsHistory.filter(
    (p) => normalizePickupStatus(p.status) === "cancelled"
  ).length

  // ======================
  // LOAD USER EMAIL
  // ======================
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUserEmail(user?.email ?? null)
    }

    loadUser()
  }, [])

  const mapPickupRows = useCallback(
    async (rows: PickupBookingRow[]): Promise<PickupSchedule[]> => {
      const allTrackingIds = Array.from(
        new Set(
          rows.flatMap((p) =>
            Array.isArray(p.tracking_ids) ? p.tracking_ids.filter(Boolean) : []
          )
        )
      )
      const { data: parcelRows } =
        allTrackingIds.length > 0
          ? await supabase
              .from("parcels")
              .select("id, tracking_id, status, sender, receiver")
              .in("tracking_id", allTrackingIds)
          : { data: [] }
      const parcelsByTrackingId = new Map(
        ((parcelRows ?? []) as NonNullable<PickupSchedule["relatedParcels"]>).map(
          (parcel) => [parcel.tracking_id, parcel]
        )
      )

      return rows.map((p) => {
        const trackingIds = p.tracking_ids ?? []

        return {
          id: p.pickup_code,
          date: p.pickup_date,
          timeSlot: p.time_slot,
          status: p.status as PickupStatus,
          customerName: p.customer_name,
          customerPhone: p.customer_phone,
          customerEmail: p.customer_email,
          pickupAddress: p.pickup_address,
          parcelDetails: p.parcel_details,
          specialInstructions: p.special_instructions ?? undefined,
          trackingIds,
          relatedParcels: trackingIds
            .map((id: string) => parcelsByTrackingId.get(id))
            .filter(Boolean) as PickupSchedule["relatedParcels"],
          queueNumber: p.queue_number ?? undefined,
          estimatedWaitMinutes: p.estimated_wait_minutes ?? undefined,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }
      })
    },
    []
  )

  const loadPickups = useCallback(async () => {
    if (!userEmail) return

    const from = (pickupHistoryPage - 1) * PICKUP_HISTORY_PAGE_SIZE
    const to = from + PICKUP_HISTORY_PAGE_SIZE - 1
    const safeSearch = pickupHistorySearch.trim().replaceAll(",", " ")
    const statusValues = getPickupStatusFilterValues(pickupHistoryStatus)

    let query = supabase
      .from("pickup_bookings")
      .select("*", { count: "exact" })
      .eq("customer_email", userEmail)

    if (statusValues) {
      query = query.in("status", statusValues)
    }

    if (safeSearch) {
      query = query.or(
        `pickup_code.ilike.%${safeSearch}%,parcel_details.ilike.%${safeSearch}%,pickup_address.ilike.%${safeSearch}%`
      )
    }

    const { data, error, count } = await query
      .order("pickup_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) {
      console.warn("Failed to load pickups:", error)
      return
    }

    const total = count ?? 0
    const maxPage = Math.max(1, Math.ceil(total / PICKUP_HISTORY_PAGE_SIZE))

    if (total > 0 && from >= total && pickupHistoryPage > maxPage) {
      setPickupHistoryPage(maxPage)
      return
    }

    const formatted = await mapPickupRows((data ?? []) as PickupBookingRow[])
    setPickupHistory(formatted)
    setPickupHistoryTotal(total || formatted.length)
  }, [
    mapPickupRows,
    pickupHistoryPage,
    pickupHistorySearch,
    pickupHistoryStatus,
    userEmail,
  ])

  useEffect(() => {
    if (!userEmail) return

    const loadStats = async () => {
      const { data, error } = await supabase
        .from("pickup_bookings")
        .select("*")
        .eq("customer_email", userEmail)
        .order("created_at", { ascending: false })

      if (error) {
        console.warn("Failed to load pickup stats:", error)
        return
      }

      setPickupStatsHistory(await mapPickupRows((data ?? []) as PickupBookingRow[]))
    }

    loadStats()
  }, [mapPickupRows, refreshKey, userEmail])

  // ======================
  // LOAD PICKUP HISTORY (PAGED BY EMAIL)
  // ======================
  useEffect(() => {
    if (!userEmail) return

    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    const loadActivePickups = async () => {
      if (!active) return
      await loadPickups()
    }

    loadActivePickups()

    channel = supabase
      .channel(`customer-pickup-history-${userEmail}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pickup_bookings",
          filter: `customer_email=eq.${userEmail.replaceAll(",", "")}`,
        },
        () => {
          loadActivePickups()
        }
      )
      .subscribe()

    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [loadPickups, refreshKey, userEmail])

  // ======================
  // CONFIRM BOOKING
  // ======================
  const handleNewBooking = async (newPickup: NewPickupPayload) => {
    const normalizedBookingParcels = (newPickup.bookingParcels ?? [])
      .map((parcel) => ({
        parcelId: parcel.parcelId.trim(),
        trackingId: parcel.trackingId.trim(),
        source: parcel.source,
      }))
      .filter((parcel) => parcel.parcelId && parcel.trackingId)
      .filter(
        (parcel, index, parcels) =>
          parcels.findIndex(
            (item) =>
              item.trackingId.toLowerCase() === parcel.trackingId.toLowerCase()
          ) === index
      )
    const trackingIds = normalizedBookingParcels.length
      ? normalizedBookingParcels.map((parcel) => parcel.trackingId)
      : Array.from(
          new Set((newPickup.trackingIds ?? []).map((id) => id.trim()).filter(Boolean))
        )
    const estimatedMinutes =
      newPickup.estimatedMinutes ??
      getEstimatedMinutes(getParcelCount(trackingIds, newPickup.parcelDetails))

    if (trackingIds.length === 0) {
      alert("Please add at least one tracking ID before confirming the pickup.")
      return false
    }

    const { data: availabilityData } = await supabase.rpc("get_available_slots", {
      p_date: newPickup.date,
    })
    const selectedSlot = (
      availabilityData as { time_slot: string; remaining: number }[] | null
    )?.find((slot) => slot.time_slot === newPickup.timeSlot)
    const remainingQuota = selectedSlot?.remaining ?? 0
    const unavailableReason = getTimeSlotUnavailableReason(
      newPickup.date,
      newPickup.timeSlot,
      remainingQuota
    )

    if (unavailableReason) {
      alert(unavailableReason)
      return false
    }

    if (selectedSlot && selectedSlot.remaining < estimatedMinutes) {
      alert(
        `This time slot only has ${selectedSlot.remaining} quota left. Your booking needs ${estimatedMinutes}.`
      )
      return false
    }

    const rpcPayload: BookPickupRpcPayload = {
      p_date: newPickup.date,
      p_time_slot: newPickup.timeSlot,
      p_customer_name: newPickup.customerName,
      p_customer_phone: newPickup.customerPhone,
      p_customer_email: newPickup.customerEmail,
      p_pickup_address: newPickup.pickupAddress,
      p_parcel_details: newPickup.parcelDetails,
      p_tracking_ids: trackingIds,
    }
    const bookingParcelsPayload = normalizedBookingParcels.map((parcel) => ({
      parcel_id: parcel.parcelId,
      tracking_id: parcel.trackingId,
      source: parcel.source,
    }))

    const bookingStartedAt = new Date().toISOString()
    let { data, error } = await supabase.rpc("book_pickup_confirmed", {
      ...rpcPayload,
      p_booking_parcels: bookingParcelsPayload,
    })

    let usedLegacyBookingRpc = false

    if (error && isMissingBookingRpcSignature(error)) {
      logSupabaseError(error)
      usedLegacyBookingRpc = true
      const fallback = await supabase.rpc("book_pickup_confirmed", rpcPayload)
      data = fallback.data
      error = fallback.error
    }

    if (error) {
      logSupabaseError(error)
      alert(
        error.message?.includes("Tracking ID") ||
          error.message?.includes("parcel")
          ? error.message
          : "Pickup booking failed. No changes were saved."
      )
      return false
    }

    const createdBooking = (
      Array.isArray(data) ? data[0] : data
    ) as ConfirmedPickupResult | null
    let resolvedBooking = createdBooking

    if (usedLegacyBookingRpc) {
      const { data: latestBooking, error: lookupError } = await supabase
        .from("pickup_bookings")
        .select("pickup_code, queue_number, tracking_ids")
        .eq("pickup_date", newPickup.date)
        .eq("time_slot", newPickup.timeSlot)
        .eq("customer_email", newPickup.customerEmail)
        .gte("created_at", bookingStartedAt)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<ConfirmedPickupResult>()

      if (lookupError) {
        logSupabaseError(lookupError)
        alert("Unable to save the parcels for this pickup booking.")
        return false
      }

      resolvedBooking = latestBooking ?? null
    }

    if (!resolvedBooking?.pickup_code) {
      console.warn("Booking RPC did not return the newly created booking ID.")
      alert("Pickup booking failed. No changes were saved.")
      return false
    }

    let savedTrackingIds = resolvedBooking.tracking_ids ?? []
    let missingTrackingIds = trackingIds.filter(
      (trackingId) =>
        !savedTrackingIds.some(
          (savedId) => savedId.toLowerCase() === trackingId.toLowerCase()
        )
    )

    if (usedLegacyBookingRpc && missingTrackingIds.length > 0) {
      const { data: repairedBooking, error: repairError } = await supabase
        .from("pickup_bookings")
        .update({
          tracking_ids: trackingIds,
          estimated_minutes: estimatedMinutes,
          updated_at: new Date().toISOString(),
        })
        .eq("pickup_code", resolvedBooking.pickup_code)
        .eq("customer_email", newPickup.customerEmail)
        .select("pickup_code, queue_number, tracking_ids")
        .maybeSingle<ConfirmedPickupResult>()

      if (repairError) {
        logSupabaseError(repairError)
        alert("Unable to save the parcels for this pickup booking.")
        return false
      }

      savedTrackingIds = repairedBooking?.tracking_ids ?? []
      missingTrackingIds = trackingIds.filter(
        (trackingId) =>
          !savedTrackingIds.some(
            (savedId) => savedId.toLowerCase() === trackingId.toLowerCase()
          )
      )
    }

    if (missingTrackingIds.length > 0) {
      console.warn("Pickup booking was created without all requested tracking IDs.", {
        requestedTrackingIds: trackingIds,
        savedTrackingIds,
      })
      alert("Unable to save the parcels for this pickup booking.")
      return false
    }

    const bookingId = resolvedBooking.pickup_code
    const queueNumber = resolvedBooking.queue_number ?? null
    const bookedTrackingIds = savedTrackingIds

    await createNotificationForCurrentUser({
      title: "Pickup Booking Created",
      message: "Pickup booking confirmed successfully.",
      type: "booking_confirmation",
      relatedId: bookingId,
    })

    await createAdminNotification({
      title: "New Pickup Booking",
      message: `A new pickup booking has been created by ${newPickup.customerName} for ${newPickup.date} at ${newPickup.timeSlot}.`,
      type: "new_booking",
      relatedId: bookingId,
      relatedBookingId: bookingId,
      relatedTrackingId: bookedTrackingIds.join(", ") || null,
      relatedQueueNumber: queueNumber,
    })

    setRefreshKey((prev) => prev + 1)
    setSelectedTimeSlot("")
    onBookingDialogChange?.(false)
    return true
  }

  // ======================
  // EDIT BOOKING
  // ======================
  const handleEditBooking = async (updatedPickup: PickupSchedule) => {
    const { error } = await supabase
      .from("pickup_bookings")
      .update({
        pickup_date: updatedPickup.date,
        time_slot: updatedPickup.timeSlot,
        pickup_address: updatedPickup.pickupAddress,
        parcel_details: updatedPickup.parcelDetails,
        // special_instructions: updatedPickup.specialInstructions,
        updated_at: new Date().toISOString(),
      })
      .eq("pickup_code", updatedPickup.id)
      .eq("customer_email", userEmail)

    if (error) {
      alert("Failed to update booking")
      return
    }

    await createNotificationForCurrentUser({
      title: "Pickup Booking Updated",
      message: "Your pickup booking details have been updated.",
      type: "booking_update",
      relatedId: updatedPickup.id,
    })

    await createAdminNotification({
      title: "Pickup Booking Updated",
      message: `${updatedPickup.customerName} updated pickup ${updatedPickup.id}.`,
      type: "pickup_booking_updated",
      relatedId: updatedPickup.id,
      relatedBookingId: updatedPickup.id,
      relatedTrackingId: updatedPickup.trackingIds?.join(", ") || null,
    })

    setIsEditDialogOpen(false)
    setEditingPickup(null)
    setRefreshKey((prev) => prev + 1)
  }

  // ======================
  // CANCEL BOOKING
  // ======================
  const handleCancelBooking = async (pickupId: string) => {
    if (!confirm("Are you sure you want to cancel this pickup?")) return

    const { error } = await supabase
      .from("pickup_bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("pickup_code", pickupId)
      .eq("customer_email", userEmail)

    if (error) {
      alert("Failed to cancel booking")
      return
    }

    await createNotificationForCurrentUser({
      title: "Pickup Cancelled",
      message: "Your pickup booking has been cancelled.",
      type: "booking_cancelled",
      relatedId: pickupId,
    })

    await createAdminNotification({
      title: "Pickup Booking Cancelled",
      message: `Pickup booking ${pickupId} has been cancelled.`,
      type: "booking_cancelled",
      relatedId: pickupId,
      relatedBookingId: pickupId,
    })

    setRefreshKey((prev) => prev + 1)
  }

  const handleDeleteCancelledBooking = async (pickupId: string) => {
    let deleted = false
    const { data, error } = await supabase.rpc("delete_cancelled_pickup_booking", {
      p_pickup_code: pickupId,
    })

    if (!error && data === true) {
      deleted = true
    } else if (error && isMissingBookingRpcSignature(error)) {
      logSupabaseError(error)

      const { data: deletedBooking, error: deleteError } = await supabase
        .from("pickup_bookings")
        .delete()
        .eq("pickup_code", pickupId)
        .eq("customer_email", userEmail)
        .eq("status", "cancelled")
        .select("pickup_code")
        .maybeSingle<{ pickup_code: string }>()

      if (deleteError) {
        logSupabaseError(deleteError)
        alert("Failed to delete cancelled booking.")
        return
      }

      deleted = Boolean(deletedBooking?.pickup_code)
    } else if (error) {
      logSupabaseError(error)
      alert(error?.message ?? "Failed to delete cancelled booking.")
      return
    }

    if (!deleted) {
      alert("Only your own cancelled bookings can be deleted.")
      return
    }

    alert("Cancelled booking deleted successfully.")
    setPickupHistory((prev) => prev.filter((pickup) => pickup.id !== pickupId))
    setPickupStatsHistory((prev) => prev.filter((pickup) => pickup.id !== pickupId))
    setPickupHistoryTotal((prev) => Math.max(prev - 1, 0))
    setRefreshKey((prev) => prev + 1)
  }

  const handleOpenBookingDialog = () => {
    onBookingDialogChange?.(true)
  }

  // ======================
  // UI
  // ======================
  return (
    <>
      <main className="min-h-screen min-w-0 bg-gray-50/50">
        <div className="w-full min-w-0 space-y-6 p-3 sm:p-4 md:p-6">
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500">Total Pickups</div>
              <div className="text-2xl font-bold">{pickupStatsHistory.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500">Upcoming</div>
              <div className="text-2xl font-bold text-blue-600">
                {upcomingCount}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500">Collected</div>
              <div className="text-2xl font-bold text-green-600">
                {collectedCount}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-sm text-gray-500">Cancelled</div>
              <div className="text-2xl font-bold text-red-600">
                {cancelledCount}
              </div>
            </div>
          </div>

          <div className="grid min-w-0 gap-6 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
              <PickupCalendar
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
                onDateSelect={setSelectedDate}
                onTimeSlotSelect={setSelectedTimeSlot}
                onBookingOpen={handleOpenBookingDialog}
                refreshKey={refreshKey}
              />
            </div>

            <div className="min-w-0 space-y-6">
              <CustomerInfo />
              <PickupStats pickups={pickupStatsHistory} />
            </div>
          </div>

          <PickupHistory
            pickups={pickupHistory}
            onEdit={(pickup) => {
              setEditingPickup(pickup)
              setIsEditDialogOpen(true)
            }}
            onCancel={handleCancelBooking}
            onDeleteCancelled={handleDeleteCancelledBooking}
            onReschedule={(pickup) => {
              setSelectedDate(pickup.date)
              setSelectedTimeSlot(pickup.timeSlot)
              onBookingDialogChange?.(true)
            }}
            page={pickupHistoryPage}
            pageSize={PICKUP_HISTORY_PAGE_SIZE}
            totalCount={pickupHistoryTotal}
            searchQuery={pickupHistorySearch}
            statusFilter={pickupHistoryStatus}
            onSearchChange={(value) => {
              setPickupHistorySearch(value)
              setPickupHistoryPage(1)
            }}
            onStatusFilterChange={(value) => {
              setPickupHistoryStatus(value)
              setPickupHistoryPage(1)
            }}
            onPageChange={setPickupHistoryPage}
          />
        </div>

        <BookingDialog
          isOpen={isBookingDialogOpen}
          onOpenChange={onBookingDialogChange || (() => {})}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          onBook={handleNewBooking}
        />

        <EditDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          pickup={editingPickup}
          onSave={handleEditBooking}
        />
      </main>
    </>
  )
}


