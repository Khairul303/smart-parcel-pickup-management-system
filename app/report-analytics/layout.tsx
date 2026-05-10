import { RoleGate } from "@/components/auth/RoleGate"

export default function ReportAnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleGate allowedRoles={["admin", "staff"]}>{children}</RoleGate>
}
