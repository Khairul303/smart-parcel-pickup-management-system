"use client";

import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabase";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import { ParcelTable } from "./components/ParcelTable";
import { ParcelFormDialog } from "./components/ParcelFormDialog";
import {
  BulkParcelImportDialog,
  type BulkParcelImportRow,
} from "./components/BulkParcelImportDialog";
import { StatusPanel } from "./components/StatusPanel";
import { StatsPanel } from "./components/StatsPanel";
import { RecentActivityPanel } from "./components/RecentActivityPanel";
import { statusConfig, priorityConfig } from "./data/parcels";
import { Parcel, ParcelFormData } from "./components/types";
import QrScanner from "./components/QrScanner";
import { createCustomerNotificationByContact } from "@/lib/customer-notifications";
import { createAdminNotification } from "@/lib/admin-notifications";
import { AdminTimeFilter } from "@/components/admin-time-filter";
import {
  getMalaysiaDateInputValue,
  isWithinMalaysiaDateRange,
  type TimeFilterMode,
} from "@/lib/malaysia-date-range";


export default function ParcelManagementPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qrScanMode, setQrScanMode] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilterMode>("daily");
  const [selectedDate, setSelectedDate] = useState(getMalaysiaDateInputValue());

  const [parcelForm, setParcelForm] = useState<ParcelFormData>({
    sender: "",
    receiver: "",
    senderPhone: "",
    receiverPhone: "",
    receiverEmail: "", // ✅ ADD
    senderAddress: "",
    receiverAddress: "",
    weight: "",
    dimensions: "",
    priority: "Normal",
    status: "ready",
  });


  /* 🔄 LOAD PARCELS */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase
        .from("parcels")
        .select("*")
        .order("created_at", { ascending: false });

      if (mounted && data) setParcels(data);
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
  const channel = supabase
    .channel("realtime-parcels")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "parcels",
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          setParcels((prev) => [
            payload.new as Parcel,
            ...prev.filter((p) => p.id !== payload.new.id),
          ]);
        }

        if (payload.eventType === "UPDATE") {
          setParcels((prev) =>
            prev.map((p) =>
              p.id === payload.new.id ? (payload.new as Parcel) : p
            )
          );
        }

        if (payload.eventType === "DELETE") {
          setParcels((prev) =>
            prev.filter((p) => p.id !== payload.old.id)
          );
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);


  /* 🔍 FILTER */
  const timeFilteredParcels = useMemo(
    () =>
      parcels.filter((parcel) =>
        [
          parcel.created_at,
          parcel.dateCreated,
          parcel.registered_at,
          parcel.updated_at,
          parcel.lastUpdated,
        ].some((dateValue) =>
          isWithinMalaysiaDateRange(dateValue, timeFilter, selectedDate)
        )
      ),
    [parcels, selectedDate, timeFilter]
  );

  const tableDateFilteredParcels = useMemo(
    () =>
      parcels.filter((parcel) =>
        isWithinMalaysiaDateRange(
          parcel.created_at ?? parcel.dateCreated ?? parcel.registered_at,
          timeFilter,
          selectedDate
        )
      ),
    [parcels, selectedDate, timeFilter]
  );

  const filteredParcels = tableDateFilteredParcels.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.tracking_id ?? "").toLowerCase().includes(q) ||
      (p.sender ?? "").toLowerCase().includes(q) ||
      (p.receiver ?? "").toLowerCase().includes(q)
    ) && (statusFilter === "all" || p.status === statusFilter);
  });

  const getParcelStatusMessage = (status: string, trackingId: string) => {
    if (status === "ready") {
      return {
        title: "Parcel Ready to Pickup",
        message: `Your parcel ${trackingId} is ready for pickup.`,
      };
    }

    if (status === "delivered") {
      return {
        title: "Parcel Collected",
        message: `Your parcel ${trackingId} has been collected.`,
      };
    }

    if (status === "pending") {
      return {
        title: "Parcel Status Updated",
        message: `Your parcel ${trackingId} is pending.`,
      };
    }

    return {
      title: "Parcel Status Updated",
      message: `Your parcel ${trackingId} status has been updated to ${status}.`,
    };
  };

  /* 📷 QR SCAN (AUTO SAVE) */
  /* 📦 STAFF: REGISTER ARRIVED PARCEL */
