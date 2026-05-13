'use client'

import { useEffect, useRef } from 'react'
import { Download, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { formatDate, formatCurrency } from '@/utils/formatDate'
import type { PermitApplication } from '@/types/permit'

interface PermitCertificateCardProps {
  permit: PermitApplication
  certificateUrl?: string
}

export const PermitCertificateCard = ({ permit, certificateUrl }: PermitCertificateCardProps) => {
  const qrRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!qrRef.current) return
    // Dynamically import qrcode to avoid SSR issues
    import('qrcode').then((QRCode) => {
      const verifyUrl = `${window.location.origin}/verify/${permit.application_number}`
      QRCode.toCanvas(qrRef.current!, verifyUrl, { width: 100, margin: 1 })
    })
  }, [permit.application_number])

  return (
    <div className="bg-white rounded-lg border-2 border-success overflow-hidden shadow-card">
      {/* Green approved banner */}
      <div className="bg-success px-5 py-3 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-white" aria-hidden="true" />
        <span className="text-white font-semibold text-sm">APPROVED</span>
      </div>

      <div className="p-5 flex flex-col sm:flex-row gap-5 items-start">
        {/* Details */}
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Permit Number</p>
            <p className="font-mono-civic text-xl font-bold text-gray-900">{permit.application_number}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Permit Type</p>
              <p className="font-medium text-gray-800 capitalize">{permit.permit_type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Issued To</p>
              <p className="font-medium text-gray-800">{permit.applicant.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Issue Date</p>
              <p className="font-medium text-gray-800">{formatDate(permit.updated_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fee Paid</p>
              <p className="font-medium text-gray-800">{formatCurrency(permit.total_fee)}</p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-2">
          <canvas ref={qrRef} aria-label={`QR code for permit ${permit.application_number}`} />
          <p className="text-xs text-gray-400 text-center">Scan to verify</p>
        </div>
      </div>

      {/* Download */}
      <div className="px-5 pb-5">
        <a
          href={certificateUrl || permit.certificate_url || '#'}
          download={`permit-${permit.application_number}.pdf`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="success"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Download PDF Certificate
          </Button>
        </a>
      </div>
    </div>
  )
}
