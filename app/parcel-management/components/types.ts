export type ParcelStatus = 'pending' | 'in-transit' | 'delivered' | 'ready' | 'completed' | 'collected' | 'cancelled';
export type ParcelPriority = 'High' | 'Normal' | 'Low';

export interface Parcel {
  id: string;
  tracking_id: string;
  sender: string;
  receiver: string;
  senderPhone: string;
  receiverPhone: string;
  receiverEmail?: string;
  senderAddress: string;
  receiverAddress: string;
  status: ParcelStatus;
  weight: string;
  dimensions: string;
  priority: ParcelPriority;
  dateCreated: string;
  lastUpdated: string;
  created_at?: string | null;
  updated_at?: string | null;
  registered_at?: string | null;
  qrCode: string;
}

export interface ParcelFormData {
  sender: string;
  receiver: string;
  senderPhone: string;
  receiverPhone: string;
  senderAddress: string;
  receiverAddress: string;
  receiverEmail: string;
  weight: string;
  dimensions: string;
  priority: ParcelPriority;
  status: ParcelStatus;
}

export interface StatusConfig {
  [key: string]: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  };
}

export interface PriorityConfig {
  [key: string]: {
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}
