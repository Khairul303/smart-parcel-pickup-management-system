"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Building } from "lucide-react";
import supabase from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"staff" | "customer">(
    "customer"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStaffAlert, setShowStaffAlert] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1️⃣ Login with Supabase Auth
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Get authenticated user
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setError("User not found");
      setLoading(false);
      return;
    }

    // 3️⃣ Get role from profiles table (SOURCE OF TRUTH)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profileError || !profile) {
      setError("Failed to retrieve user role");
      setLoading(false);
      return;
    }

    // 🚫 ROLE MISMATCH CHECK (IMPORTANT FIX)
    if (selectedRole !== profile.role) {
      setError(
        selectedRole === "staff"
          ? "This account is not registered as staff."
          : "This account is not registered as customer."
      );
      setLoading(false);
      return;
    }

    // 4️⃣ Redirect based on DATABASE role
    if (profile.role === "staff") {
      window.location.href = "/admin-dashboard";
    } else {
      window.location.href = "/customer-dashboard";
    }

    setLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-gray-200 bg-white shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Smart Parcel Pickup Management System
          </CardTitle>
          <CardDescription className="text-gray-800 mt-2">
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup className="space-y-4">

              {/* ROLE SELECTION */}
              <Field>
                <FieldLabel className="text-gray-900 font-medium">
                  Login As
                </FieldLabel>
                <div className="mt-2">
                  <RadioGroup
                    value={selectedRole}
                    onValueChange={(value) =>
                      setSelectedRole(value as "staff" | "customer")
                    }
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="customer" id="customer" />
                      <Label
                        htmlFor="customer"
                        className="flex items-center gap-1.5 cursor-pointer text-gray-900"
                      >
                        <User className="h-4 w-4" />
                        Customer
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="staff" id="staff" />
                      <Label
                        htmlFor="staff"
                        className="flex items-center gap-1.5 cursor-pointer text-gray-900"
                      >
                        <Building className="h-4 w-4" />
                        Staff / Admin
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </Field>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* EMAIL */}
              <Field>
                <FieldLabel className="text-gray-900 font-medium">
                  Email
                </FieldLabel>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-400 h-11"
                />
              </Field>

              {/* PASSWORD + FORGOT */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel className="text-gray-900 font-medium">
                    Password
                  </FieldLabel>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedRole === "staff") {
                        setShowStaffAlert(true);
                      } else {
                        window.location.href = "/login/forgot-password";
                      }
                    }}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-400 h-11"
                />
              </Field>

              {/* LOGIN BUTTON */}
              <Field className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Logging in..." : "Login to Dashboard"}
                </Button>

                <FieldDescription className="text-center mt-4">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/register"
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Create
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* STAFF ALERT */}
      <AlertDialog open={showStaffAlert} onOpenChange={setShowStaffAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Reset Information</AlertDialogTitle>
            <AlertDialogDescription>
              Please contact your administrator to reset your password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
