"use client"

import { useState } from "react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CustomerSidebar } from "@/components/layout/CustomerSidebar"
import { PickupScheduling } from "./components/PickupScheduling"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"

export default function PickupSchedulingPage() {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)

  return (
    <SidebarProvider>
      <CustomerSidebar />

      <SidebarInset>
        {/* ================= HEADER (MATCH DASHBOARD) ================= */}
        <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
          <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />

              {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Calendar className="h-5 w-5 text-white" />
              </div> */}

              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  Pickup Scheduling
                </h1>
                <p className="text-sm text-muted-foreground">
                  Schedule, manage, and track your parcel pickups
                </p>
              </div>
            </div>

            {/* Right: CTA */}
            {/* <Button
              onClick={() => setIsBookingDialogOpen(true)}
              className="w-full md:w-auto shadow"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Pickup
            </Button> */}
          </div>
        </header>

        {/* ================= MAIN CONTENT ================= */}
        <main className="p-4 md:p-4">
          <PickupScheduling
            isBookingDialogOpen={isBookingDialogOpen}
            onBookingDialogChange={setIsBookingDialogOpen}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
