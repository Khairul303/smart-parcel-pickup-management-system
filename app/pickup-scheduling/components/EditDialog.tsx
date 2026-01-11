"use client"

import { Calendar, Clock } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PickupSchedule } from "./PickupScheduling"

interface EditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  pickup: PickupSchedule | null
  onSave: (pickup: PickupSchedule) => void
}

export function EditDialog({
  isOpen,
  onOpenChange,
  pickup,
  onSave,
}: EditDialogProps) {
  const [parcelDetails, setParcelDetails] = useState(
    pickup?.parcelDetails ?? ""
  )
  const [specialInstructions, setSpecialInstructions] = useState(
    pickup?.specialInstructions ?? ""
  )

  // Reset when dialog opens with a DIFFERENT pickup
  if (!pickup) return null

  const handleSave = () => {
    onSave({
      ...pickup,
      parcelDetails,
      specialInstructions,
      updatedAt: new Date().toLocaleString(),
    })
  }

  const formatDateDisplay = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Pickup Details</DialogTitle>
          <DialogDescription>
            Update your pickup appointment information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDateDisplay(pickup.date)}</span>
              </div>
            </div>
            <div>
              <Label>Time Slot</Label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{pickup.timeSlot}</span>
              </div>
            </div>
          </div>

          <div>
            <Label>Parcel Details</Label>
            <Textarea
              value={parcelDetails}
              onChange={(e) => setParcelDetails(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label>Special Instructions</Label>
            <Textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
