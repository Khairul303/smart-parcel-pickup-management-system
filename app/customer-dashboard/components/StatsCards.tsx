import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Package } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalParcels: number
    readyForPickup: number
    completed: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
     <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {/* Left: Text */}
          <div>
            <CardDescription className="flex items-center gap-2">Total Parcels</CardDescription>
            <CardTitle className="text-2xl">
              {stats.totalParcels}
            </CardTitle>
          </div>

          {/* Right: Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <Package className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </CardHeader>

      <CardContent />
    </Card>


      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Ready for pickup
          </CardDescription>
          <CardTitle className="text-2xl text-green-600">{stats.readyForPickup}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Completed
          </CardDescription>
          <CardTitle className="text-2xl">{stats.completed}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}