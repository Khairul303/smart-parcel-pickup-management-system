"use client"

import { Calendar } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TimeFilterMode } from "@/lib/malaysia-date-range"

type AdminTimeFilterProps = {
  mode: TimeFilterMode
  date: string
  onModeChange: (value: TimeFilterMode) => void
  onDateChange: (value: string) => void
  options?: { value: TimeFilterMode; label: string }[]
}

const defaultOptions: { value: TimeFilterMode; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "specific", label: "Specific Date" },
]

export function AdminTimeFilter({
  mode,
  date,
  onModeChange,
  onDateChange,
  options = defaultOptions,
}: AdminTimeFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="w-full sm:w-44">
        <label className="mb-1.5 block text-sm font-medium">Time Filter</label>
        <Select
          value={mode}
          onValueChange={(value) => onModeChange(value as TimeFilterMode)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-44">
        <label className="mb-1.5 block text-sm font-medium">Date</label>
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="pl-9 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={mode === "all"}
            aria-disabled={mode === "all"}
          />
        </div>
      </div>
    </div>
  )
}
