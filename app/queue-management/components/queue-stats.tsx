import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Timer,
  Clock,
  CheckCircle,
} from "lucide-react"
import { AVERAGE_HANDLING_TIME } from "../types"
import { Pickup } from "../types"

interface QueueStatsProps {
  pickups: Pickup[]
  stats: {
    total: number
    checkedIn: number
    prepared: number
  }
}

export function QueueStats({ pickups, stats }: QueueStatsProps) {
  const checkedInQueue = pickups
    .filter((p) => p.status === "checked_in")
    .sort((a, b) =>
      a.queue_number.localeCompare(b.queue_number)
    )

  const queueProgress =
    stats.total > 0
      ? (stats.checkedIn / stats.total) * 100
      : 0

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Queue Status
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">
                Currently serving
              </span>
              <span className="font-semibold">
                {checkedInQueue.length > 0
                  ? checkedInQueue[0].queue_number
                  : "None"}
              </span>
            </div>
            <Progress value={queueProgress} className="h-2" />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                In queue
              </span>
              <span className="font-semibold">
                {checkedInQueue.length}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Estimated wait
              </span>
              <span className="font-semibold">
                {checkedInQueue.length > 0
                  ? `${checkedInQueue.length *
                      AVERAGE_HANDLING_TIME} min`
                  : "No wait"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Prepared
              </span>
              <span className="font-semibold">
                {stats.prepared}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Efficiency Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
              Prepare parcels before customer arrival
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
              Call next queue immediately
            </li>
            <li className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
              Update status after collection
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
