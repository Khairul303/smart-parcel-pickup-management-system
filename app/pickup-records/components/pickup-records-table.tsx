import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Phone, Package, Timer, Eye, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { PickupRecord, statusConfig } from "../types"

interface PickupRecordsTableProps {
  records: PickupRecord[]
  onViewDetails: (record: PickupRecord) => void
  onDeleteRecords: (records: PickupRecord[]) => Promise<boolean>
  stats: {
    total: number
    pending: number
    assigned: number
    inProgress: number
    completed: number
    cancelled: number
  }
}

const RECORDS_PER_PAGE = 10

export function PickupRecordsTable({
  records,
  onViewDetails,
  onDeleteRecords,
  stats,
}: PickupRecordsTableProps) {
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(
    () => new Set()
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredRecords = statusFilter === "all" 
    ? records 
    : records.filter(record => record.status === statusFilter)

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / RECORDS_PER_PAGE))
  const currentSafePage = Math.min(currentPage, totalPages)
  const pageStartIndex = (currentSafePage - 1) * RECORDS_PER_PAGE
  const paginatedRecords = filteredRecords.slice(
    pageStartIndex,
    pageStartIndex + RECORDS_PER_PAGE
  )
  const showingFrom = filteredRecords.length === 0 ? 0 : pageStartIndex + 1
  const showingTo = Math.min(pageStartIndex + paginatedRecords.length, filteredRecords.length)
  const showPagination = filteredRecords.length > RECORDS_PER_PAGE
  const filteredRecordIds = new Set(filteredRecords.map((record) => record.id))
  const selectedIds = Array.from(selectedRecordIds).filter((id) =>
    filteredRecordIds.has(id)
  )
  const selectedRecords = filteredRecords.filter((record) =>
    selectedRecordIds.has(record.id)
  )
  const visibleRecordIds = paginatedRecords.map((record) => record.id)
  const selectedVisibleCount = visibleRecordIds.filter((id) =>
    selectedRecordIds.has(id)
  ).length
  const allVisibleSelected =
    visibleRecordIds.length > 0 && selectedVisibleCount === visibleRecordIds.length
  const someVisibleSelected =
    selectedVisibleCount > 0 && selectedVisibleCount < visibleRecordIds.length

  const pageNumbers = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, index) => index + 1).filter(
        (pageNumber) =>
          pageNumber === 1 ||
          pageNumber === totalPages ||
          Math.abs(pageNumber - currentSafePage) <= 1
      ),
    [currentSafePage, totalPages]
  )

  const statusOptions = [
    { value: "all", label: "All", count: stats.total },
    { value: "pending", label: "Pending", count: stats.pending },
    { value: "assigned", label: "Assigned", count: stats.assigned },
    { value: "in-progress", label: "In Progress", count: stats.inProgress },
    { value: "completed", label: "Completed", count: stats.completed },
    { value: "cancelled", label: "Cancelled", count: stats.cancelled },
  ]

  const toggleRecordSelection = (recordId: string, checked: boolean) => {
    setSelectedRecordIds((current) => {
      const next = new Set(current)
      if (checked) {
        next.add(recordId)
      } else {
        next.delete(recordId)
      }
      return next
    })
  }

  const toggleVisibleSelection = (checked: boolean) => {
    setSelectedRecordIds((current) => {
      const next = new Set(current)
      visibleRecordIds.forEach((recordId) => {
        if (checked) {
          next.add(recordId)
        } else {
          next.delete(recordId)
        }
      })
      return next
    })
  }

  const handleDeleteSelected = async () => {
    if (selectedRecords.length === 0) return

    const confirmed = confirm(
      selectedRecords.length === 1
        ? "Delete this pickup record?"
        : `Delete ${selectedRecords.length} selected pickup records?`
    )

    if (!confirmed) return

    setIsDeleting(true)
    const deleted = await onDeleteRecords(selectedRecords)
    if (deleted) {
      setSelectedRecordIds((current) => {
        const next = new Set(current)
        selectedRecords.forEach((record) => next.delete(record.id))
        return next
      })
    }
    setIsDeleting(false)
  }

  const handleDeleteSingle = async (record: PickupRecord) => {
    const confirmed = confirm("Delete this pickup record?")

    if (!confirmed) return

    setIsDeleting(true)
    const deleted = await onDeleteRecords([record])
    if (deleted) {
      setSelectedRecordIds((current) => {
        const next = new Set(current)
        next.delete(record.id)
        return next
      })
    }
    setIsDeleting(false)
  }

  return (
    <Card className="min-w-0 border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Pickup Records</CardTitle>
            <CardDescription className="text-sm">
              Historical pickup records by queue • {filteredRecords.length} records
            </CardDescription>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete {selectedIds.length}
              </Button>
            )}
            {/* Status Filter Tabs */}
            <div className="flex max-w-full flex-wrap gap-1">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={statusFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(option.value)
                    setCurrentPage(1)
                  }}
                  className="h-7 px-2.5 text-xs"
                >
                  {option.label}
                  <Badge variant="secondary" className="ml-1.5 h-4 min-w-4 px-1 text-[10px]">
                    {option.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
          <div className="space-y-3 md:hidden">
          {paginatedRecords.map((record) => {
            const status = statusConfig[record.status]
            const isSelected = selectedRecordIds.has(record.id)

            return (
              <div key={`${record.id}-${record.createdAt}`} className="rounded-lg border p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        toggleRecordSelection(record.id, checked === true)
                      }
                      aria-label={`Select pickup record ${record.id}`}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <div className="font-medium">{record.customer.name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="truncate">{record.customer.phone}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={status.variant} className={`gap-0.5 text-xs ${status.colorClass}`}>
                    {status.icon}
                    {status.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Queue</div>
                    <div className="font-semibold">
                      {record.queueLabel ?? `Q-${record.queueNumber?.toString().padStart(2, "0") || "00"}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Pickup Time</div>
                    <div>{new Date(record.preferredTime).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {record.timeSlot ?? "Not scheduled"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">Parcel Details</div>
                    <div>{record.parcelDetails.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {record.parcelDetails.weight} | {record.parcelDetails.dimensions}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(record)}
                    className="h-9 gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="text-xs">View</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSingle(record)}
                    disabled={isDeleting}
                    className="h-9 gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="text-xs">Delete</span>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="hidden md:block">
          <div className="min-w-0">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[44px] px-3">
                    <Checkbox
                      checked={
                        allVisibleSelected
                          ? true
                          : someVisibleSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(checked) =>
                        toggleVisibleSelection(checked === true)
                      }
                      aria-label="Select visible pickup records"
                    />
                  </TableHead>
                  <TableHead className="w-[86px] px-3 text-center">Queue #</TableHead>
                  <TableHead className="px-3">Customer</TableHead>
                  <TableHead className="px-3">Parcel Details</TableHead>
                  <TableHead className="w-[112px] px-3">Pickup Date</TableHead>
                  <TableHead className="w-[132px] px-3">Time Slot</TableHead>
                  <TableHead className="w-[124px] px-3">Status</TableHead>
                  <TableHead className="w-[128px] px-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((record) => {
                  const status = statusConfig[record.status]
                  
                  return (
                    <TableRow key={`${record.id}-${record.createdAt}`} className="hover:bg-muted/50">
                      <TableCell className="px-3 py-2">
                        <Checkbox
                          checked={selectedRecordIds.has(record.id)}
                          onCheckedChange={(checked) =>
                            toggleRecordSelection(record.id, checked === true)
                          }
                          aria-label={`Select pickup record ${record.id}`}
                        />
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-col items-center">
                          <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="text-base font-bold">
                              {record.queueLabel ?? `Q-${record.queueNumber?.toString().padStart(2, "0") || "00"}`}
                            </span>
                          </div>
                          {record.estimatedWait && record.status === "in-progress" && (
                            <div className="mt-1 flex items-center text-[10px] text-amber-600">
                              <Timer className="h-2.5 w-2.5 mr-0.5" />
                              ~{record.estimatedWait} min
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">{record.customer.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{record.customer.name}</div>
                            <div className="flex items-center gap-0.5 text-xs text-muted-foreground truncate">
                              <Phone className="h-2.5 w-2.5 flex-shrink-0" />
                              <span className="truncate">{record.customer.phone}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-sm truncate">{record.parcelDetails.type}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {record.parcelDetails.weight} • {record.parcelDetails.dimensions}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs truncate">
                              {new Date(record.preferredTime).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              Created {new Date(record.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <div className="text-xs font-medium">
                          {record.timeSlot ?? "Not scheduled"}
                        </div>
                        {record.updatedAt && (
                          <div className="text-xs text-muted-foreground">
                            Updated {new Date(record.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-3">
                        <Badge 
                          variant={status.variant} 
                          className={`gap-0.5 text-xs ${status.colorClass}`}
                        >
                          <span className="flex items-center">
                            {status.icon}
                            <span className="truncate">{status.label}</span>
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onViewDetails(record)}
                          className="h-7 px-2 gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="text-xs">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSingle(record)}
                          disabled={isDeleting}
                          className="h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <h3 className="mt-3 text-base font-semibold">No records found</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  No pickup records match the selected filter
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Record count and pagination info */}
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {showingFrom}-{showingTo} of {filteredRecords.length} records
          </div>
          {showPagination && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => setCurrentPage(Math.max(currentSafePage - 1, 1))}
                disabled={currentSafePage <= 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              {pageNumbers.map((pageNumber, index) => {
                const previous = pageNumbers[index - 1]
                const showGap = previous && pageNumber - previous > 1

                return (
                  <span key={pageNumber} className="flex items-center gap-1.5">
                    {showGap && (
                      <span className="px-1 text-xs text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={pageNumber === currentSafePage ? "default" : "outline"}
                      size="sm"
                      className="h-8 min-w-8 px-2 text-xs"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  </span>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => setCurrentPage(Math.min(currentSafePage + 1, totalPages))}
                disabled={currentSafePage >= totalPages}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
