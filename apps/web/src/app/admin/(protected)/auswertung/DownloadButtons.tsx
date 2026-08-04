"use client"

import { useState } from "react"
import { FileText, FileSpreadsheet, Download, Loader2 } from "lucide-react"

// ── Shared download helper ─────────────────────────────────────────────────

async function triggerDownload(url: string, fallbackFilename: string): Promise<string | null> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    return body || "Download fehlgeschlagen"
  }
  const blob = await res.blob()
  const disposition = res.headers.get("Content-Disposition") ?? ""
  const match = /filename="?([^";\n]+)"?/.exec(disposition)
  const filename = match?.[1] ?? fallbackFilename

  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
  return null
}

// ── Per-user download buttons (PDF + CSV) ─────────────────────────────────

interface UserDownloadButtonsProps {
  userId: number
  participantId: string
}

export function UserDownloadButtons({ userId, participantId }: UserDownloadButtonsProps) {
  const [csvLoading, setCsvLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)

  async function downloadCsv() {
    setCsvLoading(true)
    setCsvError(null)
    const err = await triggerDownload(
      `/admin/api/export/users/${userId}/csv`,
      `kaia_export_${participantId}.csv`
    )
    setCsvError(err)
    setCsvLoading(false)
  }

  async function downloadPdf() {
    setPdfLoading(true)
    setPdfError(null)
    const err = await triggerDownload(
      `/admin/api/export/users/${userId}/pdf`,
      `kaia_bericht_${participantId}.pdf`
    )
    setPdfError(err)
    setPdfLoading(false)
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={downloadPdf}
        disabled={pdfLoading}
        title={pdfError ?? "PDF-Bericht herunterladen"}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium
          transition-colors disabled:opacity-50
          ${pdfError
            ? "border-red-500/30 bg-red-500/10 text-red-400"
            : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          }`}
      >
        {pdfLoading
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <FileText className="h-3.5 w-3.5" />
        }
        PDF
      </button>
      <button
        onClick={downloadCsv}
        disabled={csvLoading}
        title={csvError ?? "CSV-Daten herunterladen"}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium
          transition-colors disabled:opacity-50
          ${csvError
            ? "border-red-500/30 bg-red-500/10 text-red-400"
            : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          }`}
      >
        {csvLoading
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <FileSpreadsheet className="h-3.5 w-3.5" />
        }
        CSV
      </button>
    </div>
  )
}

// ── "Alle als CSV" footer button ───────────────────────────────────────────

export function DownloadAllCsvButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const err = await triggerDownload(
      "/admin/api/export/participants/csv",
      "kaia_study_export.csv"
    )
    setError(err)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30
          bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400
          hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors disabled:opacity-50"
      >
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <Download className="h-4 w-4" />
        }
        {loading ? "Wird erstellt…" : "Alle als CSV herunterladen"}
      </button>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
