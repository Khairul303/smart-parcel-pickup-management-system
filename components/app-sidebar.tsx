"use client"

import * as React from "react"
import {
  Home,
  Package,
  PackageCheck,
  ListChecks,
  User,
  Users,
  BarChart3,
  ClipboardList,
} from "lucide-react"
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

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/admin-dashboard",
    isActive: true,
  },
  {
    title: "Parcel Management",
    icon: PackageCheck,
    url: "/parcel-management",
  },
  {
    title: "Queue Management",
    icon: ListChecks,
    url: "/queue-management",
  },
  {
    title: "Pickup Requests",
    icon: ClipboardList,
    url: "/pickup-request",
  },
  {
    title: "Report Analytics",
    icon: BarChart3,
    url: "/report-analytics",
  },

]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState("Dashboard")

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">Parcel System</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
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
                          isActive ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${
                          isActive ? 'text-primary' : 'text-gray-500'
                        }`} />
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

      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a 
                href="/profile" 
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <User className="h-4.5 w-4.5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">View Profile</p>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}