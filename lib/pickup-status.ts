export const PICKUP_STATUS = {
  BOOKED: "booked",
  UPCOMING: "upcoming",
  CHECKED_IN: "checked_in",
  COMPLETED: "completed",
  COLLECTED: "collected",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const

export type PickupStatus = (typeof PICKUP_STATUS)[keyof typeof PICKUP_STATUS]

export type PickupDisplayStatus =
  | "upcoming"
  | "checked_in"
  | "collected"
  | "cancelled"
  | "no_show"

export const PICKUP_STATUS_LABELS: Record<PickupStatus, string> = {
  booked: "Upcoming",
  upcoming: "Upcoming",
  checked_in: "Checked In",
  completed: "Collected",
  collected: "Collected",
  cancelled: "Cancelled",
  no_show: "No Show",
}

export const PICKUP_STATUS_DISPLAY: Record<PickupStatus, PickupDisplayStatus> = {
  booked: "upcoming",
  upcoming: "upcoming",
  checked_in: "checked_in",
  completed: "collected",
  collected: "collected",
  cancelled: "cancelled",
  no_show: "no_show",
}

export const PICKUP_STATUS_BADGE_CLASSES: Record<PickupDisplayStatus, string> = {
  upcoming: "bg-blue-100 text-blue-800",
  checked_in: "bg-amber-100 text-amber-800",
  collected: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-gray-100 text-gray-800",
}

export const normalizePickupStatus = (
  status?: string | null
): PickupDisplayStatus => {
  if (!status) return "upcoming"

  return (
    PICKUP_STATUS_DISPLAY[status as PickupStatus] ??
    (status as PickupDisplayStatus)
  )
}

export const getPickupStatusLabel = (status?: string | null) =>
  PICKUP_STATUS_LABELS[(status ?? "") as PickupStatus] ??
  PICKUP_STATUS_LABELS[normalizePickupStatus(status)]

export const isUpcomingPickupStatus = (status?: string | null) =>
  normalizePickupStatus(status) === "upcoming" || status === PICKUP_STATUS.CHECKED_IN
