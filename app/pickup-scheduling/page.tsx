// app/pickup-scheduling/page.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  User, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Check,
  RefreshCw,
  Download,
  Printer,
  Share2,
  Home,
  Menu,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DialogTrigger,
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
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

// Types
interface TimeSlot {
  id: string
  time: string
  available: boolean
}

interface PickupSchedule {
  id: string
  date: string
  timeSlot: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  customerName: string
  customerPhone: string
  customerEmail: string
  pickupAddress: string
  parcelDetails: string
  specialInstructions?: string
  createdAt: string
  updatedAt: string
}

interface DateSlot {
  date: string
  day: string
  available: boolean
  slotsAvailable: number
}

// Sample data
const initialTimeSlots: TimeSlot[] = [
  { id: '1', time: '09:00 - 10:00', available: true },
  { id: '2', time: '10:00 - 11:00', available: true },
  { id: '3', time: '11:00 - 12:00', available: false },
  { id: '4', time: '12:00 - 13:00', available: true },
  { id: '5', time: '13:00 - 14:00', available: true },
  { id: '6', time: '14:00 - 15:00', available: true },
  { id: '7', time: '15:00 - 16:00', available: true },
  { id: '8', time: '16:00 - 17:00', available: false },
  { id: '9', time: '17:00 - 18:00', available: true },
]

const initialPickupHistory: PickupSchedule[] = [
  {
    id: 'PU-001',
    date: '2024-01-15',
    timeSlot: '14:00 - 15:00',
    status: 'confirmed',
    customerName: 'John Smith',
    customerPhone: '+6012-345-6789',
    customerEmail: 'john@example.com',
    pickupAddress: '123 Main Street, Kuala Lumpur',
    parcelDetails: 'Documents (5kg)',
    specialInstructions: 'Ring doorbell twice',
    createdAt: '2024-01-10 10:30',
    updatedAt: '2024-01-10 10:30'
  },
  {
    id: 'PU-002',
    date: '2024-01-14',
    timeSlot: '10:00 - 11:00',
    status: 'completed',
    customerName: 'John Smith',
    customerPhone: '+6012-345-6789',
    customerEmail: 'john@example.com',
    pickupAddress: '123 Main Street, Kuala Lumpur',
    parcelDetails: 'Electronics (2kg)',
    specialInstructions: 'Fragile items',
    createdAt: '2024-01-09 14:20',
    updatedAt: '2024-01-14 11:30'
  },
  {
    id: 'PU-003',
    date: '2024-01-12',
    timeSlot: '15:00 - 16:00',
    status: 'cancelled',
    customerName: 'John Smith',
    customerPhone: '+6012-345-6789',
    customerEmail: 'john@example.com',
    pickupAddress: '123 Main Street, Kuala Lumpur',
    parcelDetails: 'Clothing (3kg)',
    createdAt: '2024-01-08 09:15',
    updatedAt: '2024-01-10 16:45'
  },
]

const availableDates: DateSlot[] = [
  { date: '2024-01-15', day: 'Mon', available: true, slotsAvailable: 5 },
  { date: '2024-01-16', day: 'Tue', available: true, slotsAvailable: 3 },
  { date: '2024-01-17', day: 'Wed', available: true, slotsAvailable: 7 },
  { date: '2024-01-18', day: 'Thu', available: true, slotsAvailable: 4 },
  { date: '2024-01-19', day: 'Fri', available: true, slotsAvailable: 6 },
  { date: '2024-01-20', day: 'Sat', available: false, slotsAvailable: 0 },
  { date: '2024-01-21', day: 'Sun', available: false, slotsAvailable: 0 },
  { date: '2024-01-22', day: 'Mon', available: true, slotsAvailable: 8 },
  { date: '2024-01-23', day: 'Tue', available: true, slotsAvailable: 5 },
]

