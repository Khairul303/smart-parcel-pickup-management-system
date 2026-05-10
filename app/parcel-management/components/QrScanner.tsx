"use client";

import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onSuccess: (trackingId: string) => void;
  onClose: () => void;
}

export default function QrScanner({ onSuccess, onClose }: Props) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [message, setMessage] = useState("Point the camera at a parcel QR code.");
  const [error, setError] = useState<string | null>(null);
  const [scanningFile, setScanningFile] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        setMessage("QR code detected.");
        scanner.clear();
        onSuccess(decodedText);
      },
      () => {
        setError(null);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onSuccess]);

  const handleFileScan = async (file?: File) => {
    if (!file) return;

    setScanningFile(true);
    setError(null);
    setMessage("Scanning uploaded QR image...");

    const imageScanner = new Html5Qrcode("qr-file-reader");

    try {
      const decodedText = await imageScanner.scanFile(file, true);
      await scannerRef.current?.clear().catch(() => {});
      setMessage("QR image detected.");
      onSuccess(decodedText);
    } catch {
      setError("Invalid QR image or no QR code was detected.");
      setMessage("Try another image or use the camera scanner.");
    } finally {
      try {
        imageScanner.clear();
      } catch {}
      setScanningFile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92svh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4">
        <h2 className="text-lg font-semibold mb-3">
          Scan Parcel QR Code
        </h2>

        <p className="mb-3 text-sm text-gray-600">{message}</p>
        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div id="qr-reader" />
        <div id="qr-file-reader" className="hidden" />

        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Upload QR image</label>
          <Input
            type="file"
            accept="image/*"
            disabled={scanningFile}
            onChange={(event) => handleFileScan(event.target.files?.[0])}
          />
        </div>

        <Button
          variant="outline"
          onClick={onClose}
          className="mt-4 w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
