"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Button } from "@/components/ui/button"
import { Bell, ChevronRight, RefreshCw, CheckCircle } from "lucide-react"

// Import local types and config
import { PickupRecord } from "./types"
import { dummyPickupRecords } from "./config"

// Import local components
import { SummaryCard } from "./components/summary-card"
import { Filters } from "./components/filters"
import { PickupRecordsTable } from "./components/pickup-records-table"
import { RecordDetailsModal } from "./components/record-details-modal"

export default function PickupRecordsPage() {
  const [records, setRecords] = useState<PickupRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRecord, setSelectedRecord] = useState<PickupRecord | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  /* 🔄 LOAD RECORDS */
  const loadRecords = useCallback(async () => {
    setIsRefreshing(true)
    // In a real app, fetch from Supabase
    // For now, use dummy data with simulated delay
    setTimeout(() => {
      setRecords(dummyPickupRecords)
      setIsRefreshing(false)
    }, 500)
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchRecords = async () => {
      setIsRefreshing(true)

      // Simulate API delay (replace with Supabase later)
      setTimeout(() => {
        if (!isMounted) return

        setRecords(dummyPickupRecords)
        setIsRefreshing(false)
      }, 500)
    }

    fetchRecords()

    return () => {
      isMounted = false
    }
  }, [])

  /* 🔍 FILTERED RECORDS */
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.customer.phone.includes(searchQuery) ||
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
            <Button 
              variant="outline" 
              size="icon" 
              className="relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRecords}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
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
              icon={<Bell className="h-5 w-5" />}
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
