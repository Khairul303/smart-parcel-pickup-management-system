"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Scan,
  Camera,
  Edit,
  UserPlus,
  RefreshCw,
  CheckCircle,
  X,
} from "lucide-react";

interface StatusPanelProps {
  onScanQR: () => void;
  onManualEntry: () => void;
  qrScanMode: boolean;
  scanResult: string;
  onClearScan: () => void;
}

export function StatusPanel({
  onScanQR,
  onManualEntry,
  qrScanMode,
  scanResult,
  onClearScan,
}: StatusPanelProps) {
  return (
<Card className="border-gray-200 shadow-sm h-full">
  <CardHeader>
    <CardTitle className="text-lg">Quick Actions</CardTitle>
  </CardHeader>

  <CardContent className="p-6 h-full flex flex-col justify-between space-y-6">
    {/* QR Scan */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <Scan className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">QR Code Scan</h3>
          <p className="text-sm text-gray-600">
            Scan parcel QR for quick entry
          </p>
        </div>
      </div>

      <Button className="bg-blue-600 hover:bg-blue-700">
        <Camera className="h-4 w-4 mr-1" />
        Scan
      </Button>
    </div>

    {/* Manual Entry */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <Edit className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Manual Entry</h3>
          <p className="text-sm text-gray-600">
            Enter parcel details manually
          </p>
        </div>
      </div>

      <Button variant="outline">
        <UserPlus className="h-4 w-4 mr-1" />
        Enter
      </Button>
    </div>
  </CardContent>
</Card>

  );
}
