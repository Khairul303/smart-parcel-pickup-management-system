"use client";

import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";

interface SearchFilterSectionProps {
  onAddParcel?: () => void;
}

export function SearchFilterSection({ onAddParcel }: SearchFilterSectionProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:w-auto">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search parcels, customers, or tracking IDs..."
          className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 md:w-[400px]"
        />
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button size="sm" onClick={onAddParcel} className="w-full sm:w-auto">
          Add New Parcel
        </Button>
      </div>
    </div>
  );
}
