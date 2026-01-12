"use client"

import { Calendar, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PickupSchedule } from "./PickupScheduling"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: string
  selectedTimeSlot: string
  onBook: (pickup: PickupSchedule & { trackingIds?: string[] }) => void
}

// ⏱ average handling time per customer
const AVG_HANDLE_MINUTES = 5

export function BookingDialog({
  isOpen,
  onOpenChange,
  selectedDate,
  selectedTimeSlot,
  onBook,
}: Props) {
  const [queuePreview, setQueuePreview] = useState<number | null>(null)

  const [trackingIds, setTrackingIds] = useState<string[]>([""])

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    pickupAddress: "",
    parcelDetails: "",
    specialInstructions: "",
  })

  // ======================
  // PREVIEW QUEUE NUMBER
  // ======================
  useEffect(() => {
    let active = true

    const fetchQueuePreview = async () => {
      if (!isOpen || !selectedDate || !selectedTimeSlot) {
        if (active) setQueuePreview(null)
        return
      }

      const { data, error } = await supabase.rpc("preview_queue_number", {
        p_date: selectedDate,
        p_time_slot: selectedTimeSlot,
      })

      if (!error && active) {
        setQueuePreview(data)
      }
    }

    fetchQueuePreview()

    return () => {
      active = false
    }
  }, [isOpen, selectedDate, selectedTimeSlot])

  // ======================
  // HANDLERS
  // ======================
  const handleTrackingChange = (index: number, value: string) => {
    const updated = [...trackingIds]
    updated[index] = value
    setTrackingIds(updated)
  }

  const addTrackingField = () => {
    setTrackingIds([...trackingIds, ""])
  }

  const handleSubmit = () => {
    if (!selectedTimeSlot || !formData.parcelDetails.trim()) {
      alert("Please complete required fields")
      return
    }

    const cleanTrackingIds = trackingIds
      .map((id) => id.trim())
      .filter(Boolean)

    onBook({
      id: "",
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      status: "confirmed",
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      pickupAddress: formData.pickupAddress,
      parcelDetails: formData.parcelDetails,
      specialInstructions: formData.specialInstructions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingIds: cleanTrackingIds,
    })

    onOpenChange(false)
  }

  const estimatedWait =
    queuePreview !== null ? (queuePreview - 1) * AVG_HANDLE_MINUTES : null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Pickup</DialogTitle>
          <DialogDescription>
            Review your pickup details before confirmation
          </DialogDescription>
        </DialogHeader>

        {/* DATE + TIME + QUEUE */}
        <Card>
          <CardContent className="p-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {selectedDate}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {selectedTimeSlot}
            </div>

            {queuePreview !== null && (
              <>
                <div className="col-span-2 text-sm font-medium text-blue-600">
                  Estimated Queue Number: Q-
                  {String(queuePreview).padStart(3, "0")}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  Estimated waiting time: ~{estimatedWait} minutes
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* CUSTOMER & PARCEL INFO */}
        <div className="grid gap-4">
          <Input
            placeholder="Name"
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
          />
          <Input
            placeholder="Phone"
            onChange={(e) =>
              setFormData({ ...formData, customerPhone: e.target.value })
            }
          />
          <Input
            placeholder="Email"
            onChange={(e) =>
              setFormData({ ...formData, customerEmail: e.target.value })
            }
          />
          <Textarea
            placeholder="Pickup Address"
            onChange={(e) =>
              setFormData({ ...formData, pickupAddress: e.target.value })
            }
          />
          <Textarea
            placeholder="Parcel Details *"
            onChange={(e) =>
              setFormData({ ...formData, parcelDetails: e.target.value })
            }
          />

          {/* TRACKING IDS */}
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Tracking IDs (for staff preparation)
            </div>

            {trackingIds.map((id, index) => (
              <Input
                key={index}
                placeholder={`Tracking ID ${index + 1}`}
                value={id}
                onChange={(e) =>
                  handleTrackingChange(index, e.target.value)
                }
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Confirm Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
