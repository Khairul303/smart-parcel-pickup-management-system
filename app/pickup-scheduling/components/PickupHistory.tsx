"use client"

import { useState } from "react"
import { Edit, Trash2, RefreshCw, Search } from "lucide-react"
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
  onReschedule,
}: PickupHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // ======================
  // STATUS BADGE (FIXED)
  // ======================
  const getStatusBadge = (status: PickupSchedule["status"]) => {
    const config: Record<
      PickupSchedule["status"],
      { color: string; label: string }
    > = {
      booked: {
        color: "bg-blue-100 text-blue-800",
        label: "Booked",
      },
      checked_in: {
        color: "bg-amber-100 text-amber-800",
        label: "Checked In",
      },
      collected: {
        color: "bg-green-100 text-green-800",
        label: "Collected",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        label: "Cancelled",
      },
      no_show: {
        color: "bg-gray-100 text-gray-800",
        label: "No Show",
      },
    }

    const badge = config[status]

    return <Badge className={badge.color}>{badge.label}</Badge>
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
      statusFilter === "all" || pickup.status === statusFilter

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Pickup History</CardTitle>
            <CardDescription>
              View and manage your pickup appointments
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search pickups..."
                className="w-full sm:w-[180px] pl-10"
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
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">ID</TableHead>
                <TableHead className="w-[150px]">Date & Time</TableHead>
                <TableHead className="w-[90px]">Queue</TableHead>
                <TableHead className="w-[120px]">Est. Wait</TableHead>
                <TableHead className="min-w-[150px]">Parcel</TableHead>
                <TableHead className="min-w-[200px]">Address</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[160px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredPickups.map((pickup) => (
                <TableRow key={pickup.id}>
                  <TableCell className="font-medium">
                    {pickup.id}
                  </TableCell>

                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {new Date(pickup.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pickup.timeSlot}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">
                    {pickup.queueNumber ?? "-"}
                  </TableCell>

                  <TableCell className="text-sm text-gray-600">
                    {getEstimatedWait(pickup.queueNumber)}
                  </TableCell>

                  <TableCell className="max-w-[200px] truncate">
                    {pickup.parcelDetails}
                  </TableCell>

                  <TableCell className="max-w-[250px] truncate">
                    {pickup.pickupAddress}
                  </TableCell>

                  <TableCell>{getStatusBadge(pickup.status)}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onEdit(pickup)}
                        disabled={
                          pickup.status === "collected" ||
                          pickup.status === "cancelled"
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onReschedule(pickup)}
                        disabled={
                          pickup.status === "collected" ||
                          pickup.status === "cancelled"
                        }
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => onCancel(pickup.id)}
                        disabled={
                          pickup.status === "collected" ||
                          pickup.status === "cancelled"
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
