"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Eye } from "lucide-react"
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

/* ======================
   SAFE QUEUE PARSER
====================== */
const getQueueIndex = (queue: string) => {
  const num = parseInt(queue.replace(/\D/g, ""), 10)
  return isNaN(num) ? 0 : num
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
     TAB FILTERING (SAFE)
  ====================== */
  const tabPickups = useMemo(() => {
    switch (activeTab) {
      case "active":
        return filteredPickups.filter(
          (p) =>
            ((p.status === "booked" || p.status === "upcoming") &&
              p.preparation_status === "prepared") ||
            p.status === "checked_in"
        )

      case "completed":
        return filteredPickups.filter(
          (p) => p.status === "collected" || p.status === "completed"
        )

      default:
        return filteredPickups
    }
  }, [activeTab, filteredPickups])

  /* ======================
     ESTIMATED WAIT (SAFE)
  ====================== */
  const getEstimatedWait = (pickup: Pickup) => {
    if (pickup.status !== "checked_in") return null

    const queue = pickups
      .filter((p) => p.status === "checked_in")
      .sort(
        (a, b) =>
          getQueueIndex(a.queue_number) -
          getQueueIndex(b.queue_number)
      )

    const position = queue.findIndex(
      (p) => p.id === pickup.id
    )

    if (position === -1) return null
    return position * AVERAGE_HANDLING_TIME
  }

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

      <CardContent className="min-w-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4 grid w-full grid-cols-3">
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
              const estimatedWait = getEstimatedWait(pickup)
              const status = statusConfig[pickup.status]
              const prep =
                preparationConfig[pickup.preparation_status]

              return (
                <div
                  key={pickup.id}
                  className="rounded-lg border bg-white p-3 transition hover:bg-gray-50 sm:p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    {/* LEFT */}
                    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:gap-4">
                      {/* QUEUE */}
                      <div className="flex flex-col items-center">
                        <div className="px-4 py-3 rounded-lg border bg-gray-100">
                          <span className="text-xl font-bold">
                            {pickup.queue_number}
                          </span>
                        </div>

                        {estimatedWait !== null && (
                          <div className="mt-1 text-xs text-amber-600 flex items-center">
                            <Timer className="h-3 w-3 mr-1" />
                            ~{estimatedWait} min
                          </div>
                        )}
                      </div>

                      {/* INFO */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="break-words font-semibold">
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

                          {/* DATE + SLOT */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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
                              onClick={() =>
                                setSelectedPickup(pickup)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-row flex-wrap justify-end gap-2 sm:flex-col">
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

                      {(pickup.status === "booked" || pickup.status === "upcoming") &&
                        pickup.preparation_status ===
                          "prepared" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              onCheckIn(pickup)
                            }
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Check In
                          </Button>
                        )}

                      {pickup.status === "checked_in" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            onCollected(pickup)
                          }
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
          isOpen
          onClose={() => setSelectedPickup(null)}
        />
      )}
    </Card>
  )
}
