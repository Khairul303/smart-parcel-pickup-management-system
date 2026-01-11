"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PickupSchedule } from "./PickupScheduling"

interface PickupStatsProps {
  pickups: PickupSchedule[]
}

export function PickupStats({ pickups }: PickupStatsProps) {
  const totalPickups = pickups.length
  const completedPickups = pickups.filter(p => p.status === 'completed').length
  const upcomingPickups = pickups.filter(p => p.status === 'confirmed').length

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
            <span className="text-sm">Completed</span>
            <span className="font-semibold text-green-600">
              {completedPickups}
            </span>
          </div>
          <Progress 
            value={totalPickups > 0 ? (completedPickups / totalPickups) * 100 : 0} 
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
      </CardContent>
    </Card>
  )
}