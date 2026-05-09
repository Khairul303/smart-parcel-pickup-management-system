"use client"
import { useEffect, useState } from "react"
import { Calendar, Phone, Mail, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import supabase from "@/lib/supabase"

interface CustomerProfile {
  fullName: string
  email: string
  phone: string | null
  memberSince: string | null
}

export function CustomerInfo() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      setLoading(true)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        if (active) {
          setProfile(null)
          setLoading(false)
        }
        return
      }

      const { data: customerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, no_telephone, created_at")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Failed to load customer profile:", profileError)
      }

      if (active) {
        setProfile({
          fullName:
            customerProfile?.full_name ??
            user.user_metadata?.full_name ??
            "Not provided",
          email: user.email ?? "Not provided",
          phone: customerProfile?.no_telephone ?? null,
          memberSince: customerProfile?.created_at ?? user.created_at ?? null,
        })
        setLoading(false)
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [])

  const initials =
    profile?.fullName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CU"

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Not available"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
        <CardDescription>Details from your signed-in account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">
            Loading your account information...
          </div>
        ) : profile ? (
          <>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate font-semibold">{profile.fullName}</div>
                <div className="text-sm text-gray-500">Customer</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="min-w-0 truncate">{profile.fullName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                <span className={!profile.phone ? "text-muted-foreground" : ""}>
                  {profile.phone || "Phone number not provided"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="min-w-0 truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                <span>Member since {formatDate(profile.memberSince)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            Sign in to view your account information.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
