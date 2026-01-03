"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import supabase from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  // 🔹 STATES (ADDED ONLY)
  const [fullName, setFullName] = useState("")
  const [noTelephone, setNoTelephone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 🔹 SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    // 1️⃣ Create user in Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError || !data.user) {
      setError(authError?.message || "Registration failed")
      setLoading(false)
      return
    }

    // 2️⃣ Insert into profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          full_name: fullName,
          no_telephone: noTelephone,
          role: "customer",
        },
        { onConflict: "id" }
      )


    if (profileError) {
      setError("Failed to save user profile")
      setLoading(false)
      return
    }

    setSuccess("Account created successfully. Please login.")
    setLoading(false)

    setTimeout(() => {
      window.location.href = "/login"
    }, 2000)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-gray-900">
            Create your account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter details to register for ParcelFlow
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-4">
              {/* Full Name */}
              <Field>
                <FieldLabel className="text-gray-700">
                  Full Name
                </FieldLabel>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </Field>

              {/* Phone Number */}
              <Field>
                <FieldLabel className="text-gray-700">
                  Phone Number
                </FieldLabel>
                <Input
                  type="tel"
                  value={noTelephone}
                  onChange={(e) => setNoTelephone(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </Field>

              {/* Email */}
              <Field>
                <FieldLabel className="text-gray-700">
                  Email
                </FieldLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </Field>

              {/* Password */}
              <Field>
                <FieldLabel className="text-gray-700">
                  Password
                </FieldLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </Field>

              {/* Confirm Password */}
              <Field>
                <FieldLabel className="text-gray-700">
                  Confirm Password
                </FieldLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <FieldDescription className="text-gray-500 mt-1">
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              {/* ERROR / SUCCESS */}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}

              {/* Submit */}
              <Field>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <FieldDescription className="text-center mt-4 text-gray-600">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-gray-500">
        By clicking continue, you agree to our{" "}
        <a href="#" className="font-medium text-gray-700 hover:text-gray-900">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="font-medium text-gray-700 hover:text-gray-900">
          Privacy Policy
        </a>.
      </FieldDescription>
    </div>
  )
}
