import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ParcelTrack - Customer Dashboard",
  description: "Track and manage your parcels",
}

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}