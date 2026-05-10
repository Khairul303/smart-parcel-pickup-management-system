"use client"

import { Calendar, Clock } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { NewPickupPayload } from "./PickupScheduling"
import { PICKUP_STATUS } from "@/lib/pickup-status"
import {
  formatMalaysiaDate,
  getEstimatedMinutes,
  getParcelCount,
} from "@/lib/pickup-scheduling"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: string
  selectedTimeSlot: string
  onBook: (
    pickup: NewPickupPayload & {
      status: typeof PICKUP_STATUS.BOOKED
      trackingIds: string[]
      estimatedMinutes: number
      estimatedWaitMinutes: number
    }
  ) => void
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

interface PreviewResult {
  queue_number?: number
  estimated_wait_minutes?: number
  available_quota?: number
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
  const [trackingIds, setTrackingIds] = useState<string[]>([""])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({
    pickupAddress: "",
    parcelDetails: "",
    specialInstructions: "",
  })

  const cleanTrackingIds = useMemo(
    () => trackingIds.map((id) => id.trim()).filter(Boolean),
    [trackingIds]
  )
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
        console.error("Failed to load profile:", error)
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
        (slot) => slot.time_slot === selectedTimeSlot
      )
      const remaining = matchingSlot?.remaining ?? null

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
  }, [estimatedMinutes, isOpen, selectedDate, selectedTimeSlot])

  const handleTrackingChange = (index: number, value: string) => {
    const updated = [...trackingIds]
    updated[index] = value
    setTrackingIds(updated)
  }

  const addTrackingField = () => {
    setTrackingIds([...trackingIds, ""])
  }

  const handleSubmit = () => {
    if (!profile || !selectedDate || !selectedTimeSlot || !formData.parcelDetails.trim()) {
      alert("Please complete required fields")
      return
    }

    if (availableQuota !== null && availableQuota < estimatedMinutes) {
      setSubmitError("This slot does not have enough quota. Please choose another time slot.")
      return
    }

    onBook({
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      status: PICKUP_STATUS.BOOKED,
      customerName: profile.full_name,
      customerPhone: profile.no_telephone,
      customerEmail: profile.email,
      pickupAddress: formData.pickupAddress,
      parcelDetails: formData.parcelDetails,
      specialInstructions: formData.specialInstructions,
      trackingIds: cleanTrackingIds,
      estimatedMinutes,
      estimatedWaitMinutes,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            placeholder="Parcel Details *"
            value={formData.parcelDetails}
            onChange={(e) =>
              setFormData({ ...formData, parcelDetails: e.target.value })
            }
          />

          <div className="space-y-2">
            <div className="text-sm font-medium">
              Tracking IDs for staff preparation
            </div>

            {trackingIds.map((id, index) => (
              <Input
                key={index}
                placeholder={`Tracking ID ${index + 1}`}
                value={id}
                onChange={(e) => handleTrackingChange(index, e.target.value)}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTrackingField}
            >
              + Add another parcel
            </Button>
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
          <Button onClick={handleSubmit} disabled={!!quotaError}>
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
