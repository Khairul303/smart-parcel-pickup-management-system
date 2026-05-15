"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import supabase from "@/lib/supabase"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ACTIVE_PICKUP_STATUSES,
  calculateUsedQuota,
  createMalaysiaDateString,
  formatMalaysiaDate,
  getDaysInMonth,
  getMalaysiaDateString,
  getMalaysiaMonthParts,
  getTimeSlotUnavailableReason,
  getWeekdayShort,
  isPostCentreClosedDate,
  isWorkingHourSlot,
  normalizeTimeSlot,
  PICKUP_TIME_SLOTS,
  SLOT_QUOTA_UNITS,
} from "@/lib/pickup-scheduling"

interface PickupCalendarProps {
  selectedDate: string
  selectedTimeSlot: string
  onDateSelect: (date: string) => void
  onTimeSlotSelect: (timeSlot: string) => void
  onBookingOpen: () => void
  refreshKey: number
}

interface AvailableSlot {
  time_slot: string
  remaining: number
}

interface PickupBookingQuotaRow {
  time_slot: string | null
  tracking_ids?: string[] | null
}

interface TimeSlot {
  time: string
  remaining: number
  unavailableReason: string | null
}

export function PickupCalendar({
  selectedDate,
  selectedTimeSlot,
  onDateSelect,
  onTimeSlotSelect,
  onBookingOpen,
  refreshKey,
}: PickupCalendarProps) {
  const today = getMalaysiaDateString()
  const initialMonth = getMalaysiaMonthParts(selectedDate || today)
  const [visibleMonth, setVisibleMonth] = useState(initialMonth)
  const [dateAvailability, setDateAvailability] = useState<Record<string, number>>({})
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [liveRefreshKey, setLiveRefreshKey] = useState(0)
  const [clockKey, setClockKey] = useState(0)
  const [notice, setNotice] = useState<{
    title: string
    message: string
  } | null>(null)
  const selectedTimeSlotRef = useRef(selectedTimeSlot)
  const onTimeSlotSelectRef = useRef(onTimeSlotSelect)

  const currentMalaysiaDate = getMalaysiaDateString()

  useEffect(() => {
    selectedTimeSlotRef.current = selectedTimeSlot
    onTimeSlotSelectRef.current = onTimeSlotSelect
  })

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kuala_Lumpur",
      }).format(new Date(Date.UTC(visibleMonth.year, visibleMonth.monthIndex, 1, 12))),
    [visibleMonth]
  )

  const monthDates = useMemo(() => {
    const days = getDaysInMonth(visibleMonth.year, visibleMonth.monthIndex)

    return Array.from({ length: days }, (_, index) => {
      const day = index + 1
      const date = createMalaysiaDateString(
        visibleMonth.year,
        visibleMonth.monthIndex,
        day
      )

      return {
        date,
        day,
        weekday: getWeekdayShort(date),
        isPast: date < currentMalaysiaDate,
        isClosed: isPostCentreClosedDate(date),
      }
    })
  }, [currentMalaysiaDate, visibleMonth])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClockKey((key) => key + 1)
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    let active = true

    const loadAvailabilityMap = async (date: string) => {
      const { data: bookings, error: bookingsError } = await supabase
        .from("pickup_bookings")
        .select("time_slot, tracking_ids")
        .eq("pickup_date", date)
        .in("status", ACTIVE_PICKUP_STATUSES)

      if (!bookingsError) {
        const rows = (bookings ?? []) as PickupBookingQuotaRow[]

        return new Map(
          PICKUP_TIME_SLOTS.map((timeSlot) => {
            const matchingBookings = rows.filter(
              (booking) =>
                normalizeTimeSlot(booking.time_slot) === normalizeTimeSlot(timeSlot)
            )
            const usedQuota = calculateUsedQuota(matchingBookings)

            return [timeSlot, Math.max(SLOT_QUOTA_UNITS - usedQuota, 0)]
          })
        )
      }

      const { data, error } = await supabase.rpc("get_available_slots", {
        p_date: date,
      })

      if (error) {
        return new Map(
          PICKUP_TIME_SLOTS.map((timeSlot) => [timeSlot, SLOT_QUOTA_UNITS])
        )
      }

      const slots: AvailableSlot[] = data ?? []
      const slotMap = new Map(
        slots.map((slot) => [
          normalizeTimeSlot(slot.time_slot),
          Math.max(slot.remaining, 0),
        ])
      )

      return new Map(
        PICKUP_TIME_SLOTS.map((timeSlot) => [
          timeSlot,
          slotMap.get(normalizeTimeSlot(timeSlot)) ?? SLOT_QUOTA_UNITS,
        ])
      )
    }

    const loadMonthAvailability = async () => {
      const entries = await Promise.all(
        monthDates.map(async ({ date, isPast }) => {
          if (isPast || isPostCentreClosedDate(date)) return [date, 0] as const

          const slotMap = await loadAvailabilityMap(date)
          const remaining = PICKUP_TIME_SLOTS.reduce((sum, timeSlot) => {
            const slotRemaining = slotMap.get(timeSlot) ?? SLOT_QUOTA_UNITS
            const unavailableReason = getTimeSlotUnavailableReason(
              date,
              timeSlot,
              slotRemaining
            )

            return unavailableReason ? sum : sum + slotRemaining
          }, 0)

          return [date, remaining] as const
        })
      )

      if (active) setDateAvailability(Object.fromEntries(entries))
    }

    loadMonthAvailability()

    return () => {
      active = false
    }
  }, [clockKey, liveRefreshKey, monthDates, refreshKey])

  useEffect(() => {
    let active = true

    const loadAvailabilityMap = async (date: string) => {
      const { data: bookings, error: bookingsError } = await supabase
        .from("pickup_bookings")
        .select("time_slot, tracking_ids")
        .eq("pickup_date", date)
        .in("status", ACTIVE_PICKUP_STATUSES)

      if (!bookingsError) {
        const rows = (bookings ?? []) as PickupBookingQuotaRow[]

        return new Map(
          PICKUP_TIME_SLOTS.map((timeSlot) => {
            const matchingBookings = rows.filter(
              (booking) =>
                normalizeTimeSlot(booking.time_slot) === normalizeTimeSlot(timeSlot)
            )
            const usedQuota = calculateUsedQuota(matchingBookings)

            return [timeSlot, Math.max(SLOT_QUOTA_UNITS - usedQuota, 0)]
          })
        )
      }

      const { data, error } = await supabase.rpc("get_available_slots", {
        p_date: date,
      })

      if (error) {
        return new Map(
          PICKUP_TIME_SLOTS.map((timeSlot) => [timeSlot, SLOT_QUOTA_UNITS])
        )
      }

      const slots: AvailableSlot[] = data ?? []
      const slotMap = new Map(
        slots.map((slot) => [
          normalizeTimeSlot(slot.time_slot),
          Math.max(slot.remaining, 0),
        ])
      )

      return new Map(
        PICKUP_TIME_SLOTS.map((timeSlot) => [
          timeSlot,
          slotMap.get(normalizeTimeSlot(timeSlot)) ?? SLOT_QUOTA_UNITS,
        ])
      )
    }

    const loadTimeSlots = async () => {
      if (!selectedDate) {
        if (active) setTimeSlots([])
        return
      }

      const slotMap = await loadAvailabilityMap(selectedDate)

      if (!active) return

      const nextSlots = PICKUP_TIME_SLOTS.filter(isWorkingHourSlot).map((time) => {
          const remaining = slotMap.get(time) ?? SLOT_QUOTA_UNITS

          return {
            time,
            remaining,
            unavailableReason: getTimeSlotUnavailableReason(
              selectedDate,
              time,
              remaining
            ),
          }
        })

      setTimeSlots(nextSlots)

      const currentSelectedSlot = nextSlots.find(
        (slot) => slot.time === selectedTimeSlotRef.current
      )
      if (currentSelectedSlot?.unavailableReason) {
        onTimeSlotSelectRef.current("")
      }
    }

    loadTimeSlots()

    return () => {
      active = false
    }
  }, [clockKey, liveRefreshKey, refreshKey, selectedDate])

  useEffect(() => {
    const channel = supabase
      .channel("customer-pickup-slot-availability")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pickup_bookings",
        },
        () => {
          setLiveRefreshKey((key) => key + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const changeMonth = (offset: number) => {
    const next = new Date(
      visibleMonth.year,
      visibleMonth.monthIndex + offset,
      1
    )

    setVisibleMonth({
      year: next.getFullYear(),
      monthIndex: next.getMonth(),
    })
  }

  const handleDateSelect = (date: string, slotsAvailable = 0) => {
    if (date < currentMalaysiaDate) {
      setNotice({
        title: "Date Unavailable",
        message: "This pickup date has already passed.",
      })
      return
    }

    if (isPostCentreClosedDate(date)) {
      setNotice({
        title: "PostCentre Closed",
        message:
          "PostCentre Batu Pahat is closed on Saturday. Please choose another date.",
      })
      return
    }

    if (slotsAvailable <= 0) {
      setNotice({
        title: "Date Unavailable",
        message: "There are no available pickup slots for this date.",
      })
      return
    }

    onDateSelect(date)
    onTimeSlotSelect("")
  }

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (slot.unavailableReason) {
      setNotice({
        title: "Time Slot Unavailable",
        message: slot.unavailableReason,
      })
      return
    }

    onTimeSlotSelect(slot.time)
  }

  const visibleMonthStart = createMalaysiaDateString(
    visibleMonth.year,
    visibleMonth.monthIndex,
    1
  )
  const currentMonthStart = createMalaysiaDateString(
    getMalaysiaMonthParts(today).year,
    getMalaysiaMonthParts(today).monthIndex,
    1
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule New Pickup</CardTitle>
        <CardDescription>
          Book a pickup appointment at your preferred date and time
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Select Pickup Date</h3>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => changeMonth(-1)}
                disabled={visibleMonthStart <= currentMonthStart}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[128px] text-center text-sm font-medium">
                {monthLabel}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {monthDates.map((date) => {
              const slotsAvailable = dateAvailability[date.date] ?? 0
              const closedReason = date.isClosed
                ? "Closed"
                : date.isPast
                  ? "Past"
                  : slotsAvailable === 0
                    ? "Unavailable"
                    : null
              const disabled = Boolean(closedReason)

              return (
                <button
                  key={date.date}
                  type="button"
                  onClick={() => handleDateSelect(date.date, slotsAvailable)}
                  aria-disabled={disabled}
                  className={`min-h-[68px] rounded-md border px-2 py-2 text-left transition ${
                    selectedDate === date.date
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-gray-200 bg-white hover:border-primary hover:bg-primary/5"
                  } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
                >
                  <div className="text-[11px] font-medium opacity-80">
                    {date.weekday}
                  </div>
                  <div className="text-lg font-semibold leading-tight">
                    {date.day}
                  </div>
                  <div
                    className={`mt-1 truncate text-[11px] ${
                      selectedDate === date.date
                        ? "text-primary-foreground"
                        : slotsAvailable <= 20
                          ? "text-amber-600"
                          : "text-green-600"
                    }`}
                  >
                    {closedReason ?? `${slotsAvailable} mins`}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold">Available Time Slots</h3>
          {!selectedDate ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Select a pickup date to view time slots.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {timeSlots.map((slot) => {
                const isFull = Boolean(slot.unavailableReason)
                const isSelected = selectedTimeSlot === slot.time

                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => handleTimeSlotSelect(slot)}
                    aria-disabled={isFull}
                    className={`rounded-md border p-3 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-gray-200 bg-white hover:border-primary hover:bg-primary/5"
                    } ${isFull ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{slot.time}</span>
                    </div>
                    <div
                      className={`mt-2 text-xs ${
                        isSelected
                          ? "text-primary-foreground"
                          : slot.remaining <= 10
                            ? "text-amber-600"
                            : "text-green-600"
                      }`}
                    >
                      {isFull
                        ? slot.remaining <= 0
                          ? "Full"
                          : "Unavailable"
                        : `${slot.remaining} minutes available`}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {(selectedDate || selectedTimeSlot) && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <h4 className="font-semibold">Selected Appointment</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{formatMalaysiaDate(selectedDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{selectedTimeSlot || "Not selected"}</span>
                  </div>
                </div>
                <Button
                  onClick={onBookingOpen}
                  disabled={!selectedDate || !selectedTimeSlot}
                  className="w-full sm:w-auto"
                >
                  Continue Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>

      <Dialog open={Boolean(notice)} onOpenChange={(open) => !open && setNotice(null)}>
        <DialogContent className="w-[92vw] max-w-sm">
          <DialogHeader>
            <DialogTitle>{notice?.title ?? "Time Slot Unavailable"}</DialogTitle>
            <DialogDescription>
              {notice?.message ??
                "This time slot is unavailable. Please choose another slot."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setNotice(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
