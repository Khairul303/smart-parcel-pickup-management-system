// app/customer-dashboard/page.tsx
"use client"
import { CustomerSidebar } from "@/components/app-sidebar-cust"
import { useState, useEffect } from "react"
import { 
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Search,
  Filter,
  Bell,
  User,
  Home,
  Menu,
  Download,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  RefreshCw,
  BarChart3,
  TrendingUp,
  MoreVertical,
  Shield,
  Award,
  Star,
  ChevronRight,
  Info,
  ExternalLink,
  FileText,
  Printer,
  Share2,
  QrCode,
  History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

// Types
interface Parcel {
  id: string
  trackingNumber: string
  status: 'arrived' | 'in-transit' | 'delivered' | 'pending' | 'out-for-delivery' | 'ready-for-pickup'
  sender: string
  receiver: string
  weight: string
  dimensions: string
  estimatedDelivery: string
  actualDelivery?: string
  postCenter: string
  postCenterAddress: string
  postCenterHours: string
  postCenterContact: string
  arrivalTime: string
  pickupDeadline: string
  storageFee?: number
  insuranceAmount?: number
  priority: 'standard' | 'express' | 'priority'
  lastUpdated: string
  notes?: string
}

interface Notification {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'info' | 'warning' | 'success' | 'alert'
}

// Sample data
const initialParcels: Parcel[] = [
  {
    id: 'PK-001',
    trackingNumber: 'TRK7890123456',
    status: 'arrived',
    sender: 'Amazon Warehouse',
    receiver: 'John Smith',
    weight: '2.5 kg',
    dimensions: '30x20x15 cm',
    estimatedDelivery: '2024-01-16',
    postCenter: 'KL Central Post Center',
    postCenterAddress: '123 Jalan Raja, Kuala Lumpur',
    postCenterHours: 'Mon-Fri: 8AM-8PM, Sat: 9AM-6PM, Sun: Closed',
    postCenterContact: '+603-1234-5678',
    arrivalTime: '2024-01-15 10:30',
    pickupDeadline: '2024-01-22',
    storageFee: 5,
    insuranceAmount: 150,
    priority: 'express',
    lastUpdated: '2024-01-15 10:30'
  },
  {
    id: 'PK-002',
    trackingNumber: 'TRK7890123457',
    status: 'ready-for-pickup',
    sender: 'AliExpress Seller',
    receiver: 'John Smith',
    weight: '1.8 kg',
    dimensions: '25x18x10 cm',
    estimatedDelivery: '2024-01-15',
    actualDelivery: '2024-01-15 09:15',
    postCenter: 'Mid Valley Collection Point',
    postCenterAddress: 'Mid Valley Megamall, Lingkaran Syed Putra',
    postCenterHours: 'Daily: 10AM-10PM',
    postCenterContact: '+603-2234-5678',
    arrivalTime: '2024-01-15 09:00',
    pickupDeadline: '2024-01-21',
    storageFee: 3,
    priority: 'standard',
    lastUpdated: '2024-01-15 09:15'
  },
  {
    id: 'PK-003',
    trackingNumber: 'TRK7890123458',
    status: 'out-for-delivery',
    sender: 'Local Merchant',
    receiver: 'John Smith',
    weight: '5.2 kg',
    dimensions: '40x30x25 cm',
    estimatedDelivery: '2024-01-15',
    postCenter: 'PJ Delivery Hub',
    postCenterAddress: 'Petaling Jaya Main Hub',
    postCenterHours: 'Mon-Sat: 8AM-6PM',
    postCenterContact: '+603-3234-5678',
    arrivalTime: '2024-01-14 16:45',
    pickupDeadline: '2024-01-21',
    insuranceAmount: 500,
    priority: 'priority',
    lastUpdated: '2024-01-15 08:30'
  },
  {
    id: 'PK-004',
    trackingNumber: 'TRK7890123459',
    status: 'delivered',
    sender: 'E-commerce Store',
    receiver: 'John Smith',
    weight: '0.8 kg',
    dimensions: '20x15x5 cm',
    estimatedDelivery: '2024-01-14',
    actualDelivery: '2024-01-14 14:20',
    postCenter: 'Bangsar Post Office',
    postCenterAddress: 'Bangsar Shopping Center',
    postCenterHours: 'Mon-Fri: 9AM-5PM',
    postCenterContact: '+603-4234-5678',
    arrivalTime: '2024-01-13 11:15',
    pickupDeadline: '2024-01-20',
    priority: 'standard',
    lastUpdated: '2024-01-14 14:20'
  },
  {
    id: 'PK-005',
    trackingNumber: 'TRK7890123460',
    status: 'in-transit',
    sender: 'International Shipper',
    receiver: 'John Smith',
    weight: '3.5 kg',
    dimensions: '35x25x20 cm',
    estimatedDelivery: '2024-01-18',
    postCenter: 'KLIA Customs Center',
    postCenterAddress: 'KL International Airport',
    postCenterHours: '24/7',
    postCenterContact: '+603-5234-5678',
    arrivalTime: '2024-01-14 22:30',
    pickupDeadline: '2024-01-25',
    insuranceAmount: 1200,
    priority: 'express',
    lastUpdated: '2024-01-15 06:45'
  }
]

const notifications: Notification[] = [
  {
    id: 'N1',
    title: 'Parcel Arrived at Post Center',
    message: 'Your parcel TRK7890123456 has arrived at KL Central Post Center',
    timestamp: '10:30 AM',
    read: false,
    type: 'success'
  },
  {
    id: 'N2',
    title: 'Ready for Pickup',
    message: 'Parcel TRK7890123457 is ready for collection at Mid Valley',
    timestamp: '9:15 AM',
    read: true,
    type: 'info'
  },
  {
    id: 'N3',
    title: 'Out for Delivery',
    message: 'Parcel TRK7890123458 is out for delivery today',
    timestamp: '8:30 AM',
    read: true,
    type: 'warning'
  }
]

export default function CustomerDashboardPage() {
  // State
  const [parcels, setParcels] = useState<Parcel[]>(initialParcels)
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showParcelDetail, setShowParcelDetail] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(1)
  const [activeTab, setActiveTab] = useState('overview')
  const [now, setNow] = useState<number>(0)

interface ParcelTrackingTimelineProps {
  parcel: Parcel
}


  // Filter parcels
  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = 
      parcel.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parcel.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parcel.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || parcel.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
 const TWO_DAYS = 2 * 24 * 60 * 60 * 1000
  // Calculate statistics
  const stats = {
    totalParcels: parcels.length,
    arrivedAtPostCenter: parcels.filter(p => p.status === 'arrived' || p.status === 'ready-for-pickup').length,
    inTransit: parcels.filter(p => p.status === 'in-transit' || p.status === 'out-for-delivery').length,
    delivered: parcels.filter(p => p.status === 'delivered').length,
    storageFeesDue: parcels
      .filter(p => p.status === 'arrived' || p.status === 'ready-for-pickup')
      .reduce((sum, p) => sum + (p.storageFee || 0), 0),
  

urgentPickups: parcels.filter(p => {
  const deadline = new Date(p.pickupDeadline).getTime()
  return (
    (p.status === 'arrived' || p.status === 'ready-for-pickup') &&
    deadline < now + TWO_DAYS
  )
}).length



  }

  // Get status badge
  const getStatusBadge = (status: Parcel['status']) => {
    const config = {
      'arrived': { 
        color: 'bg-green-100 text-green-800', 
        icon: <Package className="h-3 w-3" />, 
        label: 'Arrived at Post Center' 
      },
      'ready-for-pickup': { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <CheckCircle className="h-3 w-3" />, 
        label: 'Ready for Pickup' 
      },
      'out-for-delivery': { 
        color: 'bg-purple-100 text-purple-800', 
        icon: <Truck className="h-3 w-3" />, 
        label: 'Out for Delivery' 
      },
      'in-transit': { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <Truck className="h-3 w-3" />, 
        label: 'In Transit' 
      },
      'delivered': { 
        color: 'bg-emerald-100 text-emerald-800', 
        icon: <CheckCircle className="h-3 w-3" />, 
        label: 'Delivered' 
      },
      'pending': { 
        color: 'bg-gray-100 text-gray-800', 
        icon: <Clock className="h-3 w-3" />, 
        label: 'Pending' 
      }
    }
    
    return (
      <Badge className={`${config[status].color} gap-1`}>
        {config[status].icon}
        {config[status].label}
      </Badge>
    )
  }

  // Get priority badge
  const getPriorityBadge = (priority: Parcel['priority']) => {
    const config = {
      'express': { color: 'bg-red-100 text-red-800', label: 'Express' },
      'priority': { color: 'bg-orange-100 text-orange-800', label: 'Priority' },
      'standard': { color: 'bg-gray-100 text-gray-800', label: 'Standard' }
    }
    
    return (
      <Badge variant="outline" className={config[priority].color}>
        {config[priority].label}
      </Badge>
    )
  }

  // Mark notification as read
  const markNotificationAsRead = (id: string) => {
    setUnreadNotifications(prev => Math.max(0, prev - 1))
  }

  // Request redelivery
  const handleRequestRedelivery = (parcelId: string) => {
    const parcel = parcels.find(p => p.id === parcelId)
    if (parcel) {
      alert(`Redelivery requested for ${parcel.trackingNumber}. You will be contacted for scheduling.`)
    }
  }

  // Extend pickup deadline
  const handleExtendPickup = (parcelId: string) => {
    const parcel = parcels.find(p => p.id === parcelId)
    if (parcel) {
      alert(`Pickup extension requested for ${parcel.trackingNumber}. Additional storage fees may apply.`)
    }
  }

  // Generate QR code for pickup
  const handleGenerateQR = (parcelId: string) => {
    const parcel = parcels.find(p => p.id === parcelId)
    if (parcel) {
      alert(`QR code generated for ${parcel.trackingNumber}. Show this at the post center for quick pickup.`)
    }
  }

  // Track parcel location
  function ParcelTrackingTimeline({ parcel }: ParcelTrackingTimelineProps) {
  const steps = [
    {
      status: "in-transit",
      label: "In Transit",
      active: ["in-transit", "out-for-delivery", "arrived", "ready-for-pickup", "delivered"].includes(parcel.status),
    },
    {
      status: "arrived",
      label: "Arrived at Post Center",
      active: ["arrived", "ready-for-pickup", "delivered"].includes(parcel.status),
    },
    {
      status: "ready-for-pickup",
      label: "Ready for Pickup",
      active: ["ready-for-pickup", "delivered"].includes(parcel.status),
    },
    {
      status: "delivered",
      label: "Delivered",
      active: parcel.status === "delivered",
    },
  ]

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-6 relative">
        {steps.map((step, index) => (
          <div key={step.status} className="flex items-start gap-3">
            <div
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                step.active ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              {index + 1}
            </div>
            <div className="flex-1 pt-1">
              <div className={`font-medium ${step.active ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </div>

              {step.status === "arrived" && (
                <div className="text-sm text-gray-500 mt-1">
                  Arrived: {new Date(parcel.arrivalTime).toLocaleString()}
                </div>
              )}

              {step.status === "delivered" && parcel.actualDelivery && (
                <div className="text-sm text-gray-500 mt-1">
                  Delivered: {new Date(parcel.actualDelivery).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold">ParcelTrack</span>
                {/* <Badge variant="outline" className="ml-2">Customer</Badge> */}
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" className="flex items-center gap-2 font-semibold text-primary">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="ghost" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                My Parcels
              </Button>
              <Button variant="ghost" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Pickup Schedule
              </Button>
              {/* <Button variant="ghost" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </Button> */}
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="relative"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">John Smith</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Award className="mr-2 h-4 w-4" />
                    Membership
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
              <p className="text-gray-600 mt-2">
                Track your parcels, view post center arrivals, and manage deliveries
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Track New Parcel
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Parcels
              </CardDescription>
              <CardTitle className="text-2xl">{stats.totalParcels}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                {stats.arrivedAtPostCenter} at post centers
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Arrived at Post Center
              </CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.arrivedAtPostCenter}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                Ready for pickup or delivery
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Completed
              </CardDescription>
              <CardTitle className="text-2xl">RM{stats.storageFeesDue}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                {stats.urgentPickups} urgent pickups
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Delivery Performance
              </CardDescription>
              <CardTitle className="text-2xl">94%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < 4 ? 'fill-amber-500 text-amber-500' : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Parcels List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>My Parcels</CardTitle>
                    <CardDescription>Track and manage your parcels</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search parcels..."
                        className="w-full sm:w-[200px] pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="arrived">Arrived</SelectItem>
                        <SelectItem value="ready-for-pickup">Ready for Pickup</SelectItem>
                        <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
                        <SelectItem value="in-transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All Parcels</TabsTrigger>
                    <TabsTrigger value="postcenter">At Post Center</TabsTrigger>
                    <TabsTrigger value="intransit">Completed</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    {filteredParcels.map((parcel) => (
                      <Card key={parcel.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setSelectedParcel(parcel)
                          setShowParcelDetail(true)
                        }}>
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{parcel.trackingNumber}</span>
                                {getStatusBadge(parcel.status)}
                                {getPriorityBadge(parcel.priority)}
                              </div>
                              <div className="text-sm text-gray-600">
                                From: {parcel.sender} • Weight: {parcel.weight}
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {parcel.postCenter}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Arrived: {new Date(parcel.arrivalTime).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedParcel(parcel)
                                    setShowParcelDetail(true)
                                  }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Label
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGenerateQR(parcel.id)}>
                                    <QrCode className="mr-2 h-4 w-4" />
                                    Generate QR Code
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {parcel.status === 'arrived' && (
                                    <DropdownMenuItem onClick={() => handleExtendPickup(parcel.id)}>
                                      <Calendar className="mr-2 h-4 w-4" />
                                      Extend Pickup
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleRequestRedelivery(parcel.id)}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Request Redelivery
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates on your parcels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { parcel: 'TRK7890123456', action: 'arrived at KL Central Post Center', time: '10:30 AM', status: 'arrived' },
                    { parcel: 'TRK7890123457', action: 'ready for pickup at Mid Valley', time: '9:15 AM', status: 'ready' },
                    { parcel: 'TRK7890123458', action: 'out for delivery today', time: '8:30 AM', status: 'delivery' },
                    { parcel: 'TRK7890123459', action: 'successfully delivered', time: 'Yesterday, 2:20 PM', status: 'delivered' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        activity.status === 'arrived' ? 'bg-green-100' :
                        activity.status === 'ready' ? 'bg-blue-100' :
                        activity.status === 'delivery' ? 'bg-purple-100' : 'bg-emerald-100'
                      }`}>
                        {activity.status === 'arrived' && <Package className="h-5 w-5 text-green-600" />}
                        {activity.status === 'ready' && <CheckCircle className="h-5 w-5 text-blue-600" />}
                        {activity.status === 'delivery' && <Truck className="h-5 w-5 text-purple-600" />}
                        {activity.status === 'delivered' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Parcel {activity.parcel}</div>
                        <div className="text-sm text-gray-600">{activity.action}</div>
                      </div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info & Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan QR for Pickup
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  Print Shipping Labels
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Documents
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Tracking
                </Button>
              </CardContent>
            </Card>

            {/* Post Center Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Nearby Post Centers</CardTitle>
                <CardDescription>Your parcels are here</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from(new Set(parcels.map(p => p.postCenter))).slice(0, 3).map((center, index) => {
                  const centerParcels = parcels.filter(p => p.postCenter === center)
                  return (
                    <div key={index} className="space-y-2 p-3 rounded-lg border">
                      <div className="font-medium">{center}</div>
                      <div className="text-sm text-gray-600">
                        {centerParcels.length} parcel{centerParcels.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {centerParcels[0]?.postCenterHours}
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        Get Directions
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Pickup Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Pickup Deadlines</CardTitle>
                <CardDescription>Act soon to avoid storage fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {parcels
                  .filter(p => p.status === 'arrived' || p.status === 'ready-for-pickup')
                  .slice(0, 3)
                  .map((parcel) => {
                    const daysLeft = Math.ceil(
  (new Date(parcel.pickupDeadline).getTime() - now) /
  (1000 * 60 * 60 * 24)
)

                    return (
                      <div key={parcel.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="font-medium">{parcel.trackingNumber}</div>
                          <div className="text-sm text-gray-600">{parcel.postCenter}</div>
                        </div>
                        <Badge variant={daysLeft <= 2 ? 'destructive' : daysLeft <= 5 ? 'default' : 'outline'}>
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    )
                  })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Parcel Detail Dialog */}
      <Dialog open={showParcelDetail} onOpenChange={setShowParcelDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedParcel && (
            <>
              <DialogHeader>
                <DialogTitle>Parcel Details</DialogTitle>
                <DialogDescription>
                  Complete information for {selectedParcel.trackingNumber}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Header with Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{selectedParcel.trackingNumber}</h3>
                    <p className="text-gray-600">{selectedParcel.sender} → {selectedParcel.receiver}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedParcel.status)}
                    {getPriorityBadge(selectedParcel.priority)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Tracking & Info */}
                  <div className="space-y-6">
                    {/* Tracking Timeline */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Tracking Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* <ParcelTrackingTimeline parcel={selectedParcel} /> */}
                      </CardContent>
                    </Card>

                    {/* Parcel Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Parcel Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Weight</Label>
                            <div className="font-medium">{selectedParcel.weight}</div>
                          </div>
                          <div>
                            <Label>Dimensions</Label>
                            <div className="font-medium">{selectedParcel.dimensions}</div>
                          </div>
                          <div>
                            <Label>Insurance</Label>
                            <div className="font-medium">
                              {selectedParcel.insuranceAmount ? `RM${selectedParcel.insuranceAmount}` : 'None'}
                            </div>
                          </div>
                          <div>
                            <Label>Storage Fee</Label>
                            <div className="font-medium">
                              {selectedParcel.storageFee ? `RM${selectedParcel.storageFee}/day` : 'Free'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Post Center & Actions */}
                  <div className="space-y-6">
                    {/* Post Center Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Post Center Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="font-medium">{selectedParcel.postCenter}</div>
                          <div className="text-sm text-gray-600 flex items-start gap-1">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {selectedParcel.postCenterAddress}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {selectedParcel.postCenterContact}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {selectedParcel.postCenterHours}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Arrival Time:</span>{' '}
                            {new Date(selectedParcel.arrivalTime).toLocaleString()}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Pickup Deadline:</span>{' '}
                            {new Date(selectedParcel.pickupDeadline).toLocaleDateString()}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Last Updated:</span>{' '}
                            {selectedParcel.lastUpdated}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Get Directions
                        </Button>
                      </CardFooter>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleGenerateQR(selectedParcel.id)}>
                            <QrCode className="mr-2 h-4 w-4" />
                            QR Code
                          </Button>
                          <Button variant="outline" size="sm">
                            <Printer className="mr-2 h-4 w-4" />
                            Print Label
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleExtendPickup(selectedParcel.id)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Extend Pickup
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRequestRedelivery(selectedParcel.id)}>
                            <Truck className="mr-2 h-4 w-4" />
                            Redeliver
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedParcel.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{selectedParcel.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Tracking
                </Button>
                <Button>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Latest updates about your parcels
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className={`mt-1 rounded-full p-1 ${
                  notification.type === 'success' ? 'bg-green-100' :
                  notification.type === 'warning' ? 'bg-yellow-100' :
                  notification.type === 'alert' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {notification.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                  {notification.type === 'alert' && <AlertCircle className="h-4 w-4 text-red-600" />}
                  {notification.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-gray-600">{notification.message}</div>
                  <div className="text-xs text-gray-500 mt-1">{notification.timestamp}</div>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setShowNotifications(false)}>
              Mark All as Read
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">ParcelTrack</span>
              </div>
              <p className="text-gray-600 text-sm">
                Your trusted partner for parcel tracking and management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Button variant="link" className="p-0 h-auto">Track Parcel</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Find Post Center</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Shipping Rates</Button></li>
                <li><Button variant="link" className="p-0 h-auto">FAQ</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Button variant="link" className="p-0 h-auto">Contact Us</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Live Chat</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Help Center</Button></li>
                <li><Button variant="link" className="p-0 h-auto">Terms of Service</Button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Download App</h4>
              <div className="space-y-3">
                <Button className="w-full">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="font-bold">Google Play</div>
                    </div>
                  </div>
                </Button>
                <Button className="w-full">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="font-bold">App Store</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-sm text-gray-500">
            © 2024 ParcelTrack Customer Dashboard. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

// Add missing icon import
import { Plus } from "lucide-react"