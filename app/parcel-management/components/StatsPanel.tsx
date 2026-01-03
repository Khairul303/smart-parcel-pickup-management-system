import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Edit, Camera } from "lucide-react";
import { Parcel } from "./types";

interface StatsPanelProps {
  parcels: Parcel[];
}

export function StatsPanel({ parcels }: StatsPanelProps) {
  const today = new Date().toDateString();

  const newParcels = parcels.length;
  const updated = parcels.filter(p => p.status !== "pending").length;
  const scanned = parcels.filter(p => p.qrCode).length;

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">
          Today&apos;s Activity
        </CardTitle>
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
              <p className="text-sm font-medium text-gray-700">Scanned</p>
              <p className="text-2xl font-bold text-gray-900">{scanned}</p>
            </div>
            <Camera className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
