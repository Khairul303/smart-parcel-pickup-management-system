import { Badge } from "@/components/ui/badge"
import {
  Package,
  CheckCircle,
  Truck,
  Clock,
  MapPin,
} from "lucide-react"
import { Parcel } from "../types"
import React from "react"

/* =====================
   STATUS BADGE
===================== */
interface StatusBadgeProps {
  status: Parcel["status"]
  size?: "sm" | "md" | "lg"
}

export function ParcelStatusBadge({
  status,
  size = "md",
}: StatusBadgeProps) {
  const iconSize =
    size === "sm"
      ? "h-3 w-3"
      : size === "lg"
      ? "h-4 w-4"
      : "h-3.5 w-3.5"

  const config: Record<
    Parcel["status"],
    {
      color: string
      icon: React.ReactNode
      label: string
    }
  > = {
    pending: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <Clock className={iconSize} />,
      label: "Pending",
    },
    "in-transit": {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <Truck className={iconSize} />,
      label: "In Transit",
    },
    arrived: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: <Package className={iconSize} />,
      label: "Arrived at Post Centre",
    },
    "ready-for-pickup": {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <CheckCircle className={iconSize} />,
      label: "Ready for Pickup",
    },
    delivered: {
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: <CheckCircle className={iconSize} />,
      label: "Completed",
    },
  }

  return (
    <Badge className={`${config[status].color} gap-1.5 font-medium`}>
      {config[status].icon}
      {config[status].label}
    </Badge>
  )
}

/* =====================
   PRIORITY BADGE
===================== */
interface PriorityBadgeProps {
  priority?: Parcel["priority"]
}

export function PriorityBadge({
  priority = "standard",
}: PriorityBadgeProps) {
  const config: Record<
    NonNullable<Parcel["priority"]>,
    { color: string; label: string }
  > = {
    standard: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: "Standard",
    },
    express: {
      color: "bg-red-100 text-red-800 border-red-200",
      label: "Express",
    },
    priority: {
      color: "bg-orange-100 text-orange-800 border-orange-200",
      label: "Priority",
    },
  }

  return (
    <Badge
      variant="outline"
      className={`${config[priority].color} font-medium`}
    >
      {config[priority].label}
    </Badge>
  )
}

/* =====================
   LOCATION BADGE
===================== */
interface LocationBadgeProps {
  location: string
  size?: "sm" | "md" | "lg"
}

export function LocationBadge({
  location,
  size = "md",
}: LocationBadgeProps) {
  const iconSize =
    size === "sm"
      ? "h-3 w-3"
      : size === "lg"
      ? "h-4 w-4"
      : "h-3.5 w-3.5"

  return (
    <Badge
      variant="outline"
      className="bg-blue-50 text-blue-700 border-blue-200 gap-1.5"
    >
      <MapPin className={iconSize} />
      {location}
    </Badge>
  )
}
