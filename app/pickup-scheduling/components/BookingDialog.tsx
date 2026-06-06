"use client"

import { Calendar, CheckCircle, Clock } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import supabase from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { BookingParcelEntry, NewPickupPayload } from "./PickupScheduling"
import { PICKUP_STATUS } from "@/lib/pickup-status"
import {
  ACTIVE_PICKUP_STATUSES,
  calculateUsedQuota,
  formatMalaysiaDate,
  getEstimatedMinutes,
  getParcelCount,
  getTimeSlotUnavailableReason,
  normalizeTimeSlot,
  SLOT_QUOTA_UNITS,
} from "@/lib/pickup-scheduling"
import { useUserTrackingIds } from "@/app/customer-dashboard/hooks/useUserTrackingIds"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: string
  selectedTimeSlot: string
  onBook: (
    pickup: NewPickupPayload & {
      status: typeof PICKUP_STATUS.BOOKED
      trackingIds: string[]
      bookingParcels: BookingParcelEntry[]
      estimatedMinutes: number
      estimatedWaitMinutes: number
    }
  ) => Promise<boolean>
}

interface Profile {
  id: string
  full_name: string
  no_telephone: string
  email: string
  address?: string
  role?: string
  created_at?: string
}

interface SlotAvailability {
  time_slot: string
  remaining: number
}

interface PickupBookingQuotaRow {
  time_slot: string | null
  tracking_ids?: string[] | null
}

interface PreviewResult {
  queue_number?: number
  estimated_wait_minutes?: number
  available_quota?: number
}

interface ManualTrackingParcel {
  parcel_id: string
  tracking_id: string
  courier?: string | null
  current_status?: string | null
  receiver_name?: string | null
}

type ManualTrackingValidationResult = ManualTrackingParcel | null

const READY_PARCEL_STATUSES = new Set([
  "ready",
  "ready-for-pickup",
  "ready_to_pickup",
  "arrived",
])

type SuccessSummary = {
  pickupDate: string
  timeSlot: string
  queueNumber: number | null
  trackingIds: string[]
  estimatedWaitMinutes: number
}

