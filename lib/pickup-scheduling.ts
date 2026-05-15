export const MALAYSIA_TIME_ZONE = "Asia/Kuala_Lumpur"

export const SLOT_QUOTA_UNITS = 5

export const PICKUP_TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
]

export const ACTIVE_PICKUP_STATUSES = ["booked", "upcoming", "checked_in"]

export const getMalaysiaDateString = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: MALAYSIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)

export const createMalaysiaDateString = (
  year: number,
  monthIndex: number,
  day: number
) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`

export const parseMalaysiaDateString = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number)
  return { year, monthIndex: month - 1, day }
}

export const getMalaysiaMonthParts = (dateString = getMalaysiaDateString()) => {
  const { year, monthIndex } = parseMalaysiaDateString(dateString)
  return { year, monthIndex }
}

export const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate()

export const getWeekdayShort = (dateString: string) => {
  const { year, monthIndex, day } = parseMalaysiaDateString(dateString)

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: MALAYSIA_TIME_ZONE,
  }).format(new Date(Date.UTC(year, monthIndex, day, 12)))
}

export const formatMalaysiaDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }
) => {
  if (!dateString) return "No date selected"

  const { year, monthIndex, day } = parseMalaysiaDateString(dateString)

  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: MALAYSIA_TIME_ZONE,
  }).format(new Date(Date.UTC(year, monthIndex, day, 12)))
}

export const getEstimatedMinutes = (parcelCount: number) =>
  Math.min(Math.max(parcelCount, 1), 4)

export const getParcelCount = (
  trackingIds?: string[] | null,
  parcelDetails?: string | null
) => {
  const trackingCount =
    trackingIds?.map((id) => id.trim()).filter(Boolean).length ?? 0

  if (trackingCount > 0) return trackingCount

  const detailLines =
    parcelDetails
      ?.split(/\r?\n|,/)
      .map((line) => line.trim())
      .filter(Boolean).length ?? 0

  return Math.max(detailLines, 1)
}
