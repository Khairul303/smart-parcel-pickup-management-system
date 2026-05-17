export type TimeFilterMode = "daily" | "weekly" | "monthly" | "yearly" | "specific" | "all"

export const MALAYSIA_TIME_ZONE = "Asia/Kuala_Lumpur"

export const getMalaysiaDateInputValue = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: MALAYSIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)

const parseDateInput = (dateInput: string) => {
  const [year, month, day] = dateInput.split("-").map(Number)
  return { year, month, day }
}

const toUtcIsoFromMalaysia = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
) =>
  new Date(
    Date.UTC(year, month - 1, day, hour - 8, minute, second, millisecond)
  ).toISOString()

export const getMalaysiaDateRange = (
  mode: TimeFilterMode,
  dateInput: string
) => {
  if (mode === "all") {
    return {
      start: new Date(0).toISOString(),
      end: new Date(8640000000000000).toISOString(),
    }
  }

  const { year, month, day } = parseDateInput(dateInput)
  const localAnchor = new Date(Date.UTC(year, month - 1, day))
  let startYear = year
  let startMonth = month
  let startDay = day
  let endYear = year
  let endMonth = month
  let endDay = day

  if (mode === "weekly") {
    const dayOfWeek = localAnchor.getUTCDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(localAnchor)
    monday.setUTCDate(localAnchor.getUTCDate() + mondayOffset)
    const sunday = new Date(monday)
    sunday.setUTCDate(monday.getUTCDate() + 6)
    startYear = monday.getUTCFullYear()
    startMonth = monday.getUTCMonth() + 1
    startDay = monday.getUTCDate()
    endYear = sunday.getUTCFullYear()
    endMonth = sunday.getUTCMonth() + 1
    endDay = sunday.getUTCDate()
  }

  if (mode === "monthly") {
    startDay = 1
    endDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  }

  if (mode === "yearly") {
    startMonth = 1
    startDay = 1
    endMonth = 12
    endDay = 31
  }

  return {
    start: toUtcIsoFromMalaysia(startYear, startMonth, startDay),
    end: toUtcIsoFromMalaysia(endYear, endMonth, endDay, 23, 59, 59, 999),
  }
}

export const isWithinMalaysiaDateRange = (
  value: string | null | undefined,
  mode: TimeFilterMode,
  dateInput: string
) => {
  if (mode === "all") return true
  if (!value) return false
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return false

  const range = getMalaysiaDateRange(mode, dateInput)
  return (
    timestamp >= new Date(range.start).getTime() &&
    timestamp <= new Date(range.end).getTime()
  )
}
