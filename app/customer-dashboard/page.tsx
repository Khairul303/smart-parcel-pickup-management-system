"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  Filter,
  Calendar,
  Bell,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CustomerSidebar } from "@/components/layout/CustomerSidebar"

import { StatsCards } from "./components/StatsCards"
import { QueueStatus } from "./components/QueueStatus"
import { RecentActivity } from "./components/RecentActivity"
import { PeakTime } from "./components/PeakTime"

import supabase from "@/lib/supabase"

/* =====================
   TYPES
===================== */
type Parcel = {
  id: string
  tracking_id: string
  sender: string
  receiver: string
  weight?: string
  priority: string
  status: "pending" | "arrived" | "ready-for-pickup" | "delivered"
  created_at: string
}

type StatusFilter = "all" | "ready" | "completed"

/* =====================
   COMPONENT
===================== */
export default function CustomerDashboardPage() {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [unreadNotifications] = useState(3)

  /* ===== TRACK PARCEL ===== */
  const [isTrackOpen, setIsTrackOpen] = useState(false)
  const [trackId, setTrackId] = useState("")
  const [trackedParcel, setTrackedParcel] = useState<Parcel | null>(null)
  const [trackError, setTrackError] = useState("")
  const [loading, setLoading] = useState(false)

  /* =====================
     FETCH PARCELS
  ===================== */
  useEffect(() => {
    const fetchParcels = async () => {
      const { data } = await supabase
        .from("parcels")
        .select("*")
        .order("created_at", { ascending: false })

      if (data) setParcels(data)
    }

    fetchParcels()
  }, [])

  /* =====================
     STATS
  ===================== */
  const stats = {
    totalParcels: parcels.length,
    readyForPickup: parcels.filter(
      (p) => p.status === "ready-for-pickup"
    ).length,
    completed: parcels.filter(
      (p) => p.status === "delivered"
    ).length,
  }

  /* =====================
     FILTER LABEL
  ===================== */
  const getFilterLabel = () => {
    switch (statusFilter) {
      case "ready":
        return "Ready for Pickup"
      case "completed":
        return "Completed"
      default:
        return "All"
    }
  }

  /* =====================
     STATUS BADGE
  ===================== */
  const getStatusBadge = (status: Parcel["status"]) => {
    const styles: Record<Parcel["status"], string> = {
      pending: "bg-gray-100 text-gray-800",
      arrived: "bg-green-100 text-green-800",
      "ready-for-pickup": "bg-blue-100 text-blue-800",
      delivered: "bg-emerald-100 text-emerald-800",
    }

    return (
      <Badge className={`rounded-full ${styles[status]}`}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    )
  }

  /* =====================
     TRACK PARCEL LOGIC
  ===================== */
  const handleTrackParcel = async () => {
    setLoading(true)
    setTrackError("")
    setTrackedParcel(null)

    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .eq("tracking_id", trackId)
      .single()

    if (error || !data) {
      setTrackError("Parcel not found. Please check the tracking ID.")
    } else {
      setTrackedParcel(data)
    }

    setLoading(false)
  }

  /* =====================
     FILTERED PARCELS
  ===================== */
  const filteredParcels = parcels.filter((p) => {
    const matchesSearch = p.tracking_id
      .toLowerCase()
      .includes(searchQuery.toLowerCase())

    if (statusFilter === "ready") {
      return matchesSearch && p.status === "ready-for-pickup"
    }

    if (statusFilter === "completed") {
      return matchesSearch && p.status === "delivered"
    }

    return matchesSearch
  })

  return (
    <SidebarProvider>
      <CustomerSidebar />

      <SidebarInset className="flex-1 min-h-screen bg-gray-50">
        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
          <div className="px-4 md:px-8">
            <div className="flex h-16 items-center justify-between">
              <h1 className="text-xl font-semibold">
                Customer Dashboard
              </h1>

              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* ================= MAIN ================= */}
        <main className="p-4 md:p-8 space-y-8">
          {/* Welcome */}
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Welcome back 👋</h2>
              <p className="text-sm text-muted-foreground">
                Here’s an overview of your parcel activity
              </p>
            </div>

            <Button onClick={() => setIsTrackOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Track Parcel
            </Button>
          </div>

          {/* Stats */}
          <StatsCards stats={stats} />

          {/* ================= GRID ================= */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* LEFT */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Parcels</CardTitle>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Search by tracking ID..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                    />

                    {/* FILTER DROPDOWN */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Filter className="mr-2 h-4 w-4" />
                          Filter: {getFilterLabel()}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("ready")}>
                          Ready for Pickup
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                          Completed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {filteredParcels.map((parcel) => (
                    <Card key={parcel.id} className="hover:shadow">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex justify-between">
                          <span className="font-semibold">
                            {parcel.tracking_id}
                          </span>
                          {getStatusBadge(parcel.status)}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          From: {parcel.sender}
                        </p>

                        <div className="flex justify-between text-sm">
                          <span>
                            Weight: {parcel.weight || "-"}
                          </span>
                          <Badge variant="outline">
                            {parcel.priority}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          {new Date(parcel.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT */}
            <div className="space-y-6 sticky top-20">
              <QueueStatus />
              <RecentActivity />
              <PeakTime />
            </div>
          </div>
        </main>

        {/* ================= TRACK PARCEL DIALOG ================= */}
        <Dialog open={isTrackOpen} onOpenChange={setIsTrackOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Track Parcel</DialogTitle>
            </DialogHeader>

            <Input
              placeholder="Enter tracking ID"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
            />

            <Button onClick={handleTrackParcel} disabled={loading}>
              {loading ? "Tracking..." : "Track"}
            </Button>

            {trackError && (
              <p className="text-sm text-red-500">
                {trackError}
              </p>
            )}

            {trackedParcel && (
              <Card>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {trackedParcel.tracking_id}
                    </span>
                    {getStatusBadge(trackedParcel.status)}
                  </div>

                  <p>Sender: {trackedParcel.sender}</p>
                  <p>Receiver: {trackedParcel.receiver}</p>
                  <p>Weight: {trackedParcel.weight || "-"}</p>
                  <p>Priority: {trackedParcel.priority}</p>
                </CardContent>
              </Card>
            )}
          </DialogContent>
        </Dialog>

        <footer className="border-t py-6 text-center text-xs text-muted-foreground">
          © 2024 Smart Parcel Pickup Management System
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
