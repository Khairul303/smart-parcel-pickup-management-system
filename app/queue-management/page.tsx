"use client"

import { useState } from "react"
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
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  UserX,
  Phone,
  Calendar,
  Filter,
  RefreshCw,
  Play,
  Pause,
  MessageSquare,
  Eye,
  Settings,
  TrendingUp,
  Target,
  Package,
  ListChecks,
  SkipForward,
  MoreVertical,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

/* =======================
   TYPES
======================= */
type QueueStatus = "waiting" | "in-progress" | "completed" | "cancelled"
type QueueType = "walkIn" | "booked"

interface QueueItem {
  id: string
  customer: {
    name: string
    phone: string
    type: string
    avatar: string
  }
  serviceType: string
  queueNumber: number
  waitingTime: string
  status: QueueStatus
  checkInTime: string
  appointmentTime?: string
  bookedTime?: string
  completedTime?: string
  duration?: string
}

interface QueueState {
  walkIn: QueueItem[]
  booked: QueueItem[]
  completed: QueueItem[]
}

/* =======================
   INITIAL DATA
======================= */
const initialQueues: QueueState = {
  walkIn: [
    {
      id: "W-001",
      customer: { name: "Ahmad Ali", phone: "+6012-345-6789", type: "Walk-in", avatar: "AA" },
      serviceType: "Parcel Drop-off",
      queueNumber: 101,
      waitingTime: "15 mins",
      status: "waiting",
      checkInTime: "09:15 AM",
    },
    {
      id: "W-002",
      customer: { name: "Siti Sarah", phone: "+6012-987-6543", type: "Walk-in", avatar: "SS" },
      serviceType: "Document Collection",
      queueNumber: 102,
      waitingTime: "25 mins",
      status: "waiting",
      checkInTime: "09:20 AM",
    },
    {
      id: "W-003",
      customer: { name: "Raj Kumar", phone: "+6013-456-7890", type: "Walk-in", avatar: "RK" },
      serviceType: "Registration",
      queueNumber: 103,
      waitingTime: "35 mins",
      status: "waiting",
      checkInTime: "09:25 AM",
    },
  ],
  booked: [
    {
      id: "B-001",
      customer: { name: "Lisa Wong", phone: "+6014-567-8901", type: "Booked", avatar: "LW" },
      serviceType: "Express Delivery",
      queueNumber: 201,
      waitingTime: "5 mins",
      status: "in-progress",
      checkInTime: "09:00 AM",
      appointmentTime: "09:30 AM",
      bookedTime: "Yesterday, 2:30 PM",
    },
    {
      id: "B-002",
      customer: { name: "David Chen", phone: "+6015-678-9012", type: "Booked", avatar: "DC" },
      serviceType: "Bulk Shipment",
      queueNumber: 202,
      waitingTime: "Next",
      status: "waiting",
      checkInTime: "09:05 AM",
      appointmentTime: "09:35 AM",
      bookedTime: "Yesterday, 4:15 PM",
    },
    {
      id: "B-003",
      customer: { name: "Maya Abdullah", phone: "+6016-789-0123", type: "Booked", avatar: "MA" },
      serviceType: "Special Handling",
      queueNumber: 203,
      waitingTime: "20 mins",
      status: "waiting",
      checkInTime: "09:10 AM",
      appointmentTime: "09:40 AM",
      bookedTime: "Today, 8:00 AM",
    },
  ],
  completed: [
    {
      id: "C-001",
      customer: { name: "John Tan", phone: "+6017-890-1234", type: "Walk-in", avatar: "JT" },
      serviceType: "Parcel Pickup",
      queueNumber: 100,
      waitingTime: "Completed",
      status: "completed",
      checkInTime: "08:45 AM",
      completedTime: "09:10 AM",
      duration: "25 mins"
    },
  ]
}

