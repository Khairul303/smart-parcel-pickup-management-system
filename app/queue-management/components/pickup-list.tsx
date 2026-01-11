import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Timer, UserCheck, PackageCheck, User } from "lucide-react"
import { Pickup, statusConfig } from "../types"
import { AVERAGE_HANDLING_TIME } from "../config"


interface PickupListProps {
  pickups: Pickup[]
  filteredPickups: Pickup[]
  stats: {
    total: number
    checkedIn: number
    collected: number
    booked: number
  }
  onCheckIn: (pickup: Pickup) => Promise<void>
  onCollected: (pickup: Pickup) => Promise<void>
}

export function PickupList({
  pickups,
  filteredPickups,
  stats,
  onCheckIn,
  onCollected,
}: PickupListProps) {
  const [activeTab, setActiveTab] = useState("all")

  const getFilteredByTab = () => {
    switch (activeTab) {
      case "active":
        return filteredPickups.filter(p => p.status === "checked_in" || p.status === "booked")
      case "completed":
        return filteredPickups.filter(p => p.status === "collected")
      default:
        return filteredPickups
    }
  }

  const getEstimatedWait = (pickupId: string) => {
    const checkedInQueue = pickups
      .filter(p => p.status === "checked_in")
      .sort((a, b) => a.queue_number - b.queue_number)
    
    const position = checkedInQueue.findIndex(p => p.id === pickupId) + 1
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
              {filteredPickups.length} pickup{filteredPickups.length !== 1 ? 's' : ''} found
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-normal">
            Average handling: {AVERAGE_HANDLING_TIME} min
          </Badge>

        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All ({pickups.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.checkedIn + stats.booked})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.collected})</TabsTrigger>
          </TabsList>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {tabPickups.map(pickup => {
              const estimatedWait = getEstimatedWait(pickup.id)
              const status = statusConfig[pickup.status]

              return (
                <div
                  key={pickup.id}
                  className="group border rounded-lg p-4 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* QUEUE NUMBER */}
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-lg ${
                          pickup.status === 'checked_in' 
                            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                            : pickup.status === 'booked'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          <span className="text-lg font-bold">
                            Q-{pickup.queue_number.toString().padStart(2, "0")}
                          </span>
                        </div>
                        {pickup.status === 'checked_in' && estimatedWait !== null && (
                          <div className="mt-2 flex items-center text-xs text-amber-600">
                            <Timer className="h-3 w-3 mr-1" />
                            ~{estimatedWait} min
                          </div>
                        )}
                      </div>

                      {/* CUSTOMER INFO */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base">
                              {pickup.customer_name}
                            </h3>
                            <Badge 
                              variant={status.variant} 
                              className={`gap-1 ${status.colorClass}`}
                            >
                              {status.icon}
                              {status.label}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground hidden sm:block">
                            {new Date(pickup.pickup_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Package className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">ID:</span>
                              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                                {pickup.tracking_id}
                              </code>
                            </div>
                            {pickup.parcel_count && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">Parcels:</span>
                                <span className="font-medium">{pickup.parcel_count}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{pickup.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col gap-2 ml-4">
                      {pickup.status === "booked" && (
                        <Button 
                          size="sm" 
                          onClick={() => onCheckIn(pickup)}
                          className="whitespace-nowrap"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Check In
                        </Button>
                      )}

                      {pickup.status === "checked_in" && (
                        <Button 
                          size="sm" 
                          onClick={() => onCollected(pickup)}
                          variant="default"
                          className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-700"
                        >
                          <PackageCheck className="h-4 w-4 mr-2" />
                          Mark Collected
                        </Button>
                      )}

                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

            {tabPickups.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No pickups found</h3>
                <p className="text-muted-foreground mt-2">
                  {activeTab === "all" ? 'No pickups scheduled for today' : 'No pickups match this filter'}
                </p>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}