"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import {
  getCurrentUserProfile,
  getRoleHome,
  type UserRole,
} from "@/lib/auth-role"

type RoleGateProps = {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const allowedRoleKey = allowedRoles.join("|")

  useEffect(() => {
    let active = true

    const checkAccess = async () => {
      const { profile } = await getCurrentUserProfile()

      if (!active) return

      if (!profile?.role) {
        window.location.replace("/login")
        return
      }

      if (!allowedRoleKey.split("|").includes(profile.role)) {
        window.location.replace(getRoleHome(profile.role))
        return
      }

      setAllowed(true)
      setLoading(false)
    }

    checkAccess()

    return () => {
      active = false
    }
  }, [allowedRoleKey])

  if (loading || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          Checking permissions...
        </div>
      </div>
    )
  }

  return <>{children}</>
}
