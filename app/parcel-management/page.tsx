"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Download, Bell } from "lucide-react";
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

import { QuickActions } from "./components/QuickActions";
import { ParcelTable } from "./components/ParcelTable";
import { ParcelFormDialog } from "./components/ParcelFormDialog";
import { StatusPanel } from "./components/StatusPanel";
import { StatsPanel } from "./components/StatsPanel";
import { statusConfig, priorityConfig } from "./data/parcels";
import { Parcel, ParcelFormData } from "./components/types";
import QrScanner from "./components/QrScanner";


export default function ParcelManagementPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qrScanMode, setQrScanMode] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [parcelForm, setParcelForm] = useState<ParcelFormData>({
    sender: "",
    receiver: "",
    senderPhone: "",
    receiverPhone: "",
    senderAddress: "",
    receiverAddress: "",
    weight: "",
    dimensions: "",
    priority: "Normal",
    status: "pending",
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

  /* 🔍 FILTER */
  const filteredParcels = parcels.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.tracking_id ?? "").toLowerCase().includes(q) ||
      (p.sender ?? "").toLowerCase().includes(q) ||
      (p.receiver ?? "").toLowerCase().includes(q)
    ) && (statusFilter === "all" || p.status === statusFilter);
  });

  /* 📷 QR SCAN (AUTO SAVE) */
  /* 📦 STAFF: REGISTER ARRIVED PARCEL */
const handleScanQR = () => {
  setQrScanMode(true);
};

const handleScanSuccess = async (trackingId: string) => {
  setQrScanMode(false);

  if (!trackingId) {
    alert("Invalid QR code");
    return;
  }

  // 1️⃣ Prevent duplicate
  const { data: existing } = await supabase
    .from("parcels")
    .select("id")
    .eq("tracking_id", trackingId)
    .maybeSingle();

  if (existing) {
    alert(`Parcel ${trackingId} already registered`);
    return;
  }

  // 2️⃣ Insert arrived parcel
  const { data, error } = await supabase
    .from("parcels")
    .insert({
      tracking_id: trackingId,
      status: "ready", // arrived at post centre
    })
    .select()
    .single();

  if (error || !data) {
    alert("Failed to register parcel");
    return;
  }

  // 3️⃣ Update UI immediately
  setParcels((prev) => [data, ...prev]);

  alert(`Parcel ${trackingId} registered successfully`);
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
      weight: "",
      dimensions: "",
      priority: "Normal",
      status: "pending",
    });
    setIsDialogOpen(true);
  };

  /* 💾 SAVE PARCEL */
  const handleSaveParcel = async () => {
    if (!parcelForm.sender || !parcelForm.receiver) {
      alert("Required fields missing");
      return;
    }

    if (selectedParcel) {
      await supabase
        .from("parcels")
        .update({
          sender: parcelForm.sender,
          receiver: parcelForm.receiver,
          sender_phone: parcelForm.senderPhone,
          receiver_phone: parcelForm.receiverPhone,
          sender_address: parcelForm.senderAddress,
          receiver_address: parcelForm.receiverAddress,
          weight: parcelForm.weight,
          dimensions: parcelForm.dimensions,
          priority: parcelForm.priority,
          status: parcelForm.status,
        })
        .eq("id", selectedParcel.id);

      setParcels((prev) =>
        prev.map((p) =>
          p.id === selectedParcel.id ? { ...p, ...parcelForm } : p
        )
      );
    }

    setIsDialogOpen(false);
    setSelectedParcel(null);
  };

  /* 🗑 DELETE */
  const handleDeleteParcel = async (parcel: Parcel) => {
    if (!confirm("Delete this parcel?")) return;
    await supabase.from("parcels").delete().eq("id", parcel.id);
    setParcels((prev) => prev.filter((p) => p.id !== parcel.id));
  };

  /* 📤 EXPORT */
  const handleExportData = () => {
    const csv = [
      ["Tracking ID", "Sender", "Receiver", "Status"],
      ...parcels.map((p) => [
        p.tracking_id,
        p.sender,
        p.receiver,
        p.status,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "parcels.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* HEADER */}
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
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
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </header>

        {/* CONTENT */}
        <main className="p-6 space-y-6 bg-gray-50">
          <h1 className="text-3xl font-bold">Parcel Management</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatsPanel parcels={parcels} />
           <StatusPanel
                onScanQR={handleScanQR}
                onManualEntry={handleManualEntry}
                qrScanMode={qrScanMode}
                scanResult={scanResult}
                onClearScan={() => setScanResult("")}
              />
          </div>

          {/* <QuickActions
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
              setSelectedParcel(p);
              setIsDialogOpen(true);
            }}
            onEdit={(p) => {
              setSelectedParcel(p);
              setIsDialogOpen(true);
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
