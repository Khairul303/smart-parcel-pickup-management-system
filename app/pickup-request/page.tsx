"use client"

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
import { Bell, Search, Filter, MoreVertical, CheckCircle, XCircle, Clock, Truck, MapPin, User, Calendar, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"

// Sample data for pickup requests
const pickupRequests = [
  {
    id: "PU-001",
    customer: {
      name: "John Smith",
      email: "john@example.com",
      phone: "+6012-345-6789",
      avatar: "JS"
    },
    parcelDetails: {
      type: "Documents",
      weight: "0.5kg",
      dimensions: "30x20x5cm",
      value: "RM 50"
    },
    pickupAddress: "123 Main Street, Kuala Lumpur",
    preferredTime: "2024-01-15 14:00",
    status: "pending",
    assignedTo: "You",
    createdAt: "2024-01-14 09:30"
  },
  {
    id: "PU-002",
    customer: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+6012-987-6543",
      avatar: "SJ"
    },
    parcelDetails: {
      type: "Electronics",
      weight: "2.5kg",
      dimensions: "40x30x20cm",
      value: "RM 1,200"
    },
    pickupAddress: "456 Jalan Bukit Bintang, KL",
    preferredTime: "2024-01-15 10:00",
    status: "assigned",
    assignedTo: "You",
    createdAt: "2024-01-14 11:15"
  },
  {
    id: "PU-003",
    customer: {
      name: "Mike Davis",
      email: "mike@example.com",
      phone: "+6013-456-7890",
      avatar: "MD"
    },
    parcelDetails: {
      type: "Clothing",
      weight: "3.0kg",
      dimensions: "50x40x30cm",
      value: "RM 350"
    },
    pickupAddress: "789 Taman Tun Dr Ismail, KL",
    preferredTime: "2024-01-15 16:30",
    status: "in-progress",
    assignedTo: "You",
    createdAt: "2024-01-14 14:45"
  },
  {
    id: "PU-004",
    customer: {
      name: "Emma Wilson",
      email: "emma@example.com",
      phone: "+6014-567-8901",
      avatar: "EW"
    },
    parcelDetails: {
      type: "Fragile Items",
      weight: "5.0kg",
      dimensions: "60x40x40cm",
      value: "RM 800"
    },
    pickupAddress: "321 Bangsar South, KL",
    preferredTime: "2024-01-16 09:00",
    status: "completed",
    assignedTo: "You",
    createdAt: "2024-01-14 16:20"
  },
  {
    id: "PU-005",
    customer: {
      name: "Robert Brown",
      email: "robert@example.com",
      phone: "+6015-678-9012",
      avatar: "RB"
    },
    parcelDetails: {
      type: "Books",
      weight: "4.0kg",
      dimensions: "45x35x25cm",
      value: "RM 120"
    },
    pickupAddress: "654 Cheras, Kuala Lumpur",
    preferredTime: "2024-01-16 11:00",
    status: "cancelled",
    assignedTo: "Not Assigned",
    createdAt: "2024-01-14 17:30"
  },
]

const statusOptions = [
  { value: "all", label: "All Requests" },
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "assigned", label: "Assigned", color: "bg-blue-500" },
  { value: "in-progress", label: "In Progress", color: "bg-purple-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
]

