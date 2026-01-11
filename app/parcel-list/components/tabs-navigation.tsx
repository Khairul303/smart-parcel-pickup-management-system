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
      (p) => p.status === "arrived" || p.status === "ready-for-pickup"
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
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          All ({counts.all})
        </TabsTrigger>

        <TabsTrigger value="notarrived">
          Not Arrived ({counts.notarrived})
        </TabsTrigger>

        <TabsTrigger value="postcenter">
          Ready to Pickup ({counts.postcenter})
        </TabsTrigger>

        <TabsTrigger value="completed">
          Completed ({counts.completed})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
