"use client"

import type * as React from "react"

import { RoleBasedSidebar } from "@/components/app-sidebar"
import type { Sidebar } from "@/components/ui/sidebar"

export function CustomerSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return <RoleBasedSidebar sidebarRole="customer" {...props} />
}
