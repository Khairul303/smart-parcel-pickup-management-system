"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

interface Props {
  onSuccess: (trackingId: string) => void;
  onClose: () => void;
}

export default function QrScanner({ onSuccess, onClose }: Props) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onSuccess(decodedText);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-3">
          Scan Parcel QR Code
        </h2>

        <div id="qr-reader" />

        <button
          onClick={onClose}
          className="mt-4 w-full rounded bg-gray-200 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
