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
  let isMounted = true;

  const loadParcels = async () => {
    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && isMounted) {
      setParcels(data || []);
    }
  };

  loadParcels();

  return () => {
    isMounted = false;
  };
}, []);


  /* 🔍 FILTER */
const filteredParcels = parcels.filter((parcel) => {
  const query = search.toLowerCase();

  const matchesSearch =
    (parcel.tracking_id ?? "").toLowerCase().includes(query) ||
    (parcel.sender ?? "").toLowerCase().includes(query) ||
    (parcel.receiver ?? "").toLowerCase().includes(query);

  const matchesStatus =
    statusFilter === "all" || parcel.status === statusFilter;

  return matchesSearch && matchesStatus;
});



  /* 📷 QR SCAN */
  const handleScanQR = async () => {
    setQrScanMode(true);

    // simulate scanner result
    const scannedTrackingId = "PK-2024-001";

    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .eq("tracking_id", scannedTrackingId)
      .single();

    setQrScanMode(false);

    if (error || !data) {
      alert("Parcel not found");
      return;
    }

    setScanResult(data.tracking_id);
    setSelectedParcel(data);
    setParcelForm({
      sender: data.sender,
      receiver: data.receiver,
      senderPhone: data.sender_phone || "",
      receiverPhone: data.receiver_phone || "",
      senderAddress: data.sender_address || "",
      receiverAddress: data.receiver_address || "",
      weight: data.weight || "",
      dimensions: data.dimensions || "",
      priority: data.priority,
      status: data.status,
    });

    setIsDialogOpen(true);
  };

  /* ✍️ MANUAL ENTRY */
  const handleManualEntry = () => {
    setIsManualEntry(true);
    setSelectedParcel(null);
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

  /* 💾 SAVE (INSERT / UPDATE) */
  const handleSaveParcel = async () => {
  if (!parcelForm.sender || !parcelForm.receiver) {
    alert("Required fields missing");
    return;
  }

  if (selectedParcel) {
    const { error } = await supabase
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedParcel.id);

    if (!error) {
      setParcels((prev) =>
        prev.map((p) =>
          p.id === selectedParcel.id
            ? { ...p, ...parcelForm }
            : p
        )
      );
    }
  } else {
    const { data } = await supabase
      .from("parcels")
      .insert({
        tracking_id: crypto.randomUUID().slice(0, 8).toUpperCase(),
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
      .select()
      .single();

    if (data) {
      setParcels((prev) => [data, ...prev]);
    }
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
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StatsPanel parcels={parcels} />
            </div>
            <StatusPanel
              statusConfig={statusConfig}
              activeStatus={statusFilter}
              onStatusChange={setStatusFilter}
            />
          </div>

          <QuickActions
            onScanQR={handleScanQR}
            onManualEntry={handleManualEntry}
            qrScanMode={qrScanMode}
            scanResult={scanResult}
            onClearScan={() => setScanResult("")}
          />

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between">
              <input
                placeholder="Search parcels..."
                className="border px-4 py-2 rounded w-80"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
                <Button onClick={handleManualEntry}>
                  <Plus className="h-4 w-4 mr-2" /> Add Parcel
                </Button>
              </div>
            </div>

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
          </div>

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
      </SidebarInset>
    </SidebarProvider>
  );
}
