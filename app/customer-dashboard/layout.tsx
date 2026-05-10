import type { Metadata } from "next"
import { RoleGate } from "@/components/auth/RoleGate"

export const metadata: Metadata = {
  title: "ParcelTrack - Customer Dashboard",
  description: "Track and manage your parcels",
}

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleGate allowedRoles={["customer"]}>{children}</RoleGate>
}
