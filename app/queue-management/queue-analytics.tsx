// components/queue-analytics.tsx
"use client"

import { TrendingUp, Users, Clock, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function QueueAnalytics() {
  // Sample data for the charts
  const customerFlowData = [
    { time: "09:00", value: 45 },
    { time: "10:00", value: 78 },
    { time: "11:00", value: 92 },
    { time: "12:00", value: 65 },
    { time: "13:00", value: 88 },
    { time: "14:00", value: 125 },
    { time: "15:00", value: 96 },
    { time: "16:00", value: 72 },
  ]

  const waitTimeData = [
    { time: "09:00", value: 8 },
    { time: "10:00", value: 12 },
    { time: "11:00", value: 15 },
    { time: "12:00", value: 18 },
    { time: "13:00", value: 14 },
    { time: "14:00", value: 22 },
    { time: "15:00", value: 16 },
    { time: "16:00", value: 11 },
  ]

  const maxCustomerFlow = Math.max(...customerFlowData.map(d => d.value))
  const maxWaitTime = Math.max(...waitTimeData.map(d => d.value))

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Queue Analytics
        </CardTitle>
        <CardDescription>Real-time performance metrics and trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Served */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-4xl font-bold">156</div>
                  <div className="text-sm text-muted-foreground">Total Served</div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">12 min</span>
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  -2 min
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Today</span>
                <div className="font-medium">14:00</div>
              </div>
              <Progress value={80} className="h-2" />
              <div className="text-xs text-muted-foreground">Peak Hour</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Week</span>
                <div className="font-medium">94%</div>
              </div>
              <Progress value={94} className="h-2" />
              <div className="text-xs text-muted-foreground">Efficiency</div>
            </div>
          </div>

          {/* Customer Flow Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Customer Flow</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                Visitors
              </div>
            </div>
            
            <div className="relative h-48">
              <div className="absolute inset-0 flex items-end gap-1">
                {customerFlowData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-primary/30 to-primary rounded-t-sm"
                      style={{ 
                        height: `${(item.value / maxCustomerFlow) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                    <div className="text-xs text-muted-foreground mt-2">{item.time}</div>
                    <div className="text-xs font-medium mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-sm font-medium">45</div>
                <div className="text-xs text-muted-foreground">09:00</div>
              </div>
              <div>
                <div className="text-sm font-medium">125</div>
                <div className="text-xs text-muted-foreground">14:00</div>
              </div>
              <div>
                <div className="text-sm font-medium">96</div>
                <div className="text-xs text-muted-foreground">15:00</div>
              </div>
              <div>
                <div className="text-sm font-medium">72</div>
                <div className="text-xs text-muted-foreground">16:00</div>
              </div>
            </div>
          </div>

          {/* Average Wait Time Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Average Wait Time</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                Minutes
              </div>
            </div>
            
            <div className="relative h-48">
              <div className="absolute inset-0 flex items-end gap-1">
                {waitTimeData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-amber-500/30 to-amber-500 rounded-t-sm"
                      style={{ 
                        height: `${(item.value / maxWaitTime) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                    <div className="text-xs text-muted-foreground mt-2">{item.time}</div>
                    <div className="text-xs font-medium mt-1">{item.value} min</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-sm font-medium">8 min</div>
                <div className="text-xs text-muted-foreground">09:00</div>
              </div>
              <div>
                <div className="text-sm font-medium">22 min</div>
                <div className="text-xs text-muted-foreground">14:00</div>
              </div>
              <div>
                <div className="text-sm font-medium">16 min</div>
                <div className="text-xs text-muted-foreground">15:00</div>
              </div>
              <div>
                <div className="text-sm font-medium">11 min</div>
                <div className="text-xs text-muted-foreground">16:00</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium">Service Level</div>
            </div>
            <div className="text-2xl font-bold mt-2">92%</div>
            <div className="text-xs text-muted-foreground">Target: 90%</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-sm font-medium">Abandonment Rate</div>
            <div className="text-2xl font-bold mt-2">3.2%</div>
            <div className="text-xs text-muted-foreground">Below industry avg.</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-sm font-medium">Satisfaction</div>
            <div className="text-2xl font-bold mt-2">4.7</div>
            <div className="text-xs text-muted-foreground">Out of 5.0</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}