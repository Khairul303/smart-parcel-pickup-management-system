import supabase from "@/lib/supabase"

export type AdminNotificationType =
  | "new_booking"
  | "queue_updated"
  | "booking_cancelled"
  | "parcel_status_updated"
  | "parcel_collected"
  | "pickup_booking_created"
  | "pickup_booking_updated"
  | "pickup_booking_cancelled"
  | "pickup_queue_updated"
  | "booking_confirmation"
  | "booking_update"
  | "booking_cancelled"
  | "parcel_registered"
  | "parcel_status"
  | "queue_update"
  | "alert"
  | "system"

type CreateAdminNotificationInput = {
  title: string
  message: string
  type: AdminNotificationType
  relatedId?: string | null
  relatedBookingId?: string | null
  relatedTrackingId?: string | null
  relatedQueueNumber?: string | null
}

const isMissingColumnError = (message?: string | null, column?: string) =>
  Boolean(
    column &&
      message?.toLowerCase().includes(column.toLowerCase()) &&
      (message.toLowerCase().includes("schema cache") ||
        message.toLowerCase().includes("column"))
  )

const isMissingNotificationsTableError = (message?: string | null) =>
  message?.toLowerCase().includes("public.notifications") &&
  message.toLowerCase().includes("schema cache")

const logNotificationWarning = (message: string, error: unknown) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message, error)
  }
}

export const createAdminNotification = async ({
  title,
  message,
  type,
  relatedId = null,
  relatedBookingId = null,
  relatedTrackingId = null,
  relatedQueueNumber = null,
}: CreateAdminNotificationInput) => {
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "create_admin_notification",
    {
      p_title: title,
      p_message: message,
      p_type: type,
      p_related_id: relatedId,
      p_related_booking_id: relatedBookingId,
      p_related_tracking_id: relatedTrackingId,
      p_related_queue_number: relatedQueueNumber,
    }
  )

  if (!rpcError) return rpcData

  const rpcUnavailable =
    rpcError.message?.toLowerCase().includes("create_admin_notification") ||
    rpcError.message?.toLowerCase().includes("schema cache") ||
    rpcError.message?.toLowerCase().includes("function")

  if (!rpcUnavailable) {
    logNotificationWarning("Admin notification RPC was skipped:", rpcError)
  }

  const basePayload = {
    user_id: null,
    title,
    message,
    type,
    related_id: relatedId,
    is_read: false,
  }

  const payloads = [
    {
      ...basePayload,
      audience: "admin",
      role_target: "staff",
      category: "operations",
      related_booking_id: relatedBookingId,
      related_parcel_id: relatedTrackingId,
      related_queue_id: relatedQueueNumber,
      related_tracking_id: relatedTrackingId,
      related_queue_number: relatedQueueNumber,
    },
    { ...basePayload, audience: "admin" },
    basePayload,
  ]

  for (const payload of payloads) {
    const { data, error } = await supabase
      .from("notifications")
      .insert(payload)
      .select()
      .maybeSingle()

    if (!error) return data
    if (isMissingNotificationsTableError(error.message)) return null

    const canFallback =
      isMissingColumnError(error.message, "audience") ||
      isMissingColumnError(error.message, "role_target") ||
      isMissingColumnError(error.message, "category") ||
      isMissingColumnError(error.message, "related_parcel_id") ||
      isMissingColumnError(error.message, "related_queue_id")

    if (!canFallback) {
      logNotificationWarning("Admin notification was skipped:", error)
      return null
    }
  }

  return null
}
