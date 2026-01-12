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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Edit } from "lucide-react";
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
}

export function ParcelFormDialog({
  isOpen,
  onOpenChange,
  selectedParcel,
  isManualEntry,
  formData,
  onFormChange,
  onSave,
  onEnableEdit,
}: ParcelFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
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

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Parcel Details</TabsTrigger>
            <TabsTrigger value="sender">Sender Info</TabsTrigger>
            <TabsTrigger value="receiver">Receiver Info</TabsTrigger>
          </TabsList>

          {/* ================= PARCEL DETAILS ================= */}
          <TabsContent value="details" className="space-y-4 pt-4">
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
                  disabled={!isManualEntry && !!selectedParcel}
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
                  disabled={!isManualEntry && !!selectedParcel}
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
                  disabled={!isManualEntry && !!selectedParcel}
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
                disabled={!isManualEntry && !!selectedParcel}
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
          </TabsContent>

          {/* ================= SENDER INFO ================= */}
          <TabsContent value="sender" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sender Name *</Label>
                <Input
                  value={formData.sender}
                  onChange={(e) =>
                    onFormChange({ ...formData, sender: e.target.value })
                  }
                  disabled={!isManualEntry && !!selectedParcel}
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
                  disabled={!isManualEntry && !!selectedParcel}
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
                disabled={!isManualEntry && !!selectedParcel}
                rows={3}
                required
              />
            </div>
          </TabsContent>

          {/* ================= RECEIVER INFO ================= */}
          <TabsContent value="receiver" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Receiver Name *</Label>
                <Input
                  value={formData.receiver}
                  onChange={(e) =>
                    onFormChange({ ...formData, receiver: e.target.value })
                  }
                  disabled={!isManualEntry && !!selectedParcel}
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
                  disabled={!isManualEntry && !!selectedParcel}
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
                  disabled={!isManualEntry && !!selectedParcel}
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
                disabled={!isManualEntry && !!selectedParcel}
                rows={3}
                required
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          {(!selectedParcel || isManualEntry) && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={onSave}
            >
              <Save className="h-4 w-4" />
              {selectedParcel ? "Update Parcel" : "Create Parcel"}
            </Button>
          )}

          {selectedParcel && !isManualEntry && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={onEnableEdit}
            >
              <Edit className="h-4 w-4" />
              Edit Parcel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
