import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { formatDate } from '@/utils/formatDate'

interface VerifyPageProps {
  params: { permitNumber: string }
}

async function getPermitValidity(permitNumber: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/permits/verify/${permitNumber}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.data
  } catch {
    return null
  }
}

export default async function PermitVerificationPage({ params }: VerifyPageProps) {
  const permit = await getPermitValidity(params.permitNumber)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-700 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">CC</span>
          </div>
          <h1 className="font-display text-xl font-bold text-gray-900">Permit Verification</h1>
          <p className="text-gray-500 text-sm mt-1">CivicConnect — Official Permit Registry</p>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden">
          {!permit ? (
            <div className="p-6 text-center">
              <XCircle className="w-12 h-12 text-danger mx-auto mb-3" aria-hidden="true" />
              <h2 className="font-semibold text-gray-900 mb-1">Permit Not Found</h2>
              <p className="text-sm text-gray-500">
                No permit found for <span className="font-mono-civic font-medium">{params.permitNumber}</span>.
                This permit may be invalid or does not exist in our system.
              </p>
            </div>
          ) : permit.status !== 'Approved' ? (
            <div className="p-6 text-center">
              <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" aria-hidden="true" />
              <h2 className="font-semibold text-gray-900 mb-1">Permit Not Active</h2>
              <p className="text-sm text-gray-500">
                This permit has status: <span className="font-medium">{permit.status}</span>
              </p>
            </div>
          ) : (
            <>
              <div className="bg-success px-5 py-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white" aria-hidden="true" />
                <span className="text-white font-semibold text-sm">VALID PERMIT</span>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Permit Number</span>
                  <span className="font-mono-civic font-bold text-gray-900">{permit.application_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium capitalize">{permit.permit_type?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issued To</span>
                  <span className="font-medium">{permit.applicant?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issue Date</span>
                  <span className="font-medium">{formatDate(permit.updated_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-success">Approved ✓</span>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Verified by CivicConnect · City Government Official System
        </p>
      </div>
    </div>
  )
}
