"use client"

import * as React from "react"
import {
  Calendar,
  Home,
  Package,
  PackageCheck,
  ListChecks,
  User,
  BarChart3,
  ClipboardList,
  LogOut
} from "lucide-react"
import { usePathname } from "next/navigation"
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrentUserProfile } from "@/hooks/use-current-user-profile"
import { PostCentreTitleLogo } from "@/components/postcentre-title-logo"
import { CustomerProfileDialog } from "@/components/layout/customer-profile-dialog"
import type { AccountRole } from "@/hooks/use-current-user-profile"

const handleLogout = () => {
  // Optional: clear stored session data
  localStorage.removeItem("user")
  localStorage.removeItem("token")

  // Redirect to login page
  window.location.href = "/login"
}


type SidebarRole = "customer" | "staff"

const staffMenuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/admin-dashboard",
  },
  {
    title: "Parcel Management",
    icon: PackageCheck,
    url: "/parcel-management",
  },
  {
    title: "Pickup Management",
    icon: ListChecks,
    url: "/queue-management",
  },
  {
    title: "Pickup Records",
    icon: ClipboardList,
    url: "/pickup-records",
  },
  {
    title: "Report Analytics",
    icon: BarChart3,
    url: "/report-analytics",
  },

]

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
  },
]

const isActiveRoute = (pathname: string, url: string) =>
  pathname === url || pathname.startsWith(`${url}/`)

export function RoleBasedSidebar({
  sidebarRole: roleOverride,
  ...props
}: React.ComponentProps<typeof Sidebar> & { sidebarRole?: SidebarRole }) {
  const pathname = usePathname()
  const fallbackRole: AccountRole = roleOverride === "customer" ? "customer" : "staff"
  const { displayName, role } = useCurrentUserProfile(fallbackRole)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const isCustomer = roleOverride
    ? roleOverride === "customer"
    : role === "customer"
  const menuItems = isCustomer ? customerMenuItems : staffMenuItems
  const accountLabel = role === "admin" ? "Admin Account" : "Staff Account"
  const panelTitle = isCustomer ? "PostCentre" : "Staff Panel"
  const panelSubtitle = isCustomer ? "Customer Panel" : undefined

  return (
    <>
      <Sidebar {...props}>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <PostCentreTitleLogo className="h-10 w-24" />
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold">{panelTitle}</h1>
              {panelSubtitle && (
                <p className="text-xs text-muted-foreground">{panelSubtitle}</p>
              )}
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveRoute(pathname, item.url)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <a
                          href={item.url}
                          aria-current={isActive ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                            isActive
                              ? "bg-gray-100 text-primary dark:bg-gray-800"
                              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-gray-500"}`} />
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

        <SidebarFooter className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full">
                <div className="flex items-center gap-3 rounded-lg px-3 py-3 transition-all hover:bg-gray-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-gray-500">
                      {isCustomer ? "View profile" : "Account"}
                    </p>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-48">
              {isCustomer ? (
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  {accountLabel}
                </DropdownMenuItem>
              )}

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

      {isCustomer && (
        <CustomerProfileDialog
          open={profileOpen}
          onOpenChange={setProfileOpen}
        />
      )}
    </>
  )
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return <RoleBasedSidebar sidebarRole="staff" {...props} />
}
