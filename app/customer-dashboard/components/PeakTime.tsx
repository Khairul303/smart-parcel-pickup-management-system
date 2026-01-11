import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const timeSlots = [
  { time: "Morning (8AM-11AM)", status: "Busy", variant: "destructive" as const },
  { time: "Afternoon (2PM-4PM)", status: "Moderate", variant: "default" as const },
  { time: "Evening (5PM-7PM)", status: "Quiet", variant: "outline" as const }
]

export function PeakTime() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Peak time</CardTitle>
        <CardDescription>Best time to visit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {timeSlots.map((slot, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="text-sm">{slot.time}</div>
              <Badge variant={slot.variant}>{slot.status}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}