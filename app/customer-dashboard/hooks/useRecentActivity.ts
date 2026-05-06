"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import supabase from "@/lib/supabase"

export type RecentActivityParcel = {
  id: string
  tracking_id: string
  sender: string | null
  receiver: string | null
  receiver_email?: string | null
  receiver_phone?: string | null
  status: string
  priority: string | null
  created_at: string | null
  updated_at: string | null
}

type CustomerProfile = {
  email: string | null
  phone: string | null
}

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? ""

const getActivityDate = (parcel: RecentActivityParcel) =>
  parcel.updated_at ?? parcel.created_at ?? ""

const sortActivities = (items: RecentActivityParcel[]) =>
  [...items].sort(
    (a, b) =>
      new Date(getActivityDate(b)).getTime() -
      new Date(getActivityDate(a)).getTime()
  )

const belongsToCustomer = (
  parcel: RecentActivityParcel,
  profile: CustomerProfile | null
) => {
  if (!profile) return true

  const email = normalize(profile.email)
  const phone = normalize(profile.phone)
  const parcelEmail = normalize(parcel.receiver_email)
  const parcelPhone = normalize(parcel.receiver_phone)

  if (email && parcelEmail) return parcelEmail === email
  if (phone && parcelPhone) return parcelPhone === phone

  return true
}

export function useRecentActivity(limit = 5) {
  const [activities, setActivities] = useState<RecentActivityParcel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const limitedActivities = useMemo(
    () => sortActivities(activities).slice(0, limit),
    [activities, limit]
  )

  const loadActivities = useCallback(
    async (customerProfile: CustomerProfile | null) => {
      setError(null)

      const { data, error: parcelsError } = await supabase
        .from("parcels")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30)

      if (parcelsError) {
        setError(parcelsError.message)
        setActivities([])
        setLoading(false)
        return
      }

      const filtered = ((data ?? []) as RecentActivityParcel[]).filter(
        (parcel) => belongsToCustomer(parcel, customerProfile)
      )

      setActivities(sortActivities(filtered))
      setLoading(false)
    },
    []
  )

  useEffect(() => {
    let active = true
    let currentProfile: CustomerProfile | null = null

    const load = async () => {
      setLoading(true)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("no_telephone")
          .eq("id", user.id)
          .maybeSingle()

        currentProfile = {
          email: user.email ?? null,
          phone: profileData?.no_telephone ?? null,
        }
      }

      if (active) loadActivities(currentProfile)
    }

    load()

    const channel = supabase
      .channel("customer-dashboard-recent-activity")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "parcels",
        },
        (payload) => {
          const eventType = payload.eventType

          if (eventType === "DELETE") {
            const oldParcel = payload.old as Partial<RecentActivityParcel>
            setActivities((prev) =>
              prev.filter((activity) => activity.id !== oldParcel.id)
            )
            return
          }

          const nextParcel = payload.new as RecentActivityParcel

          if (!belongsToCustomer(nextParcel, currentProfile)) {
            setActivities((prev) =>
              prev.filter((activity) => activity.id !== nextParcel.id)
            )
            return
          }

          setActivities((prev) => {
            const withoutCurrent = prev.filter(
              (activity) => activity.id !== nextParcel.id
            )
            return sortActivities([nextParcel, ...withoutCurrent])
          })
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          setError("Unable to connect to recent activity updates.")
        }
      })

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [loadActivities])

  return {
    activities: limitedActivities,
    loading,
    error,
  }
}
