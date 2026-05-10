import { RoleGate } from "@/components/auth/RoleGate"

export default function PickupRecordsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleGate allowedRoles={["admin", "staff"]}>{children}</RoleGate>
}
