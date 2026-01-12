"use client"

import { useEffect, useState } from "react"
import { Clock, Calendar } from "lucide-react"
import supabase from "@/lib/supabase"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// ======================
// TYPES
// ======================
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

interface DateSlot {
  date: string
  day: string
  slotsAvailable: number
}

interface TimeSlot {
  time: string
  remaining: number
}

// ======================
// COMPONENT
// ======================
export function PickupCalendar({
  selectedDate,
  selectedTimeSlot,
  onDateSelect,
  onTimeSlotSelect,
  onBookingOpen,
}: PickupCalendarProps) {
  const [availableDates, setAvailableDates] = useState<DateSlot[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  // ======================
  // GENERATE NEXT 14 DAYS
  // ======================
  useEffect(() => {
    let active = true

    const generateDates = async () => {
      const dates: DateSlot[] = []

      for (let i = 0; i < 14; i++) {
        const d = new Date()
        d.setDate(d.getDate() + i)

        const dateStr = d.toISOString().split("T")[0]

        const { data, error } = await supabase.rpc("get_available_slots", {
          p_date: dateStr,
        })


        if (error) continue

        const slots: AvailableSlot[] = data ?? []

        const totalRemaining = slots.reduce(
          (sum, slot) => sum + slot.remaining,
          0
        )

        dates.push({
          date: dateStr,
          day: d.toLocaleDateString("en-US", { weekday: "short" }),
          slotsAvailable: totalRemaining,
        })
      }

      if (active) {
        setAvailableDates(dates)
      }
    }

    generateDates()

    return () => {
      active = false
    }
  }, [])

  // ======================
  // LOAD TIME SLOTS (SAFE)
  // ======================
  useEffect(() => {
    let active = true

    const loadTimeSlots = async () => {
      // ✅ handle empty date WITHOUT setState sync
      if (!selectedDate) {
        if (active) setTimeSlots([])
        return
      }

    const { data, error } = await supabase.rpc("get_available_slots", {
      p_date: selectedDate,
    })


      if (error || !active) return

      const slots: AvailableSlot[] = data ?? []

      setTimeSlots(
        slots.map((slot) => ({
          time: slot.time_slot,
          remaining: slot.remaining,
        }))
      )
    }

    loadTimeSlots()

    return () => {
      active = false
    }
  }, [selectedDate])

  // ======================
  // FORMAT DATE DISPLAY
  // ======================
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // ======================
  // UI (UNCHANGED)
  // ======================
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule New Pickup</CardTitle>
        <CardDescription>
          Book a pickup appointment at your preferred date and time
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* DATE SELECTION */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Pickup Date</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {availableDates.map((d) => (
              <button
                key={d.date}
                onClick={() => onDateSelect(d.date)}
                disabled={d.slotsAvailable === 0}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                  selectedDate === d.date
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                } ${
                  d.slotsAvailable === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <div className="text-sm text-gray-500">{d.day}</div>
                <div className="text-xl font-bold my-1">
                  {new Date(d.date).getDate()}
                </div>
                <div className="text-xs">
                  {d.slotsAvailable === 0 ? (
                    <span className="text-red-600">Full</span>
                  ) : (
                    <span className="text-green-600">
                      {d.slotsAvailable} slots
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* TIME SLOT SELECTION */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => onTimeSlotSelect(slot.time)}
                disabled={slot.remaining === 0}
                className={`p-4 rounded-lg border transition-all ${
                  selectedTimeSlot === slot.time
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 hover:border-primary hover:bg-primary/5"
                } ${
                  slot.remaining === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{slot.time}</span>
                </div>
                <div className="mt-1 text-xs text-center">
                  {slot.remaining === 0 ? (
                    <span className="text-red-600">Full</span>
                  ) : (
                    <span className="text-green-600">
                      {slot.remaining} left
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SELECTED DETAILS */}
        {(selectedDate || selectedTimeSlot) && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h4 className="font-semibold">Selected Appointment</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateDisplay(selectedDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{selectedTimeSlot || "Not selected"}</span>
                  </div>
                </div>
                <Button
                  onClick={onBookingOpen}
                  disabled={!selectedDate || !selectedTimeSlot}
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
