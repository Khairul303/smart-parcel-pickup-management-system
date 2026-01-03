export type ParcelStatus = 'pending' | 'in-transit' | 'delivered' | 'ready';
export type ParcelPriority = 'High' | 'Normal' | 'Low';

export interface Parcel {
  id: string;
  tracking_id: string;
  sender: string;
  receiver: string;
  senderPhone: string;
  receiverPhone: string;
  senderAddress: string;
  receiverAddress: string;
  status: ParcelStatus;
  weight: string;
  dimensions: string;
  priority: ParcelPriority;
  dateCreated: string;
  lastUpdated: string;
  qrCode: string;
}

export interface ParcelFormData {
  sender: string;
  receiver: string;
  senderPhone: string;
  receiverPhone: string;
  senderAddress: string;
  receiverAddress: string;
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