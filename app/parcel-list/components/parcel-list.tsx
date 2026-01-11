"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { SearchFilter } from "./search-filter"
import { TabsNavigation, ParcelTab } from "./tabs-navigation"
import { ParcelCard } from "./parcel-card"
import { EmptyState } from "./empty-state"
import { Parcel } from "../types"

interface ParcelsListProps {
  parcels: Parcel[]
  searchQuery: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onViewDetails: (parcel: Parcel) => void
  onExtendPickup: (parcelId: string) => void
  onRequestRedelivery: (parcelId: string) => void
}

export function ParcelsList({
  parcels,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onViewDetails,
  onExtendPickup,
  onRequestRedelivery,
}: ParcelsListProps) {
  const [activeTab, setActiveTab] = useState<ParcelTab>("all")

  const getFilteredParcels = () => {
    let filtered = parcels

    switch (activeTab) {
      case "notarrived":
        filtered = parcels.filter(
          (p) => p.status === "pending" || p.status === "in-transit"
        )
        break

      case "postcenter":
        filtered = parcels.filter(
          (p) => p.status === "arrived" || p.status === "ready-for-pickup"
        )
        break

      case "completed":
        filtered = parcels.filter((p) => p.status === "delivered")
        break
    }

    return filtered.filter((parcel) => {
      const matchesSearch =
        parcel.tracking_id
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        parcel.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parcel.receiver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        parcel.id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || parcel.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }

  const filteredParcels = getFilteredParcels()
  const hasSearchOrFilter = searchQuery || statusFilter !== "all"

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-2xl font-bold">
          My Parcels
        </CardTitle>
        <CardDescription>
          Track and manage all your parcels in one place
        </CardDescription>

        <SearchFilter
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={onSearchChange}
          onStatusFilterChange={onStatusFilterChange}
        />
      </CardHeader>

      <CardContent className="pt-6">
        <TabsNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          parcels={parcels}
        />

        <div className="my-6 text-sm text-gray-600">
          Showing <b>{filteredParcels.length}</b> of{" "}
          <b>{parcels.length}</b> parcels
        </div>

        {filteredParcels.length > 0 ? (
          filteredParcels.map((parcel) => (
            <ParcelCard
              key={parcel.id}
              parcel={parcel}
              onViewDetails={onViewDetails}
              onExtendPickup={onExtendPickup}
              onRequestRedelivery={onRequestRedelivery}
            />
          ))
        ) : (
          <EmptyState
            type={hasSearchOrFilter ? "search" : activeTab}
            onReset={
              hasSearchOrFilter
                ? () => {
                    onSearchChange("")
                    onStatusFilterChange("all")
                  }
                : undefined
            }
          />
        )}
      </CardContent>
    </Card>
  )
}
