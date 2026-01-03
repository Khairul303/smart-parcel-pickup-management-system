"use client"

import { useState, useEffect } from "react"
import { LabelList } from "recharts";
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  Users,
  Package,
  Truck,
  DollarSign,
  Clock,
  Target,
  Award,
  Activity,
  PieChart,
  LineChart,
  FileText,
  Eye,
  Printer,
  Share2,
  MoreVertical,
  Search,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";


/* =======================
   TYPES
======================= */
interface PerformanceMetric {
  name: string
  current: number
  previous: number
  change: number
  target: number
}

interface RevenueData {
  month: string
  revenue: number
  parcels: number
  customers: number
}

interface ServiceDistribution {
  name: string
  value: number
  color: string
}

/* =======================
   SAMPLE DATA
======================= */
const performanceMetrics: PerformanceMetric[] = [
  { name: "Delivery Success Rate", current: 94.5, previous: 92.3, change: 2.2, target: 95 },
  { name: "Customer Satisfaction", current: 4.7, previous: 4.6, change: 0.1, target: 4.8 },
  { name: "On-time Delivery", current: 88.2, previous: 85.7, change: 2.5, target: 90 },
  { name: "Average Delivery Time", current: 2.4, previous: 2.8, change: -0.4, target: 2.2 },
  { name: "Parcel Volume", current: 1247, previous: 1123, change: 12.4, target: 1300 },
  { name: "Revenue Growth", current: 15.8, previous: 12.3, change: 3.5, target: 18 },
]

const revenueData: RevenueData[] = [
  { month: 'Jan', revenue: 45000, parcels: 980, customers: 245 },
  { month: 'Feb', revenue: 52000, parcels: 1120, customers: 280 },
  { month: 'Mar', revenue: 48000, parcels: 1050, customers: 262 },
  { month: 'Apr', revenue: 61000, parcels: 1340, customers: 335 },
  { month: 'May', revenue: 57000, parcels: 1250, customers: 312 },
  { month: 'Jun', revenue: 69000, parcels: 1520, customers: 380 },
  { month: 'Jul', revenue: 72000, parcels: 1580, customers: 395 },
  { month: 'Aug', revenue: 65000, parcels: 1430, customers: 357 },
  { month: 'Sep', revenue: 74000, parcels: 1630, customers: 407 },
  { month: 'Oct', revenue: 78000, parcels: 1720, customers: 430 },
  { month: 'Nov', revenue: 82000, parcels: 1800, customers: 450 },
  { month: 'Dec', revenue: 89000, parcels: 1950, customers: 487 },
]

const serviceDistribution: ServiceDistribution[] = [
  { name: 'Express Delivery', value: 35, color: '#3b82f6' },
  { name: 'Standard Delivery', value: 45, color: '#10b981' },
  { name: 'International', value: 12, color: '#8b5cf6' },
  { name: 'Same-day', value: 8, color: '#ef4444' },
]

const topCustomers = [
  { id: 1, name: 'ABC Corporation', orders: 124, revenue: '$89,500', status: 'VIP' },
  { id: 2, name: 'XYZ Enterprises', orders: 89, revenue: '$67,200', status: 'VIP' },
  { id: 3, name: 'Global Logistics', orders: 76, revenue: '$54,800', status: 'Premium' },
  { id: 4, name: 'Tech Solutions', orders: 65, revenue: '$42,300', status: 'Premium' },
  { id: 5, name: 'E-commerce Store', orders: 53, revenue: '$38,700', status: 'Regular' },
]

