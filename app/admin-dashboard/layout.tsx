import { RoleGate } from "@/components/auth/RoleGate"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleGate allowedRoles={["admin", "staff"]}>{children}</RoleGate>
}
