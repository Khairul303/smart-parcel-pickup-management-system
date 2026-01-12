"use client"

import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  X,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface CustomerProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UserProfile {
  fullName: string
  email: string
  phone: string | null
  joinDate: string
  status: "active" | "inactive"
  avatarUrl?: string | null
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CustomerProfileDialog({
  open,
  onOpenChange,
}: CustomerProfileDialogProps) {
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  /* ------------------------------ Helpers ---------------------------------- */

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  /* ------------------------------ Fetch profile ---------------------------- */

  useEffect(() => {
    if (!open) return

    const fetchProfile = async () => {
      setLoading(true)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setLoading(false)
        return
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, no_telephone, created_at")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Profile fetch error:", error)
        setLoading(false)
        return
      }

      setUserData({
        fullName: profile.full_name ?? "Unknown User",
        email: user.email ?? "N/A",
        phone: profile.no_telephone,
        joinDate: profile.created_at,
        status: user.confirmed_at ? "active" : "inactive",
        avatarUrl: null,
      })

      setLoading(false)
    }

    fetchProfile()
  }, [open])

  /* ------------------------------ Loading ---------------------------------- */

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <VisuallyHidden>
            <DialogTitle>Customer Profile</DialogTitle>
          </VisuallyHidden>

          <p className="text-sm text-muted-foreground">
            Loading profile…
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  if (!userData) return null

  /* ------------------------------ UI --------------------------------------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[400px] p-0 rounded-xl">
        {/* Header */}
        <DialogHeader className="relative p-6 pb-4">
          <DialogTitle className="text-2xl font-bold">
            Customer Profile
          </DialogTitle>
          <DialogDescription>
            Account information
          </DialogDescription>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-7 w-7"
            onClick={() => onOpenChange(false)}
          >
          </Button>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Avatar */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-20 w-20 border-4 shadow">
              <AvatarImage src={userData.avatarUrl ?? undefined} />
              <AvatarFallback className="font-semibold">
                {getInitials(userData.fullName)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-xl font-bold">
                {userData.fullName}
              </h2>
              <Badge
                variant={userData.status === "active" ? "default" : "secondary"}
                className="mt-1 gap-1"
              >
                <CheckCircle className="h-3 w-3" />
                {userData.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Personal Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">Personal Information</h3>

            <InfoItem
              icon={<User className="h-4 w-4" />}
              label="Full Name"
              value={userData.fullName}
            />

            <InfoItem
              icon={<Mail className="h-4 w-4 text-blue-600" />}
              label="Email"
              value={userData.email}
            />

            <InfoItem
              icon={<Phone className="h-4 w-4 text-gray-600" />}
              label="Phone Number"
              value={userData.phone || "Not provided"}
              muted={!userData.phone}
            />
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h3 className="font-semibold">Account Details</h3>

            <InfoItem
              icon={<Calendar className="h-4 w-4 text-green-600" />}
              label="Member Since"
              value={formatDate(userData.joinDate)}
            />
          </div>

          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/* Reusable Item                                                              */
/* -------------------------------------------------------------------------- */

function InfoItem({
  icon,
  label,
  value,
  muted,
}: {
  icon: React.ReactNode
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg">
      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-sm font-medium ${
            muted ? "text-muted-foreground" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
