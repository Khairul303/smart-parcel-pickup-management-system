import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Calendar, Phone, Mail, Package, Scale, Ruler, DollarSign, Clock, User, Truck, CheckCircle, XCircle, X } from "lucide-react"
import { PickupRecord, statusConfig } from "../types"
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <div>
                  <div className="font-semibold">{record.customer.name}</div>
                  <div className="text-sm text-muted-foreground">{record.customer.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Queue Number</div>
                <div className="text-2xl font-bold text-blue-600">
                  Q-{record.queueNumber?.toString().padStart(2, "0") || "00"}
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
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Scheduled Time</div>
                <div className="text-sm">
                  {new Date(record.preferredTime).toLocaleString()}
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
            <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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