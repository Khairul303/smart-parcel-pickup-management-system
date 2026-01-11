import { Badge } from "@/components/ui/badge"
import { statusConfig } from "../types"

interface StatusBadgeProps {
  status: keyof typeof statusConfig
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant={config.variant} 
      className={`gap-1 ${config.colorClass || ''}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}