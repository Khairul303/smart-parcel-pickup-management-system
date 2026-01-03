"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Truck, AlertCircle, ArrowUpRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const todayActivities = [
  { 
    id: "ACT001",
    type: "Parcel Registered",
    description: "New parcel registered by John Smith",
    parcelId: "PKL-2024-001",
    time: "09:30 AM",
    status: "completed",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50"
  },
  { 
    id: "ACT002",
    type: "Status Update",
    description: "Parcel PKL-2024-005 departed warehouse",
    parcelId: "PKL-2024-005",
    time: "10:15 AM",
    status: "in-progress",
    icon: Truck,
    color: "text-blue-600 bg-blue-50"
  },
  { 
    id: "ACT003",
    type: "Delivery Attempt",
    description: "Failed delivery attempt at 123 Main St",
    parcelId: "PKL-2024-008",
    time: "11:45 AM",
    status: "warning",
    icon: AlertCircle,
    color: "text-amber-600 bg-amber-50"
  },
  { 
    id: "ACT004",
    type: "Parcel Delivered",
    description: "Successfully delivered to Sarah Johnson",
    parcelId: "PKL-2024-003",
    time: "02:20 PM",
    status: "completed",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50"
  },
  { 
    id: "ACT005",
    type: "New Customer",
    description: "Mike Davis registered new account",
    parcelId: "N/A",
    time: "03:10 PM",
    status: "info",
    icon: ArrowUpRight,
    color: "text-purple-600 bg-purple-50"
  },
];

export function TodayActivitySection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Today Activity
            </CardTitle>
            <CardDescription>Real-time updates and parcel activities</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Clock className="mr-2 h-4 w-4" />
              Live Updates
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todayActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className={`rounded-full p-2 ${activity.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{activity.type}</h4>
                    <Badge 
                      variant={
                        activity.status === "completed" ? "default" :
                        activity.status === "in-progress" ? "secondary" :
                        activity.status === "warning" ? "destructive" :
                        "outline"
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <span className="text-xs font-medium">Parcel: {activity.parcelId}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">Warning</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View All Activities
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}