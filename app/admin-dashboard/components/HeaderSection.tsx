"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function HeaderSection() {
  return (
    <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center gap-2 border-b bg-background px-3 py-2 sm:px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="mr-2 hidden h-6 sm:block" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/admin-dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
