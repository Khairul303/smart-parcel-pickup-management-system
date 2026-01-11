import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Phone, Package, Timer, Eye } from "lucide-react"
import { PickupRecord, statusConfig } from "../types"

interface PickupRecordsTableProps {
  records: PickupRecord[]
  onViewDetails: (record: PickupRecord) => void
  stats: {
    total: number
    pending: number
    assigned: number
    inProgress: number
    completed: number
    cancelled: number
  }
}

export function PickupRecordsTable({
  records,
  onViewDetails,
  stats,
}: PickupRecordsTableProps) {
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredRecords = statusFilter === "all" 
    ? records 
    : records.filter(record => record.status === statusFilter)

  const statusOptions = [
    { value: "all", label: "All", count: stats.total },
    { value: "pending", label: "Pending", count: stats.pending },
    { value: "assigned", label: "Assigned", count: stats.assigned },
    { value: "in-progress", label: "In Progress", count: stats.inProgress },
    { value: "completed", label: "Completed", count: stats.completed },
    { value: "cancelled", label: "Cancelled", count: stats.cancelled },
  ]

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Pickup Records</CardTitle>
            <CardDescription className="text-sm">
              Historical pickup records by queue • {filteredRecords.length} records
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={statusFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(option.value)}
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
        <div className="overflow-x-auto">
          <div className="min-w-[800px] lg:min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 px-4 text-center">Queue #</TableHead>
                  <TableHead className="w-60 px-4">Customer</TableHead>
                  <TableHead className="w-40 px-4">Parcel Details</TableHead>
                  <TableHead className="w-36 px-4">Pickup Time</TableHead>
                  <TableHead className="w-28 px-4">Status</TableHead>
                  <TableHead className="w-15 px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const status = statusConfig[record.status]
                  
                  return (
                    <TableRow key={record.id} className="hover:bg-muted/50">
                      <TableCell className="px-4 py-2">
                        <div className="flex flex-col items-center">
                          <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="text-base font-bold">
                              Q-{record.queueNumber?.toString().padStart(2, "0") || "00"}
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
                      <TableCell className="px-4 py-3">
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
                      <TableCell className="px-4 py-3">
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
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs truncate">
                              {new Date(record.preferredTime).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {new Date(record.preferredTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
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
                      <TableCell className="px-4 py-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onViewDetails(record)}
                          className="h-7 px-2 gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="text-xs">View</span>
                        </Button>
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
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-xs text-muted-foreground">
            Showing {filteredRecords.length} of {records.length} records
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}