"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type React from "react"
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
  TrendingDown,
  Calendar,
  Users,
  Package,
  Clock,
  Target,
  Activity,
  FileText,
  Eye,
  Download,
  RefreshCw,
  CheckCircle as CheckCircleIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  getAdminDashboardMetrics,
  toTitle,
  useAdminRealtimeData,
} from "@/lib/admin-realtime"
import { getEstimatedMinutes, SLOT_QUOTA_UNITS } from "@/lib/pickup-scheduling"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const chartColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

const getPickupDisplayStatus = (status?: string | null) => {
  if (status === "booked" || status === "upcoming") return "Upcoming"
  if (status === "completed" || status === "collected") return "Collected"
  if (status === "cancelled") return "Cancelled"
  if (status === "checked_in") return "Checked In"
  if (status === "no_show") return "No Show"
  return toTitle(status ?? "unknown")
}

const isCollectedPickup = (status?: string | null) =>
  status === "completed" || status === "collected"

const isUpcomingPickup = (status?: string | null) =>
  status === "booked" || status === "upcoming"

const isCancelledPickup = (status?: string | null) =>
  status === "cancelled"

const isActivePickup = (status?: string | null) =>
  status !== "cancelled" && status !== "no_show"

const getPickupDateValue = (pickup: { pickup_date?: string | null; created_at?: string | null }) =>
  new Date(pickup.pickup_date ?? pickup.created_at ?? 0)

type RecentGeneratedReport = {
  name: string
  type: string
  generatedAt: string
  rangeLabel: string
  fileName: string
  objectUrl: string
}

