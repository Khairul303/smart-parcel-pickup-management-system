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
  UserPlus,
  Filter,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  Star,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Shield,
  Award,
  UserCheck,
  UserX,
  CreditCard,
  Activity,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/* =======================
   TYPES
======================= */
interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  joinDate: string
  totalOrders: number
  totalSpent: number
  status: 'active' | 'inactive' | 'vip' | 'premium'
  lastOrder: string
  avatar: string
  customerType: 'individual' | 'business'
  satisfaction: number
}

/* =======================
   SAMPLE DATA
======================= */
const initialCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+6012-345-6789',
    address: '123 Main Street, Kuala Lumpur',
    joinDate: '2023-01-15',
    totalOrders: 24,
    totalSpent: 12500,
    status: 'vip',
    lastOrder: '2024-01-14',
    avatar: 'JS',
    customerType: 'individual',
    satisfaction: 4.8
  },
  {
    id: 'CUST-002',
    name: 'ABC Corporation',
    email: 'contact@abccorp.com',
    phone: '+603-1234-5678',
    address: '456 Business Park, Petaling Jaya',
    joinDate: '2022-05-20',
    totalOrders: 156,
    totalSpent: 89500,
    status: 'premium',
    lastOrder: '2024-01-14',
    avatar: 'AC',
    customerType: 'business',
    satisfaction: 4.9
  },
  {
    id: 'CUST-003',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+6012-987-6543',
    address: '789 Residential Area, Bangsar',
    joinDate: '2023-08-10',
    totalOrders: 12,
    totalSpent: 4500,
    status: 'active',
    lastOrder: '2024-01-13',
    avatar: 'SJ',
    customerType: 'individual',
    satisfaction: 4.5
  },
  {
    id: 'CUST-004',
    name: 'XYZ Enterprises',
    email: 'info@xyzent.com',
    phone: '+603-8765-4321',
    address: '101 Industrial Zone, Shah Alam',
    joinDate: '2021-11-30',
    totalOrders: 89,
    totalSpent: 67200,
    status: 'premium',
    lastOrder: '2024-01-12',
    avatar: 'XE',
    customerType: 'business',
    satisfaction: 4.7
  },
  {
    id: 'CUST-005',
    name: 'Mike Davis',
    email: 'mike.davis@example.com',
    phone: '+6013-456-7890',
    address: '222 Taman Tun, Kuala Lumpur',
    joinDate: '2024-01-05',
    totalOrders: 3,
    totalSpent: 1200,
    status: 'active',
    lastOrder: '2024-01-11',
    avatar: 'MD',
    customerType: 'individual',
    satisfaction: 4.2
  },
  {
    id: 'CUST-006',
    name: 'Global Logistics',
    email: 'support@globallogistics.com',
    phone: '+603-5555-7777',
    address: '333 Port Area, Port Klang',
    joinDate: '2020-03-15',
    totalOrders: 245,
    totalSpent: 187000,
    status: 'vip',
    lastOrder: '2024-01-10',
    avatar: 'GL',
    customerType: 'business',
    satisfaction: 4.9
  },
  {
    id: 'CUST-007',
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    phone: '+6014-567-8901',
    address: '444 Condo Residence, Mont Kiara',
    joinDate: '2023-06-22',
    totalOrders: 8,
    totalSpent: 3200,
    status: 'active',
    lastOrder: '2024-01-09',
    avatar: 'EW',
    customerType: 'individual',
    satisfaction: 4.3
  },
  {
    id: 'CUST-008',
    name: 'Tech Solutions',
    email: 'sales@techsolutions.com',
    phone: '+603-2222-3333',
    address: '555 Tech Park, Cyberjaya',
    joinDate: '2022-09-18',
    totalOrders: 76,
    totalSpent: 54800,
    status: 'premium',
    lastOrder: '2024-01-08',
    avatar: 'TS',
    customerType: 'business',
    satisfaction: 4.6
  },
]

