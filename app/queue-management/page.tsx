"use client"

import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
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
import {
  Bell,
  ChevronRight,
  Users,
  UserCheck,
  PackageCheck,
  CheckCircle,
  RefreshCw,
} from "lucide-react"

// Import local types and config
import { Pickup } from "./types"
import { dummyPickups, AVERAGE_HANDLING_TIME } from "./config"

// Import local components
import { SummaryCard } from "./components/summary-card"
import { Filters } from "./components/filters"
import { PickupList } from "./components/pickup-list"
import { QueueStats } from "./components/queue-stats"

export default function PickupManagementPage() {
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  /* =====================
     LOAD TODAY PICKUPS (FIXED)
  ===================== */
  useEffect(() => {
    let isMounted = true

    const fetchPickups = async () => {
      setIsRefreshing(true)

      const today = new Date().toISOString().slice(0, 10)

      const { data, error } = await supabase
        .from("pickups")
        .select("*")
        .gte("pickup_time", today)
        .order("queue_number")

      if (!isMounted) return

      if (error || !data || data.length === 0) {
        setPickups(dummyPickups)
      } else {
        setPickups(data)
      }

      setIsRefreshing(false)
    }

    fetchPickups()

    return () => {
      isMounted = false
    }
  }, [])

  /* 🔍 FILTERED PICKUPS */
  const filteredPickups = pickups.filter(pickup => {
    const matchesSearch =
      pickup.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.phone?.includes(searchQuery)

    const matchesStatus =
      statusFilter === "all" ||
      pickup.status === statusFilter

    return matchesSearch && matchesStatus
  })

  /* 📊 STATS */
  const stats = {
    total: pickups.length,
    checkedIn: pickups.filter(p => p.status === "checked_in").length,
    collected: pickups.filter(p => p.status === "collected").length,
    booked: pickups.filter(p => p.status === "booked").length,
  }

  const completionRate =
    stats.total > 0
      ? Math.round((stats.collected / stats.total) * 100)
      : 0

  /* 🔄 MANUAL REFRESH (BUTTON) */
  const handleRefresh = async () => {
    setIsRefreshing(true)

    const today = new Date().toISOString().slice(0, 10)

    const { data, error } = await supabase
      .from("pickups")
      .select("*")
      .gte("pickup_time", today)
      .order("queue_number")

    if (error || !data || data.length === 0) {
      setPickups(dummyPickups)
    } else {
      setPickups(data)
    }

    setIsRefreshing(false)
  }

  /* ✅ CHECK IN */
  const handleCheckIn = async (pickup: Pickup) => {
    await supabase
      .from("pickups")
      .update({ status: "checked_in" })
      .eq("id", pickup.id)

    setPickups(prev =>
      prev.map(p =>
        p.id === pickup.id ? { ...p, status: "checked_in" } : p
      )
    )
  }

  /* 📦 COLLECTED */
  const handleCollected = async (pickup: Pickup) => {
    await supabase
      .from("pickups")
      .update({ status: "collected" })
      .eq("id", pickup.id)

    setPickups(prev =>
      prev.map(p =>
        p.id === pickup.id ? { ...p, status: "collected" } : p
      )
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin-dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">
                    Pickup Management
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white min-h-screen">
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Pickup Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time monitoring of parcel pickups with queue management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Last updated:</span>
              <span className="text-sm font-medium">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Pickups"
              value={stats.total}
              icon={<Users className="h-5 w-5" />}
              description="Scheduled for today"
              color="bg-blue-500"
            />
            <SummaryCard
              title="In Queue"
              value={stats.checkedIn}
              icon={<UserCheck className="h-5 w-5" />}
              description="Currently waiting"
              color="bg-amber-500"
              trend={`~${stats.checkedIn * AVERAGE_HANDLING_TIME} min total wait`}
            />
            <SummaryCard
              title="Collected"
              value={stats.collected}
              icon={<PackageCheck className="h-5 w-5" />}
              description="Successfully picked up"
              color="bg-emerald-500"
            />
            <SummaryCard
              title="Completion Rate"
              value={`${completionRate}%`}
              icon={<CheckCircle className="h-5 w-5" />}
              description="Of today's pickups"
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

          {/* MAIN CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PickupList
                pickups={pickups}
                filteredPickups={filteredPickups}
                stats={stats}
                onCheckIn={handleCheckIn}
                onCollected={handleCollected}
              />
            </div>

            <div className="space-y-6">
              <QueueStats pickups={pickups} stats={stats} />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