export default function ReportAnalyticsPage() {
  const [dateRange, setDateRange] = useState("month")
  const [generating, setGenerating] = useState(false)
  const [recentReports, setRecentReports] = useState<RecentGeneratedReport[]>([])
  const [reportNow] = useState(() => Date.now())
  const reportObjectUrlsRef = useRef<Set<string>>(new Set())
  const adminData = useAdminRealtimeData({ notifications: false })
  const { parcels, pickups, loading, error } = adminData
  const metrics = getAdminDashboardMetrics(parcels, pickups)

  const filteredPickups = useMemo(() => {
    const days = dateRange === "week" ? 7 : dateRange === "year" ? 365 : 30
    const cutoff = reportNow - days * 24 * 60 * 60 * 1000

    return pickups.filter(
      (pickup) =>
        !pickup.created_at || new Date(pickup.created_at).getTime() >= cutoff
    )
  }, [dateRange, pickups, reportNow])

  const filteredParcels = useMemo(() => {
    const days = dateRange === "week" ? 7 : dateRange === "year" ? 365 : 30
    const cutoff = reportNow - days * 24 * 60 * 60 * 1000

    return parcels.filter(
      (parcel) =>
        !parcel.created_at || new Date(parcel.created_at).getTime() >= cutoff
    )
  }, [dateRange, parcels, reportNow])

  const filteredMetrics = useMemo(
    () => getAdminDashboardMetrics(filteredParcels, filteredPickups),
    [filteredParcels, filteredPickups]
  )

  const pendingParcels = filteredParcels.filter(
    (parcel) => parcel.status === "pending"
  ).length

  const pickupTrendData = useMemo(() => {
    const bucket = new Map<string, { month: string; bookings: number; collected: number }>()

    filteredPickups.forEach((pickup) => {
      const date = new Date(pickup.pickup_date ?? pickup.created_at ?? reportNow)
      const key =
        dateRange === "year"
          ? date.toLocaleString([], { month: "short" })
          : date.toLocaleDateString([], { month: "short", day: "numeric" })
      const current = bucket.get(key) ?? { month: key, bookings: 0, collected: 0 }

      current.bookings += 1
      if (pickup.status === "collected" || pickup.status === "completed") {
        current.collected += 1
      }

      bucket.set(key, current)
    })

    return Array.from(bucket.values()).slice(-12)
  }, [dateRange, filteredPickups, reportNow])

  const parcelStatusBreakdown = useMemo(() => {
    const counts = new Map<string, number>()

    filteredParcels.forEach((parcel) => {
      const status = toTitle(parcel.status ?? "unknown")
      counts.set(status, (counts.get(status) ?? 0) + 1)
    })

    return Array.from(counts.entries()).map(([name, value], index) => ({
      name,
      value,
      color: chartColors[index % chartColors.length],
    }))
  }, [filteredParcels])

  const parcelVolumeData = useMemo(() => {
    const bucket = new Map<string, { label: string; parcels: number }>()

    filteredParcels.forEach((parcel) => {
      const date = new Date(parcel.created_at ?? reportNow)
      const key =
        dateRange === "year"
          ? date.toLocaleString([], { month: "short" })
          : date.toLocaleDateString([], { month: "short", day: "numeric" })
      const current = bucket.get(key) ?? { label: key, parcels: 0 }
      current.parcels += 1
      bucket.set(key, current)
    })

    return Array.from(bucket.values()).slice(-12)
  }, [dateRange, filteredParcels, reportNow])

  const pickupTypeDistribution = useMemo(() => {
    const counts = new Map<string, number>()

    filteredPickups.forEach((pickup) => {
      const label = pickup.time_slot ? "Scheduled Pickup" : "Unscheduled Pickup"
      counts.set(label, (counts.get(label) ?? 0) + 1)
    })

    if (metrics.activePickups > 0) counts.set("Active Queue", metrics.activePickups)
    if (metrics.cancelledPickups > 0) counts.set("Cancelled", metrics.cancelledPickups)

    return Array.from(counts.entries()).map(([name, value], index) => ({
      name,
      value,
      color: chartColors[index % chartColors.length],
    }))
  }, [filteredPickups, metrics.activePickups, metrics.cancelledPickups])

  const queueStatusDistribution = useMemo(() => {
    const rows = [
      {
        name: "Upcoming",
        value: filteredPickups.filter((pickup) =>
          isUpcomingPickup(pickup.status)
        ).length,
        color: "#3b82f6",
      },
      {
        name: "Collected",
        value: filteredPickups.filter((pickup) =>
          isCollectedPickup(pickup.status)
        ).length,
        color: "#10b981",
      },
      {
        name: "Cancelled",
        value: filteredPickups.filter((pickup) =>
          isCancelledPickup(pickup.status)
        ).length,
        color: "#ef4444",
      },
      {
        name: "Pending",
        value: filteredPickups.filter(
          (pickup) => !pickup.status || pickup.status === "pending"
        ).length,
        color: "#f59e0b",
      },
    ]

    return rows.filter((row) => row.value > 0)
  }, [filteredPickups])

  const monthlyPerformance = useMemo(() => {
    const reportDate = new Date(reportNow)
    const month = reportDate.getMonth()
    const year = reportDate.getFullYear()
    const monthPickups = pickups.filter((pickup) => {
      const date = getPickupDateValue(pickup)
      return date.getMonth() === month && date.getFullYear() === year
    })
    const completed = monthPickups.filter((pickup) =>
      isCollectedPickup(pickup.status)
    ).length
    const cancelled = monthPickups.filter((pickup) =>
      isCancelledPickup(pickup.status)
    ).length
    const upcoming = monthPickups.filter((pickup) =>
      isUpcomingPickup(pickup.status)
    ).length
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return {
      label: reportDate.toLocaleString([], { month: "long", year: "numeric" }),
      total: monthPickups.length,
      completed,
      cancelled,
      upcoming,
      completionRate:
        monthPickups.length > 0
          ? Math.round((completed / monthPickups.length) * 100)
          : 0,
      cancellationRate:
        monthPickups.length > 0
          ? Math.round((cancelled / monthPickups.length) * 100)
          : 0,
      averagePerDay:
        monthPickups.length > 0
          ? Number((monthPickups.length / daysInMonth).toFixed(1))
          : 0,
    }
  }, [pickups, reportNow])

  const queueWaitingAnalysis = useMemo(() => {
    const grouped = new Map<string, typeof filteredPickups>()

    filteredPickups
      .filter((pickup) => isActivePickup(pickup.status))
      .forEach((pickup) => {
        const key = `${pickup.pickup_date ?? "No date"}|${pickup.time_slot ?? "No slot"}`
        grouped.set(key, [...(grouped.get(key) ?? []), pickup])
      })

    const waits: number[] = []

    grouped.forEach((items) => {
      const sorted = [...items].sort((a, b) => {
        const queueA = Number.parseInt(a.queue_number?.replace(/\D/g, "") ?? "", 10) || 0
        const queueB = Number.parseInt(b.queue_number?.replace(/\D/g, "") ?? "", 10) || 0
        const queueCompare = queueA - queueB
        if (queueCompare !== 0) return queueCompare
        return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
      })

      let cumulativeWait = 0
      sorted.forEach((pickup) => {
        waits.push(pickup.estimated_wait_minutes ?? cumulativeWait)
        cumulativeWait += pickup.estimated_minutes ?? getEstimatedMinutes(pickup.tracking_ids?.length ?? 1)
      })
    })

    const slotCounts = new Map<string, number>()
    filteredPickups
      .filter((pickup) => isActivePickup(pickup.status))
      .forEach((pickup) => {
        const slot = pickup.time_slot ?? "No slot"
        slotCounts.set(slot, (slotCounts.get(slot) ?? 0) + 1)
      })

    const peakSlot =
      Array.from(slotCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "No active queue"

    return {
      average:
        waits.length > 0
          ? Math.round(waits.reduce((total, wait) => total + wait, 0) / waits.length)
          : 0,
      highest: waits.length > 0 ? Math.max(...waits) : 0,
      lowest: waits.length > 0 ? Math.min(...waits) : 0,
      activeRecords: filteredPickups.filter((pickup) => isActivePickup(pickup.status)).length,
      peakSlot,
    }
  }, [filteredPickups])

  const slotUtilization = useMemo(() => {
    const rowsMap = new Map<
      string,
      {
        pickupDate: string
        timeSlot: string
        bookings: number
        usedQuota: number
      }
    >()
    const slotTotals = new Map<string, { bookings: number; usedQuota: number }>()

    filteredPickups
      .filter((pickup) => isActivePickup(pickup.status))
      .forEach((pickup) => {
        const pickupDate = pickup.pickup_date ?? "No date"
        const timeSlot = pickup.time_slot ?? "No slot"
        const key = `${pickupDate}|${timeSlot}`
        const parcelCount = pickup.tracking_ids?.length ?? 1
        const estimatedMinutes =
          pickup.estimated_minutes ?? getEstimatedMinutes(parcelCount)
        const current = rowsMap.get(key) ?? {
          pickupDate,
          timeSlot,
          bookings: 0,
          usedQuota: 0,
        }
        const slotCurrent = slotTotals.get(timeSlot) ?? {
          bookings: 0,
          usedQuota: 0,
        }

        current.bookings += 1
        current.usedQuota += estimatedMinutes
        slotCurrent.bookings += 1
        slotCurrent.usedQuota += estimatedMinutes

        rowsMap.set(key, current)
        slotTotals.set(timeSlot, slotCurrent)
      })

    const rows = Array.from(rowsMap.values())
      .map((row) => ({
        ...row,
        availableQuota: Math.max(SLOT_QUOTA_UNITS - row.usedQuota, 0),
        utilization: Math.round((row.usedQuota / SLOT_QUOTA_UNITS) * 100),
      }))
      .sort((a, b) => {
        const dateCompare = a.pickupDate.localeCompare(b.pickupDate)
        if (dateCompare !== 0) return dateCompare
        return a.timeSlot.localeCompare(b.timeSlot)
      })

    const totals = Array.from(slotTotals.entries()).map(([timeSlot, value]) => ({
      timeSlot,
      ...value,
    }))

    return {
      rows,
      mostUsed:
        totals.sort((a, b) => b.bookings - a.bookings)[0]?.timeSlot ??
        "No bookings",
      leastUsed:
        totals.sort((a, b) => a.bookings - b.bookings)[0]?.timeSlot ??
        "No bookings",
      totals,
    }
  }, [filteredPickups])

  const performanceMetrics = [
    { name: "Pickup Success Rate", current: metrics.successRate, target: 95 },
    { name: "On-Time Pickup Rate", current: metrics.onTimeRate, target: 90 },
    { name: "Queue Efficiency", current: metrics.queueEfficiency, target: 90 },
  ]

  const peakHour = useMemo(() => {
    const slotCounts = new Map<string, number>()

    pickups.forEach((pickup) => {
      if (!pickup.time_slot) return
      slotCounts.set(pickup.time_slot, (slotCounts.get(pickup.time_slot) ?? 0) + 1)
    })

    return (
      Array.from(slotCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "No bookings"
    )
  }, [pickups])

  const pieData =
    pickupTypeDistribution.length > 0
      ? pickupTypeDistribution
      : [{ name: "No data", value: 1, color: "#e5e7eb" }]
  const trendData =
    pickupTrendData.length > 0
      ? pickupTrendData
      : [{ month: "No data", bookings: 0, collected: 0 }]

  useEffect(() => {
    const reportObjectUrls = reportObjectUrlsRef.current

    return () => {
      reportObjectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
      reportObjectUrls.clear()
    }
  }, [])

  const handleViewReport = (report: RecentGeneratedReport) => {
    window.open(report.objectUrl, "_blank", "noopener,noreferrer")
  }

  const handleDownloadReport = (report: RecentGeneratedReport) => {
    const link = document.createElement("a")
    link.href = report.objectUrl
    link.download = report.fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleGenerateReport = () => {
    try {
      setGenerating(true)
      const doc = new jsPDF({ orientation: "landscape" })
      const rangeLabel =
        dateRange === "week"
          ? "Last 7 days"
          : dateRange === "year"
            ? "Last year"
            : "Last 30 days"

      doc.setFontSize(16)
      doc.text("Smart Parcel Pickup Performance Report", 14, 16)
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24)
      doc.text(`Selected range: ${rangeLabel}`, 14, 30)

      autoTable(doc, {
        startY: 38,
        head: [["Summary", "Value"]],
        body: [
          ["Total parcels", String(filteredParcels.length)],
          ["Ready parcels", String(filteredParcels.filter((p) => ["ready", "ready-for-pickup"].includes(p.status ?? "")).length)],
          ["Collected/completed parcels", String(filteredParcels.filter((p) => ["delivered", "completed", "collected"].includes(p.status ?? "")).length)],
          ["Pickup bookings", String(filteredPickups.length)],
          ["Monthly collected pickups", String(monthlyPerformance.completed)],
          ["Monthly upcoming pickups", String(monthlyPerformance.upcoming)],
          ["Monthly cancelled pickups", String(monthlyPerformance.cancelled)],
          ["Monthly completion rate", `${monthlyPerformance.completionRate}%`],
          ["Monthly cancellation rate", `${monthlyPerformance.cancellationRate}%`],
          ["Average queue wait", `${queueWaitingAnalysis.average} min`],
          ["Highest queue wait", `${queueWaitingAnalysis.highest} min`],
          ["Peak queue slot", queueWaitingAnalysis.peakSlot],
          ["Most used time slot", slotUtilization.mostUsed],
          ["Least used time slot", slotUtilization.leastUsed],
          ["Pickup success rate", `${metrics.successRate}%`],
        ],
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235] },
      })

      autoTable(doc, {
        startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
          ? (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
          : 82,
        head: [[
          "No.",
          "Tracking ID",
          "Customer",
          "Pickup Date",
          "Time Slot",
          "Queue",
          "Parcel Status",
          "Pickup Status",
          "Created",
          "Updated",
        ]],
        body: filteredPickups.map((pickup, index) => {
          const trackingId = pickup.tracking_ids?.[0] ?? "-"
          const parcel = filteredParcels.find((item) => item.tracking_id === trackingId)

          return [
            String(index + 1),
            trackingId,
            pickup.customer_name ?? parcel?.receiver ?? "-",
            pickup.pickup_date ?? "-",
            pickup.time_slot ?? "-",
            pickup.queue_number ?? "-",
            toTitle(parcel?.status ?? "-"),
            getPickupDisplayStatus(pickup.status),
            pickup.created_at ? new Date(pickup.created_at).toLocaleDateString() : "-",
            pickup.updated_at ? new Date(pickup.updated_at).toLocaleDateString() : "-",
          ]
        }),
        theme: "striped",
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 8 },
      })

      autoTable(doc, {
        startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
          ? (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
          : 120,
        head: [["Pickup Date", "Time Slot", "Bookings", "Used Quota", "Available Quota", "Utilization"]],
        body: slotUtilization.rows.map((row) => [
          row.pickupDate,
          row.timeSlot,
          String(row.bookings),
          String(row.usedQuota),
          String(row.availableQuota),
          `${row.utilization}%`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8 },
      })

      const generatedAt = new Date().toISOString()
      const fileName = `pickup-analytics-${dateRange}-${generatedAt.slice(0, 10)}.pdf`
      const objectUrl = URL.createObjectURL(doc.output("blob"))
      reportObjectUrlsRef.current.add(objectUrl)

      doc.save(fileName)
      setRecentReports((current) => {
        const next = [
          {
            name: "Pickup Analytics Report",
            type: "PDF",
            generatedAt,
            rangeLabel,
            fileName,
            objectUrl,
          },
          ...current,
        ]
        const visibleReports = next.slice(0, 5)
        next.slice(5).forEach((report) => {
          URL.revokeObjectURL(report.objectUrl)
          reportObjectUrlsRef.current.delete(report.objectUrl)
        })

        return visibleReports
      })
    } catch (reportError) {
      alert(reportError instanceof Error ? reportError.message : "Unable to generate PDF report.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b bg-background px-3 py-2 sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="hidden h-6 sm:block" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Report & Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="min-w-0 space-y-6 p-4 md:p-6">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Report & Analytics</h1>
            <p className="text-muted-foreground">
              Smart analytics for parcel pickup efficiency and queue performance
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleGenerateReport} disabled={generating} className="w-full sm:w-auto">
              <RefreshCw className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`} />
              Generate Report
            </Button>
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              {error}
            </div>
          )}

          <Tabs defaultValue="overview">
            <TabsList className="grid h-auto w-full grid-cols-4">
              <TabsTrigger value="overview">
                <Activity className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="parcel">
                <Package className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Parcel</span>
              </TabsTrigger>
              <TabsTrigger value="queue">
                <Users className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Queue</span>
              </TabsTrigger>
              <TabsTrigger value="performance">
                <Target className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Performance</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryCard title="Total Parcels" value={loading ? "..." : String(filteredMetrics.totalParcels)} icon={<Package />} />
                <SummaryCard title="Total Pickup Bookings" value={loading ? "..." : String(filteredMetrics.totalPickups)} icon={<Calendar />} />
                <SummaryCard title="Total Queue Records" value={String(filteredPickups.length)} icon={<Users />} />
                <SummaryCard title="Completed / Collected" value={String(filteredMetrics.completedPickups)} icon={<CheckCircleIcon />} />
                <SummaryCard title="Cancelled" value={String(filteredMetrics.cancelledPickups)} icon={<TrendingDown />} />
                <SummaryCard title="Completion Rate" value={`${filteredMetrics.successRate}%`} icon={<Target />} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pickup Booking vs Collected Pickup Trend</CardTitle>
                  <CardDescription>Bookings compared with collected pickups over time</CardDescription>
                </CardHeader>
                <CardContent className="h-72 min-w-0 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="bookings" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Pickup Bookings" />
                      <Area type="monotone" dataKey="collected" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Collected Pickups" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Pickup Type Distribution</CardTitle>
                    <CardDescription>Customer pickup behavior analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                          <LabelList dataKey="name" position="outside" />
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pickup Performance KPIs</CardTitle>
                    <CardDescription>Current performance vs target</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {performanceMetrics.map((metric) => (
                      <div key={metric.name}>
                        <div className="flex justify-between text-sm font-medium">
                          <span>{metric.name}</span>
                          <span>{metric.current}%</span>
                        </div>
                        <Progress value={(metric.current / metric.target) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">Target: {metric.target}%</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="parcel" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryCard title="Total Parcels" value={String(filteredParcels.length)} icon={<Package />} />
                <SummaryCard title="Ready Parcels" value={String(filteredParcels.filter((p) => ["ready", "ready-for-pickup"].includes(p.status ?? "")).length)} icon={<Package />} />
                <SummaryCard title="Collected / Completed" value={String(filteredParcels.filter((p) => ["delivered", "completed", "collected"].includes(p.status ?? "")).length)} icon={<CheckCircleIcon />} />
                <SummaryCard title="Pending Parcels" value={String(pendingParcels)} icon={<Clock />} />
                <SummaryCard title="Cancelled Parcels" value={String(filteredParcels.filter((p) => ["cancelled", "canceled"].includes(p.status ?? "")).length)} icon={<TrendingDown />} />
                <SummaryCard title="Registered This Period" value={String(filteredParcels.length)} icon={<Calendar />} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Parcel Status Breakdown</CardTitle>
                    <CardDescription>Parcel counts grouped by current status</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={
                            parcelStatusBreakdown.length > 0
                              ? parcelStatusBreakdown
                              : [{ name: "No data", value: 1, color: "#e5e7eb" }]
                          }
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          <LabelList dataKey="name" position="outside" />
                          {(parcelStatusBreakdown.length > 0
                            ? parcelStatusBreakdown
                            : [{ name: "No data", value: 1, color: "#e5e7eb" }]
                          ).map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Parcel Volume Trend</CardTitle>
                    <CardDescription>Recent parcel registrations in the selected range</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={
                          parcelVolumeData.length > 0
                            ? parcelVolumeData
                            : [{ label: "No data", parcels: 0 }]
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="parcels" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Parcels" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Parcel Registrations</CardTitle>
                  <CardDescription>Latest parcel records from Supabase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tracking ID</TableHead>
                          <TableHead>Receiver</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredParcels.slice(0, 8).map((parcel) => (
                          <TableRow key={parcel.id}>
                            <TableCell className="font-medium">{parcel.tracking_id ?? "-"}</TableCell>
                            <TableCell>{parcel.receiver ?? "-"}</TableCell>
                            <TableCell>{toTitle(parcel.status ?? "-")}</TableCell>
                            <TableCell>{parcel.created_at ? new Date(parcel.created_at).toLocaleString() : "-"}</TableCell>
                          </TableRow>
                        ))}
                        {filteredParcels.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                              No parcel analytics data available.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="queue">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <SummaryCard title="Total Queue Records" value={String(filteredPickups.length)} icon={<Users />} />
                  <SummaryCard title="Active / Upcoming" value={String(filteredMetrics.activePickups)} icon={<Calendar />} />
                  <SummaryCard title="Completed / Collected" value={String(filteredMetrics.completedPickups)} icon={<CheckCircleIcon />} />
                  <SummaryCard title="Cancelled Queue" value={String(filteredMetrics.cancelledPickups)} icon={<TrendingDown />} />
                  <SummaryCard title="Average Waiting Time" value={`${queueWaitingAnalysis.average} min`} icon={<Clock />} />
                  <SummaryCard title="Peak Time Slot" value={queueWaitingAnalysis.peakSlot} icon={<Target />} />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Queue Status Distribution</CardTitle>
                    <CardDescription>Upcoming, collected, cancelled, and pending queue records</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72 min-w-0">
                    {queueStatusDistribution.length === 0 ? (
                      <div className="flex h-full items-center justify-center rounded-lg border text-sm text-muted-foreground">
                        No queue status data available.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie data={queueStatusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={86} dataKey="value">
                            <LabelList dataKey="name" position="outside" />
                            {queueStatusDistribution.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Queue Status Summary</CardTitle>
                    <CardDescription>Live pickup booking and queue record counts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Records</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {["booked", "upcoming", "checked_in", "collected", "cancelled", "no_show"].map((status) => (
                          <TableRow key={status}>
                            <TableCell>{getPickupDisplayStatus(status)}</TableCell>
                            <TableCell>{filteredPickups.filter((pickup) => pickup.status === status).length}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SummaryCard title="Completion Rate" value={`${filteredMetrics.successRate}%`} icon={<CheckCircleIcon />} />
                <SummaryCard title="Cancellation Rate" value={filteredPickups.length > 0 ? `${Math.round((filteredMetrics.cancelledPickups / filteredPickups.length) * 100)}%` : "0%"} icon={<TrendingDown />} />
                <SummaryCard title="Average Waiting Time" value={`${queueWaitingAnalysis.average} min`} icon={<Clock />} />
                <SummaryCard title="Average Processing Time" value={`${filteredMetrics.processingHours.toFixed(1)} hr`} icon={<Activity />} />
                <SummaryCard title="Slot Utilization Rate" value={slotUtilization.rows.length > 0 ? `${Math.round(slotUtilization.rows.reduce((total, row) => total + row.utilization, 0) / slotUtilization.rows.length)}%` : "0%"} icon={<Target />} />
                <SummaryCard title="Peak Pickup Hour" value={peakHour} icon={<Clock />} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pickup Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>On-Time Pickup</TableCell>
                        <TableCell>{filteredMetrics.onTimeRate}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Late Pickup</TableCell>
                        <TableCell>{Math.max(0, 100 - filteredMetrics.onTimeRate)}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>No-Show</TableCell>
                        <TableCell>{filteredMetrics.noShowRate}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Parcels</TableCell>
                        <TableCell>{filteredMetrics.totalParcels}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Ready Parcels</TableCell>
                        <TableCell>{filteredMetrics.readyParcels}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Collected Parcels</TableCell>
                        <TableCell>{filteredMetrics.completedParcels}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peak Time Slot & Slot Utilization Analysis</CardTitle>
                  <CardDescription>
                    Pickup slot usage based on active bookings and 60 quota units per slot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pickup Date</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Used Quota</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slotUtilization.rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                          No slot utilization data available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      slotUtilization.rows.map((row) => (
                        <TableRow key={`${row.pickupDate}-${row.timeSlot}`}>
                          <TableCell>{row.pickupDate}</TableCell>
                          <TableCell>{row.timeSlot}</TableCell>
                          <TableCell>{row.bookings}</TableCell>
                          <TableCell>{row.usedQuota}/{SLOT_QUOTA_UNITS}</TableCell>
                          <TableCell>{row.availableQuota}</TableCell>
                          <TableCell>
                            <div className="min-w-24 space-y-1">
                              <div className="text-sm font-medium">{row.utilization}%</div>
                              <Progress value={row.utilization} className="h-2" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Previously generated pickup reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentReports.length === 0 ? (
                <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                  No recent reports available.
                </div>
              ) : recentReports.map((report) => (
                <div key={`${report.generatedAt}-${report.fileName}`} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <div className="min-w-0">
                      <span className="block min-w-0 truncate font-medium">{report.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {report.type} generated {new Date(report.generatedAt).toLocaleString()}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {report.rangeLabel}
                        </span>
                        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {report.fileName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      title="View generated PDF"
                      onClick={() => handleViewReport(report)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Download generated PDF"
                      onClick={() => handleDownloadReport(report)}
                    >
                      <Download className="h-4 w-4" />
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
      <CardContent className="flex min-w-0 items-center gap-4 p-4">
        <div className="rounded-lg bg-muted p-3">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="truncate text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
