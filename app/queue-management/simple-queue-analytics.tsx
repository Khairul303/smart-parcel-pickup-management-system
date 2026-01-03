// components/simple-queue-analytics.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SimpleQueueAnalytics() {
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Queue Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Total Served */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Total Served</div>
              <div className="text-sm mt-1">12 min</div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Today</h3>
              <div className="text-center">
                <div className="text-2xl font-bold">14:00</div>
                <div className="text-sm text-muted-foreground">Peak Hour</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Week</h3>
              <div className="text-center">
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-muted-foreground">Efficiency</div>
              </div>
            </div>
          </div>

          {/* Middle Column - Customer Flow */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Customer Flow</h3>
            <div className="space-y-2">
              {timeSlots.map((time) => (
                <div key={time} className="flex items-center justify-between py-1 border-b">
                  <span className="text-sm">{time}</span>
                  <div className="h-2 bg-primary rounded-full w-20"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Average Wait Time */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Average Wait Time</h3>
            <div className="space-y-2">
              {timeSlots.map((time) => (
                <div key={time} className="flex items-center justify-between py-1 border-b">
                  <span className="text-sm">{time}</span>
                  <div className="h-2 bg-amber-500 rounded-full w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}