import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CheckCircle } from "lucide-react"

const activities = [
  {
    icon: Package,
    iconColor: "text-green-600",
    bgColor: "bg-green-100",
    title: "Parcel arrived",
    description: "TRK7890123456 at KL Central",
    time: "10:30 AM"
  },
  {
    icon: CheckCircle,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
    title: "Ready for pickup",
    description: "TRK7890123457 at Mid Valley",
    time: "9:15 AM"
  },
  {
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-100",
    title: "Delivered",
    description: "TRK7890123458 to your address",
    time: "Yesterday, 2:20 PM"
  }
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${activity.bgColor} mt-1`}>
                <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="font-medium">{activity.title}</div>
                <div className="text-sm text-gray-600">{activity.description}</div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}