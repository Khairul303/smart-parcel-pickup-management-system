"use client"

import * as React from "react"

import supabase from "@/lib/supabase"

export type AccountRole = "customer" | "staff" | "admin"

type ProfileRow = {
  full_name?: string | null
  name?: string | null
  username?: string | null
  display_name?: string | null
  customer_name?: string | null
  role?: string | null
}

const getFirstText = (...values: unknown[]) =>
  values.find((value): value is string => {
    return typeof value === "string" && value.trim().length > 0
  })?.trim()

const getRoleFallback = (role?: string | null) => {
  if (role === "admin") return "Admin"
  if (role === "staff") return "Staff"
  return "Customer"
}

export function getDisplayName({
  profile,
  metadata,
  email,
  fallbackRole,
}: {
  profile?: ProfileRow | null
  metadata?: Record<string, unknown> | null
  email?: string | null
  fallbackRole?: string | null
}) {
  return (
    getFirstText(
      profile?.full_name,
      profile?.name,
      profile?.username,
      profile?.display_name,
      profile?.customer_name,
      metadata?.full_name,
      metadata?.name,
      metadata?.username,
      metadata?.display_name,
      metadata?.customer_name,
      email
    ) ?? getRoleFallback(profile?.role ?? fallbackRole)
  )
}

export function useCurrentUserProfile(fallbackRole: AccountRole) {
  const [displayName, setDisplayName] = React.useState(() =>
    getRoleFallback(fallbackRole)
  )
  const [role, setRole] = React.useState<string | null>(fallbackRole)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    const loadProfile = async () => {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!active) return

      if (!user) {
        setDisplayName(getRoleFallback(fallbackRole))
        setRole(fallbackRole)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle<ProfileRow>()

      if (!active) return

      setRole(profile?.role ?? fallbackRole)
      setDisplayName(
        getDisplayName({
          profile,
          metadata: user.user_metadata,
          email: user.email,
          fallbackRole,
        })
      )
      setLoading(false)
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [fallbackRole])

  return { displayName, role, loading }
}
