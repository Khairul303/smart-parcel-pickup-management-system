import React from "react"
import { Clock, User, Truck, CheckCircle, XCircle } from "lucide-react"

export type PickupStatus =
  | "pending"
  | "assigned"
  | "in-progress"
  | "completed"
  | "cancelled"

export interface PickupRecord {
  id: string
  customer: {
    name: string
    email: string
    phone: string
    avatar: string
  }
  parcelDetails: {
    type: string
    weight: string
    dimensions: string
    value: string
  }
  pickupAddress: string
  preferredTime: string
  status: PickupStatus
  assignedTo: string
  createdAt: string
  queueNumber?: number
  estimatedWait?: number
}

export const statusConfig: Record<PickupStatus, {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ReactNode;
  colorClass: string;
}> = {
  pending: {
    label: "Pending",
    variant: "outline",
    icon: <Clock className="h-3 w-3 mr-1" />,
    colorClass: "text-yellow-700 border-yellow-300 bg-yellow-50"
  },
  assigned: {
    label: "Assigned",
    variant: "secondary",
    icon: <User className="h-3 w-3 mr-1" />,
    colorClass: "text-blue-700 border-blue-300 bg-blue-50"
  },
  "in-progress": {
    label: "In Progress",
    variant: "secondary",
    icon: <Truck className="h-3 w-3 mr-1" />,
    colorClass: "text-purple-700 border-purple-300 bg-purple-50"
  },
  completed: {
    label: "Completed",
    variant: "outline",
    icon: <CheckCircle className="h-3 w-3 mr-1" />,
    colorClass: "text-green-700 border-green-300 bg-green-50"
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3 mr-1" />,
    colorClass: "text-red-700 border-red-300 bg-red-50"
  }
}