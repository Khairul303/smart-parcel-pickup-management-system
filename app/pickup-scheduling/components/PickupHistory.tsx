"use client"

import { useState } from "react"
import { Edit, Trash2, Search } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PickupSchedule } from "./PickupScheduling"
import {
  getPickupStatusLabel,
  normalizePickupStatus,
  PICKUP_STATUS_BADGE_CLASSES,
} from "@/lib/pickup-status"

// ⏱ Average handling time (minutes per customer)
const AVG_HANDLE_MINUTES = 5

interface PickupHistoryProps {
  pickups: PickupSchedule[]
  onEdit: (pickup: PickupSchedule) => void
  onCancel: (pickupId: string) => void
  onReschedule: (pickup: PickupSchedule) => void
}

export function PickupHistory({
  pickups,
  onEdit,
  onCancel,
}: PickupHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const getStatusBadge = (status: PickupSchedule["status"]) => {
    const displayStatus = normalizePickupStatus(status)

    return (
      <Badge className={PICKUP_STATUS_BADGE_CLASSES[displayStatus]}>
        {getPickupStatusLabel(status)}
      </Badge>
    )
  }

  // ======================
  // FILTER PICKUPS
  // ======================
  const filteredPickups = pickups.filter((pickup) => {
    const search = searchQuery.toLowerCase()

    const matchesSearch =
      pickup.id.toLowerCase().includes(search) ||
      pickup.parcelDetails.toLowerCase().includes(search) ||
      pickup.pickupAddress.toLowerCase().includes(search)

    const matchesStatus =
      statusFilter === "all" || normalizePickupStatus(pickup.status) === statusFilter

    return matchesSearch && matchesStatus
  })

  // ======================
  // QUEUE → ESTIMATED WAIT
  // ======================
  const getEstimatedWait = (queue?: string) => {
    if (!queue) return "-"
    const num = Number(queue.replace("Q-", ""))
    if (isNaN(num) || num <= 1) return "0 min"
    return `${(num - 1) * AVG_HANDLE_MINUTES} min`
  }

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Pickup History</CardTitle>
            <CardDescription>
              View and manage your pickup appointments
            </CardDescription>
          </div>

          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search pickups..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-w-0">
        <div className="space-y-3 md:hidden">
          {filteredPickups.map((pickup) => (
            <div key={pickup.id} className="rounded-md border p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{pickup.id}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(pickup.date).toLocaleDateString()} at{" "}
                    {pickup.timeSlot}
                  </div>
                </div>
                {getStatusBadge(pickup.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Queue</div>
                  <div className="font-medium">{pickup.queueNumber ?? "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Est. Wait</div>
                  <div>{getEstimatedWait(pickup.queueNumber)}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500">Parcel</div>
                  <div className="break-words">{pickup.parcelDetails}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500">Address</div>
                  <div className="break-words">{pickup.pickupAddress}</div>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit(pickup)}
                  disabled={
                    normalizePickupStatus(pickup.status) === "collected" ||
                    normalizePickupStatus(pickup.status) === "cancelled"
                  }
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  onClick={() => onCancel(pickup.id)}
                  disabled={
                    normalizePickupStatus(pickup.status) === "collected" ||
                    normalizePickupStatus(pickup.status) === "cancelled"
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden w-full min-w-0 rounded-md border md:block">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[112px] px-2 lg:w-[128px]">ID</TableHead>
                <TableHead className="w-[124px] px-2 lg:w-[150px]">Date & Time</TableHead>
                <TableHead className="w-[74px] px-2 lg:w-[86px]">Queue</TableHead>
                <TableHead className="w-[82px] px-2 lg:w-[96px]">Est. Wait</TableHead>
                <TableHead className="px-2">Parcel</TableHead>
                <TableHead className="px-2">Address</TableHead>
                <TableHead className="w-[116px] px-2 lg:w-[128px]">Status</TableHead>
                <TableHead className="w-[86px] px-2 text-right lg:w-[96px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredPickups.map((pickup) => (
                <TableRow key={pickup.id}>
                  <TableCell className="truncate px-2 font-medium">
                    {pickup.id}
                  </TableCell>

                  <TableCell className="px-2">
                    <div>
                      <div className="font-medium leading-tight">
                        {new Date(pickup.date).toLocaleDateString()}
                      </div>
                      <div className="truncate text-xs text-gray-500">
                        {pickup.timeSlot}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="truncate px-2 font-medium">
                    {pickup.queueNumber ?? "-"}
                  </TableCell>

                  <TableCell className="px-2 text-sm text-gray-600">
                    {getEstimatedWait(pickup.queueNumber)}
                  </TableCell>

                  <TableCell className="truncate px-2">
                    {pickup.parcelDetails}
                  </TableCell>

                  <TableCell className="truncate px-2">
                    {pickup.pickupAddress}
                  </TableCell>

                  <TableCell className="px-2">{getStatusBadge(pickup.status)}</TableCell>

                  <TableCell className="px-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onEdit(pickup)}
                        disabled={
                          normalizePickupStatus(pickup.status) === "collected" ||
                          normalizePickupStatus(pickup.status) === "cancelled"
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => onCancel(pickup.id)}
                        disabled={
                          normalizePickupStatus(pickup.status) === "collected" ||
                          normalizePickupStatus(pickup.status) === "cancelled"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
