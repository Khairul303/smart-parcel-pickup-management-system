"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const recentParcels = [
  { id: "PKL001", customer: "John Smith", status: "In Transit", location: "Warehouse A", time: "2 hours ago" },
  { id: "PKL002", customer: "Sarah Johnson", status: "Delivered", location: "123 Main St", time: "4 hours ago" },
  { id: "PKL003", customer: "Mike Davis", status: "Pending", location: "Sorting Center", time: "6 hours ago" },
  { id: "PKL004", customer: "Emma Wilson", status: "In Transit", location: "Distribution Hub", time: "8 hours ago" },
  { id: "PKL005", customer: "Robert Brown", status: "Processing", location: "Warehouse B", time: "10 hours ago" },
];

export function RecentParcelsSection() {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Parcels</CardTitle>
            <CardDescription>Latest parcel activities and status</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentParcels.map((parcel) => (
            <div key={parcel.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{parcel.id}</span>
                  <Badge 
                    variant={
                      parcel.status === "Delivered" ? "default" :
                      parcel.status === "In Transit" ? "secondary" :
                      "outline"
                    }
                  >
                    {parcel.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{parcel.customer}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{parcel.location}</p>
                <p className="text-xs text-muted-foreground">{parcel.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}