import { PickupRecord } from "../types"

export const AVERAGE_HANDLING_TIME = 3 // minutes per parcel

export const dummyPickupRecords: PickupRecord[] = [
  {
    id: "PU-001",
    customer: {
      name: "John Smith",
      email: "john@example.com",
      phone: "+6012-345-6789",
      avatar: "JS"
    },
    parcelDetails: {
      type: "Documents",
      weight: "0.5kg",
      dimensions: "30x20x5cm",
      value: "RM 50"
    },
    pickupAddress: "123 Main Street, Kuala Lumpur",
    preferredTime: "2024-01-15T14:00:00",
    status: "pending",
    assignedTo: "You",
    createdAt: "2024-01-14T09:30:00",
    queueNumber: 1
  },
  {
    id: "PU-002",
    customer: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+6012-987-6543",
      avatar: "SJ"
    },
    parcelDetails: {
      type: "Electronics",
      weight: "2.5kg",
      dimensions: "40x30x20cm",
      value: "RM 1,200"
    },
    pickupAddress: "456 Jalan Bukit Bintang, KL",
    preferredTime: "2024-01-15T10:00:00",
    status: "assigned",
    assignedTo: "You",
    createdAt: "2024-01-14T11:15:00",
    queueNumber: 2
  },
  {
    id: "PU-003",
    customer: {
      name: "Mike Davis",
      email: "mike@example.com",
      phone: "+6013-456-7890",
      avatar: "MD"
    },
    parcelDetails: {
      type: "Clothing",
      weight: "3.0kg",
      dimensions: "50x40x30cm",
      value: "RM 350"
    },
    pickupAddress: "789 Taman Tun Dr Ismail, KL",
    preferredTime: "2024-01-15T16:30:00",
    status: "in-progress",
    assignedTo: "You",
    createdAt: "2024-01-14T14:45:00",
    queueNumber: 3
  },
  {
    id: "PU-004",
    customer: {
      name: "Emma Wilson",
      email: "emma@example.com",
      phone: "+6014-567-8901",
      avatar: "EW"
    },
    parcelDetails: {
      type: "Fragile Items",
      weight: "5.0kg",
      dimensions: "60x40x40cm",
      value: "RM 800"
    },
    pickupAddress: "321 Bangsar South, KL",
    preferredTime: "2024-01-16T09:00:00",
    status: "completed",
    assignedTo: "You",
    createdAt: "2024-01-14T16:20:00",
    queueNumber: 4
  },
  {
    id: "PU-005",
    customer: {
      name: "Robert Brown",
      email: "robert@example.com",
      phone: "+6015-678-9012",
      avatar: "RB"
    },
    parcelDetails: {
      type: "Books",
      weight: "4.0kg",
      dimensions: "45x35x25cm",
      value: "RM 120"
    },
    pickupAddress: "654 Cheras, Kuala Lumpur",
    preferredTime: "2024-01-16T11:00:00",
    status: "cancelled",
    assignedTo: "Not Assigned",
    createdAt: "2024-01-14T17:30:00",
    queueNumber: 5
  },
  {
    id: "PU-006",
    customer: {
      name: "Lisa Wong",
      email: "lisa@example.com",
      phone: "+6016-789-0123",
      avatar: "LW"
    },
    parcelDetails: {
      type: "Gifts",
      weight: "1.5kg",
      dimensions: "35x25x15cm",
      value: "RM 200"
    },
    pickupAddress: "101 Damansara Heights, KL",
    preferredTime: "2024-01-16T15:00:00",
    status: "assigned",
    assignedTo: "You",
    createdAt: "2024-01-14T18:45:00",
    queueNumber: 6
  },
  {
    id: "PU-007",
    customer: {
      name: "David Lee",
      email: "david@example.com",
      phone: "+6017-890-1234",
      avatar: "DL"
    },
    parcelDetails: {
      type: "Documents",
      weight: "0.8kg",
      dimensions: "32x22x5cm",
      value: "RM 75"
    },
    pickupAddress: "222 Mont Kiara, KL",
    preferredTime: "2024-01-17T10:30:00",
    status: "pending",
    assignedTo: "You",
    createdAt: "2024-01-15T09:15:00",
    queueNumber: 7
  },
]

export const statusOptions = [
  { value: "all", label: "All Records" },
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "assigned", label: "Assigned", color: "bg-blue-500" },
  { value: "in-progress", label: "In Progress", color: "bg-purple-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
]