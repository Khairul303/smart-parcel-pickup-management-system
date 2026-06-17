"use client";

import { Button } from "@/components/ui/button";

interface SearchFilterSectionProps {
  onAddParcel?: () => void;
}

export function SearchFilterSection({ onAddParcel }: SearchFilterSectionProps) {
  return (
    <div className="flex justify-end">
      <Button size="sm" onClick={onAddParcel} className="w-full sm:w-auto">
        Add New Parcel
      </Button>
    </div>
  );
}