/* =======================
   COMPONENT
======================= */
export default function ReportAnalyticsPage() {
  const [dateRange, setDateRange] = useState('month')
  const [loading, setLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState('performance')

  const handleExportReport = (format: string) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert(`Report exported as ${format.toUpperCase()}`)
    }, 1000)
  }

  const handleGenerateReport = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Report generated successfully')
    }, 1500)
  }

  const calculateMetrics = () => {
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
    const totalParcels = revenueData.reduce((sum, item) => sum + item.parcels, 0)
    const avgRevenuePerParcel = totalRevenue / totalParcels
    const revenueGrowth = ((revenueData[revenueData.length-1].revenue - revenueData[0].revenue) / revenueData[0].revenue) * 100

    return {
      totalRevenue: `$${(totalRevenue / 1000).toFixed(0)}K`,
      totalParcels: totalParcels.toLocaleString(),
      avgRevenuePerParcel: `$${avgRevenuePerParcel.toFixed(2)}`,
      revenueGrowth: `${revenueGrowth.toFixed(1)}%`
    }
  }

  const metrics = calculateMetrics()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-2" />
            <Separator orientation="vertical" className="mr-2 h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Report & Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Report & Analytics</h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive insights and performance analytics for your parcel business
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                    <SelectItem value="quarter">Last quarter</SelectItem>
                    <SelectItem value="year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleGenerateReport} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Generate Report
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExportReport('pdf')}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportReport('excel')}>
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportReport('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Queue Entry
                </CardDescription>
                <CardTitle className="text-2xl">{metrics.totalRevenue}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Growth: {metrics.revenueGrowth}</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Peak Time 
                </CardDescription>
                <CardTitle className="text-2xl">{metrics.totalParcels}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg per month: 1,630</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Best Time
                </CardDescription>
                <CardTitle className="text-2xl">4,287</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">+12% from last month</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Total Parcel
                </CardDescription>
                <CardTitle className="text-2xl">2.4 days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">-0.4 days improved</span>
                  <TrendingDown className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Queue
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Total Parcels
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Revenue Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue and parcel volume</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Revenue ($)" />
                      <Area yAxisId="right" type="monotone" dataKey="parcels" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Parcels" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Service Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Distribution</CardTitle>
                    <CardDescription>Breakdown by service type</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
  <Pie
    data={serviceDistribution as { name: string; value: number }[]}
    cx="50%"
    cy="50%"
    outerRadius={80}
    dataKey="value"
    nameKey="name"
  >
    <LabelList dataKey="name" position="outside" />
    {serviceDistribution.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.color} />
    ))}
  </Pie>
  <Tooltip />
</RechartsPieChart>
                </ResponsiveContainer>


                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Performance Indicators</CardTitle>
                    <CardDescription>Current vs Target</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {performanceMetrics.slice(0, 3).map((metric) => (
                      <div key={metric.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{metric.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{metric.current}{metric.name.includes('Rate') || metric.name.includes('Growth') ? '%' : ''}</span>
                            <Badge variant={metric.change >= 0 ? "default" : "destructive"}>
                              {metric.change >= 0 ? '+' : ''}{metric.change}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={(metric.current / metric.target) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Target: {metric.target}{metric.name.includes('Rate') || metric.name.includes('Growth') ? '%' : ''}</span>
                          <span>{((metric.current / metric.target) * 100).toFixed(1)}% achieved</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Detailed performance analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Current</TableHead>
                        <TableHead>Previous</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {performanceMetrics.map((metric) => (
                        <TableRow key={metric.name}>
                          <TableCell className="font-medium">{metric.name}</TableCell>
                          <TableCell>
                            <div className="font-bold">
                              {metric.current}
                              {(metric.name.includes('Rate') || metric.name.includes('Growth')) ? '%' : ''}
                            </div>
                          </TableCell>
                          <TableCell>
                            {metric.previous}
                            {(metric.name.includes('Rate') || metric.name.includes('Growth')) ? '%' : ''}
                          </TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1 ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {metric.change >= 0 ? '+' : ''}{metric.change}%
                            </div>
                          </TableCell>
                          <TableCell>
                            {metric.target}
                            {(metric.name.includes('Rate') || metric.name.includes('Growth')) ? '%' : ''}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={(metric.current / metric.target) * 100} className="h-2 w-24" />
                              <span className="text-sm">{((metric.current / metric.target) * 100).toFixed(1)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>Based on order volume and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.orders}</TableCell>
                          <TableCell>{customer.revenue}</TableCell>
                          <TableCell>
                            <Badge variant={
                              customer.status === 'VIP' ? 'default' : 
                              customer.status === 'Premium' ? 'secondary' : 'outline'
                            }>
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Monthly Performance Report - December 2024', date: '2024-12-01', type: 'PDF', size: '2.4 MB' },
                  { name: 'Customer Analysis Q4 2024', date: '2024-11-15', type: 'Excel', size: '3.1 MB' },
                  { name: 'Revenue Trend Analysis', date: '2024-11-01', type: 'PDF', size: '1.8 MB' },
                  { name: 'Service Efficiency Report', date: '2024-10-20', type: 'CSV', size: '1.2 MB' },
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.date} • {report.type} • {report.size}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}