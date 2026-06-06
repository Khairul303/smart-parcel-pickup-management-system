export const MALAYSIA_TIME_ZONE = "Asia/Kuala_Lumpur"

export const SLOT_QUOTA_UNITS = 60
export const POSTCENTRE_OPEN_HOUR = 11
export const POSTCENTRE_CLOSE_HOUR = 19
export const POSTCENTRE_CLOSED_WEEKDAY = 6

export const PICKUP_TIME_SLOTS = [
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
]

export const ACTIVE_PICKUP_STATUSES = ["booked", "upcoming", "pending", "checked_in"]

export const getMalaysiaDateString = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: MALAYSIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)

export const getMalaysiaTimeParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MALAYSIA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? 0),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? 0),
  }
}

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

export const getMalaysiaWeekday = (dateString: string) => {
  const { year, monthIndex, day } = parseMalaysiaDateString(dateString)
  return new Date(Date.UTC(year, monthIndex, day, 12)).getUTCDay()
}

export const isPostCentreClosedDate = (dateString: string) =>
  getMalaysiaWeekday(dateString) === POSTCENTRE_CLOSED_WEEKDAY

export const parseTimeSlot = (timeSlot: string) => {
  const match = timeSlot.match(/^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/)

  if (!match) return null

  return {
    startHour: Number(match[1]),
    startMinute: Number(match[2]),
    endHour: Number(match[3]),
    endMinute: Number(match[4]),
  }
}

export const normalizeTimeSlot = (timeSlot?: string | null) => {
  if (!timeSlot) return ""

  const normalized = timeSlot
    .trim()
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")

  const standardMatch = normalized.match(
    /^(\d{1,2}):(\d{2}) - (\d{1,2}):(\d{2})$/
  )

  if (standardMatch) {
    return `${standardMatch[1].padStart(2, "0")}:${standardMatch[2]} - ${standardMatch[3].padStart(2, "0")}:${standardMatch[4]}`
  }

  const meridiemMatch = normalized.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM) - (\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i
  )

  if (!meridiemMatch) return normalized

  const to24Hour = (hourValue: string, meridiem: string) => {
    const hour = Number(hourValue)
    const upper = meridiem.toUpperCase()

    if (upper === "AM") return hour === 12 ? 0 : hour
    return hour === 12 ? 12 : hour + 12
  }

  const startHour = to24Hour(meridiemMatch[1], meridiemMatch[3])
  const endHour = to24Hour(meridiemMatch[4], meridiemMatch[6])
  const startMinute = meridiemMatch[2] ?? "00"
  const endMinute = meridiemMatch[5] ?? "00"

  return `${String(startHour).padStart(2, "0")}:${startMinute} - ${String(
    endHour
  ).padStart(2, "0")}:${endMinute}`
}

export const calculateUsedQuota = (
  bookings: Array<{ tracking_ids?: string[] | null; parcel_count?: number | null }>
) =>
  bookings.reduce((total, booking) => {
    const parcelCount =
      typeof booking.parcel_count === "number" && booking.parcel_count > 0
        ? booking.parcel_count
        : booking.tracking_ids?.filter(Boolean).length || 1

    return total + getEstimatedMinutes(parcelCount)
  }, 0)

export const isWorkingHourSlot = (timeSlot: string) => {
  const slot = parseTimeSlot(timeSlot)
  if (!slot) return false

  return (
    slot.startMinute === 0 &&
    slot.endMinute === 0 &&
    slot.startHour >= POSTCENTRE_OPEN_HOUR &&
    slot.endHour <= POSTCENTRE_CLOSE_HOUR &&
    slot.endHour > slot.startHour
  )
}

export const isTimeSlotStarted = (
  pickupDate: string,
  timeSlot: string,
  now = new Date()
) => {
  const today = getMalaysiaDateString(now)
  if (pickupDate < today) return true
  if (pickupDate > today) return false

  const slot = parseTimeSlot(timeSlot)
  if (!slot) return true

  const current = getMalaysiaTimeParts(now)
  const currentMinutes = current.hour * 60 + current.minute
  const slotStartMinutes = slot.startHour * 60 + slot.startMinute

  return currentMinutes >= slotStartMinutes
}

export const isTimeSlotEnded = (
  pickupDate: string,
  timeSlot: string,
  now = new Date()
) => {
  const today = getMalaysiaDateString(now)
  if (pickupDate < today) return true
  if (pickupDate > today) return false

  const slot = parseTimeSlot(timeSlot)
  if (!slot) return true

  const current = getMalaysiaTimeParts(now)
  const currentMinutes = current.hour * 60 + current.minute
  const slotEndMinutes = slot.endHour * 60 + slot.endMinute

  return currentMinutes >= slotEndMinutes
}

export const getTimeSlotUnavailableReason = (
  pickupDate: string,
  timeSlot: string,
  remainingQuota: number,
  now = new Date()
) => {
  if (!pickupDate) return "Select a pickup date first."
  if (pickupDate < getMalaysiaDateString(now)) {
    return "This pickup date has already passed."
  }
  if (isPostCentreClosedDate(pickupDate)) {
    return "PostCentre Batu Pahat is closed on Saturday. Please choose another date."
  }
  if (!isWorkingHourSlot(timeSlot)) {
    return "This time slot is outside working hours."
  }
  if (isTimeSlotEnded(pickupDate, timeSlot, now)) {
    return "This time slot has already passed. Please choose another slot."
  }
  if (remainingQuota <= 0) {
    return "This time slot is already full. Please choose another available slot."
  }

  return null
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
