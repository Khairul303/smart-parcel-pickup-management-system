"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Package,
  Clock,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ======================
// TYPES
// ======================
type NotificationType =
  | "booking_confirmation"
  | "queue_update"
  | "alert"
  | "system";

type NotificationStatus = "unread" | "read";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  timestamp: string;
  metadata?: {
    bookingId?: string;
    queuePosition?: number;
    estimatedTime?: string;
    location?: string;
  };
}

// ======================
// SAMPLE DATA
// ======================
const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "Pickup Booking Confirmed",
    message:
      "Your parcel pickup at Main Hub has been confirmed for tomorrow at 2:00 PM",
    type: "booking_confirmation",
    status: "unread",
    timestamp: "5 min ago",
    metadata: {
      bookingId: "BK-789012",
      estimatedTime: "Tomorrow, 2:00 PM",
      location: "Main Hub - Downtown",
    },
  },
  {
    id: "2",
    title: "Queue Position Updated",
    message: "Your queue position has moved from #5 to #2",
    type: "queue_update",
    status: "unread",
    timestamp: "15 min ago",
    metadata: {
      queuePosition: 2,
      estimatedTime: "30 minutes",
      bookingId: "BK-789012",
    },
  },
  {
    id: "3",
    title: "Pickup Alert",
    message:
      "Your pickup window starts in 15 minutes. Please proceed to the counter.",
    type: "alert",
    status: "read",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    title: "System Maintenance",
    message:
      "Scheduled maintenance on Sunday from 2–4 AM. System may be unavailable.",
    type: "system",
    status: "read",
    timestamp: "2 hours ago",
  },
];

// ======================
// CONFIG
// ======================
const notificationConfig = {
  booking_confirmation: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50",
    label: "Booking",
  },
  queue_update: {
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-50",
    label: "Queue",
  },
  alert: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50",
    label: "Alert",
  },
  system: {
    icon: Info,
    color: "text-purple-500",
    bg: "bg-purple-50",
    label: "System",
  },
};

// ======================
// ITEM COMPONENT
// ======================
const NotificationItem = ({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) => {
  const config = notificationConfig[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition
      ${
        notification.status === "unread"
          ? "bg-blue-50 border-blue-100"
          : "bg-white"
      }`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        <div className={`p-2 rounded-full ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            <span className="text-xs text-gray-500">
              {notification.timestamp}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>

          {notification.metadata && (
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              {notification.metadata.bookingId && (
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {notification.metadata.bookingId}
                </div>
              )}
              {notification.metadata.queuePosition && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />#
                  {notification.metadata.queuePosition}
                </div>
              )}
              {notification.metadata.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {notification.metadata.location}
                </div>
              )}
            </div>
          )}
        </div>

        {notification.status === "unread" && (
          <span className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
        )}
      </div>
    </div>
  );
};

// ======================
// MAIN DIALOG
// ======================
export const NotificationsDialog = () => {
  const [notifications, setNotifications] =
    useState<Notification[]>(sampleNotifications);

  const [isOpen, setIsOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  // ✅ DERIVED STATE (NO useEffect)
  const unreadCount = notifications.filter(
    (n) => n.status === "unread"
  ).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: "read" } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: "read" }))
    );
  };

  const clearAll = () => setNotifications([]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[500px] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="flex gap-2 items-center">
              <Bell className="h-5 w-5" />
              Notifications
            </DialogTitle>
            <div className="flex gap-3 items-center">
              <span className="text-sm">Push</span>
              <Switch
                checked={pushEnabled}
                onCheckedChange={setPushEnabled}
              />
              <Button size="sm" variant="ghost" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="all" className="p-4">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="booking">Booking</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="alert">Alerts</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </div>
        </Tabs>

        <Separator />

        <div className="p-4 flex justify-between items-center bg-gray-50">
          <div className="flex gap-2 items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">
                3 active bookings
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
