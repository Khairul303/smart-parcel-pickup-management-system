"use client"

import { CheckCircle, Clock, Package } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PARCEL_STATUS, PARCEL_STATUS_LABEL } from "@/lib/parcel-status"
import type { AdminParcel } from "@/lib/admin-realtime"

export function StatsSection({
  parcels,
  loading,
}: {
  parcels: AdminParcel[]
  loading?: boolean
}) {

  const stats = [
    {
      label: PARCEL_STATUS_LABEL[PARCEL_STATUS.ALL],
      value: parcels.length,
      icon: Package,
      iconClassName: "text-gray-500",
      iconBgClassName: "bg-gray-100",
      valueClassName: "text-gray-900",
    },
    {
      label: PARCEL_STATUS_LABEL[PARCEL_STATUS.READY],
      value: parcels.filter((parcel) => parcel.status === PARCEL_STATUS.READY)
        .length,
      icon: CheckCircle,
      iconClassName: "text-green-600",
      iconBgClassName: "bg-green-100",
      valueClassName: "text-green-600",
    },
    {
      label: PARCEL_STATUS_LABEL[PARCEL_STATUS.COMPLETED],
      value: parcels.filter(
        (parcel) =>
          parcel.status === PARCEL_STATUS.COMPLETED ||
          parcel.status === "delivered" ||
          parcel.status === "collected"
      ).length,
      icon: Clock,
      iconClassName: "text-blue-600",
      iconBgClassName: "bg-blue-100",
      valueClassName: "text-blue-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <Card key={stat.label} className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className={`text-2xl ${stat.valueClassName}`}>
                    {loading ? "..." : stat.value}
                  </CardTitle>
                </div>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.iconBgClassName}`}
                >
                  <Icon className={`h-5 w-5 ${stat.iconClassName}`} />
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