/* =======================
   COMPONENT
======================= */
export default function QueueManagementPage() {
  const [queues, setQueues] = useState<QueueState>(initialQueues)
  const [activeTab, setActiveTab] = useState("all")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [nowServing, setNowServing] = useState<number>(201)
  const [announcement, setAnnouncement] = useState("")

  // Calculate statistics
  const stats = {
    totalWaiting: queues.walkIn.filter(q => q.status === "waiting").length + 
                 queues.booked.filter(q => q.status === "waiting").length,
    inProgress: queues.walkIn.filter(q => q.status === "in-progress").length + 
                queues.booked.filter(q => q.status === "in-progress").length,
    completedToday: queues.completed.length,
    averageWaitTime: "18 mins",
    totalServed: 156 // Static for now
  }

  /* =======================
     STATUS BADGE
  ======================= */
  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case "waiting":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" /> Waiting
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Play className="mr-1 h-3 w-3" /> In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <UserX className="mr-1 h-3 w-3" /> Cancelled
          </Badge>
        )
    }
  }

  /* =======================
     HANDLE COMPLETE
  ======================= */
  const handleComplete = (queueId: string, type: QueueType) => {
    setQueues(prev => {
      const target = prev[type].find(q => q.id === queueId)
      if (!target) return prev

      const completedItem: QueueItem = {
        ...target,
        status: "completed",
        completedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: "—",
      }

      return {
        ...prev,
        [type]: prev[type].filter(q => q.id !== queueId),
        completed: [...prev.completed, completedItem],
      }
    })
  }

  const handleCallNext = () => {
    // Find next waiting customer
    const allWaiting = [...queues.walkIn, ...queues.booked]
      .filter(q => q.status === "waiting")
      .sort((a, b) => a.queueNumber - b.queueNumber)
    
    if (allWaiting.length > 0) {
      const nextCustomer = allWaiting[0]
      setNowServing(nextCustomer.queueNumber)
      setAnnouncement(`Now serving: ${nextCustomer.customer.name} (Queue ${nextCustomer.queueNumber})`)
      
      // Update status
      setQueues(prev => ({
        ...prev,
        walkIn: prev.walkIn.map(q => 
          q.id === nextCustomer.id ? { ...q, status: "in-progress" } : q
        ),
        booked: prev.booked.map(q => 
          q.id === nextCustomer.id ? { ...q, status: "in-progress" } : q
        )
      }))
    }
  }

  const handleStartService = (queueId: string, type: QueueType) => {
    setNowServing(queues[type].find(q => q.id === queueId)?.queueNumber || nowServing)
    setQueues(prev => ({
      ...prev,
      [type]: prev[type].map(q => 
        q.id === queueId ? { ...q, status: "in-progress" } : q
      )
    }))
  }

  const handleSkip = (queueId: string, type: QueueType) => {
    // Move to end of queue by increasing queue number
    setQueues(prev => ({
      ...prev,
      [type]: prev[type].map(q => 
        q.id === queueId ? { ...q, queueNumber: q.queueNumber + 100 } : q
      ).sort((a, b) => a.queueNumber - b.queueNumber)
    }))
  }

  /* =======================
     QUEUE ANALYTICS COMPONENT
  ======================= */
  const QueueAnalytics = () => {
    // Sample data for charts
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
            {/* Left Column - Total Served */}
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

            {/* Middle Column - Customer Flow */}
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
            </div>

            {/* Right Column - Average Wait Time */}
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

  /* =======================
     RENDER
  ======================= */
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
                  <BreadcrumbPage>Queue Management</BreadcrumbPage>
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Queue Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage walk-in and booked queues in real-time
            </p>
          </div>

          {/* Announcement Banner */}
          {announcement && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Announcement</p>
                    <p className="text-sm opacity-90">{announcement}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20"
                  onClick={() => setAnnouncement("")}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Stats Cards and Queue Analytics */}
          <div className="grid gap-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Now Serving</CardDescription>
                  <CardTitle className="text-3xl text-primary">#{nowServing}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleCallNext} className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Call Next Customer
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Waiting</CardDescription>
                  <CardTitle className="text-3xl text-amber-600">{stats.totalWaiting}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Customers in queue</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>In Progress</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">{stats.inProgress}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Currently being served</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Avg. Wait Time</CardDescription>
                  <CardTitle className="text-3xl text-green-600">{stats.averageWaitTime}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Today average</p>
                </CardContent>
              </Card>
            </div>

            
          </div>

          {/* Queue Management Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Walk-in Queue */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Walk-in Queue
                </CardTitle>
                <CardDescription>Customers without appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {queues.walkIn.map((queue) => (
                  <div key={queue.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold text-primary">#{queue.queueNumber}</div>
                        <div className="text-xs text-muted-foreground">Queue</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{queue.customer.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{queue.customer.name}</div>
                            <div className="text-xs text-muted-foreground">{queue.serviceType}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {queue.waitingTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {queue.checkInTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(queue.status)}
                      <div className="flex gap-2">
                        {queue.status === "waiting" && (
                          <Button size="sm" onClick={() => handleStartService(queue.id, 'walkIn')}>
                            Start
                          </Button>
                        )}
                        {queue.status === "in-progress" && (
                          <Button size="sm" variant="default" onClick={() => handleComplete(queue.id, 'walkIn')}>
                            Complete
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleSkip(queue.id, 'walkIn')}>
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Booked Queue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  Booked Queue
                </CardTitle>
                <CardDescription>Scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {queues.booked.map((queue) => (
                  <div key={queue.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{queue.customer.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{queue.customer.name}</div>
                          <div className="text-xs text-muted-foreground">{queue.serviceType}</div>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Appointment: {queue.appointmentTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {queue.customer.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(queue.status)}
                      <div className="flex gap-2">
                        {queue.status === "waiting" && (
                          <Button size="sm" onClick={() => handleStartService(queue.id, 'booked')}>
                            Start
                          </Button>
                        )}
                        {queue.status === "in-progress" && (
                          <Button size="sm" variant="default" onClick={() => handleComplete(queue.id, 'booked')}>
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recently Completed */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Completed</CardTitle>
              <CardDescription>Today completed services</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Queue #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead>Completed Time</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queues.completed.map((queue) => (
                    <TableRow key={queue.id}>
                      <TableCell className="font-medium">#{queue.queueNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{queue.customer.avatar}</AvatarFallback>
                          </Avatar>
                          <span>{queue.customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{queue.serviceType}</TableCell>
                      <TableCell>{queue.checkInTime}</TableCell>
                      <TableCell>{queue.completedTime}</TableCell>
                      <TableCell>{queue.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}