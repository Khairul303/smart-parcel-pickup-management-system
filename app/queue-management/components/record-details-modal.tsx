import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  User,
  Phone,
  Calendar,
  Clock,
  Package,
  ClipboardCheck,
  CheckCircle,
} from "lucide-react"
import { Pickup, statusConfig, preparationConfig } from "../types"

interface RecordDetailsModalProps {
  pickup: Pickup
  isOpen: boolean
  onClose: () => void
}

export function RecordDetailsModal({
  pickup,
  isOpen,
  onClose,
}: RecordDetailsModalProps) {
  const status = statusConfig[pickup.status]
  const prep = preparationConfig[pickup.preparation_status]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pickup Record Details</DialogTitle>
          <DialogDescription>
            Queue {pickup.queue_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* CUSTOMER */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer
            </h3>

            <div className="space-y-2 text-sm">
              <div className="font-semibold">
                {pickup.customer_name}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {pickup.customer_phone || "—"}
              </div>
            </div>
          </div>

          {/* QUEUE & TIME */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Queue & Schedule
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Queue Number</div>
                <div className="text-xl font-bold">
                  {pickup.queue_number}
                </div>
              </div>

              <div>
                <div className="text-muted-foreground">Pickup Date</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {pickup.pickup_date}
                </div>
              </div>

              <div>
                <div className="text-muted-foreground">Time Slot</div>
                <div>{pickup.time_slot}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Status</div>
                <Badge
                  variant={status.variant}
                  className={status.colorClass}
                >
                  {status.icon}
                  {status.label}
                </Badge>
              </div>

              <div>
                <div className="text-muted-foreground">
                  Preparation
                </div>
                <Badge
                  variant={prep.variant}
                  className={prep.colorClass}
                >
                  {prep.icon}
                  {prep.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* PARCELS */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Parcels
            </h3>

            <div className="flex flex-wrap gap-2">
              {pickup.tracking_ids.length > 0 ? (
                pickup.tracking_ids.map((id) => (
                  <Badge key={id} variant="outline">
                    {id}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">
                  No tracking IDs
                </span>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
