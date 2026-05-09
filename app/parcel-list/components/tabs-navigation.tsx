import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Parcel } from "../types"

/* =====================
   TAB TYPE (SHARED)
===================== */
export type ParcelTab =
  | "all"
  | "notarrived"
  | "postcenter"
  | "completed"

interface TabsNavigationProps {
  activeTab: ParcelTab
  onTabChange: (value: ParcelTab) => void
  parcels: Parcel[]
}

export function TabsNavigation({
  activeTab,
  onTabChange,
  parcels,
}: TabsNavigationProps) {
  const counts = {
    all: parcels.length,
    notarrived: parcels.filter(
      (p) => p.status === "pending" || p.status === "in-transit"
    ).length,
    postcenter: parcels.filter(
      (p) => p.status === "ready" || p.status === "ready-for-pickup"
    ).length,
    completed: parcels.filter(
      (p) => p.status === "delivered"
    ).length,
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as ParcelTab)}
    >
      <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4">
        <TabsTrigger value="all" className="min-w-0 text-xs sm:text-sm">
          All <span className="ml-1">({counts.all})</span>
        </TabsTrigger>

        <TabsTrigger value="notarrived" className="min-w-0 text-xs sm:text-sm">
          Not Arrived <span className="ml-1">({counts.notarrived})</span>
        </TabsTrigger>

        <TabsTrigger value="postcenter" className="min-w-0 text-xs sm:text-sm">
          <span className="truncate">Ready to Pickup</span>
          <span className="ml-1">({counts.postcenter})</span>
        </TabsTrigger>

        <TabsTrigger value="completed" className="min-w-0 text-xs sm:text-sm">
          Completed <span className="ml-1">({counts.completed})</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
