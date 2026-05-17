import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  isWithinMalaysiaDateRange,
  type TimeFilterMode,
} from "@/lib/malaysia-date-range";
import { Package, Edit, CheckCircle } from "lucide-react";
import { Parcel } from "./types";

interface StatsPanelProps {
  parcels: Parcel[];
  timeFilter: TimeFilterMode;
  selectedDate: string;
}

export function StatsPanel({ parcels, timeFilter, selectedDate }: StatsPanelProps) {
  const newParcels = parcels.filter((parcel) =>
    isWithinMalaysiaDateRange(
      parcel.created_at ?? parcel.dateCreated ?? parcel.registered_at,
      timeFilter,
      selectedDate
    )
  ).length;
  const updated = parcels.filter((parcel) =>
    isWithinMalaysiaDateRange(
      parcel.updated_at ?? parcel.lastUpdated,
      timeFilter,
      selectedDate
    )
  ).length;
  const ready = parcels.filter((p) => p.status === "ready").length;
  const completed = parcels.filter((p) =>
    ["delivered", "completed", "collected"].includes(p.status)
  ).length;

  return (
    <Card className="h-full border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">Today&apos;s Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">New Parcels</p>
              <p className="text-2xl font-bold text-gray-900">{newParcels}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Updated</p>
              <p className="text-2xl font-bold text-gray-900">{updated}</p>
            </div>
            <Edit className="h-8 w-8 text-green-600" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Ready to Pickup</p>
              <p className="text-2xl font-bold text-gray-900">{ready}</p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Collected / Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
