"use client"

import { useEffect, useMemo, useState } from "react"
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
  createMalaysiaDateString,
  formatMalaysiaDate,
  getDaysInMonth,
  getMalaysiaDateString,
  getMalaysiaMonthParts,
  getWeekdayShort,
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

interface TimeSlot {
  time: string
  remaining: number
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
        isPast: date < today,
      }
    })
  }, [today, visibleMonth])

  useEffect(() => {
    let active = true

    const loadMonthAvailability = async () => {
      const entries = await Promise.all(
        monthDates.map(async ({ date, isPast }) => {
          if (isPast) return [date, 0] as const

          const { data, error } = await supabase.rpc("get_available_slots", {
            p_date: date,
          })

          if (error) {
            return [date, PICKUP_TIME_SLOTS.length * SLOT_QUOTA_UNITS] as const
          }

          const slots: AvailableSlot[] = data ?? []
          const remaining = slots.reduce((sum, slot) => sum + slot.remaining, 0)

          return [date, remaining] as const
        })
      )

      if (active) setDateAvailability(Object.fromEntries(entries))
    }

    loadMonthAvailability()

    return () => {
      active = false
    }
  }, [liveRefreshKey, monthDates, refreshKey])

  useEffect(() => {
    let active = true

    const loadTimeSlots = async () => {
      if (!selectedDate) {
        if (active) setTimeSlots([])
        return
      }

      const { data, error } = await supabase.rpc("get_available_slots", {
        p_date: selectedDate,
      })

      if (!active) return

      if (error) {
        setTimeSlots(
          PICKUP_TIME_SLOTS.map((time) => ({
            time,
            remaining: SLOT_QUOTA_UNITS,
          }))
        )
        return
      }

      const slotMap = new Map(
        ((data ?? []) as AvailableSlot[]).map((slot) => [
          slot.time_slot,
          Math.max(slot.remaining, 0),
        ])
      )

      setTimeSlots(
        PICKUP_TIME_SLOTS.map((time) => ({
          time,
          remaining: slotMap.get(time) ?? SLOT_QUOTA_UNITS,
        }))
      )
    }

    loadTimeSlots()

    return () => {
      active = false
    }
  }, [liveRefreshKey, refreshKey, selectedDate])

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

  const handleDateSelect = (date: string) => {
    onDateSelect(date)
    onTimeSlotSelect("")
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
              const disabled = date.isPast || slotsAvailable === 0

              return (
                <button
                  key={date.date}
                  type="button"
                  onClick={() => handleDateSelect(date.date)}
                  disabled={disabled}
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
                    {date.isPast
                      ? "Past"
                      : slotsAvailable === 0
                        ? "No slots available"
                        : `${slotsAvailable} slots`}
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
                const isFull = slot.remaining <= 0
                const isSelected = selectedTimeSlot === slot.time

                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => onTimeSlotSelect(slot.time)}
                    disabled={isFull}
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
                        ? "This time slot is full"
                        : `${slot.remaining} slots available`}
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
    </Card>
  )
}
