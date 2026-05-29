"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Scan,
  Camera,
  Edit,
  UserPlus,
  RefreshCw,
  X,
  CheckCircle,
} from "lucide-react";

interface QuickActionsProps {
  onScanQR: () => void;
  onManualEntry: () => void;
  qrScanMode: boolean;
  scanResult: string;
  onClearScan: () => void;
}

export function QuickActions({
  onScanQR,
  onManualEntry,
  qrScanMode,
  scanResult,
  onClearScan,
}: QuickActionsProps) {
  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:max-w-4xl">
        {/* QR Scan Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-fit p-3 bg-blue-50 rounded-lg">
                <Scan className="h-6 w-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900">QR Code Scan</h3>
                <p className="text-sm text-gray-600">
                  Scan parcel QR for quick entry
                </p>
              </div>
              <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
                onClick={onScanQR}
                disabled={qrScanMode}
              >
                {qrScanMode ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Camera className="h-3 w-3 mr-1" />
                    Scan Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-fit p-3 bg-green-50 rounded-lg">
                <Edit className="h-6 w-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900">Manual Entry</h3>
                <p className="text-sm text-gray-600">
                  Enter parcel details manually
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-gray-300 sm:w-auto"
                onClick={onManualEntry}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Enter Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Scan Result */}
      {scanResult && (
        <Card className="border-gray-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    QR Scan Successful
                  </h3>
                  <p className="text-sm text-gray-600">
                    Parcel{" "}
                    <span className="font-medium">{scanResult}</span> loaded
                    successfully
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClearScan}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
