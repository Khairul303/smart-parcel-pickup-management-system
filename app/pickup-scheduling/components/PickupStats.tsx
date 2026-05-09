"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PickupSchedule } from "./PickupScheduling"
import { isUpcomingPickupStatus, normalizePickupStatus } from "@/lib/pickup-status"

interface PickupStatsProps {
  pickups: PickupSchedule[]
}

export function PickupStats({ pickups }: PickupStatsProps) {
  const totalPickups = pickups.length
  const collectedPickups = pickups.filter(
    (p) => normalizePickupStatus(p.status) === "collected"
  ).length
  const upcomingPickups = pickups.filter(
    (p) => isUpcomingPickupStatus(p.status)
  ).length
  const cancelledPickups = pickups.filter(
    (p) => normalizePickupStatus(p.status) === "cancelled"
  ).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pickup Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Total Pickups</span>
            <span className="font-semibold">{totalPickups}</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Collected</span>
            <span className="font-semibold text-green-600">
              {collectedPickups}
            </span>
          </div>
          <Progress 
            value={totalPickups > 0 ? (collectedPickups / totalPickups) * 100 : 0} 
            className="h-2"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Upcoming</span>
            <span className="font-semibold text-blue-600">
              {upcomingPickups}
            </span>
          </div>
          <Progress 
            value={totalPickups > 0 ? (upcomingPickups / totalPickups) * 100 : 0} 
            className="h-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Cancelled</span>
            <span className="font-semibold text-red-600">
              {cancelledPickups}
            </span>
          </div>
          <Progress
            value={totalPickups > 0 ? (cancelledPickups / totalPickups) * 100 : 0}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}
