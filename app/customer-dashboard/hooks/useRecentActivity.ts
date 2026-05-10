"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import supabase from "@/lib/supabase"
import {
  belongsToCustomerContact,
  buildCustomerParcelOrFilter,
  type CustomerContact,
} from "@/lib/customer-data"

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

const getActivityDate = (parcel: RecentActivityParcel) =>
  parcel.updated_at ?? parcel.created_at ?? ""

const sortActivities = (items: RecentActivityParcel[]) =>
  [...items].sort(
    (a, b) =>
      new Date(getActivityDate(b)).getTime() -
      new Date(getActivityDate(a)).getTime()
  )

export function useRecentActivity(limit = 5) {
  const [activities, setActivities] = useState<RecentActivityParcel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const limitedActivities = useMemo(
    () => sortActivities(activities).slice(0, limit),
    [activities, limit]
  )

  const loadActivities = useCallback(
    async (customerProfile: CustomerContact | null) => {
      setError(null)

      if (!customerProfile) {
        setActivities([])
        setLoading(false)
        return
      }

      const customerFilter = buildCustomerParcelOrFilter(customerProfile)

      if (!customerFilter) {
        setActivities([])
        setLoading(false)
        return
      }

      const { data, error: parcelsError } = await supabase
        .from("parcels")
        .select("*")
        .or(customerFilter)
        .order("created_at", { ascending: false })
        .limit(30)

      if (parcelsError) {
        setError(parcelsError.message)
        setActivities([])
        setLoading(false)
        return
      }

      const filtered = ((data ?? []) as RecentActivityParcel[]).filter(
        (parcel) => belongsToCustomerContact(parcel, customerProfile)
      )

      setActivities(sortActivities(filtered))
      setLoading(false)
    },
    []
  )

  useEffect(() => {
    let active = true
    let currentProfile: CustomerContact | null = null

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
          id: user.id,
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

          if (
            !currentProfile ||
            !belongsToCustomerContact(nextParcel, currentProfile)
          ) {
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
