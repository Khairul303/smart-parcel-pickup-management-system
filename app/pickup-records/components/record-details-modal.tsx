import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Calendar, Phone, Package, Scale, Ruler, DollarSign, Clock, User } from "lucide-react"
import { PickupRecord, statusConfig } from "../types"
import { toTitle } from "@/lib/admin-realtime"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RecordDetailsModalProps {
  record: PickupRecord
  isOpen: boolean
  onClose: () => void
}

export function RecordDetailsModal({ record, isOpen, onClose }: RecordDetailsModalProps) {
  const status = statusConfig[record.status]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Record Details</DialogTitle>
              <DialogDescription>Pickup #{record.id}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="mb-3 text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">{record.customer.avatar}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-semibold">{record.customer.name}</div>
                  <div className="break-all text-sm text-muted-foreground">{record.customer.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{record.customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Created: {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Queue & Timing Information */}
          <div>
            <h3 className="mb-3 text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Queue & Timing
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Queue Number</div>
                <div className="text-2xl font-bold text-blue-600">
                  {record.queueLabel ?? `Q-${record.queueNumber?.toString().padStart(2, "0") || "00"}`}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Status</div>
                <Badge 
                  variant={status.variant} 
                  className={`gap-1 ${status.colorClass}`}
                >
                  {status.icon}
                  {status.label}
                </Badge>
                {record.pickupStatus && (
                  <div className="text-xs text-muted-foreground">
                    Pickup status: {toTitle(record.pickupStatus)}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Scheduled Time</div>
                <div className="text-sm">
                  {new Date(record.preferredTime).toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Time Slot</div>
                <div className="text-sm">{record.timeSlot ?? "Not scheduled"}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Updated</div>
                <div className="text-sm">
                  {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : "Not recorded"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Assigned To</div>
                <Badge variant="secondary">{record.assignedTo}</Badge>
              </div>
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <h3 className="mb-3 text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Pickup Location
            </h3>
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="text-sm">{record.pickupAddress}</div>
            </div>
          </div>

          {/* Parcel Details */}
          <div>
            <h3 className="mb-3 text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Parcel Details
            </h3>
            {record.relatedParcels && record.relatedParcels.length > 0 ? (
              <div className="space-y-3">
                {record.relatedParcels.map((parcel) => (
                  <div key={parcel.id} className="rounded-lg border p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="break-all font-medium">{parcel.tracking_id}</div>
                      <Badge variant="outline">{toTitle(parcel.status ?? "unknown")}</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <div className="text-muted-foreground">Sender</div>
                        <div>{parcel.sender ?? "Not recorded"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Receiver</div>
                        <div>{parcel.receiver ?? record.customer.name}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Receiver Contact</div>
                        <div>{parcel.receiver_phone ?? record.customer.phone}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Weight / Dimensions</div>
                        <div>{parcel.weight ?? "-"} / {parcel.dimensions ?? "-"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Created</div>
                        <div>{parcel.created_at ? new Date(parcel.created_at).toLocaleString() : "Not recorded"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Updated</div>
                        <div>{parcel.updated_at ? new Date(parcel.updated_at).toLocaleString() : "Not recorded"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Type</div>
                </div>
                <div className="text-sm">{record.parcelDetails.type}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Weight</div>
                </div>
                <div className="text-sm">{record.parcelDetails.weight}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Dimensions</div>
                </div>
                <div className="text-sm">{record.parcelDetails.dimensions}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Value</div>
                </div>
                <div className="text-sm">{record.parcelDetails.value}</div>
              </div>
            </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end sm:gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>Update Record</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
