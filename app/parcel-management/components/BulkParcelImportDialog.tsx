"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
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
import type { ParcelPriority, ParcelStatus } from "./types";

export type BulkParcelImportRow = {
  rowNumber: number;
  trackingId?: string;
  sender: string;
  receiver: string;
  senderPhone: string;
  receiverPhone: string;
  receiverEmail: string;
  senderAddress: string;
  receiverAddress: string;
  weight: string;
  dimensions: string;
  priority: ParcelPriority;
  status: ParcelStatus;
  issues: string[];
};

interface BulkParcelImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: BulkParcelImportRow[]) => Promise<void>;
  isImporting?: boolean;
}

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getCell = (row: Record<string, unknown>, keys: string[]) => {
  const normalized = Object.entries(row).reduce<Record<string, unknown>>(
    (current, [key, value]) => {
      current[normalizeHeader(key)] = value;
      return current;
    },
    {}
  );

  for (const key of keys) {
    const value = normalized[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
};

const getDimensions = (row: Record<string, unknown>) => {
  const dimensions = getCell(row, [
    "dimensions",
    "dimension",
    "parcel_dimensions",
    "parcel_dimension",
    "size",
    "parcel_size",
    "measurement",
    "measurements",
    "l_w_h",
    "length_width_height",
  ]);

  if (dimensions) return dimensions;

  const length = getCell(row, ["length", "parcel_length", "length_cm"]);
  const width = getCell(row, ["width", "parcel_width", "width_cm"]);
  const height = getCell(row, ["height", "parcel_height", "height_cm"]);

  return [length, width, height].filter(Boolean).join(" x ");
};

const normalizePriority = (value: string): ParcelPriority => {
  const priority = value.toLowerCase();
  if (priority === "high") return "High";
  if (priority === "low") return "Low";
  return "Normal";
};

const normalizeStatus = (value: string): ParcelStatus => {
  const status = normalizeHeader(value);
  if (["collected", "delivered", "completed"].includes(status)) return "delivered";
  if (["cancelled", "canceled"].includes(status)) return "cancelled";
  if (["pending", "not_collected", "not_ready"].includes(status)) return "pending";
  return "ready";
};

const parseRows = (rows: Record<string, unknown>[]) =>
  rows.map<BulkParcelImportRow>((row, index) => {
    const parsed: BulkParcelImportRow = {
      rowNumber: index + 2,
      trackingId: getCell(row, [
        "tracking_id",
        "tracking_no",
        "tracking_number",
        "tracking_code",
        "tracking",
        "parcel_id",
        "parcel_no",
        "parcel_number",
        "parcel_code",
      ]),
      sender: getCell(row, ["sender", "sender_name", "sender_full_name", "from", "from_name"]),
      receiver: getCell(row, [
        "receiver",
        "receiver_name",
        "recipient",
        "recipient_name",
        "customer",
        "customer_name",
        "name",
      ]),
      senderPhone: getCell(row, [
        "sender_phone",
        "sender_phone_number",
        "sender_contact",
        "sender_contact_number",
        "from_phone",
      ]),
      receiverPhone: getCell(row, [
        "receiver_phone",
        "receiver_phone_number",
        "receiver_contact",
        "receiver_contact_number",
        "recipient_phone",
        "customer_phone",
        "customer_phone_number",
        "phone",
        "phone_number",
        "contact",
        "contact_number",
      ]),
      receiverEmail: getCell(row, [
        "receiver_email",
        "receiver_email_address",
        "recipient_email",
        "customer_email",
        "customer_email_address",
        "email",
        "email_address",
      ]),
      senderAddress: getCell(row, ["sender_address", "sender_full_address", "from_address"]),
      receiverAddress: getCell(row, [
        "receiver_address",
        "receiver_full_address",
        "recipient_address",
        "customer_address",
        "delivery_address",
        "address",
      ]),
      weight: getCell(row, ["weight", "parcel_weight", "weight_kg", "kg"]),
      dimensions: getDimensions(row),
      priority: normalizePriority(getCell(row, ["priority", "parcel_priority"])),
      status: normalizeStatus(getCell(row, ["status", "parcel_status"])),
      issues: [],
    };

    parsed.issues = [
      !parsed.sender ? "Missing sender" : "",
      !parsed.receiver ? "Missing receiver" : "",
      !parsed.receiverPhone ? "Missing receiver phone" : "",
    ].filter(Boolean);

    return parsed;
  });

export function BulkParcelImportDialog({
  isOpen,
  onOpenChange,
  onImport,
  isImporting,
}: BulkParcelImportDialogProps) {
  const [rows, setRows] = useState<BulkParcelImportRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  const invalidRows = useMemo(
    () => rows.filter((row) => row.issues.length > 0),
    [rows]
  );
  const validRows = useMemo(
    () => rows.filter((row) => row.issues.length === 0),
    [rows]
  );

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setRows([]);
      setError(null);
      setShowReview(false);
    }
  };

  const handleFileChange = async (file?: File) => {
    setError(null);
    setRows([]);
    setShowReview(false);

    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false,
      });

      const parsedRows = parseRows(jsonRows).filter((row) =>
        Object.values(row).some((value) => String(value ?? "").trim() !== "")
      );

      if (parsedRows.length === 0) {
        setError("No parcel rows found in the uploaded file.");
        return;
      }

      setRows(parsedRows);
      setShowReview(true);
    } catch {
      setError("Unable to read this file. Please upload a valid .xlsx, .xls, or .csv file.");
    }
  };

  const handleAnalyze = () => {
    if (rows.length === 0) {
      setError("Please upload a file before analyzing.");
      return;
    }

    setError(null);
    setShowReview(true);
  };

  const handleConfirmImport = async () => {
    if (invalidRows.length > 0) {
      setError("Please fix the invalid rows in Excel and upload the file again.");
      return;
    }

    await onImport(validRows);
    setRows([]);
    setError(null);
    setShowReview(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Parcel Creation</DialogTitle>
          <DialogDescription>
            Upload Excel or CSV parcel data. Review the analyzed rows before confirming import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Excel or CSV File</Label>
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(event) => handleFileChange(event.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">
              Supported columns include Tracking ID, Sender Name, Sender Phone, Sender Address,
              Receiver Name, Receiver Phone, Receiver Email, Receiver Address, Weight, Dimensions,
              Priority, and Status.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {showReview && rows.length > 0 && (
            <div className="rounded-md border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  Analysis: {validRows.length} valid rows, {invalidRows.length} invalid rows.
                </span>
                <span className={invalidRows.length > 0 ? "text-red-600" : "text-green-600"}>
                  {invalidRows.length > 0 ? "Required data missing" : "Ready to confirm"}
                </span>
              </div>
              <div className="mt-3 max-h-80 overflow-auto rounded border">
                <table className="w-full min-w-[980px] text-left text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Tracking ID</th>
                      <th className="px-3 py-2">Sender</th>
                      <th className="px-3 py-2">Sender Phone</th>
                      <th className="px-3 py-2">Receiver</th>
                      <th className="px-3 py-2">Receiver Phone</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Weight</th>
                      <th className="px-3 py-2">Dimensions</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={`${row.trackingId}-${index}`} className="border-t">
                        <td className="px-3 py-2">{row.rowNumber}</td>
                        <td className="px-3 py-2">{row.trackingId || "Auto-generated"}</td>
                        <td className="px-3 py-2">{row.sender || "-"}</td>
                        <td className="px-3 py-2">{row.senderPhone || "-"}</td>
                        <td className="px-3 py-2">{row.receiver || "-"}</td>
                        <td className="px-3 py-2">{row.receiverPhone || "-"}</td>
                        <td className="px-3 py-2">{row.receiverEmail || "-"}</td>
                        <td className="px-3 py-2">{row.weight || "-"}</td>
                        <td className="px-3 py-2">{row.dimensions || "-"}</td>
                        <td className="px-3 py-2">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          {!showReview ? (
            <Button onClick={handleAnalyze} disabled={rows.length === 0}>
              Analyze Parcel Details
            </Button>
          ) : (
            <Button
              onClick={handleConfirmImport}
              disabled={isImporting || rows.length === 0 || invalidRows.length > 0}
            >
              {isImporting ? "Importing..." : "Confirm Import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
