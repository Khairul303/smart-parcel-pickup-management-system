"use client";

import { useState } from "react";
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
import { Save, Edit, } from "lucide-react";
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
            {selectedParcel ? (isManualEntry ? "Update Parcel" : "Parcel Details") : "Create New Parcel"}
          </DialogTitle>
          <DialogDescription>
            {selectedParcel 
              ? (isManualEntry 
                  ? "Update parcel information and status" 
                  : "View parcel details and information")
              : "Enter parcel details manually or scan QR code"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Parcel Details</TabsTrigger>
            <TabsTrigger value="sender">Sender Info</TabsTrigger>
            <TabsTrigger value="receiver">Receiver Info</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parcel-id">Parcel ID</Label>
                <Input
                  id="parcel-id"
                  value={selectedParcel?.id || "Auto-generated"}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qr-code">QR Code</Label>
                <Input
                  id="qr-code"
                  value={selectedParcel?.qrCode || "Auto-generated"}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight *</Label>
                <Input
                  id="weight"
                  placeholder="2.5kg"
                  value={formData.weight}
                  onChange={(e) => onFormChange({...formData, weight: e.target.value})}
                  disabled={!isManualEntry && !!selectedParcel}

                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions *</Label>
                <Input
                  id="dimensions"
                  placeholder="30x20x15cm"
                  value={formData.dimensions}
                  onChange={(e) => onFormChange({...formData, dimensions: e.target.value})}
                  disabled={!isManualEntry && !!selectedParcel}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: ParcelPriority) => onFormChange({...formData, priority: value})}
                  disabled={!isManualEntry && !!selectedParcel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
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
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ParcelStatus) => onFormChange({...formData, status: value})}
                disabled={!isManualEntry && !!selectedParcel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Not Collected</SelectItem>
                  <SelectItem value="ready">Ready for Pickup</SelectItem>
                  <SelectItem value="delivered">Collected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="sender" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sender-name">Sender Name *</Label>
                <Input
                  id="sender-name"
                  placeholder="John Doe"
                  value={formData.sender}
                  onChange={(e) => onFormChange({...formData, sender: e.target.value})}
                  disabled={!isManualEntry && !!selectedParcel}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-phone">Sender Phone *</Label>
                <Input
                  id="sender-phone"
                  placeholder="+6012-3456789"
                  value={formData.senderPhone}
                  onChange={(e) => onFormChange({...formData, senderPhone: e.target.value})}
                  disabled={!isManualEntry && !!selectedParcel}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender-address">Sender Address *</Label>
              <Textarea
                id="sender-address"
                placeholder="123 Main Street, City, State"
                value={formData.senderAddress}
                onChange={(e) => onFormChange({...formData, senderAddress: e.target.value})}
                disabled={!isManualEntry && !!selectedParcel}
                rows={3}
                required
              />
            </div>
          </TabsContent>

          <TabsContent value="receiver" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiver-name">Receiver Name *</Label>
                <Input
                  id="receiver-name"
                  placeholder="Sarah Smith"
                  value={formData.receiver}
                  onChange={(e) => onFormChange({...formData, receiver: e.target.value})}
                  disabled={!isManualEntry && !!selectedParcel}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiver-phone">Receiver Phone *</Label>
                <Input
                  id="receiver-phone"
                  placeholder="+6019-8765432"
                  value={formData.receiverPhone}
                  onChange={(e) => onFormChange({...formData, receiverPhone: e.target.value})}
                  disabled={!isManualEntry && !!selectedParcel}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiver-address">Receiver Address *</Label>
              <Textarea
                id="receiver-address"
                placeholder="456 Oak Avenue, City, State"
                value={formData.receiverAddress}
                onChange={(e) => onFormChange({...formData, receiverAddress: e.target.value})}
                disabled={!isManualEntry && !!selectedParcel}
                rows={3}
                required
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300"
          >
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