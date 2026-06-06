"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Edit, Eye, Search, Trash2, XCircle } from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { formatMalaysiaDate } from "@/lib/pickup-scheduling"

// ⏱ Average handling time (minutes per customer)

interface PickupHistoryProps {
  pickups: PickupSchedule[]
  onEdit: (pickup: PickupSchedule) => void
  onCancel: (pickupId: string) => void
  onDeleteCancelled: (pickupId: string) => void
  onReschedule: (pickup: PickupSchedule) => void
  page: number
  pageSize: number
  totalCount: number
  searchQuery: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onPageChange: (page: number) => void
}

export function PickupHistory({
  pickups,
  onEdit,
  onCancel,
  onDeleteCancelled,
  page,
  pageSize,
  totalCount,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onPageChange,
}: PickupHistoryProps) {
  const [selectedPickup, setSelectedPickup] = useState<PickupSchedule | null>(null)
  const [deletePickup, setDeletePickup] = useState<PickupSchedule | null>(null)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((pageNumber) => {
      if (totalPages <= 5) return true
      return (
        pageNumber === 1 ||
        pageNumber === totalPages ||
        Math.abs(pageNumber - page) <= 1
      )
    })

  const getStatusBadge = (status: PickupSchedule["status"]) => {
    const displayStatus = normalizePickupStatus(status)

    return (
      <Badge className={PICKUP_STATUS_BADGE_CLASSES[displayStatus]}>
        {getPickupStatusLabel(status)}
      </Badge>
    )
  }

  const showPagination = totalCount > pageSize

  // ======================
  // QUEUE → ESTIMATED WAIT
  // ======================
  const getEstimatedWait = (pickup: PickupSchedule) => {
    if (typeof pickup.estimatedWaitMinutes === "number") {
      return `${pickup.estimatedWaitMinutes} min`
    }

    const queue = pickup.queueNumber
    if (!queue) return "-"
    const num = Number(queue.replace("Q-", ""))
    if (isNaN(num) || num <= 1) return "0 min"
    return `${num - 1} min`
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
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
          {pickups.map((pickup) => (
            <div key={pickup.id} className="rounded-md border p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{pickup.id}</div>
                  <div className="text-sm text-gray-500">
                    {formatMalaysiaDate(pickup.date, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} at{" "}
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
                  <div>{getEstimatedWait(pickup)}</div>
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
                  onClick={() => setSelectedPickup(pickup)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit(pickup)}
                  disabled={
                    normalizePickupStatus(pickup.status) === "cancelled"
                  }
                >
                  <Edit className="h-4 w-4" />
                </Button>

                {normalizePickupStatus(pickup.status) === "cancelled" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => setDeletePickup(pickup)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => onCancel(pickup.id)}
                    disabled={normalizePickupStatus(pickup.status) === "collected"}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {pickups.length === 0 && (
            <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
              No pickup bookings found.
            </div>
          )}
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
              {pickups.map((pickup) => (
                <TableRow key={pickup.id}>
                  <TableCell className="truncate px-2 font-medium">
                    {pickup.id}
                  </TableCell>

                  <TableCell className="px-2">
                    <div>
                      <div className="font-medium leading-tight">
                        {formatMalaysiaDate(pickup.date, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
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
                    {getEstimatedWait(pickup)}
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
                        onClick={() => setSelectedPickup(pickup)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onEdit(pickup)}
                        disabled={
                          normalizePickupStatus(pickup.status) === "cancelled"
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {normalizePickupStatus(pickup.status) === "cancelled" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => setDeletePickup(pickup)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => onCancel(pickup.id)}
                          disabled={normalizePickupStatus(pickup.status) === "collected"}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pickups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No pickup bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {showPagination && (
          <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(page - 1, 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              {pageNumbers.map((pageNumber, index) => {
                const previous = pageNumbers[index - 1]
                const showGap = previous && pageNumber - previous > 1

                return (
                  <span key={pageNumber} className="flex items-center gap-1">
                    {showGap && (
                      <span className="px-1 text-sm text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={pageNumber === page ? "default" : "outline"}
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => onPageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  </span>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog
        open={Boolean(selectedPickup)}
        onOpenChange={(open) => !open && setSelectedPickup(null)}
      >
        <DialogContent className="max-h-[90svh] w-[95vw] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pickup Details</DialogTitle>
            <DialogDescription>
              Complete details for your pickup booking.
            </DialogDescription>
          </DialogHeader>

          {selectedPickup && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 rounded-md border p-4 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-muted-foreground">Booking Reference</div>
                  <div className="font-medium">{selectedPickup.id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Queue Number</div>
                  <div className="font-medium">{selectedPickup.queueNumber ?? "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Pickup Date</div>
                  <div className="font-medium">{formatMalaysiaDate(selectedPickup.date)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Time Slot</div>
                  <div className="font-medium">{selectedPickup.timeSlot}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedPickup.status)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Estimated Waiting Time</div>
                  <div className="font-medium">{getEstimatedWait(selectedPickup)}</div>
                </div>
              </div>

              <div className="rounded-md border p-4 text-sm">
                <h3 className="mb-3 font-semibold">Tracking ID(s)</h3>
                {selectedPickup.trackingIds && selectedPickup.trackingIds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPickup.trackingIds.map((id) => {
                      const parcel = selectedPickup.relatedParcels?.find(
                        (item) => item.tracking_id === id
                      )

                      return (
                        <div key={id} className="rounded-md border bg-gray-50 p-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <Badge variant="outline" className="w-fit break-all bg-white">
                              {id}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {parcel?.status ? `Parcel status: ${parcel.status}` : "Parcel status unavailable"}
                            </span>
                          </div>
                          {(parcel?.sender || parcel?.receiver) && (
                            <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                              <div>
                                <span className="text-muted-foreground">Sender: </span>
                                <span>{parcel.sender ?? "-"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Receiver: </span>
                                <span>{parcel.receiver ?? selectedPickup.customerName}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No tracking ID recorded.</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-md border p-4 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-muted-foreground">Customer Name</div>
                  <div className="font-medium">{selectedPickup.customerName}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Phone</div>
                  <div className="font-medium">{selectedPickup.customerPhone}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Email</div>
                  <div className="break-all font-medium">{selectedPickup.customerEmail}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Pickup Address</div>
                  <div className="font-medium">{selectedPickup.pickupAddress || "-"}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-muted-foreground">Parcel Details</div>
                  <div className="whitespace-pre-wrap font-medium">
                    {selectedPickup.parcelDetails || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div className="font-medium">
                    {selectedPickup.createdAt
                      ? new Date(selectedPickup.createdAt).toLocaleString()
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Updated</div>
                  <div className="font-medium">
                    {selectedPickup.updatedAt
                      ? new Date(selectedPickup.updatedAt).toLocaleString()
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedPickup(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletePickup)}
        onOpenChange={(open) => !open && setDeletePickup(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Cancelled Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this cancelled booking from your pickup history?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (!deletePickup) return
                onDeleteCancelled(deletePickup.id)
                setDeletePickup(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
