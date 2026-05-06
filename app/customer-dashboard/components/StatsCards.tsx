import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Package } from "lucide-react"
import { PARCEL_STATUS_LABEL, PARCEL_STATUS } from "@/lib/parcel-status"

interface StatsCardsProps {
  stats: {
    totalParcels: number
    readyForPickup: number
    completed: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: PARCEL_STATUS_LABEL[PARCEL_STATUS.ALL],
      value: stats.totalParcels,
      icon: Package,
      iconClassName: "text-gray-500",
      iconBgClassName: "bg-gray-100",
      valueClassName: "text-gray-900",
    },
    {
      label: PARCEL_STATUS_LABEL[PARCEL_STATUS.READY],
      value: stats.readyForPickup,
      icon: CheckCircle,
      iconClassName: "text-green-600",
      iconBgClassName: "bg-green-100",
      valueClassName: "text-green-600",
    },
    {
      label: PARCEL_STATUS_LABEL[PARCEL_STATUS.COMPLETED],
      value: stats.completed,
      icon: Clock,
      iconClassName: "text-blue-600",
      iconBgClassName: "bg-blue-100",
      valueClassName: "text-blue-600",
    },
  ]

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <Card key={card.label} className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className={`text-2xl ${card.valueClassName}`}>
                    {card.value}
                  </CardTitle>
                </div>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBgClassName}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent />
          </Card>
        )
      })}
    </div>
  )
}
