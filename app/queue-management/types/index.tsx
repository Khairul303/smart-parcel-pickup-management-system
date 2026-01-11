import { Package, Calendar, UserCheck, CheckCircle, ClockIcon } from "lucide-react"

export type PickupStatus =
  | "ready"
  | "booked"
  | "checked_in"
  | "collected"
  | "no_show"

export interface Pickup {
  id: string
  tracking_id: string
  customer_name: string
  pickup_time: string
  status: PickupStatus
  queue_number: number
  phone?: string
  email?: string
  parcel_count?: number
}

// Update the variant types to match Badge component's accepted variants
export const statusConfig: Record<PickupStatus, {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ReactNode;
  colorClass?: string; // Add custom color class for styling
}> = {
  ready: {
    label: "Ready",
    variant: "outline",
    icon: <Package className="h-3 w-3 mr-1" />,
    colorClass: "text-gray-700 border-gray-300"
  },
  booked: {
    label: "Booked",
    variant: "default",
    icon: <Calendar className="h-3 w-3 mr-1" />,
    colorClass: "text-blue-700 border-blue-300 bg-blue-50"
  },
  checked_in: {
    label: "Checked In",
    variant: "secondary", // Changed from "success" to "secondary"
    icon: <UserCheck className="h-3 w-3 mr-1" />,
    colorClass: "text-green-700 border-green-300 bg-green-50"
  },
  collected: {
    label: "Collected",
    variant: "outline",
    icon: <CheckCircle className="h-3 w-3 mr-1" />,
    colorClass: "text-purple-700 border-purple-300"
  },
  no_show: {
    label: "No Show",
    variant: "destructive",
    icon: <ClockIcon className="h-3 w-3 mr-1" />,
    colorClass: "text-red-700 border-red-300 bg-red-50"
  }
}