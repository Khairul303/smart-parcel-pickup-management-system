import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, QrCode, UserCheck } from "lucide-react";

interface StatusPanelProps {
  statusConfig: Record<string, { label: string }>;
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

export function StatusPanel({
  statusConfig,
  activeStatus,
  onStatusChange,
}: StatusPanelProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">System Status</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Authentication
              </span>
            </div>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              <UserCheck className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <QrCode className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Filtered Status
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.keys(statusConfig).map((status) => (
              <Badge
                key={status}
                variant={activeStatus === status ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onStatusChange(status)}
              >
                {statusConfig[status].label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
