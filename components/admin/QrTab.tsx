"use client";

import { useState } from "react";

interface GeneratedQr {
  table: string;
  dataUrl: string;
  url: string;
}

export default function QrTab() {
  const [tableInput, setTableInput] = useState("");
  const [qrCodes, setQrCodes] = useState<GeneratedQr[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!tableInput.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/qr?table=${encodeURIComponent(tableInput.trim())}`);
      if (!res.ok) throw new Error("Could not generate QR code");
      const data = await res.json();
      setQrCodes((prev) => [
        { table: data.table, dataUrl: data.dataUrl, url: data.url },
        ...prev.filter((qr) => qr.table !== data.table),
      ]);
      setTableInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-stone-800">QR Codes</h2>

      <div className="mb-6 flex items-end gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs text-stone-500">Table number</label>
          <input
            value={tableInput}
            onChange={(e) => setTableInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="e.g. 5"
            className="w-32 rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={generate}
          disabled={generating || !tableInput.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {generating ? "Generating..." : "Generate QR"}
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {qrCodes.map((qr) => (
          <div
            key={qr.table}
            className="flex flex-col items-center rounded-xl border border-stone-200 bg-white p-4"
          >
            <p className="mb-2 font-semibold text-stone-800">Table {qr.table}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr.dataUrl} alt={`QR code for table ${qr.table}`} className="h-40 w-40" />
            <p className="mt-2 break-all text-center text-xs text-stone-400">{qr.url}</p>
            <a
              href={qr.dataUrl}
              download={`table-${qr.table}-qr.png`}
              className="mt-3 w-full rounded-lg border border-brand-600 py-1.5 text-center text-sm font-semibold text-brand-700"
            >
              Download PNG
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
