import { useState } from 'react'
import qrImage from '../../assets/QR.jpeg'

/**
 * Floating QR payment card — fixed bottom-right, stays visible while scrolling.
 *
 * @param {{ visible?: boolean }} props
 */
export function PaymentQrFloat({ visible = true }) {
  const [expanded, setExpanded] = useState(false)

  if (!visible) return null

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2"
      aria-live="polite"
    >
      {expanded && (
        <div className="pointer-events-auto w-[220px] overflow-hidden rounded-lg border border-secondary/20 bg-surface shadow-[0_8px_32px_rgba(13,59,46,0.14)] sm:w-[280px]">
          <div className="border-b border-secondary/15 bg-neutral/60 px-3 py-2.5">
            <p className="text-center text-[0.72rem] font-semibold uppercase tracking-wide text-secondary">
              Quét chuyển tiền nhanh
            </p>
          </div>
          <div className="p-3">
            <img
              src={qrImage}
              alt="Mã QR chuyển khoản MoMo — TRAN MINH PHUC"
              className="w-full rounded-md"
              width={280}
              height={350}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Ẩn mã QR chuyển khoản' : 'Hiện mã QR chuyển khoản'}
        className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-secondary/25 bg-surface px-3 py-2 text-xs font-semibold text-primary shadow-[0_4px_16px_rgba(13,59,46,0.12)] transition-colors hover:bg-neutral"
      >
        <svg
          className="h-4 w-4 shrink-0 text-tertiary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
          />
        </svg>
        {expanded ? 'Ẩn QR' : 'Chuyển khoản'}
      </button>
    </div>
  )
}
