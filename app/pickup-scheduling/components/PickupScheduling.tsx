"use client"

import { useEffect, useState } from "react"
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
  queueNumber?: string
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
}

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
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPickup, setEditingPickup] = useState<PickupSchedule | null>(null)

  // 🔐 Logged-in user email
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // 🔄 Refresh key
  const [refreshKey, setRefreshKey] = useState(0)

  const upcomingCount = pickupHistory.filter((p) =>
    isUpcomingPickupStatus(p.status)
  ).length
  const collectedCount = pickupHistory.filter(
    (p) => normalizePickupStatus(p.status) === "collected"
  ).length
  const cancelledCount = pickupHistory.filter(
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

  // ======================
  // LOAD PICKUP HISTORY (BY EMAIL)
  // ======================
  useEffect(() => {
    if (!userEmail) return

    let active = true

    const loadPickups = async () => {
      const { data, error } = await supabase
        .from("pickup_bookings")
        .select("*")
        .eq("customer_email", userEmail) // ✅ FILTER BY EMAIL
        .order("created_at", { ascending: false })

      if (error || !active) {
        console.error("Failed to load pickups:", error)
        return
      }

      const formatted: PickupSchedule[] = data.map((p) => ({
        id: p.pickup_code,
        date: p.pickup_date,
        timeSlot: p.time_slot,
        status: p.status,
        customerName: p.customer_name,
        customerPhone: p.customer_phone,
        customerEmail: p.customer_email,
        pickupAddress: p.pickup_address,
        parcelDetails: p.parcel_details,
        specialInstructions: p.special_instructions,
        queueNumber: p.queue_number,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }))

      setPickupHistory(formatted)
    }

    loadPickups()

    return () => {
      active = false
    }
  }, [refreshKey, userEmail])

  // ======================
  // CONFIRM BOOKING
  // ======================
  const handleNewBooking = async (newPickup: NewPickupPayload) => {
    const { error } = await supabase.rpc("book_pickup_confirmed", {
      p_date: newPickup.date,
      p_time_slot: newPickup.timeSlot,
      p_customer_name: newPickup.customerName,
      p_customer_phone: newPickup.customerPhone,
      p_customer_email: newPickup.customerEmail,
      p_pickup_address: newPickup.pickupAddress,
      p_parcel_details: newPickup.parcelDetails,
      p_tracking_ids: [],
    })

    if (error) {
      console.error(error)
      alert(error.message ?? "Booking failed. Please try again.")
      return
    }

    setRefreshKey((prev) => prev + 1)
    setSelectedTimeSlot("")
    onBookingDialogChange?.(false)
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
              <div className="text-2xl font-bold">{pickupHistory.length}</div>
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
              <PickupStats pickups={pickupHistory} />
            </div>
          </div>

          <PickupHistory
            pickups={pickupHistory}
            onEdit={(pickup) => {
              setEditingPickup(pickup)
              setIsEditDialogOpen(true)
            }}
            onCancel={handleCancelBooking}
            onReschedule={(pickup) => {
              setSelectedDate(pickup.date)
              setSelectedTimeSlot(pickup.timeSlot)
              onBookingDialogChange?.(true)
            }}
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
