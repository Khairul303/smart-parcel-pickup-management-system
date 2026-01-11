/**
 * Parcel type aligned with Supabase table: public.parcels
 *
 * Status mapping:
 * - pending / in-transit       → Not Arrived
 * - arrived / ready-for-pickup → Ready to Pickup
 * - delivered                 → Completed
 */

export type ParcelStatus =
  | "pending"
  | "in-transit"
  | "arrived"
  | "ready-for-pickup"
  | "delivered"

export type ParcelPriority =
  | "standard"
  | "express"
  | "priority"

export interface Parcel {
  /** Primary key (UUID) */
  id: string

  /** Tracking ID provided to customer */
  tracking_id: string

  /** Current parcel status (DB value) */
  status: ParcelStatus

  /** Sender & receiver information */
  sender: string
  receiver: string

  /** Optional parcel details */
  weight?: string
  dimensions?: string

  /** Delivery priority */
  priority?: ParcelPriority

  /** Supabase timestamps */
  created_at?: string
  updated_at?: string
}
