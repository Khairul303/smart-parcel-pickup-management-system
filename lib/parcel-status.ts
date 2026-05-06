export const PARCEL_STATUS = {
  ALL: "all",
  READY: "ready",
  COMPLETED: "completed",
} as const

export type ParcelStatusFilter =
  (typeof PARCEL_STATUS)[keyof typeof PARCEL_STATUS]

export type DashboardParcelStatus =
  | typeof PARCEL_STATUS.READY
  | typeof PARCEL_STATUS.COMPLETED

export const PARCEL_STATUS_LABEL = {
  [PARCEL_STATUS.ALL]: "Total Parcel",
  [PARCEL_STATUS.READY]: "Ready to Pickup",
  [PARCEL_STATUS.COMPLETED]: "Completed",
} as const

export const isDashboardParcelStatus = (
  status?: string | null
): status is DashboardParcelStatus =>
  status === PARCEL_STATUS.READY || status === PARCEL_STATUS.COMPLETED
