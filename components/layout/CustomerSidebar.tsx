"use client"

import * as React from "react"
import {
  Home,
  Package,
  Calendar,
  Bell,
  User,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { LogOut } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const customerMenuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/customer-dashboard",
  },
  {
    title: "My Parcels",
    icon: Package,
    url: "/parcel-list",
  },
  {
    title: "Pickup Schedule",
    icon: Calendar,
    url: "/pickup-scheduling",
  }
]

const handleLogout = () => {
  // Optional: clear stored session data
  localStorage.removeItem("user")
  localStorage.removeItem("token")

  // Redirect to login page
  window.location.href = "/login"
}


export function CustomerSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState("Dashboard")

  return (
    <Sidebar {...props}>
      {/* ===== Header ===== */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">PostCentre</h1>
            <p className="text-xs text-gray-500">Customer Panel</p>
          </div>
        </div>
      </SidebarHeader>

      {/* ===== Menu ===== */}
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {customerMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeItem === item.title

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={() => setActiveItem(item.title)}
                    >
                      <a
                        href={item.url}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? "bg-gray-100 dark:bg-gray-800"
                            : "hover:bg-gray-50 dark:hover:bg-gray-900"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isActive ? "text-primary" : "text-gray-500"
                          }`}
                        />
                        <span className="font-medium">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

{/* ===== Footer / Profile ===== */}
<SidebarFooter className="p-4 border-t">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="w-full">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 transition-all">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">John Smith</p>
            <p className="text-xs text-gray-500">Account</p>
          </div>
        </div>
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="start" className="w-48">
      <DropdownMenuItem asChild>
        <a href="/customer-dashboard/profile">
          <User className="mr-2 h-4 w-4" />
          View Profile
        </a>
      </DropdownMenuItem>

      <DropdownMenuItem 
        onClick={handleLogout}
        className="text-red-600 focus:text-red-600"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</SidebarFooter>


      <SidebarRail />
    </Sidebar>
  )
}