export function BookingDialog({
  isOpen,
  onOpenChange,
  selectedDate,
  selectedTimeSlot,
  onBook,
}: Props) {
  const [queuePreview, setQueuePreview] = useState<number | null>(null)
  const [estimatedWaitMinutes, setEstimatedWaitMinutes] = useState(0)
  const [availableQuota, setAvailableQuota] = useState<number | null>(null)
  const [selectedTrackingIds, setSelectedTrackingIds] = useState<string[]>([])
  const [manualTrackingId, setManualTrackingId] = useState("")
  const [manualTrackingParcels, setManualTrackingParcels] = useState<
    ManualTrackingParcel[]
  >([])
  const [manualTrackingMessage, setManualTrackingMessage] = useState<string | null>(null)
  const [validatingManualTrackingId, setValidatingManualTrackingId] = useState(false)
  const [livePreviewKey, setLivePreviewKey] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successSummary, setSuccessSummary] = useState<SuccessSummary | null>(null)
  const [notice, setNotice] = useState<{
    title: string
    message: string
  } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const {
    trackingParcels,
    loading: trackingIdsLoading,
    error: trackingIdsError,
  } = useUserTrackingIds()
  const [formData, setFormData] = useState({
    pickupAddress: "",
    parcelDetails: "",
    specialInstructions: "",
  })

  const availableParcels = useMemo(
    () =>
      trackingParcels.filter(
        (parcel) =>
          parcel.tracking_id &&
          READY_PARCEL_STATUSES.has((parcel.status ?? "").toLowerCase())
      ),
    [trackingParcels]
  )
  const availableTrackingIds = useMemo(
    () => availableParcels.map((parcel) => parcel.tracking_id),
    [availableParcels]
  )
  const selectedRegisteredParcels = useMemo<BookingParcelEntry[]>(
    () =>
      selectedTrackingIds.reduce<BookingParcelEntry[]>((items, trackingId) => {
          const parcel = availableParcels.find(
            (item) => item.tracking_id.toLowerCase() === trackingId.toLowerCase()
          )

          if (!parcel?.id || !parcel.tracking_id) return items

          return [
            ...items,
            {
            parcelId: parcel.id,
            trackingId: parcel.tracking_id.trim(),
            source: "registered" as const,
            },
          ]
        }, []),
    [availableParcels, selectedTrackingIds]
  )
  const selectedManualParcels = useMemo<BookingParcelEntry[]>(
    () =>
      manualTrackingParcels.map((parcel) => ({
        parcelId: parcel.parcel_id,
        trackingId: parcel.tracking_id.trim(),
        source: "manual",
      })),
    [manualTrackingParcels]
  )
  const bookingParcels = useMemo(() => {
    const seen = new Set<string>()

    return [...selectedRegisteredParcels, ...selectedManualParcels].filter(
      (parcel) => {
        const key = parcel.trackingId.toLowerCase()
        if (!parcel.parcelId || !parcel.trackingId || seen.has(key)) return false
        seen.add(key)
        return true
      }
    )
  }, [selectedManualParcels, selectedRegisteredParcels])
  const cleanTrackingIds = useMemo(() => {
    return bookingParcels.map((parcel) => parcel.trackingId)
  }, [bookingParcels])
  const parcelCount = getParcelCount(cleanTrackingIds, formData.parcelDetails)
  const estimatedMinutes = getEstimatedMinutes(parcelCount)
  const quotaError =
    availableQuota !== null && availableQuota < estimatedMinutes
      ? `This slot only has ${availableQuota} quota left. Your booking needs ${estimatedMinutes}.`
      : submitError

  useEffect(() => {
    if (!isOpen) return

    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("profile_with_email")
        .select("*")
        .eq("id", user.id)
        .single<Profile>()

      if (!error && data) {
        setProfile(data)
      } else {
        console.warn("Failed to load profile:", error)
      }
    }

    fetchProfile()
  }, [isOpen])

  useEffect(() => {
    let active = true

    const fetchQueuePreview = async () => {
      if (!isOpen || !selectedDate || !selectedTimeSlot) {
        if (active) {
          setQueuePreview(null)
          setEstimatedWaitMinutes(0)
          setAvailableQuota(null)
          setSubmitError(null)
        }
        return
      }

      const { data: slotData } = await supabase.rpc("get_available_slots", {
        p_date: selectedDate,
      })
      const matchingSlot = (slotData as SlotAvailability[] | null)?.find(
        (slot) =>
          normalizeTimeSlot(slot.time_slot) === normalizeTimeSlot(selectedTimeSlot)
      )
      const remaining = matchingSlot?.remaining ?? SLOT_QUOTA_UNITS

      const { data: detailedPreview, error: detailedError } = await supabase.rpc(
        "preview_pickup_queue",
        {
          p_date: selectedDate,
          p_time_slot: selectedTimeSlot,
        }
      )

      if (!active) return

      if (!detailedError && detailedPreview) {
        const preview = Array.isArray(detailedPreview)
          ? detailedPreview[0]
          : detailedPreview
        const normalized = preview as PreviewResult

        setQueuePreview(normalized.queue_number ?? null)
        setEstimatedWaitMinutes(normalized.estimated_wait_minutes ?? 0)
        setAvailableQuota(normalized.available_quota ?? remaining)
        return
      }

      const { data, error } = await supabase.rpc("preview_queue_number", {
        p_date: selectedDate,
        p_time_slot: selectedTimeSlot,
      })

      if (!active) return

      if (!error) {
        const nextQueueNumber = Number(data ?? 1)
        setQueuePreview(nextQueueNumber)
        setEstimatedWaitMinutes(Math.max(nextQueueNumber - 1, 0))
      }

      setAvailableQuota(remaining)
    }

    fetchQueuePreview()

    return () => {
      active = false
    }
  }, [estimatedMinutes, isOpen, livePreviewKey, selectedDate, selectedTimeSlot])

  useEffect(() => {
    if (!isOpen || !selectedDate) return

    const channel = supabase
      .channel(`customer-booking-preview-${selectedDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pickup_bookings",
          filter: `pickup_date=eq.${selectedDate}`,
        },
        (payload) => {
          const row = (payload.eventType === "DELETE" ? payload.old : payload.new) as
            | { time_slot?: string | null }
            | undefined

          if (row?.time_slot && row.time_slot !== selectedTimeSlot) return
          setLivePreviewKey((key) => key + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen, selectedDate, selectedTimeSlot])

  const fetchLatestAvailableQuota = async () => {
    const { data: bookings, error: bookingsError } = await supabase
      .from("pickup_bookings")
      .select("time_slot, tracking_ids")
      .eq("pickup_date", selectedDate)
      .in("status", ACTIVE_PICKUP_STATUSES)

    if (!bookingsError) {
      const matchingBookings = ((bookings ?? []) as PickupBookingQuotaRow[]).filter(
        (booking) =>
          normalizeTimeSlot(booking.time_slot) === normalizeTimeSlot(selectedTimeSlot)
      )
      const usedQuota = calculateUsedQuota(matchingBookings)

      return Math.max(SLOT_QUOTA_UNITS - usedQuota, 0)
    }

    const { data, error } = await supabase.rpc("get_available_slots", {
      p_date: selectedDate,
    })

    if (error) return SLOT_QUOTA_UNITS

    const matchingSlot = (data as SlotAvailability[] | null)?.find(
      (slot) =>
        normalizeTimeSlot(slot.time_slot) === normalizeTimeSlot(selectedTimeSlot)
    )

    return matchingSlot?.remaining ?? SLOT_QUOTA_UNITS
  }

  const showUnavailableNotice = (message: string) => {
    setSubmitError(message)
    setNotice({
      title: "Time Slot Unavailable",
      message,
    })
  }

  const validateManualTrackingId = async (
    trackingId: string,
    currentTrackingIds: string[]
  ): Promise<ManualTrackingValidationResult> => {
    const cleanTrackingId = trackingId.trim()

    if (!cleanTrackingId) return null

    if (
      currentTrackingIds.some(
        (id) => id.toLowerCase() === cleanTrackingId.toLowerCase()
      )
    ) {
      setSubmitError("This tracking ID has already been added to this booking.")
      setManualTrackingMessage(null)
      return null
    }

    setValidatingManualTrackingId(true)
    setSubmitError(null)
    setManualTrackingMessage(null)

    const { data, error } = await supabase.rpc("validate_manual_tracking_id", {
      p_tracking_id: cleanTrackingId,
      p_current_tracking_ids: currentTrackingIds,
    })

    setValidatingManualTrackingId(false)

    if (error) {
      console.warn({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      setSubmitError(error.message || "Tracking ID not found.")
      return null
    }

    const parcel = Array.isArray(data) ? data[0] : data

    if (!parcel?.tracking_id) {
      setSubmitError("Tracking ID not found.")
      return null
    }

    return parcel as ManualTrackingParcel
  }

  const handleAddManualTrackingId = async () => {
    const currentTrackingIds = [
      ...selectedTrackingIds,
      ...manualTrackingParcels.map((parcel) => parcel.tracking_id),
    ]
    const parcel = await validateManualTrackingId(
      manualTrackingId,
      currentTrackingIds
    )

    if (!parcel) return

    setManualTrackingParcels((prev) => [...prev, parcel])
    setManualTrackingId("")
    setManualTrackingMessage("Tracking ID added successfully.")
  }

  const handleSubmit = async () => {
    if (!profile || !selectedDate || !selectedTimeSlot) {
      alert("Please complete required fields")
      return
    }

    let finalBookingParcels = bookingParcels

    if (manualTrackingId.trim()) {
      const pendingManualParcel = await validateManualTrackingId(
        manualTrackingId,
        finalBookingParcels.map((parcel) => parcel.trackingId)
      )

      if (!pendingManualParcel) return

      finalBookingParcels = [
        ...finalBookingParcels,
        {
          parcelId: pendingManualParcel.parcel_id,
          trackingId: pendingManualParcel.tracking_id.trim(),
          source: "manual",
        },
      ]
    }

    const normalizedBookingParcels = finalBookingParcels.reduce<BookingParcelEntry[]>(
      (items, parcel) => {
        const trackingId = parcel.trackingId.trim()
        const key = trackingId.toLowerCase()

        if (!parcel.parcelId || !trackingId) return items
        if (items.some((item) => item.trackingId.toLowerCase() === key)) {
          return items
        }

        return [...items, { ...parcel, trackingId }]
      },
      []
    )
    const finalTrackingIds = normalizedBookingParcels.map(
      (parcel) => parcel.trackingId
    )
    const finalEstimatedMinutes = getEstimatedMinutes(
      getParcelCount(finalTrackingIds, formData.parcelDetails)
    )

    if (finalTrackingIds.length === 0) {
      setSubmitError("Please add at least one tracking ID before confirming the pickup.")
      return
    }

    const latestQuota = await fetchLatestAvailableQuota()
    const remainingQuota = latestQuota ?? availableQuota ?? SLOT_QUOTA_UNITS
    const unavailableReason = getTimeSlotUnavailableReason(
      selectedDate,
      selectedTimeSlot,
      remainingQuota
    )

    if (unavailableReason) {
      showUnavailableNotice(unavailableReason)
      return
    }

    if (latestQuota !== null) setAvailableQuota(latestQuota)

    if (latestQuota !== null && latestQuota < finalEstimatedMinutes) {
      showUnavailableNotice(
        `This slot only has ${latestQuota} quota left, but your booking requires ${finalEstimatedMinutes}.`
      )
      return
    }

    const booked = await onBook({
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      status: PICKUP_STATUS.BOOKED,
      customerName: profile.full_name,
      customerPhone: profile.no_telephone,
      customerEmail: profile.email,
      pickupAddress: formData.pickupAddress,
      parcelDetails:
        formData.parcelDetails.trim() ||
        `Tracking ID(s): ${finalTrackingIds.join(", ")}`,
      specialInstructions: formData.specialInstructions,
      trackingIds: finalTrackingIds,
      bookingParcels: normalizedBookingParcels,
      estimatedMinutes: finalEstimatedMinutes,
      estimatedWaitMinutes,
    })

    if (booked) {
      setSuccessSummary({
        pickupDate: selectedDate,
        timeSlot: selectedTimeSlot,
        queueNumber: queuePreview,
        trackingIds: finalTrackingIds,
        estimatedWaitMinutes,
      })
      setSelectedTrackingIds([])
      setManualTrackingId("")
      setManualTrackingParcels([])
      setManualTrackingMessage(null)
      setFormData((prev) => ({ ...prev, parcelDetails: "" }))
      onOpenChange(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedTrackingIds([])
      setManualTrackingId("")
      setManualTrackingParcels([])
      setManualTrackingMessage(null)
      setSubmitError(null)
      setNotice(null)
    }

    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Pickup</DialogTitle>
          <DialogDescription>
            Review your pickup details before confirmation
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatMalaysiaDate(selectedDate)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {selectedTimeSlot}
            </div>

            {queuePreview !== null && (
              <>
                <div className="sm:col-span-2 text-sm font-medium text-blue-600">
                  Estimated Queue Number: Q-
                  {String(queuePreview).padStart(3, "0")}
                </div>
                <div className="sm:col-span-2 text-xs text-muted-foreground">
                  Estimated waiting time: ~{estimatedWaitMinutes} minutes
                </div>
                <div className="sm:col-span-2 text-xs text-muted-foreground">
                  This booking uses {estimatedMinutes} quota unit
                  {estimatedMinutes === 1 ? "" : "s"} for {parcelCount} parcel
                  {parcelCount === 1 ? "" : "s"}.
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Input placeholder="Name" value={profile?.full_name ?? ""} disabled />
          <Input placeholder="Phone" value={profile?.no_telephone ?? ""} disabled />
          <Input placeholder="Email" value={profile?.email ?? ""} disabled />

          <Textarea
            placeholder="Pickup Address"
            value={formData.pickupAddress}
            onChange={(e) =>
              setFormData({ ...formData, pickupAddress: e.target.value })
            }
          />
          <Textarea
            placeholder="Parcel Details (optional)"
            value={formData.parcelDetails}
            onChange={(e) =>
              setFormData({ ...formData, parcelDetails: e.target.value })
            }
          />

          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium">Available Parcels at PostCentre</div>
                <p className="text-xs text-muted-foreground">
                  Select one or more parcels for this pickup.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={availableTrackingIds.length === 0}
                onClick={() => {
                  const manualTrackingIdSet = new Set(
                    manualTrackingParcels.map((parcel) =>
                      parcel.tracking_id.toLowerCase()
                    )
                  )
                  const selectableTrackingIds = availableTrackingIds.filter(
                    (id) => !manualTrackingIdSet.has(id.toLowerCase())
                  )
                  const allSelected =
                    selectedTrackingIds.length === selectableTrackingIds.length
                  setSelectedTrackingIds(allSelected ? [] : selectableTrackingIds)
                  setSubmitError(null)
                }}
              >
                {selectedTrackingIds.length === availableTrackingIds.length &&
                availableTrackingIds.length > 0
                  ? "Clear All"
                  : "Select All"}
              </Button>
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
              {trackingIdsLoading ? (
                <p className="text-sm text-muted-foreground">Loading parcels...</p>
              ) : availableParcels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No parcel available for pickup.
                </p>
              ) : (
                availableParcels.map((parcel) => {
                  const checked = selectedTrackingIds.includes(parcel.tracking_id)

                  return (
                    <label
                      key={parcel.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(nextChecked) => {
                          const alreadyAddedManually = manualTrackingParcels.some(
                            (manualParcel) =>
                              manualParcel.tracking_id.toLowerCase() ===
                              parcel.tracking_id.toLowerCase()
                          )

                          if (nextChecked === true && alreadyAddedManually) {
                            setSubmitError(
                              "This tracking ID has already been added to this booking."
                            )
                            return
                          }

                          setSelectedTrackingIds((prev) =>
                            nextChecked === true
                              ? Array.from(new Set([...prev, parcel.tracking_id]))
                              : prev.filter((id) => id !== parcel.tracking_id)
                          )
                          setSubmitError(null)
                        }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block break-all text-sm font-medium">
                          {parcel.tracking_id}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {parcel.sender ? `From ${parcel.sender}` : "Ready for pickup"}
                        </span>
                      </span>
                    </label>
                  )
                })
              )}
            </div>
            {trackingIdsError && (
              <p className="text-sm text-red-500">{trackingIdsError}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Or enter tracking ID manually</div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Enter tracking ID"
                value={manualTrackingId}
                onChange={(e) => {
                  setManualTrackingId(e.target.value)
                  setSubmitError(null)
                  setManualTrackingMessage(null)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleAddManualTrackingId()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddManualTrackingId}
                disabled={!manualTrackingId.trim() || validatingManualTrackingId}
              >
                {validatingManualTrackingId ? "Checking..." : "Add"}
              </Button>
            </div>
            {manualTrackingMessage && (
              <p className="text-sm text-green-600">{manualTrackingMessage}</p>
            )}
            {manualTrackingParcels.length > 0 && (
              <div className="space-y-2 rounded-md border p-3">
                {manualTrackingParcels.map((parcel) => (
                  <div
                    key={parcel.parcel_id}
                    className="flex flex-col gap-2 rounded-md bg-gray-50 p-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="break-all font-medium">{parcel.tracking_id}</div>
                      <div className="text-xs text-muted-foreground">
                        {parcel.courier ? `${parcel.courier} - ` : ""}
                        {parcel.current_status ?? "Ready for pickup"}
                        {parcel.receiver_name ? ` - Receiver: ${parcel.receiver_name}` : ""}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setManualTrackingParcels((prev) =>
                          prev.filter((item) => item.parcel_id !== parcel.parcel_id)
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {selectedTrackingIds.length > 0 && manualTrackingParcels.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Selected parcels and manual tracking IDs will be combined.
              </p>
            )}
          </div>

          {availableQuota !== null && (
            <div className="rounded-md border bg-gray-50 p-3 text-sm">
              <div className="font-medium">
                {availableQuota} slots available for {selectedTimeSlot}
              </div>
              <div className="text-xs text-muted-foreground">
                Your current parcel count requires {estimatedMinutes} slot
                {estimatedMinutes === 1 ? "" : "s"}.
              </div>
            </div>
          )}

          {quotaError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {quotaError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!profile}>
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={Boolean(notice)} onOpenChange={(open) => !open && setNotice(null)}>
        <DialogContent className="w-[92vw] max-w-sm">
          <DialogHeader>
            <DialogTitle>{notice?.title ?? "Time Slot Unavailable"}</DialogTitle>
            <DialogDescription>
              {notice?.message ??
                "This time slot is unavailable. Please choose another slot."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setNotice(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(successSummary)}
        onOpenChange={(open) => !open && setSuccessSummary(null)}
      >
        <DialogContent className="w-[92vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Booking Successful
            </DialogTitle>
            <DialogDescription>
              Your pickup booking has been created successfully.
            </DialogDescription>
          </DialogHeader>
          {successSummary && (
            <div className="space-y-3 rounded-md border bg-gray-50 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Pickup Date</span>
                <span className="font-medium">
                  {formatMalaysiaDate(successSummary.pickupDate)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Time Slot</span>
                <span className="font-medium">{successSummary.timeSlot}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Queue</span>
                <span className="font-medium">
                  {successSummary.queueNumber
                    ? `Q-${String(successSummary.queueNumber).padStart(3, "0")}`
                    : "Pending"}
                </span>
              </div>
              <div>
                <div className="text-muted-foreground">Tracking ID(s)</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {successSummary.trackingIds.map((id) => (
                    <span key={id} className="rounded-md border bg-white px-2 py-1 text-xs">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Estimated Wait</span>
                <span className="font-medium">
                  ~{successSummary.estimatedWaitMinutes} minutes
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSuccessSummary(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

