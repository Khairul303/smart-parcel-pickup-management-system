"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { title: "Total Parcels", value: "1,247", change: "+12%", color: "bg-blue-500" },
  { title: "Not Collected", value: "89", change: "+8%", color: "bg-green-500" },
  { title: "Ready for Pickup", value: "156", change: "+5%", color: "bg-amber-500" },
  { title: "Collected", value: "23", change: "-2%", color: "bg-red-500" },
];

export function StatsSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription>{stat.title}</CardDescription>
            <CardTitle className="text-2xl">{stat.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from last week
              </span>
              <div className={`h-2 w-2 rounded-full ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}