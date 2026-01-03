"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import {
  HeaderSection,
  WelcomeSection,
  SearchFilterSection,
  StatsSection,
  TodayActivitySection,
  RecentParcelsSection,
  PerformanceMetricsSection,
  QuickActionsSection,
} from "./components";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        // 1️⃣ Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          window.location.replace("/login");
          return;
        }

        // 2️⃣ Get user role from profiles
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error || !profile) {
          window.location.replace("/login");
          return;
        }

        // 3️⃣ Allow ONLY staff
        if (profile.role !== "staff") {
          window.location.replace("/customer-dashboard");
          return;
        }

        // 4️⃣ Access granted
        if (isMounted) {
          setUserRole(profile.role);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        window.location.replace("/login");
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddParcel = () => {
    window.location.href = "/parcel-management";
  };

  // 🔄 Loading screen
  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Checking permissions...</p>
              {userRole && (
                <p className="text-sm text-muted-foreground">
                  Detected role: {userRole}
                </p>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // ✅ STAFF ONLY CONTENT
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <HeaderSection />

        <main className="flex-1 space-y-6 p-6">
          <WelcomeSection />

          <SearchFilterSection onAddParcel={handleAddParcel} />

          <StatsSection />

          <TodayActivitySection />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <RecentParcelsSection />
            <PerformanceMetricsSection />
            <QuickActionsSection />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
