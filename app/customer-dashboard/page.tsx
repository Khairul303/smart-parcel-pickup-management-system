"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  Filter,
  Calendar,
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { CustomerSidebar } from "@/components/layout/CustomerSidebar"

import { StatsCards } from "./components/StatsCards"
import { QueueStatus } from "./components/QueueStatus"
import { RecentActivity } from "./components/RecentActivity"
import { PeakTime } from "./components/PeakTime"
import { NotificationsDialog } from "./components/notifications"
import { useUserTrackingIds } from "./hooks/useUserTrackingIds"

import supabase from "@/lib/supabase"
import {
  belongsToCustomerContact,
  buildCustomerParcelOrFilter,
  type CustomerContact,
} from "@/lib/customer-data"
import {
  PARCEL_STATUS,
  PARCEL_STATUS_LABEL,
  ParcelStatusFilter,
} from "@/lib/parcel-status"

/* =====================
   TYPES
===================== */
type Parcel = {
  id: string
  tracking_id: string
  sender?: string | null
  receiver?: string | null
  weight?: string
  dimensions?: string | null
  priority?: string | null
  status:
    | "pending"
    | "ready"
    | "ready-for-pickup"
    | "completed"
    | "in-transit"
    | "delivered"
  created_at?: string | null
  updated_at?: string | null
  receiver_email?: string | null
  receiver_phone?: string | null
  user_id?: string | null
  customer_id?: string | null
  profile_id?: string | null
}

type StatusFilter = ParcelStatusFilter

