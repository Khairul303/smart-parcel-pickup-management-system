import { RoleGate } from "@/components/auth/RoleGate"

export default function QueueManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleGate allowedRoles={["admin", "staff"]}>{children}</RoleGate>
}
