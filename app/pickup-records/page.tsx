"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { ClipboardList, ChevronRight, RefreshCw, CheckCircle } from "lucide-react"

import { PickupRecord } from "./types"
import { useAdminRealtimeData, type AdminPickupBooking } from "@/lib/admin-realtime"

// Import local components
import { SummaryCard } from "./components/summary-card"
import { Filters } from "./components/filters"
import { PickupRecordsTable } from "./components/pickup-records-table"
import { RecordDetailsModal } from "./components/record-details-modal"
import { AdminNotificationButton } from "@/app/admin-dashboard/components"

export default function PickupRecordsPage() {
  const {
    pickups,
  } = useAdminRealtimeData({ parcels: false, notifications: false })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRecord, setSelectedRecord] = useState<PickupRecord | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const mapPickupStatus = (status?: string | null): PickupRecord["status"] => {
    if (status === "checked_in") return "in-progress"
    if (status === "collected" || status === "completed") return "completed"
    if (status === "cancelled" || status === "no_show") return "cancelled"
    if (status === "booked" || status === "upcoming") return "assigned"
    return "pending"
  }

  const getInitials = (name?: string | null) =>
    (name ?? "NA")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

  const getQueueNumber = (queue?: string | null) => {
    const parsed = Number.parseInt(queue?.replace(/\D/g, "") ?? "", 10)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  const toPickupRecord = (pickup: AdminPickupBooking): PickupRecord => ({
    id: pickup.pickup_code,
    customer: {
      name: pickup.customer_name ?? "Unknown Customer",
      email: pickup.customer_email ?? "-",
      phone: pickup.customer_phone ?? "-",
      avatar: getInitials(pickup.customer_name),
    },
    parcelDetails: {
      type:
        pickup.tracking_ids && pickup.tracking_ids.length > 0
          ? pickup.tracking_ids.join(", ")
          : pickup.parcel_details ?? "Parcel details unavailable",
      weight: `${Math.max(pickup.tracking_ids?.length ?? 1, 1)} parcel(s)`,
      dimensions: pickup.parcel_details ?? "Not specified",
      value: "Not recorded",
    },
    pickupAddress: pickup.pickup_address ?? "No pickup address recorded",
    preferredTime: `${pickup.pickup_date ?? ""}T${
      pickup.time_slot?.slice(0, 5) ?? "00:00"
    }:00`,
    timeSlot: pickup.time_slot ?? "Not scheduled",
    status: mapPickupStatus(pickup.status),
    assignedTo: pickup.preparation_status === "prepared" ? "Prepared" : "Staff",
    createdAt: pickup.created_at ?? new Date().toISOString(),
    updatedAt: pickup.updated_at ?? pickup.created_at ?? undefined,
    queueNumber: getQueueNumber(pickup.queue_number),
    queueLabel: pickup.queue_number ?? "-",
    estimatedWait: pickup.estimated_wait_minutes ?? undefined,
  })

  const records = pickups
    .map(toPickupRecord)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  /* 🔍 FILTERED RECORDS */
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.customer.phone.includes(searchQuery) ||
      (record.timeSlot ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      statusFilter === "all" || 
      record.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  /* 📊 STATS */
  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === "pending").length,
    assigned: records.filter(r => r.status === "assigned").length,
    inProgress: records.filter(r => r.status === "in-progress").length,
    completed: records.filter(r => r.status === "completed").length,
    cancelled: records.filter(r => r.status === "cancelled").length,
  }

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100)
    : 0

  const activeQueueCount = stats.assigned + stats.inProgress

  /* HANDLE VIEW RECORD DETAILS */
  const handleViewRecordDetails = (record: PickupRecord) => {
    setSelectedRecord(record)
    setShowDetailsModal(true)
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-3 border-b bg-background/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="hidden h-6 sm:block" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin-dashboard" className="flex items-center gap-1">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">Pickup Records</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <AdminNotificationButton />
          </div>
        </header>

        {/* CONTENT */}
        <main className="min-h-screen min-w-0 space-y-6 bg-gradient-to-b from-gray-50/50 to-white p-4 md:p-6">
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pickup Records</h1>
              <p className="text-muted-foreground mt-1">
                Historical pickup records organized by queue and status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Last updated:</span>
              <span className="text-sm font-medium">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Records"
              value={stats.total}
              icon={<ClipboardList className="h-5 w-5" />}
              description="All pickup records"
              color="bg-blue-500"
            />
            <SummaryCard
              title="Active Queue"
              value={activeQueueCount}
              icon={<ChevronRight className="h-5 w-5" />}
              description="Currently in queue"
              color="bg-amber-500"
              progress={(activeQueueCount / Math.max(stats.total, 1)) * 100}
              progressColor="bg-amber-100"
            />
            <SummaryCard
              title="Completed"
              value={stats.completed}
              icon={<CheckCircle className="h-5 w-5" />}
              description="Successfully picked up"
              color="bg-emerald-500"
            />
            <SummaryCard
              title="Success Rate"
              value={`${completionRate}%`}
              icon={<RefreshCw className="h-5 w-5" />}
              description="Of all pickup attempts"
              color="bg-violet-500"
              progress={completionRate}
            />
          </div>

          {/* FILTERS */}
          <Filters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {/* MAIN CONTENT - FULL WIDTH */}
          <div className="space-y-6">

            {/* PICKUP RECORDS TABLE (FULL WIDTH) */}
            <PickupRecordsTable
              records={filteredRecords}
              onViewDetails={handleViewRecordDetails}
              stats={stats}
            />
          </div>

          {/* RECORD DETAILS MODAL */}
          {showDetailsModal && selectedRecord && (
            <RecordDetailsModal
              record={selectedRecord}
              isOpen={showDetailsModal}
              onClose={() => setShowDetailsModal(false)}
            />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
