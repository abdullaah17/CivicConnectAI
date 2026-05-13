'use client'

import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { TicketForm } from '@/components/tickets/TicketForm'
import { useCreateTicket } from '@/hooks/useTickets'
import type { TicketFormData } from '@/utils/validators'
import toast from 'react-hot-toast'

export default function SubmitRequestPage() {
  const router = useRouter()
  const createTicket = useCreateTicket()

  const handleSubmit = async (data: TicketFormData, files: File[]) => {
    try {
      const ticket = await createTicket.mutateAsync({ ...data, attachments: files })
      toast.success(`Request ${ticket.ticket_number} submitted successfully!`)
      router.push(`/requests/${ticket.id}`)
    } catch {
      toast.error('Submission failed. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Report an Issue"
        subtitle="Describe the civic issue and we'll route it to the right department."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Report an Issue' },
        ]}
      />
      <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6">
        <TicketForm onSubmit={handleSubmit} isSubmitting={createTicket.isPending} />
      </div>
    </div>
  )
}
