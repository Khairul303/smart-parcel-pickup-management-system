"use client"
import { MapPin, Phone, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function CustomerInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
        <CardDescription>Default pickup details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">John Smith</div>
            <div className="text-sm text-gray-500">Customer</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>+6012-345-6789</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>john@example.com</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <span>123 Main Street, Kuala Lumpur</span>
          </div>
        </div>
        
        <Button variant="outline" className="w-full">
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  )
}