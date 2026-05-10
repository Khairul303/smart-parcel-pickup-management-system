import supabase from "@/lib/supabase"

export type UserRole = "customer" | "staff" | "admin"

export type CurrentUserProfile = {
  id: string
  email: string | null
  role: UserRole | null
  phone: string | null
}

export const ADMIN_ROLES: UserRole[] = ["admin", "staff"]
export const CUSTOMER_ROLES: UserRole[] = ["customer"]

export const getCurrentUserProfile = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    return { profile: null, error: sessionError }
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, no_telephone")
    .eq("id", session.user.id)
    .maybeSingle()

  if (error || !data) {
    return { profile: null, error }
  }

  return {
    profile: {
      id: session.user.id,
      email: session.user.email ?? null,
      role: (data.role ?? null) as UserRole | null,
      phone: data.no_telephone ?? null,
    } satisfies CurrentUserProfile,
    error: null,
  }
}

export const getRoleHome = (role?: string | null) =>
  role === "admin" || role === "staff" ? "/admin-dashboard" : "/customer-dashboard"
