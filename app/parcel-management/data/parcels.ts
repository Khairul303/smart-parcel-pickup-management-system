import { Clock, Truck, CheckCircle, Package, AlertCircle, Tag } from "lucide-react";

/* ---------------- STATUS CONFIG ---------------- */

export const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  "in-transit": {
    label: "In Transit",
    icon: Truck,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-green-50 text-green-700 border-green-200",
  },
  ready: {
    label: "Ready",
    icon: Package,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
} as const;

/* ---------------- PRIORITY CONFIG ---------------- */

export const priorityConfig = {
  High: {
    label: "High",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  Normal: {
    label: "Normal",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Tag,
  },
  Low: {
    label: "Low",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: Tag,
  },
} as const;
