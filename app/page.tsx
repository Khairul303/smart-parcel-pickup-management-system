import {
  Activity,
  ArrowRight,
  Bell,
  CalendarCheck,
  CalendarClock,
  History,
  ListOrdered,
  MonitorSmartphone,
  Package,
  PackageSearch,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCentreTitleLogo } from "@/components/postcentre-title-logo";
import Link from "next/link";

export default function HomePage() {
  const highlights = [
    {
      icon: CalendarCheck,
      title: "Easy Booking",
      description: "Choose a pickup slot for parcels ready at PostCentre"
    },
    {
      icon: ListOrdered,
      title: "Live Queue",
      description: "Check your queue number and waiting time before pickup"
    },
    {
      icon: PackageSearch,
      title: "Parcel Lookup",
      description: "Find parcel details quickly using your tracking ID"
    },
    {
      icon: Bell,
      title: "Status Alerts",
      description: "Receive booking, queue, and parcel status updates"
    },
    {
      icon: History,
      title: "Pickup Records",
      description: "Review upcoming and completed pickup bookings"
    }
  ];

  const systemFeatures = [
    {
      icon: CalendarClock,
      title: "Pickup Scheduling",
      description: "Book a pickup date and time slot for parcels that are ready to collect."
    },
    {
      icon: Activity,
      title: "Live Queue Status",
      description: "View real-time queue updates and estimated waiting time before pickup."
    },
    {
      icon: Search,
      title: "Parcel Tracking",
      description: "Track parcel status using tracking ID and view parcel details easily."
    },
    {
      icon: Bell,
      title: "Instant Notifications",
      description: "Receive updates when your parcel status, booking, or queue information changes."
    },
    {
      icon: History,
      title: "Pickup History",
      description: "View your previous and upcoming pickup booking records in one place."
    },
    {
      icon: MonitorSmartphone,
      title: "PWA Friendly Access",
      description: "Access the system through mobile or desktop with a responsive app-like experience."
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PostCentreTitleLogo />
              <span className="text-xl font-bold text-gray-900">PostCentre Batu Pahat</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">How it Works</a>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Parcel Pickup Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage arrived parcels with pickup booking, live queue updates,
            tracking ID lookup, and instant notifications for smoother PostCentre counter pickup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/login">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20">
          {highlights.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How it Works */}
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl p-8 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple three-step process for a smoother PostCentre parcel pickup
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Book Your Arrived Parcel</h3>
              <p className="text-gray-600">Select the parcel that has arrived at PostCentre and choose your preferred pickup date and time slot.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Check the Live Queue</h3>
              <p className="text-gray-600">View the live queue status, estimated waiting time, and your queue number before coming to the counter.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Collect Your Parcel Smoothly</h3>
              <p className="text-gray-600">Come to PostCentre according to your selected time slot and collect your parcel with a more organized pickup flow.</p>
            </div>
          </div>
        </div>

        {/* System Features */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">System Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage parcel pickup easily and efficiently.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to streamline your parcel management?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Access your PostCentre dashboard to book pickups, check queue updates, and manage parcel records in one place.
          </p>
          <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/login">
              Access Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900">PostCentre Batu Pahat</span>
                <p className="text-xs text-gray-600">Smart Parcel Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900">Terms of Service</a>
              <a href="#" className="hover:text-gray-900">Support</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
            <div className="text-sm text-gray-600">
              &copy; 2024 SmartParcel. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
