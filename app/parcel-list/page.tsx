"use client"

import { useState, useEffect } from "react"
import { ParcelsList } from "./components/parcel-list"
import { Parcel } from "./types"

import {
  Bell,
  ChevronRight,
  User,
  Shield,
  Award,
  Package as PackageIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { CustomerSidebar } from "@/components/layout/CustomerSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

import supabase from "@/lib/supabase"

export default function ParcelListPage() {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [unreadNotifications] = useState(3)

  /* =====================
     FETCH PARCELS (SUPABASE)
  ===================== */
  useEffect(() => {
    const fetchParcels = async () => {
      setIsLoading(true)

      const { data, error } = await supabase
        .from("parcels")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching parcels:", error)
      } else {
        setParcels(data || [])
      }

      setIsLoading(false)
    }

    fetchParcels()
  }, [])

  /* =====================
     HANDLERS (UI ONLY)
  ===================== */
  const handleRequestRedelivery = (parcelId: string) => {
    alert("Redelivery request submitted. Staff will contact you.")
  }

  const handleExtendPickup = (parcelId: string) => {
    alert("Pickup extension requested.")
  }

  const handleViewDetails = (parcel: Parcel) => {
    alert(
      `Parcel Details:
Tracking ID: ${parcel.tracking_id}
Status: ${parcel.status}
Sender: ${parcel.sender}
Receiver: ${parcel.receiver}`
    )
  }

  /* =====================
     STATUS HELPERS
  ===================== */
  const isNotArrived = (status: string) =>
    status === "pending" || status === "in-transit"

  const isReadyToPickup = (status: string) =>
    status === "arrived" || status === "ready-for-pickup"

  const isCompleted = (status: string) =>
    status === "delivered"

  /* =====================
     STATS
  ===================== */
  const stats = {
    total: parcels.length,
    notArrived: parcels.filter((p) => isNotArrived(p.status)).length,
    readyToPickup: parcels.filter((p) => isReadyToPickup(p.status)).length,
    completed: parcels.filter((p) => isCompleted(p.status)).length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <CustomerSidebar />

      <SidebarInset className="flex-1 min-h-screen bg-gray-50">
        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
          <div className="px-4 md:px-8">
            <div className="flex h-16 items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">
                My Parcels
              </h1>

              <div className="flex items-center gap-4">
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
          </div>
        </header>

        {/* ================= MAIN ================= */}
        <main className="px-4 md:px-8 py-6 w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back 👋
            </h2>
            <p className="mt-2 text-gray-600">
              Track your parcels and manage pickups easily
            </p>
          </div>

          {/* ================= STATS ================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Parcel", value: stats.total },
              { label: "Not Arrived", value: stats.notArrived },
              { label: "Ready to Pickup", value: stats.readyToPickup },
              { label: "Completed", value: stats.completed },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white p-6 rounded-lg border shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      {item.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {item.value}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <PackageIcon className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ================= PARCEL LIST ================= */}
          <ParcelsList
            parcels={parcels}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={setSearchQuery}
            onStatusFilterChange={setStatusFilter}
            onViewDetails={handleViewDetails}
            onExtendPickup={handleExtendPickup}
            onRequestRedelivery={handleRequestRedelivery}
          />
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="border-t bg-white mt-12">
          <div className="px-4 md:px-8 py-6 text-center text-sm text-gray-500">
            © 2024 ParcelTrack Customer Dashboard. All rights reserved.
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
