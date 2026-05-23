export type PermitType = 'construction_permit' | 'event_permit' | 'business_license_renewal'

export type PermitStatus =
  | 'Draft'
  | 'Submitted'
  | 'Document Verification'
  | 'Inspection Scheduled'
  | 'Approved'
  | 'Rejected'

export interface PermitTypeInfo {
  id: PermitType
  name: string
  description: string
  base_fee: number
  estimated_days: number
  icon: string
}

export interface PermitDocument {
  id: string
  filename: string
  url: string
  mime_type: string
  size: number
  uploaded_at: string
}

export interface FeeBreakdown {
  label: string
  amount: number
}

export interface PermitApplication {
  id: string
  application_number: string
  permit_type: PermitType
  status: PermitStatus
  applicant: {
    id: string
    name: string
    email: string
  }
  form_data: Record<string, unknown>
  documents: PermitDocument[]
  fee_breakdown: FeeBreakdown[]
  total_fee: number
  payment_receipt?: {
    receipt_number: string
    amount: number
    date: string
  }
  rejection_reason?: string
  certificate_url?: string
  reviewed_by?: {
    id: string
    name: string
  }
  created_at: string
  updated_at: string
}

export interface PermitListItem {
  id: string
  application_number: string
  permit_type: PermitType
  status: PermitStatus
  total_fee: number
  created_at: string
  updated_at: string
}
