interface EmptyStateProps {
  type:
    | "search"
    | "all"
    | "notarrived"
    | "postcenter"
    | "completed"
  onReset?: () => void
}

export function EmptyState({ type, onReset }: EmptyStateProps) {
  const messages: Record<string, string> = {
    search: "No parcels match your search criteria.",
    all: "No parcels found.",
    notarrived: "No parcels waiting to arrive.",
    postcenter: "No parcels ready for pickup.",
    completed: "No completed parcels yet.",
  }

  return (
    <div className="text-center py-12 text-gray-500">
      <p className="mb-4">{messages[type]}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="text-primary hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
