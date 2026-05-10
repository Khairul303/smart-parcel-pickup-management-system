"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import supabase from "@/lib/supabase"
import {
  belongsToCustomerContact,
  buildCustomerParcelOrFilter,
  type CustomerContact,
} from "@/lib/customer-data"

export type UserTrackingParcel = {
  id: string
  tracking_id: string
  sender?: string | null
  receiver?: string | null
  receiver_email?: string | null
  receiver_phone?: string | null
  user_id?: string | null
  customer_id?: string | null
  profile_id?: string | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
}

const sortByNewest = (items: UserTrackingParcel[]) =>
  [...items].sort(
    (a, b) =>
      new Date(b.updated_at ?? b.created_at ?? "").getTime() -
      new Date(a.updated_at ?? a.created_at ?? "").getTime()
  )

export function useUserTrackingIds() {
  const [trackingParcels, setTrackingParcels] = useState<UserTrackingParcel[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const trackingIds = useMemo(
    () =>
      sortByNewest(trackingParcels)
        .map((parcel) => parcel.tracking_id)
        .filter(Boolean),
    [trackingParcels]
  )

  const loadTrackingIds = useCallback(async () => {
    setLoading(true)
    setError(null)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setError("Unable to load your tracking IDs.")
      setTrackingParcels([])
      setLoading(false)
      return
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("no_telephone")
      .eq("id", user.id)
      .maybeSingle()

    const profile: CustomerContact = {
      id: user.id,
      email: user.email ?? null,
      phone: profileData?.no_telephone ?? null,
    }
    const customerFilter = buildCustomerParcelOrFilter(profile)

    if (!customerFilter) {
      setTrackingParcels([])
      setLoading(false)
      return
    }

    const { data, error: parcelsError } = await supabase
      .from("parcels")
      .select("*")
      .or(customerFilter)
      .order("created_at", { ascending: false })

    if (parcelsError) {
      setError("Unable to load registered tracking IDs.")
      setTrackingParcels([])
      setLoading(false)
      return
    }

    const filtered = ((data ?? []) as UserTrackingParcel[]).filter((parcel) =>
      belongsToCustomerContact(parcel, profile)
    )

    setTrackingParcels(sortByNewest(filtered))
    setLoading(false)
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadTrackingIds)
  }, [loadTrackingIds])

  return {
    trackingIds,
    trackingParcels,
    loading,
    error,
    refresh: loadTrackingIds,
  }
}