export default function PickupRequestPage() {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState(pickupRequests[0])

  const filteredRequests = selectedStatus === "all" 
    ? pickupRequests 
    : pickupRequests.filter(req => req.status === selectedStatus)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
      case "assigned":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><User className="mr-1 h-3 w-3" /> Assigned</Badge>
      case "in-progress":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200"><Truck className="mr-1 h-3 w-3" /> In Progress</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="mr-1 h-3 w-3" /> Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const stats = {
    total: pickupRequests.length,
    pending: pickupRequests.filter(r => r.status === "pending").length,
    assigned: pickupRequests.filter(r => r.status === "assigned").length,
    inProgress: pickupRequests.filter(r => r.status === "in-progress").length,
    completed: pickupRequests.filter(r => r.status === "completed").length,
    cancelled: pickupRequests.filter(r => r.status === "cancelled").length,
  }

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
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Pickup Requests</BreadcrumbPage>
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

        {/* Main Content */}
        <main className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Manage Pickup Requests</h1>
              <p className="text-muted-foreground">
                View and manage assigned pickup requests from customers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search requests..."
                  className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 md:w-[300px]"
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Requests</CardDescription>
                <CardTitle className="text-2xl">{stats.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={100} className="h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-2xl text-yellow-600">{stats.pending}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={(stats.pending / stats.total) * 100} className="h-2 bg-yellow-100" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Assigned</CardDescription>
                <CardTitle className="text-2xl text-blue-600">{stats.assigned}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={(stats.assigned / stats.total) * 100} className="h-2 bg-blue-100" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>In Progress</CardDescription>
                <CardTitle className="text-2xl text-purple-600">{stats.inProgress}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={(stats.inProgress / stats.total) * 100} className="h-2 bg-purple-100" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-2xl text-green-600">{stats.completed}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={(stats.completed / stats.total) * 100} className="h-2 bg-green-100" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Cancelled</CardDescription>
                <CardTitle className="text-2xl text-red-600">{stats.cancelled}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={(stats.cancelled / stats.total) * 100} className="h-2 bg-red-100" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - List of Requests */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pickup Requests</CardTitle>
                      <CardDescription>Your assigned pickup requests</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Status Filters */}
                  <div className="mb-6 flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={selectedStatus === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus(option.value)}
                        className="gap-2"
                      >
                        {option.color && <div className={`h-2 w-2 rounded-full ${option.color}`} />}
                        {option.label}
                      </Button>
                    ))}
                  </div>

                  {/* Requests Table */}
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Pickup Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request) => (
                          <TableRow 
                            key={request.id}
                            className={`cursor-pointer hover:bg-muted/50 ${selectedRequest.id === request.id ? 'bg-muted' : ''}`}
                            onClick={() => setSelectedRequest(request)}
                          >
                            <TableCell className="font-medium">{request.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{request.customer.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{request.customer.name}</div>
                                  <div className="text-xs text-muted-foreground">{request.customer.phone}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(request.preferredTime).toLocaleDateString()}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(request.preferredTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Request Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Request Details</CardTitle>
                  <CardDescription>Pickup request #{selectedRequest.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium">Customer Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{selectedRequest.customer.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedRequest.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedRequest.customer.email}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedRequest.customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Created: {new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pickup Details */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium">Pickup Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Address</div>
                          <div className="text-sm text-muted-foreground">{selectedRequest.pickupAddress}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-sm font-medium">Preferred Time</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(selectedRequest.preferredTime).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Assigned To</div>
                          <Badge variant="secondary">{selectedRequest.assignedTo}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parcel Details */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium">Parcel Details</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm font-medium">Type</div>
                        <div className="text-sm text-muted-foreground">{selectedRequest.parcelDetails.type}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Weight</div>
                        <div className="text-sm text-muted-foreground">{selectedRequest.parcelDetails.weight}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Dimensions</div>
                        <div className="text-sm text-muted-foreground">{selectedRequest.parcelDetails.dimensions}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Declared Value</div>
                        <div className="text-sm text-muted-foreground">{selectedRequest.parcelDetails.value}</div>
                      </div>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium">Update Status</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Clock className="mr-2 h-4 w-4" />
                        Mark Pending
                      </Button>
                      <Button variant="outline" size="sm">
                        <Truck className="mr-2 h-4 w-4" />
                        Start Pickup
                      </Button>
                      <Button variant="outline" size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t px-6 py-4">
                  <Button variant="outline">Edit Details</Button>
                  <Button>Update Status</Button>
                </CardFooter>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-sm">Today Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pickups Scheduled</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pickups Completed</span>
                      <span className="font-medium text-green-600">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending Confirmation</span>
                      <span className="font-medium text-yellow-600">2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}