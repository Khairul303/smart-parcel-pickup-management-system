"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { Parcel, ParcelFormData, ParcelStatus, ParcelPriority } from "./types";

interface ParcelFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedParcel: Parcel | null;
  isManualEntry: boolean;
  formData: ParcelFormData;
  onFormChange: (data: ParcelFormData) => void;
  onSave: () => void;
  onEnableEdit: () => void;
  isSaving?: boolean;
  message?: string | null;
  error?: string | null;
}

export function ParcelFormDialog({
  isOpen,
  onOpenChange,
  selectedParcel,
  isManualEntry,
  formData,
  onFormChange,
  onSave,
  isSaving,
  message,
  error,
}: ParcelFormDialogProps) {
  const disabled = !isManualEntry && !!selectedParcel;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {selectedParcel
              ? isManualEntry
                ? "Update Parcel"
                : "Parcel Details"
              : "Create New Parcel"}
          </DialogTitle>
          <DialogDescription>
            {selectedParcel
              ? isManualEntry
                ? "Update parcel information and status"
                : "View parcel details and information"
              : "Enter parcel details manually or scan QR code"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="space-y-5">
          <section className="rounded-lg border p-4">
            <h3 className="mb-4 font-semibold">Parcel Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parcel ID</Label>
                <Input
                  value={selectedParcel?.id || "Auto-generated"}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>QR Code</Label>
                <Input
                  value={selectedParcel?.qrCode || "Auto-generated"}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Weight *</Label>
                <Input
                  value={formData.weight}
                  onChange={(e) =>
                    onFormChange({ ...formData, weight: e.target.value })
                  }
                  disabled={disabled}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Dimensions *</Label>
                <Input
                  value={formData.dimensions}
                  onChange={(e) =>
                    onFormChange({ ...formData, dimensions: e.target.value })
                  }
                  disabled={disabled}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: ParcelPriority) =>
                    onFormChange({ ...formData, priority: value })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ParcelStatus) =>
                  onFormChange({ ...formData, status: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Not Collected</SelectItem>
                  <SelectItem value="ready">Ready for Pickup</SelectItem>
                  <SelectItem value="delivered">Collected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <h3 className="mb-4 font-semibold">Sender Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sender Name *</Label>
                <Input
                  value={formData.sender}
                  onChange={(e) =>
                    onFormChange({ ...formData, sender: e.target.value })
                  }
                  disabled={disabled}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Sender Phone *</Label>
                <Input
                  value={formData.senderPhone}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      senderPhone: e.target.value,
                    })
                  }
                  disabled={disabled}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sender Address *</Label>
              <Textarea
                value={formData.senderAddress}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    senderAddress: e.target.value,
                  })
                }
                disabled={disabled}
                rows={3}
                required
              />
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <h3 className="mb-4 font-semibold">Receiver Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Receiver Name *</Label>
                <Input
                  value={formData.receiver}
                  onChange={(e) =>
                    onFormChange({ ...formData, receiver: e.target.value })
                  }
                  disabled={disabled}
                  required
                />
              </div>

              {/* ✅ NEW EMAIL FIELD */}
              <div className="space-y-2">
                <Label>Receiver Email *</Label>
                <Input
                  type="email"
                  placeholder="receiver@email.com"
                  value={formData.receiverEmail}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      receiverEmail: e.target.value,
                    })
                  }
                  disabled={disabled}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Receiver Phone *</Label>
                <Input
                  value={formData.receiverPhone}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      receiverPhone: e.target.value,
                    })
                  }
                  disabled={disabled}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Receiver Address *</Label>
              <Textarea
                value={formData.receiverAddress}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    receiverAddress: e.target.value,
                  })
                }
                disabled={disabled}
                rows={3}
                required
              />
            </div>
          </section>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          {(!selectedParcel || isManualEntry) && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={onSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : selectedParcel ? "Update Parcel" : "Create Parcel"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
