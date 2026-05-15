import supabase from "@/lib/supabase"

const isMissingNotificationsTableError = (message?: string | null) =>
  message?.toLowerCase().includes("public.notifications") &&
  message.toLowerCase().includes("schema cache")

const isMissingAudienceColumnError = (message?: string | null) =>
  message?.toLowerCase().includes("audience") &&
  (message.toLowerCase().includes("schema cache") ||
    message.toLowerCase().includes("column"))

const logNotificationWarning = (message: string, error: unknown) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message, error)
  }
}

export type CustomerNotificationType =
  | "booking_confirmation"
  | "booking_update"
  | "booking_cancelled"
  | "parcel_registered"
  | "parcel_status"
  | "queue_update"
  | "alert"
  | "system"

export interface CustomerNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: CustomerNotificationType
  related_id: string | null
  is_read: boolean
  created_at: string
  audience?: "customer" | string | null
}

export interface CreateCustomerNotificationInput {
  userId: string
  title: string
  message: string
  type: CustomerNotificationType
  relatedId?: string | null
}

type ProfileContact = {
  id: string
  email?: string | null
  no_telephone?: string | null
}

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? ""

export const createCustomerNotification = async ({
  userId,
  title,
  message,
  type,
  relatedId = null,
}: CreateCustomerNotificationInput) => {
  if (!userId) return null

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      audience: "customer",
      title,
      message,
      type,
      related_id: relatedId,
      is_read: false,
    })
    .select()
    .maybeSingle()

  if (error) {
    if (isMissingNotificationsTableError(error.message)) return null
    if (isMissingAudienceColumnError(error.message)) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          title,
          message,
          type,
          related_id: relatedId,
          is_read: false,
        })
        .select()
        .maybeSingle()

      if (fallbackError) {
        if (isMissingNotificationsTableError(fallbackError.message)) return null

        logNotificationWarning("Customer notification was skipped:", fallbackError)
        return null
      }

      return fallbackData as CustomerNotification | null
    }

    logNotificationWarning("Customer notification was skipped:", error)
    return null
  }

  return data as CustomerNotification | null
}

export const createNotificationForCurrentUser = async (
  input: Omit<CreateCustomerNotificationInput, "userId">
) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    if (error) logNotificationWarning("Unable to load current user for notification:", error)
    return null
  }

  return createCustomerNotification({
    ...input,
    userId: user.id,
  })
}

const findProfileByEmail = async (email?: string | null) => {
  const cleanEmail = normalize(email)
  if (!cleanEmail) return null

  const { data, error } = await supabase
    .from("profile_with_email")
    .select("id, email, no_telephone")
    .ilike("email", cleanEmail)
    .maybeSingle()

  if (error) {
    logNotificationWarning("Customer profile lookup by email was skipped:", error)
    return null
  }

  return data as ProfileContact | null
}

const findProfileByPhone = async (phone?: string | null) => {
  const cleanPhone = normalize(phone)
  if (!cleanPhone) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("id, no_telephone")
    .eq("no_telephone", phone)
    .maybeSingle()

  if (error) {
    logNotificationWarning("Customer profile lookup by phone was skipped:", error)
    return null
  }

  return data as ProfileContact | null
}

export const resolveCustomerUserId = async ({
  email,
  phone,
}: {
  email?: string | null
  phone?: string | null
}) => {
  const byEmail = await findProfileByEmail(email)
  if (byEmail?.id) return byEmail.id

  const byPhone = await findProfileByPhone(phone)
  return byPhone?.id ?? null
}

export const createCustomerNotificationByContact = async ({
  email,
  phone,
  ...notification
}: Omit<CreateCustomerNotificationInput, "userId"> & {
  email?: string | null
  phone?: string | null
}) => {
  const userId = await resolveCustomerUserId({ email, phone })
  if (!userId) return null

  return createCustomerNotification({
    ...notification,
    userId,
  })
}
