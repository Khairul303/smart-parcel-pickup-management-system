"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Truck } from "lucide-react"
import { Parcel } from "../types"

interface ParcelCardProps {
  parcel: Parcel
  onViewDetails: (parcel: Parcel) => void
  onExtendPickup: (parcelId: string) => void
  onRequestRedelivery: (parcelId: string) => void
}

export function ParcelCard({
  parcel,
  onViewDetails,
  onExtendPickup,
  onRequestRedelivery,
}: ParcelCardProps) {
  return (
    <Card className="transition hover:shadow">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <div className="break-all font-bold">{parcel.tracking_id}</div>
          <div className="text-sm text-gray-600">
            {parcel.sender} → {parcel.receiver}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Status: {parcel.status}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="sm" onClick={() => onViewDetails(parcel)} className="w-full sm:w-auto">
            <Eye className="h-4 w-4 mr-1" /> Details
          </Button>

          {parcel.status === "ready-for-pickup" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onExtendPickup(parcel.id)}
            >
              Extend Pickup
            </Button>
          )}

          {parcel.status === "delivered" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onRequestRedelivery(parcel.id)}
            >
              <Truck className="h-4 w-4 mr-1" />
              Redelivery
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