export default function PickupSchedulingPage() {
  // State
  const [selectedDate, setSelectedDate] = useState<string>('2024-01-15')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [pickupHistory, setPickupHistory] = useState<PickupSchedule[]>(initialPickupHistory)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPickup, setEditingPickup] = useState<PickupSchedule | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [formData, setFormData] = useState({
    customerName: 'John Smith',
    customerPhone: '+6012-345-6789',
    customerEmail: 'john@example.com',
    pickupAddress: '123 Main Street, Kuala Lumpur',
    parcelDetails: '',
    specialInstructions: '',
    notifySMS: true,
    notifyEmail: true
  })

  // Filter pickup history
  const filteredHistory = pickupHistory.filter(pickup => {
    const matchesSearch = 
      pickup.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.parcelDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || pickup.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Get status badge
  const getStatusBadge = (status: PickupSchedule['status']) => {
    const config = {
      confirmed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" />, label: 'Confirmed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" />, label: 'Pending' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" />, label: 'Cancelled' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: <Check className="h-3 w-3" />, label: 'Completed' }
    }
    
    return (
      <Badge className={`${config[status].color} gap-1`}>
        {config[status].icon}
        {config[status].label}
      </Badge>
    )
  }

  // Handle form changes
  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle new booking
  const handleNewBooking = () => {
    if (!selectedTimeSlot) {
      alert('Please select a time slot')
      return
    }

    if (!formData.parcelDetails.trim()) {
      alert('Please provide parcel details')
      return
    }

    const newPickup: PickupSchedule = {
      id: `PU-${String(pickupHistory.length + 1).padStart(3, '0')}`,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      status: 'confirmed',
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      pickupAddress: formData.pickupAddress,
      parcelDetails: formData.parcelDetails,
      specialInstructions: formData.specialInstructions,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString()
    }

    setPickupHistory(prev => [newPickup, ...prev])
    setIsBookingDialogOpen(false)
    setSelectedTimeSlot('')
    setFormData(prev => ({
      ...prev,
      parcelDetails: '',
      specialInstructions: ''
    }))
    
    alert('Pickup scheduled successfully!')
  }

  // Handle edit booking
  const handleEditBooking = () => {
    if (!editingPickup) return

    setPickupHistory(prev => 
      prev.map(pickup => 
        pickup.id === editingPickup.id 
          ? { 
              ...pickup, 
              ...formData,
              updatedAt: new Date().toLocaleString()
            } 
          : pickup
      )
    )
    
    setIsEditDialogOpen(false)
    setEditingPickup(null)
    alert('Pickup updated successfully!')
  }

  // Handle cancel booking
  const handleCancelBooking = (pickupId: string) => {
    if (confirm('Are you sure you want to cancel this pickup?')) {
      setPickupHistory(prev => 
        prev.map(pickup => 
          pickup.id === pickupId 
            ? { ...pickup, status: 'cancelled', updatedAt: new Date().toLocaleString() } 
            : pickup
        )
      )
      alert('Pickup cancelled successfully!')
    }
  }

  // Handle reschedule
  const handleReschedule = (pickup: PickupSchedule) => {
    setSelectedDate(pickup.date)
    setSelectedTimeSlot(pickup.timeSlot)
    setFormData({
      ...formData,
      parcelDetails: pickup.parcelDetails,
      specialInstructions: pickup.specialInstructions || ''
    })
    setIsBookingDialogOpen(true)
    alert('Please select new date and time for rescheduling')
  }

  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    return initialTimeSlots.filter(slot => slot.available)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
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
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="ghost" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                My Parcels
              </Button>
              <Button variant="ghost" className="flex items-center gap-2 font-semibold text-primary">
                <Calendar className="h-4 w-4" />
                Pickup Schedule
              </Button>
            </nav>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
              <Avatar>
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pickup Scheduling</h1>
          <p className="text-gray-600 mt-2">
            Schedule, manage, and track your parcel pickups conveniently
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Schedule Pickup */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Pickup</CardTitle>
                <CardDescription>
                  Book a pickup appointment at your preferred date and time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Step Indicator */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                        1
                      </div>
                      <span className="mt-2 text-sm font-medium">Select Date</span>
                    </div>
                    <div className="h-1 flex-1 bg-gray-200 mx-4"></div>
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedDate ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                        2
                      </div>
                      <span className="mt-2 text-sm font-medium">Select Time</span>
                    </div>
                    <div className="h-1 flex-1 bg-gray-200 mx-4"></div>
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        3
                      </div>
                      <span className="mt-2 text-sm font-medium">Confirm</span>
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Select Pickup Date</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {availableDates.map((dateSlot) => (
                      <button
                        key={dateSlot.date}
                        onClick={() => setSelectedDate(dateSlot.date)}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                          selectedDate === dateSlot.date
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        } ${!dateSlot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!dateSlot.available}
                      >
                        <div className="text-sm text-gray-500">{dateSlot.day}</div>
                        <div className="text-xl font-bold my-1">
                          {new Date(dateSlot.date).getDate()}
                        </div>
                        <div className="text-xs">
                          {dateSlot.available ? (
                            <span className="text-green-600">{dateSlot.slotsAvailable} slots</span>
                          ) : (
                            <span className="text-red-600">Unavailable</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {getAvailableTimeSlots().map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-4 rounded-lg border transition-all ${
                          selectedTimeSlot === slot.time
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-primary hover:bg-primary/5'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{slot.time}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Details */}
                {(selectedDate || selectedTimeSlot) && (
                  <Card className="mb-6">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Selected Appointment</h4>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateDisplay(selectedDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{selectedTimeSlot || 'Not selected'}</span>
                          </div>
                        </div>
                        <Button onClick={() => setIsBookingDialogOpen(true)}>
                          Continue Booking
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Pickup History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pickup History</CardTitle>
                    <CardDescription>View and manage your previous pickup appointments</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search pickups..."
                        className="w-[200px] pl-10"
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
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Parcel Details</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((pickup) => (
                      <TableRow key={pickup.id}>
                        <TableCell className="font-medium">{pickup.id}</TableCell>
                        <TableCell>
                          <div>
                            <div>{new Date(pickup.date).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">{pickup.timeSlot}</div>
                          </div>
                        </TableCell>
                        <TableCell>{pickup.parcelDetails}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {pickup.pickupAddress}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(pickup.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingPickup(pickup)
                                setFormData({
                                  customerName: pickup.customerName,
                                  customerPhone: pickup.customerPhone,
                                  customerEmail: pickup.customerEmail,
                                  pickupAddress: pickup.pickupAddress,
                                  parcelDetails: pickup.parcelDetails,
                                  specialInstructions: pickup.specialInstructions || '',
                                  notifySMS: true,
                                  notifyEmail: true
                                })
                                setIsEditDialogOpen(true)
                              }}
                              disabled={pickup.status === 'completed' || pickup.status === 'cancelled'}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReschedule(pickup)}
                              disabled={pickup.status === 'completed' || pickup.status === 'cancelled'}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleCancelBooking(pickup.id)}
                              disabled={pickup.status === 'completed' || pickup.status === 'cancelled'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Information */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>Default pickup details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">John Smith</div>
                    <div className="text-sm text-gray-500">Customer</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>+6012-345-6789</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>john@example.com</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>123 Main Street, Kuala Lumpur</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Pickup Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Pickups</span>
                    <span className="font-semibold">{pickupHistory.length}</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <span className="font-semibold text-green-600">
                      {pickupHistory.filter(p => p.status === 'completed').length}
                    </span>
                  </div>
                  <Progress 
                    value={(pickupHistory.filter(p => p.status === 'completed').length / pickupHistory.length) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Upcoming</span>
                    <span className="font-semibold text-blue-600">
                      {pickupHistory.filter(p => p.status === 'confirmed').length}
                    </span>
                  </div>
                  <Progress 
                    value={(pickupHistory.filter(p => p.status === 'confirmed').length / pickupHistory.length) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="mr-2 h-4 w-4" />
                  Print Confirmation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Schedule
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Pickup Details</DialogTitle>
            <DialogDescription>
              Review and confirm your pickup appointment details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Appointment Summary */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Appointment Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDateDisplay(selectedDate)}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Time Slot</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{selectedTimeSlot}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleFormChange('customerName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => handleFormChange('customerPhone', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleFormChange('customerEmail', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="pickupAddress">Pickup Address</Label>
                  <Textarea
                    id="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={(e) => handleFormChange('pickupAddress', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Parcel Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Parcel Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="parcelDetails">
                    Parcel Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="parcelDetails"
                    placeholder="e.g., Documents (5kg), Electronics in original box, Fragile items..."
                    value={formData.parcelDetails}
                    onChange={(e) => handleFormChange('parcelDetails', e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Please describe your parcel including weight, dimensions, and any special handling requirements
                  </p>
                </div>
                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    placeholder="e.g., Ring doorbell twice, Leave with security guard, Call before arrival..."
                    value={formData.specialInstructions}
                    onChange={(e) => handleFormChange('specialInstructions', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-4">
              <h3 className="font-semibold">Notification Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifySMS">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive SMS updates about your pickup status
                    </p>
                  </div>
                  <Switch
                    id="notifySMS"
                    checked={formData.notifySMS}
                    onCheckedChange={(checked) => handleFormChange('notifySMS', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifyEmail">Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive email confirmations and updates
                    </p>
                  </div>
                  <Switch
                    id="notifyEmail"
                    checked={formData.notifyEmail}
                    onCheckedChange={(checked) => handleFormChange('notifyEmail', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewBooking}>
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Pickup Details</DialogTitle>
            <DialogDescription>
              Update your pickup appointment information
            </DialogDescription>
          </DialogHeader>
          
          {editingPickup && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDateDisplay(editingPickup.date)}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Time Slot</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{editingPickup.timeSlot}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-parcelDetails">Parcel Details</Label>
                  <Textarea
                    id="edit-parcelDetails"
                    value={formData.parcelDetails}
                    onChange={(e) => handleFormChange('parcelDetails', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="edit-specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) => handleFormChange('specialInstructions', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditBooking}>
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
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
                Simplifying parcel management and pickup scheduling for customers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-primary">Home</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary">Schedule Pickup</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary">Track Parcel</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-primary">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>support@parceltrack.com</li>
                <li>+603-1234-5678</li>
                <li>Kuala Lumpur, Malaysia</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-sm text-gray-500">
            © 2024 ParcelTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}