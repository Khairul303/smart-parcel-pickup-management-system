import {
  Package,
  Calendar,
  UserCheck,
  CheckCircle,
  ClockIcon,
  ClipboardCheck,
} from "lucide-react"

export const AVERAGE_HANDLING_TIME = 3

/* =========================
   PICKUP STATUS (FLOW)
========================= */
export type PickupStatus =
  | "booked"
  | "checked_in"
  | "collected"
  | "no_show"
  | "cancelled"

/* =========================
   PREPARATION STATUS
========================= */
export type PreparationStatus =
  | "pending"
  | "prepared"

/* =========================
   PICKUP MODEL (STAFF SIDE)
========================= */
export interface Pickup {
  id: string                     // pickup_code
  pickup_date: string
  time_slot: string
  queue_number: string           // Q-001
  customer_name: string
  customer_phone?: string
  customer_email?: string

  tracking_ids: string[]         // MULTIPLE parcels
  parcel_count?: number          // derived from tracking_ids.length

  status: PickupStatus
  preparation_status: PreparationStatus
}

/* =========================
   STATUS BADGE CONFIG
   (Shadcn-safe)
========================= */
export const statusConfig: Record<
  PickupStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
    icon: React.ReactNode
    colorClass?: string
  }
> = {
  booked: {
    label: "Booked",
    variant: "default",
    icon: <Calendar className="h-3 w-3 mr-1" />,
    colorClass: "text-blue-700 border-blue-300 bg-blue-50",
  },

  checked_in: {
    label: "Checked In",
    variant: "secondary",
    icon: <UserCheck className="h-3 w-3 mr-1" />,
    colorClass: "text-green-700 border-green-300 bg-green-50",
  },

  collected: {
    label: "Collected",
    variant: "outline",
    icon: <CheckCircle className="h-3 w-3 mr-1" />,
    colorClass: "text-purple-700 border-purple-300",
  },

  no_show: {
    label: "No Show",
    variant: "destructive",
    icon: <ClockIcon className="h-3 w-3 mr-1" />,
    colorClass: "text-red-700 border-red-300 bg-red-50",
  },

  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    icon: <Package className="h-3 w-3 mr-1" />,
    colorClass: "text-gray-500 border-gray-300 bg-gray-100",
  },
}


/* =========================
   PREPARATION BADGE CONFIG
========================= */
export const preparationConfig: Record<
  PreparationStatus,
  {
    label: string
    variant: "default" | "secondary" | "outline"
    icon: React.ReactNode
    colorClass?: string
  }
> = {
  pending: {
    label: "Not Prepared",
    variant: "secondary",
    icon: <Package className="h-3 w-3 mr-1" />,
    colorClass: "text-gray-700 border-gray-300 bg-gray-50",
  },
  prepared: {
    label: "Prepared",
    variant: "outline",
    icon: <ClipboardCheck className="h-3 w-3 mr-1" />,
    colorClass: "text-emerald-700 border-emerald-300 bg-emerald-50",
  },
}
