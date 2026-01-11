import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Timer, Clock, CheckCircle, User, Calendar, Bell } from "lucide-react"
import { AVERAGE_HANDLING_TIME } from "../config"
import { Pickup } from "../types"

interface QueueStatsProps {
  pickups: Pickup[]
  stats: {
    total: number
    checkedIn: number
  }
}

export function QueueStats({ pickups, stats }: QueueStatsProps) {
  const checkedInQueue = pickups
    .filter(p => p.status === "checked_in")
    .sort((a, b) => a.queue_number - b.queue_number)

  const queueProgress = stats.total > 0 
    ? (stats.checkedIn / stats.total) * 100 
    : 0

  return (
    <>
      {/* CURRENT QUEUE STATUS */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Currently serving</span>
              <span className="font-semibold">
                {checkedInQueue.length > 0 
                  ? `Q-${checkedInQueue[0].queue_number.toString().padStart(2, "0")}` 
                  : 'None'}
              </span>
            </div>
            <Progress value={queueProgress} className="h-2" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Queue length</span>
              <span className="font-semibold">{checkedInQueue.length} waiting</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Est. wait time</span>
              <span className="font-semibold">
                {checkedInQueue.length > 0 
                  ? `${(checkedInQueue.length * AVERAGE_HANDLING_TIME)} minutes`
                  : 'No wait'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Next available</span>
              <span className="font-semibold">
                {pickups.filter(p => p.status === 'booked').length > 0 
                  ? new Date(new Date().getTime() + (checkedInQueue.length * AVERAGE_HANDLING_TIME * 60000))
                      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Now'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QUICK ACTIONS */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <User className="h-4 w-4 mr-2" />
            Add Walk-in Pickup
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Pickup
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Bell className="h-4 w-4 mr-2" />
            Send Notifications
          </Button>
        </CardContent>
      </Card>

      {/* TIPS */}
      <Card className="border shadow-sm bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Efficiency Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>Process check-ins promptly to keep queue moving</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>Keep customers informed about wait times</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>Update status immediately after collection</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  )
}