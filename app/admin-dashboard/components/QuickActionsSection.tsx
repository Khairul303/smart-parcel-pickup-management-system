"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ListChecks, Users, BarChart3 } from "lucide-react";

export function QuickActionsSection() {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto flex-col gap-2 py-6">
            <Package className="h-8 w-8" />
            <span>Register Parcel</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-6">
            <ListChecks className="h-8 w-8" />
            <span>Manage Queue</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-6">
            <Users className="h-8 w-8" />
            <span>View Customers</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-6">
            <BarChart3 className="h-8 w-8" />
            <span>Generate Report</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}