/* =====================
   COMPONENT
===================== */
export default function CustomerDashboardPage() {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    PARCEL_STATUS.ALL
  )

  /* ===== TRACK PARCEL ===== */
  const [isTrackOpen, setIsTrackOpen] = useState(false)
  const [trackId, setTrackId] = useState("")
  const [trackedParcel, setTrackedParcel] = useState<Parcel | null>(null)
  const [trackError, setTrackError] = useState("")
  const [loading, setLoading] = useState(false)
  const {
    trackingIds,
    loading: trackingIdsLoading,
    error: trackingIdsError,
  } = useUserTrackingIds()

  /* =====================
     FETCH PARCELS
  ===================== */
  useEffect(() => {
    const fetchParcels = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profileData } = await supabase
        .from("profiles")
        .select("no_telephone")
        .eq("id", user.id)
        .maybeSingle()

      const profile: CustomerContact = {
        id: user.id,
        email: user.email ?? null,
        phone: profileData?.no_telephone ?? null,
      }
      const customerFilter = buildCustomerParcelOrFilter(profile)

      if (!customerFilter) {
        setParcels([])
        return
      }

      const { data } = await supabase
        .from("parcels")
        .select("*")
        .or(customerFilter)
        .order("created_at", { ascending: false })

      if (data) {
        setParcels(
          (data as Parcel[]).filter((parcel) =>
            belongsToCustomerContact(parcel, profile)
          )
        )
      }
    }

    fetchParcels()
  }, [])

  /* =====================
     STATS
  ===================== */
  const stats = {
    totalParcels: parcels.length,
    readyForPickup: parcels.filter(
      (p) => p.status === PARCEL_STATUS.READY
    ).length,
    completed: parcels.filter(
      (p) => p.status === PARCEL_STATUS.COMPLETED
    ).length,
  }

  /* =====================
     FILTER LABEL
  ===================== */
  const getFilterLabel = () => {
    switch (statusFilter) {
      case PARCEL_STATUS.READY:
        return PARCEL_STATUS_LABEL[PARCEL_STATUS.READY]
      case PARCEL_STATUS.COMPLETED:
        return PARCEL_STATUS_LABEL[PARCEL_STATUS.COMPLETED]
      default:
        return PARCEL_STATUS_LABEL[PARCEL_STATUS.ALL]
    }
  }

  /* =====================
     STATUS BADGE
  ===================== */
  const getStatusBadge = (status: Parcel["status"]) => {
    const styles: Record<Parcel["status"], string> = {
      pending: "bg-gray-100 text-gray-800",
      ready: "bg-green-100 text-green-800",
      "ready-for-pickup": "bg-blue-100 text-blue-800",
      completed: "bg-emerald-100 text-emerald-800",
      "in-transit": "bg-amber-100 text-amber-800",
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
  const trackingId = trackId.trim()

  if (!trackingId) {
    setTrackError("Please enter or select a tracking ID.")
    setTrackedParcel(null)
    return
  }

  setLoading(true)
  setTrackError("")
  setTrackedParcel(null)

  /* 1️⃣ Try normal RLS-protected fetch */
  const { data } = await supabase
    .from("parcels")
    .select("*")
    .eq("tracking_id", trackingId)
    .maybeSingle()

  if (data) {
    setTrackedParcel(data)
    setLoading(false)
    return
  }

  /* 2️⃣ Check existence via RPC */
  const { data: exists } = await supabase
    .rpc("check_parcel_exists", {
      p_tracking_id: trackingId,
    })

  if (exists) {
    setTrackError(
      "This parcel exists but is not registered under your email or phone number."
    )
  } else {
    setTrackError(
      "Tracking ID does not exist."
    )
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

    if (statusFilter === PARCEL_STATUS.READY) {
      return matchesSearch && p.status === PARCEL_STATUS.READY
    }

    if (statusFilter === PARCEL_STATUS.COMPLETED) {
      return matchesSearch && p.status === PARCEL_STATUS.COMPLETED
    }

    return matchesSearch
  })

  const formatDateTime = (date?: string | null) => {
    if (!date) return "-"

    return new Date(date).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <SidebarProvider>
      <CustomerSidebar />

      <SidebarInset className="flex-1 min-h-screen bg-gray-50">
        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
          <div className="px-4 md:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <h1 className="truncate text-xl font-semibold">
                  Customer Dashboard
                </h1>
              </div>
                <NotificationsDialog />
            </div>
          </div>
        </header>

        {/* ================= MAIN ================= */}
        <main className="min-w-0 space-y-8 p-4 md:p-8">
          {/* Welcome */}
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold sm:text-3xl">Welcome back 👋</h2>
              <p className="text-sm text-muted-foreground">
                Here’s an overview of your parcel activity
              </p>
            </div>

            <Button onClick={() => setIsTrackOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Track Parcel
            </Button>
          </div>

          {/* Stats */}
          <StatsCards stats={stats} />

          {/* ================= GRID ================= */}
          <div className="grid min-w-0 gap-6 lg:grid-cols-3">
            {/* LEFT */}
            <div className="min-w-0 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Parcels</CardTitle>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      className="min-w-0"
                      placeholder="Search by tracking ID..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                    />

                    {/* FILTER DROPDOWN */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between sm:w-auto">
                          <Filter className="mr-2 h-4 w-4" />
                          Filter: {getFilterLabel()}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setStatusFilter(PARCEL_STATUS.ALL)}>
                          {PARCEL_STATUS_LABEL[PARCEL_STATUS.ALL]}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter(PARCEL_STATUS.READY)}>
                          {PARCEL_STATUS_LABEL[PARCEL_STATUS.READY]}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter(PARCEL_STATUS.COMPLETED)}>
                          {PARCEL_STATUS_LABEL[PARCEL_STATUS.COMPLETED]}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {filteredParcels.map((parcel) => (
                    <Card key={parcel.id} className="hover:shadow">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <span className="break-all font-semibold">
                            {parcel.tracking_id}
                          </span>
                          {getStatusBadge(parcel.status)}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          From: {parcel.sender}
                        </p>

                        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                          <span>
                            Weight: {parcel.weight || "-"}
                          </span>
                          <Badge variant="outline">
                            {parcel.priority}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          {parcel.created_at
                            ? new Date(parcel.created_at).toLocaleDateString()
                            : "-"}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT */}
            <div className="min-w-0 space-y-6 lg:sticky lg:top-20">
              <QueueStatus />
              <RecentActivity />
              <PeakTime />
            </div>
          </div>
        </main>

        {/* ================= TRACK PARCEL DIALOG ================= */}
        <Dialog
          open={isTrackOpen}
          onOpenChange={(open) => {
            setIsTrackOpen(open)
            if (!open) {
              setTrackError("")
              setTrackedParcel(null)
            }
          }}
        >
          <DialogContent className="w-[95vw] max-w-2xl max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Track Parcel</DialogTitle>
              <DialogDescription>
                Select one of your registered tracking IDs or enter a tracking ID manually.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Registered Tracking IDs</div>
                <Select
                  value={trackingIds.includes(trackId) ? trackId : undefined}
                  onValueChange={(value) => {
                    if (value === "__empty") return
                    setTrackId(value)
                    setTrackError("")
                  }}
                  disabled={trackingIdsLoading || trackingIds.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        trackingIdsLoading
                          ? "Loading tracking IDs..."
                          : trackingIds.length === 0
                            ? "No registered tracking ID found"
                            : "Select tracking ID"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {trackingIds.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        No registered tracking ID found
                      </SelectItem>
                    ) : (
                      trackingIds.map((id) => (
                        <SelectItem key={id} value={id}>
                          {id}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {trackingIdsError && (
                  <p className="text-sm text-red-500">{trackingIdsError}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Manual Tracking ID</div>
                <Input
                  placeholder="Enter tracking ID"
                  value={trackId}
                  onChange={(e) => {
                    setTrackId(e.target.value)
                    setTrackError("")
                  }}
                />
              </div>
            </div>

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
                <CardHeader>
                  <CardTitle>Parcel Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-muted-foreground">Tracking ID</div>
                      <div className="font-semibold">
                        {trackedParcel.tracking_id}
                      </div>
                    </div>
                    {getStatusBadge(trackedParcel.status)}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-muted-foreground">Sender</div>
                      <div className="font-medium">
                        {trackedParcel.sender || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Receiver</div>
                      <div className="font-medium">
                        {trackedParcel.receiver || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Pickup / Delivery Status
                      </div>
                      <div className="font-medium capitalize">
                        {trackedParcel.status.replace("-", " ")}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Priority</div>
                      <div className="font-medium">
                        {trackedParcel.priority || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Weight</div>
                      <div className="font-medium">
                        {trackedParcel.weight || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Dimensions</div>
                      <div className="font-medium">
                        {trackedParcel.dimensions || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Registered Date</div>
                      <div className="font-medium">
                        {formatDateTime(trackedParcel.created_at)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Updated</div>
                      <div className="font-medium">
                        {formatDateTime(trackedParcel.updated_at)}
                      </div>
                    </div>
                  </div>
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
