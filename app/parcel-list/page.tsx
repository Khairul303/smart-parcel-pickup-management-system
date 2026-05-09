"use client"

import { useState, useEffect } from "react"
import { ParcelsList } from "./components/parcel-list"
import { Parcel } from "./types"

import { Package as PackageIcon } from "lucide-react"


import { CustomerSidebar } from "@/components/layout/CustomerSidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

import supabase from "@/lib/supabase"

export default function ParcelListPage() {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

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
  const handleRequestRedelivery = () => {
    alert("Redelivery request submitted. Staff will contact you.")
  }

  const handleExtendPickup = () => {
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
    status === "ready" || status === "ready-for-pickup"

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
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <h1 className="truncate text-xl font-semibold text-gray-900">
                  My Parcels
                </h1>
              </div>

              {/* <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </div> */}
            </div>
          </div>
        </header>

        {/* ================= MAIN ================= */}
        <main className="w-full min-w-0 px-4 py-6 md:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Welcome back 👋
            </h2>
            <p className="mt-2 text-gray-600">
              Record your parcels. 
            </p>
          </div>

          {/* ================= STATS ================= */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Parcel", value: stats.total },
              { label: "Not Arrived", value: stats.notArrived },
              { label: "Ready to Pickup", value: stats.readyToPickup },
              { label: "Completed", value: stats.completed },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border bg-white p-4 shadow-sm sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
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
