"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import { Eye } from "lucide-react"
import { RecordDetailsModal } from "./record-details-modal"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Timer,
  UserCheck,
  PackageCheck,
  ClipboardCheck,
  User,
} from "lucide-react"
import { Pickup, statusConfig, preparationConfig } from "../types"
import { AVERAGE_HANDLING_TIME } from "../types"

interface PickupListProps {
  pickups: Pickup[]
  filteredPickups: Pickup[]
  stats: {
    total: number
    prepared: number
    checkedIn: number
    collected: number
  }
  onPrepare: (pickup: Pickup) => Promise<void>
  onCheckIn: (pickup: Pickup) => Promise<void>
  onCollected: (pickup: Pickup) => Promise<void>
}

export function PickupList({
  pickups,
  filteredPickups,
  stats,
  onPrepare,
  onCheckIn,
  onCollected,
}: PickupListProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null)


  /* ======================
     TAB FILTERING
  ====================== */
  const getFilteredByTab = () => {
    switch (activeTab) {
      case "active":
        return filteredPickups.filter(
          (p) =>
            (p.status === "booked" &&
              p.preparation_status === "prepared") ||
            p.status === "checked_in"
        )
      case "completed":
        return filteredPickups.filter((p) => p.status === "collected")
      default:
        return filteredPickups
    }
  }

  /* ======================
     QUEUE → ESTIMATED WAIT
     (NUMERIC SAFE)
  ====================== */
  const getEstimatedWait = (pickupId: string) => {
    const checkedInQueue = pickups
      .filter((p) => p.status === "checked_in")
      .sort((a, b) => {
        const aNum = Number(a.queue_number.replace("Q-", ""))
        const bNum = Number(b.queue_number.replace("Q-", ""))
        return aNum - bNum
      })

    const position =
      checkedInQueue.findIndex((p) => p.id === pickupId) + 1

    if (position <= 0) return null
    return (position - 1) * AVERAGE_HANDLING_TIME
  }

  const tabPickups = getFilteredByTab()

  return (
    <Card className="border shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pickup Queue</CardTitle>
            <CardDescription>
              {filteredPickups.length} pickup
              {filteredPickups.length !== 1 ? "s" : ""} found
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-normal">
            Avg handling: {AVERAGE_HANDLING_TIME} min
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">
              All ({pickups.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({stats.prepared + stats.checkedIn})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({stats.collected})
            </TabsTrigger>
          </TabsList>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {tabPickups.map((pickup) => {
              const estimatedWait = getEstimatedWait(pickup.id)
              const status = statusConfig[pickup.status]
              const prep = preparationConfig[pickup.preparation_status]

              return (
                <div
                  key={pickup.id}
                  className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between gap-4">
                    {/* LEFT */}
                    <div className="flex gap-4 flex-1">
                      {/* QUEUE */}
                      <div className="flex flex-col items-center">
                        <div className="px-4 py-3 rounded-lg border bg-gray-100">
                          <span className="text-xl font-bold tracking-wide">
                            {pickup.queue_number}
                          </span>
                        </div>

                        {pickup.status === "checked_in" &&
                          estimatedWait !== null && (
                            <div className="mt-1 text-xs text-amber-600 flex items-center">
                              <Timer className="h-3 w-3 mr-1" />
                              ~{estimatedWait} min
                            </div>
                          )}
                      </div>

                      {/* INFO */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">
                            {pickup.customer_name}
                          </h3>

                          <Badge
                            variant={status.variant}
                            className={status.colorClass}
                          >
                            {status.icon}
                            {status.label}
                          </Badge>

                          <Badge
                            variant={prep.variant}
                            className={prep.colorClass}
                          >
                            {prep.icon}
                            {prep.label}
                          </Badge>
                        </div>

                        <div className="mt-2 space-y-1 text-sm">
                          {/* TRACKING IDS */}
                          <div className="flex flex-wrap gap-1 items-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {pickup.tracking_ids.length > 0 ? (
                              pickup.tracking_ids.map((id) => (
                                <Badge
                                  key={id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {id}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                No tracking IDs
                              </span>
                            )}
                          </div>

                          {/* PHONE */}
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {pickup.customer_phone || "—"}
                            </span>
                          </div>
                          {/* PICKUP DATE & TIME SLOT */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{pickup.pickup_date}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{pickup.time_slot}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedPickup(pickup)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col gap-2">
                      {pickup.preparation_status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onPrepare(pickup)}
                        >
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Prepare
                        </Button>
                      )}

                      {pickup.status === "booked" &&
                        pickup.preparation_status === "prepared" && (
                          <Button
                            size="sm"
                            onClick={() => onCheckIn(pickup)}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Check In
                          </Button>
                        )}

                      {pickup.status === "checked_in" && (
                        <Button
                          size="sm"
                          onClick={() => onCollected(pickup)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <PackageCheck className="h-4 w-4 mr-2" />
                          Collected
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {tabPickups.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                No pickups found
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
      {selectedPickup && (
      <RecordDetailsModal
        pickup={selectedPickup}
        isOpen={!!selectedPickup}
        onClose={() => setSelectedPickup(null)}
      />
    )}

    </Card>
  )
}
