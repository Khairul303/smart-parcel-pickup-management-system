"use client"

import {
  useCallback,
  useEffect,
  useState,
  startTransition,
} from "react"
import supabase from "@/lib/supabase"
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
import {
  ChevronRight,
  Users,
  UserCheck,
  PackageCheck,
  CheckCircle,
} from "lucide-react"

import { Pickup, AVERAGE_HANDLING_TIME } from "./types"
import { SummaryCard } from "./components/summary-card"
import { Filters } from "./components/filters"
import { PickupList } from "./components/pickup-list"
import { QueueStats } from "./components/queue-stats"
import { createCustomerNotificationByContact } from "@/lib/customer-notifications"
import { AdminNotificationButton } from "@/app/admin-dashboard/components"

/* =====================
   DB ROW TYPE
===================== */
interface PickupRow {
  pickup_code: string
  pickup_date: string
  time_slot: string
  queue_number: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  tracking_ids: string[] | null
  status: "booked" | "upcoming" | "checked_in" | "collected" | "cancelled" | "no_show"
  preparation_status: "pending" | "prepared"
}

/* =====================
   MALAYSIA DATE (Asia/KL)
===================== */
const getMalaysiaDateString = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

export default function PickupManagementPage() {
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  /* =====================
     LOAD PICKUPS
  ===================== */
  const loadPickups = useCallback(async () => {
    const todayStr = getMalaysiaDateString()

    const { data, error } = await supabase
      .from("pickup_bookings") // ✅ SINGLE SOURCE OF TRUTH
      .select(`
        pickup_code,
        pickup_date,
        time_slot,
        queue_number,
        customer_name,
        customer_email,
        customer_phone,
        tracking_ids,
        status,
        preparation_status
      `)
      .gte("pickup_date", todayStr)
      .order("pickup_date", { ascending: true })
        .order("time_slot", { ascending: true })

    startTransition(() => {
      if (error) {
        console.error("Failed to load pickups:", error)
        setPickups([])
      } else {
        const mapped =
          (data as PickupRow[] | null)?.map((p) => ({
            id: p.pickup_code,
            pickup_date: p.pickup_date,
            time_slot: p.time_slot,
            queue_number: p.queue_number ?? "-",
            customer_name: p.customer_name,
            customer_email: p.customer_email,
            customer_phone: p.customer_phone ?? undefined,
            tracking_ids: p.tracking_ids ?? [],
            parcel_count: p.tracking_ids?.length ?? 0,
            status: p.status,
            preparation_status: p.preparation_status,
          })) ?? []

        // numeric-safe queue sorting
        mapped.sort((a, b) => {
          const qa = parseInt(a.queue_number.replace(/\D/g, "")) || 0
          const qb = parseInt(b.queue_number.replace(/\D/g, "")) || 0
          const dateCompare = a.pickup_date.localeCompare(b.pickup_date)
          if (dateCompare !== 0) return dateCompare
          const slotCompare = a.time_slot.localeCompare(b.time_slot)
          if (slotCompare !== 0) return slotCompare
          return qa - qb
        })

        setPickups(mapped)
      }
    })
  }, [])

  /* =====================
     INITIAL LOAD
  ===================== */
  useEffect(() => {
    startTransition(() => {
      loadPickups()
    })
  }, [loadPickups])

  useEffect(() => {
    const channel = supabase
      .channel("staff-pickup-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pickup_bookings" },
        () => loadPickups()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadPickups])

  /* =====================
     FILTERING
  ===================== */
  const filteredPickups = pickups.filter((p) => {
    const matchesSearch =
      p.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.queue_number.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter

    return matchesSearch && matchesStatus
  })

  /* =====================
     STATS
  ===================== */
  const activePickups = pickups.filter((p) => p.status !== "cancelled" && p.status !== "no_show")

  const stats = {
    total: activePickups.length,
    prepared: pickups.filter(
      (p) => p.preparation_status === "prepared" && p.status !== "cancelled" && p.status !== "no_show"
    ).length,
    checkedIn: pickups.filter(
      (p) => p.status === "checked_in"
    ).length,
    collected: pickups.filter(
      (p) => p.status === "collected"
    ).length,
  }

  const completionRate =
    stats.total > 0
      ? Math.round((stats.collected / stats.total) * 100)
      : 0

  /* =====================
     ACTIONS (SAME TABLE)
  ===================== */
  const handlePrepare = async (pickup: Pickup) => {
    await supabase
      .from("pickup_bookings")
      .update({ preparation_status: "prepared" })
      .eq("pickup_code", pickup.id)

    await createCustomerNotificationByContact({
      email: pickup.customer_email,
      phone: pickup.customer_phone,
      title: "Queue Updated",
      message: "Your parcel has been prepared for pickup.",
      type: "queue_update",
      relatedId: pickup.id,
    })

  }

  const handleCheckIn = async (pickup: Pickup) => {
    if (pickup.pickup_date !== getMalaysiaDateString()) {
      alert("Pickup is not scheduled for today")
      return
    }

    if (pickup.preparation_status !== "prepared") {
      alert("Parcel not prepared yet")
      return
    }

    await supabase
      .from("pickup_bookings")
      .update({ status: "checked_in" })
      .eq("pickup_code", pickup.id)

    await createCustomerNotificationByContact({
      email: pickup.customer_email,
      phone: pickup.customer_phone,
      title: "Queue Updated",
      message: `Your queue status has been updated. Queue number: ${pickup.queue_number}.`,
      type: "queue_update",
      relatedId: pickup.id,
    })

  }

  const handleCollected = async (pickup: Pickup) => {
    await supabase
      .from("pickup_bookings")
      .update({ status: "collected" })
      .eq("pickup_code", pickup.id)

    await createCustomerNotificationByContact({
      email: pickup.customer_email,
      phone: pickup.customer_phone,
      title: "Pickup Collected",
      message: "Your pickup has been marked as collected.",
      type: "queue_update",
      relatedId: pickup.id,
    })

  }

  /* =====================
     UI (UNCHANGED)
  ===================== */
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-3 border-b bg-background/95 px-3 py-2 sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="hidden h-6 sm:block" />
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

          <AdminNotificationButton />
        </header>

        {/* CONTENT */}
        <main className="min-h-screen min-w-0 space-y-6 bg-linear-to-b from-gray-50/50 to-white p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Pickups"
              value={stats.total}
              icon={<Users className="h-5 w-5" />}
              description="Scheduled"
              color="bg-blue-500"
            />
            <SummaryCard
              title="Prepared"
              value={stats.prepared}
              icon={<UserCheck className="h-5 w-5" />}
              description="Ready"
              color="bg-emerald-500"
              trend={`~${stats.prepared * AVERAGE_HANDLING_TIME} min`}
            />
            <SummaryCard
              title="Collected"
              value={stats.collected}
              icon={<PackageCheck className="h-5 w-5" />}
              description="Completed"
              color="bg-indigo-500"
            />
            <SummaryCard
              title="Completion Rate"
              value={`${completionRate}%`}
              icon={<CheckCircle className="h-5 w-5" />}
              description="Performance"
              color="bg-violet-500"
              progress={completionRate}
            />
          </div>

          <Filters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <PickupList
                pickups={pickups}
                filteredPickups={filteredPickups}
                stats={stats}
                onPrepare={handlePrepare}
                onCheckIn={handleCheckIn}
                onCollected={handleCollected}
              />
            </div>

            <QueueStats pickups={pickups} stats={stats} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
