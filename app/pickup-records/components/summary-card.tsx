import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface SummaryCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  color?: string
  trend?: string
  progress?: number
  progressColor?: string
}

export function SummaryCard({
  title,
  value,
  icon,
  description,
  color,
  trend,
  progress,
  progressColor,
}: SummaryCardProps) {
  return (
    <Card className="border shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend && (
              <p className="text-xs text-amber-600 font-medium mt-2">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color || 'bg-gray-100'} text-white`}>
            {icon}
          </div>
        </div>
        {progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className={`h-2 ${progressColor || ''}`} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}