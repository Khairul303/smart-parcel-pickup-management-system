"use client"

import { useState } from "react"
import { LabelList } from "recharts"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Bell,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  Package,
  Clock,
  Target,
  Activity,
  FileText,
  Eye,
  Share2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"

/* =======================
   SMART PICKUP DATA
======================= */
const pickupTrendData = [
  { month: "Jan", bookings: 820, collected: 780 },
  { month: "Feb", bookings: 900, collected: 860 },
  { month: "Mar", bookings: 880, collected: 845 },
  { month: "Apr", bookings: 1020, collected: 980 },
  { month: "May", bookings: 1100, collected: 1045 },
  { month: "Jun", bookings: 1240, collected: 1180 },
]

const pickupTypeDistribution = [
  { name: "Scheduled Pickup", value: 55, color: "#3b82f6" },
  { name: "Walk-in Pickup", value: 25, color: "#10b981" },
  { name: "Express Pickup", value: 12, color: "#f59e0b" },
  { name: "Bulk Pickup (SME)", value: 8, color: "#ef4444" },
]

const performanceMetrics = [
  { name: "Pickup Success Rate", current: 92, target: 95 },
  { name: "On-Time Pickup Rate", current: 88, target: 90 },
  { name: "Queue Efficiency", current: 85, target: 90 },
]

/* =======================
   COMPONENT
======================= */
export default function ReportAnalyticsPage() {
  const [dateRange, setDateRange] = useState("month")
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert("Pickup performance report generated")
    }, 1000)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* HEADER */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin-dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Report & Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </header>

        {/* CONTENT */}
        <main className="p-6 space-y-6">
          {/* PAGE TITLE */}
          <div>
            <h1 className="text-3xl font-bold">Report & Analytics</h1>
            <p className="text-muted-foreground">
              Smart analytics for parcel pickup efficiency and queue performance
            </p>
          </div>

          {/* FILTER */}
          <div className="flex items-center gap-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleGenerateReport} disabled={loading}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Generate Report
            </Button>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid gap-4 md:grid-cols-4">
            <SummaryCard title="Total Pickup Requests" value="4,287" icon={<Package />} />
            <SummaryCard title="Peak Pickup Hour" value="5:00–7:00 PM" icon={<Clock />} />
            <SummaryCard title="Average Wait Time" value="6.2 min" icon={<Users />} />
            <SummaryCard title="No-Show Rate" value="8%" icon={<TrendingDown />} />
          </div>

          {/* TABS */}
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <Activity className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="queue">
                <Users className="mr-2 h-4 w-4" />
                Queue
              </TabsTrigger>
              <TabsTrigger value="performance">
                <Target className="mr-2 h-4 w-4" />
                Performance
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pickup Volume Trend</CardTitle>
                  <CardDescription>
                    Booking vs actual parcel collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pickupTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="bookings"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="Pickup Bookings"
                      />
                      <Area
                        type="monotone"
                        dataKey="collected"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                        name="Parcels Collected"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {/* PICKUP TYPE */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pickup Type Distribution</CardTitle>
                    <CardDescription>
                      Customer pickup behavior analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pickupTypeDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          <LabelList dataKey="name" position="outside" />
                          {pickupTypeDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* KPI */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pickup Performance KPIs</CardTitle>
                    <CardDescription>
                      Current performance vs target
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {performanceMetrics.map(metric => (
                      <div key={metric.name}>
                        <div className="flex justify-between text-sm font-medium">
                          <span>{metric.name}</span>
                          <span>{metric.current}%</span>
                        </div>
                        <Progress
                          value={(metric.current / metric.target) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          Target: {metric.target}%
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* PERFORMANCE */}
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Pickup Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>On-Time Pickup</TableCell>
                        <TableCell>88%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Late Pickup</TableCell>
                        <TableCell>10%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>No-Show</TableCell>
                        <TableCell>2%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* RECENT REPORTS */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Previously generated pickup reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Monthly Pickup Performance Report",
                "Queue Waiting Time Analysis",
                "No-Show & Delay Report",
              ].map((name, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <span>{name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

/* =======================
   SUMMARY CARD
======================= */
function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="p-3 bg-muted rounded-lg">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