const handleScanQR = () => {
  setQrScanMode(true);
};

const handleScanSuccess = async (trackingId: string) => {
  setQrScanMode(false);
  setScanResult("");

  if (!trackingId?.trim()) {
    setScanResult("Invalid QR code.");
    return;
  }

  const cleanTrackingId = trackingId.trim();
  const { data: existing, error } = await supabase
    .from("parcels")
    .select("*")
    .eq("tracking_id", cleanTrackingId)
    .maybeSingle();

  if (error) {
    setScanResult(error.message);
    return;
  }

  if (existing) {
    setSearch(cleanTrackingId);
    openParcelDialog(existing as Parcel);
    setScanResult(`Parcel ${cleanTrackingId} found.`);
    return;
  }

  setScanResult("Parcel record not found.");
};

  const openParcelDialog = (parcel: Parcel, editable = false) => {
    const dbParcel = parcel as Parcel & {
      sender_phone?: string | null;
      receiver_phone?: string | null;
      receiver_email?: string | null;
      sender_address?: string | null;
      receiver_address?: string | null;
    };

    setSelectedParcel(parcel);
    setIsManualEntry(editable);
    setParcelForm({
      sender: parcel.sender ?? "",
      receiver: parcel.receiver ?? "",
      senderPhone: parcel.senderPhone ?? dbParcel.sender_phone ?? "",
      receiverPhone: parcel.receiverPhone ?? dbParcel.receiver_phone ?? "",
      receiverEmail: parcel.receiverEmail ?? dbParcel.receiver_email ?? "",
      senderAddress: parcel.senderAddress ?? dbParcel.sender_address ?? "",
      receiverAddress: parcel.receiverAddress ?? dbParcel.receiver_address ?? "",
      weight: parcel.weight ?? "",
      dimensions: parcel.dimensions ?? "",
      priority: parcel.priority ?? "Normal",
      status: parcel.status ?? "ready",
    });
    setFormError(null);
    setFormMessage(null);
    setIsDialogOpen(true);
  };


  /* ✍️ MANUAL ENTRY */
  const handleManualEntry = () => {
    setSelectedParcel(null);
    setIsManualEntry(true);
    setParcelForm({
      sender: "",
      receiver: "",
      senderPhone: "",
      receiverPhone: "",
      senderAddress: "",
      receiverAddress: "",
      receiverEmail: "",
      weight: "",
      dimensions: "",
      priority: "Normal",
      status: "ready",
    });
    setFormError(null);
    setFormMessage(null);
    setIsDialogOpen(true);
  };

  /* 💾 SAVE PARCEL */
  const handleSaveParcel = async () => {
  setFormError(null);
  setFormMessage(null);

  if (!parcelForm.sender || !parcelForm.receiver || !parcelForm.receiverPhone || !parcelForm.weight || !parcelForm.dimensions) {
    setFormError("Please complete sender, receiver, receiver phone, weight, and dimensions.");
    return;
  }

  setIsSaving(true);

  // UPDATE existing parcel
  if (selectedParcel) {
    const { error } = await supabase
      .from("parcels")
      .update({
        sender: parcelForm.sender,
        receiver: parcelForm.receiver,
        sender_phone: parcelForm.senderPhone,
        receiver_phone: parcelForm.receiverPhone,
        receiver_email: parcelForm.receiverEmail,
        sender_address: parcelForm.senderAddress,
        receiver_address: parcelForm.receiverAddress,
        weight: parcelForm.weight,
        dimensions: parcelForm.dimensions,
        priority: parcelForm.priority,
        status: parcelForm.status,
      })
      .eq("id", selectedParcel.id);

    if (error) {
      setFormError(error.message);
      setIsSaving(false);
      return;
    }

    const statusMessage = getParcelStatusMessage(
      parcelForm.status,
      selectedParcel.tracking_id
    );

    await createCustomerNotificationByContact({
      email: parcelForm.receiverEmail,
      phone: parcelForm.receiverPhone,
      title: statusMessage.title,
      message: statusMessage.message,
      type: "parcel_status",
      relatedId: selectedParcel.tracking_id,
    });

    await createAdminNotification({
      title: "Parcel Status Updated",
      message: `Parcel ${selectedParcel.tracking_id} status changed from ${selectedParcel.status} to ${parcelForm.status}.`,
      type: "parcel_status_updated",
      relatedId: selectedParcel.tracking_id,
      relatedTrackingId: selectedParcel.tracking_id,
    });
  }

  // INSERT new parcel (manual entry)
  else {
    const trackingId = `PC-${Date.now()}`;

    const { error } = await supabase
      .from("parcels")
      .insert({
        tracking_id: trackingId,
        sender: parcelForm.sender,
        receiver: parcelForm.receiver,
        sender_phone: parcelForm.senderPhone,
        receiver_phone: parcelForm.receiverPhone,
        receiver_email: parcelForm.receiverEmail,
        sender_address: parcelForm.senderAddress,
        receiver_address: parcelForm.receiverAddress,
        weight: parcelForm.weight,
        dimensions: parcelForm.dimensions,
        priority: parcelForm.priority,
        status: parcelForm.status,
      })
      .select()
      .single();

    if (error) {
      setFormError(error.message);
      setIsSaving(false);
      return;
    }

    await createCustomerNotificationByContact({
      email: parcelForm.receiverEmail,
      phone: parcelForm.receiverPhone,
      title: "Parcel Registered",
      message: `Your parcel ${trackingId} has been registered in the system.`,
      type: "parcel_registered",
      relatedId: trackingId,
    });

    await createAdminNotification({
      title: "Parcel Registered",
      message: `Parcel ${trackingId} has been registered in the system.`,
      type: "parcel_registered",
      relatedId: trackingId,
      relatedTrackingId: trackingId,
    });

    if (parcelForm.status === "ready") {
      await createCustomerNotificationByContact({
        email: parcelForm.receiverEmail,
        phone: parcelForm.receiverPhone,
        title: "Parcel Ready to Pickup",
        message: `Your parcel ${trackingId} is ready for pickup.`,
        type: "parcel_status",
        relatedId: trackingId,
      });

      await createAdminNotification({
        title: "Parcel Status Updated",
        message: `Parcel ${trackingId} status changed to ready.`,
        type: "parcel_status_updated",
        relatedId: trackingId,
        relatedTrackingId: trackingId,
      });
    }
  }

  setFormMessage(selectedParcel ? "Parcel updated successfully." : "Parcel created successfully.");
  setIsSaving(false);
  setIsDialogOpen(false);
  setSelectedParcel(null);
  setIsManualEntry(false);
};


  /* 🗑 DELETE */
  const handleBulkImport = async (rows: BulkParcelImportRow[]) => {
    setIsBulkImporting(true);

    const now = Date.now();
    const rowsToInsert = rows.map((row, index) => {
      const trackingId = row.trackingId || `PC-${now}-${index + 1}`;

      return {
        tracking_id: trackingId,
        sender: row.sender,
        receiver: row.receiver,
        sender_phone: row.senderPhone,
        receiver_phone: row.receiverPhone,
        receiver_email: row.receiverEmail,
        sender_address: row.senderAddress,
        receiver_address: row.receiverAddress,
        weight: row.weight || "-",
        dimensions: row.dimensions || "-",
        priority: row.priority,
        status: row.status || "ready",
      };
    });

    const { data, error } = await supabase
      .from("parcels")
      .insert(rowsToInsert)
      .select();

    if (error) {
      setIsBulkImporting(false);
      alert(error.message);
      return;
    }

    if (data) {
      setParcels((current) => [
        ...(data as Parcel[]),
        ...current.filter(
          (parcel) =>
            !data.some((created) => created.tracking_id === parcel.tracking_id)
        ),
      ]);
    }

    await Promise.allSettled(
      rowsToInsert
        .filter((row) => row.status === "ready")
        .map((row) =>
          createCustomerNotificationByContact({
            email: row.receiver_email,
            phone: row.receiver_phone,
            title: "Parcel Ready to Pickup",
            message: `Your parcel ${row.tracking_id} is ready for pickup.`,
            type: "parcel_status",
            relatedId: row.tracking_id,
          })
        )
    );

    await createAdminNotification({
      title: "Bulk Parcel Import Completed",
      message: `${rowsToInsert.length} parcels were registered from an uploaded file.`,
      type: "parcel_registered",
      relatedId: rowsToInsert[0]?.tracking_id ?? null,
      relatedTrackingId: rowsToInsert[0]?.tracking_id ?? null,
    });

    setIsBulkImporting(false);
    setIsBulkImportOpen(false);
    alert(`${rowsToInsert.length} parcels imported successfully.`);
  };

  const handleDeleteParcel = async (parcel: Parcel) => {
    if (!confirm("Delete this parcel?")) return;
    await supabase.from("parcels").delete().eq("id", parcel.id);
    setParcels((prev) => prev.filter((p) => p.id !== parcel.id));
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* HEADER */}
        <header className="flex min-h-16 items-center justify-between gap-3 border-b px-3 py-2 sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="hidden h-6 sm:block" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin-dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Parcel Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* CONTENT */}
        <main className="min-w-0 space-y-6 bg-gray-50 p-4 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="text-2xl font-bold sm:text-3xl">Parcel Management</h1>
            <div className="w-full lg:w-auto">
              <AdminTimeFilter
                mode={timeFilter}
                date={selectedDate}
                onModeChange={setTimeFilter}
                onDateChange={setSelectedDate}
                options={[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" },
                  { value: "all", label: "All" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
            <StatsPanel
              parcels={timeFilteredParcels}
              timeFilter={timeFilter}
              selectedDate={selectedDate}
            />
            <div className="min-w-0">
              <StatusPanel
                onScanQR={handleScanQR}
                onBulkImport={() => setIsBulkImportOpen(true)}
                onManualEntry={handleManualEntry}
                qrScanMode={qrScanMode}
                scanResult={scanResult}
                onClearScan={() => setScanResult("")}
              />
            </div>
          </div>

          <RecentActivityPanel parcels={timeFilteredParcels} />

          {/* <QuickActionsx`
            onScanQR={handleScanQR}
            onManualEntry={handleManualEntry}
            qrScanMode={qrScanMode}
            scanResult={scanResult}
            onClearScan={() => setScanResult("")}
          /> */}

          <ParcelTable
            parcels={filteredParcels}
            search={search}
            statusFilter={statusFilter}
            onSearchChange={setSearch}
            onStatusFilterChange={setStatusFilter}
            onViewParcel={(p) => {
              openParcelDialog(p);
            }}
            onEdit={(p) => {
              openParcelDialog(p, true);
            }}
            onDelete={handleDeleteParcel}
            statusConfig={statusConfig}
            priorityConfig={priorityConfig}
          />

          <ParcelFormDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            selectedParcel={selectedParcel}
            isManualEntry={isManualEntry}
            formData={parcelForm}
            onFormChange={setParcelForm}
            onSave={handleSaveParcel}
            onEnableEdit={() => setIsManualEntry(true)}
            isSaving={isSaving}
            message={formMessage}
            error={formError}
          />
          <BulkParcelImportDialog
            isOpen={isBulkImportOpen}
            onOpenChange={setIsBulkImportOpen}
            onImport={handleBulkImport}
            isImporting={isBulkImporting}
          />
        </main>
        {qrScanMode && (
          <QrScanner
            onSuccess={handleScanSuccess}
            onClose={() => setQrScanMode(false)}
          />
        )}

      </SidebarInset>
    </SidebarProvider>
  );
}