/* =======================
   COMPONENT
======================= */
export default function ViewCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter
    const matchesType = typeFilter === "all" || customer.customerType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate statistics
  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active' || c.status === 'premium' || c.status === 'vip').length,
    vipCustomers: customers.filter(c => c.status === 'vip').length,
    businessCustomers: customers.filter(c => c.customerType === 'business').length,
    totalRevenue: customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
    avgSatisfaction: customers.reduce((sum, customer) => sum + customer.satisfaction, 0) / customers.length
  }

  // Get status badge
  const getStatusBadge = (status: Customer['status']) => {
    const config = {
      active: { color: "bg-green-100 text-green-800", icon: <UserCheck className="h-3 w-3" />, label: "Active" },
      inactive: { color: "bg-gray-100 text-gray-800", icon: <UserX className="h-3 w-3" />, label: "Inactive" },
      vip: { color: "bg-purple-100 text-purple-800", icon: <Award className="h-3 w-3" />, label: "VIP" },
      premium: { color: "bg-blue-100 text-blue-800", icon: <Shield className="h-3 w-3" />, label: "Premium" }
    }
    
    return (
      <Badge className={`${config[status].color} gap-1`}>
        {config[status].icon}
        {config[status].label}
      </Badge>
    )
  }

  // Get type badge
  const getTypeBadge = (type: Customer['customerType']) => {
    return (
      <Badge variant="outline" className={
        type === 'business' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50'
      }>
        {type === 'business' ? 'Business' : 'Individual'}
      </Badge>
    )
  }

  const handleExportCustomers = () => {
    alert(`Exporting ${filteredCustomers.length} customers...`)
  }

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      setCustomers(prev => prev.filter(c => c.id !== customerId))
      alert("Customer deleted successfully")
    }
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
                  <BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>View Customers</BreadcrumbPage>
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
              <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage and view all customer information and analytics
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Customer
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Customers
                </CardDescription>
                <CardTitle className="text-2xl">{stats.totalCustomers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {stats.activeCustomers} active • {stats.vipCustomers} VIP
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardDescription>
                <CardTitle className="text-2xl">${(stats.totalRevenue / 1000).toFixed(0)}K</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  From all customer transactions
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  VIP Customers
                </CardDescription>
                <CardTitle className="text-2xl">{stats.vipCustomers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {stats.businessCustomers} business accounts
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Avg Satisfaction
                </CardDescription>
                <CardTitle className="text-2xl">{stats.avgSatisfaction.toFixed(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(stats.avgSatisfaction)
                          ? 'fill-amber-500 text-amber-500'
                          : 'fill-muted text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportCustomers}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>
                Showing {filteredCustomers.length} of {customers.length} customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{customer.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-xs text-muted-foreground">{customer.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{customer.totalOrders}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last: {new Date(customer.lastOrder).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${customer.totalSpent.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          Joined: {new Date(customer.joinDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>{getTypeBadge(customer.customerType)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setShowCustomerDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                              <DropdownMenuItem>View Orders</DropdownMenuItem>
                              <DropdownMenuItem>Send Message</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Customer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Page 1 of 1
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </main>
      </SidebarInset>

      {/* Customer Detail Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-2xl">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>Customer Details</DialogTitle>
                <DialogDescription>
                  Complete information for {selectedCustomer.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Customer Profile */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>{selectedCustomer.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                      {getStatusBadge(selectedCustomer.status)}
                    </div>
                    <p className="text-muted-foreground">{selectedCustomer.id} • {getTypeBadge(selectedCustomer.customerType)}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">{selectedCustomer.satisfaction}</span>
                        <span className="text-sm text-muted-foreground">/5.0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Joined {new Date(selectedCustomer.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Information</Label>
                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{selectedCustomer.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Statistics */}
                  <div className="space-y-2">
                    <Label>Order Statistics</Label>
                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Orders</span>
                        <span className="font-bold">{selectedCustomer.totalOrders}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Spent</span>
                        <span className="font-bold">${selectedCustomer.totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Order Value</span>
                        <span className="font-bold">
                          ${(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Order</span>
                        <span className="font-medium">
                          {new Date(selectedCustomer.lastOrder).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-2">
                  <Label>Recent Activity</Label>
                  <div className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Parcel PK-2024-001 delivered</span>
                      <span className="text-muted-foreground">2 days ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>New pickup request created</span>
                      <span className="text-muted-foreground">5 days ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Customer satisfaction survey completed</span>
                      <span className="text-muted-foreground">1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline">Edit Profile</Button>
                <Button>Send Message</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}