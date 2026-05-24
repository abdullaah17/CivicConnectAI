'use client'

import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { SkeletonList } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { Select } from '@/components/common/Input'
import { useAnnouncements, useMarkAnnouncementRead } from '@/hooks/useAnnouncements'

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'general', label: 'General' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'health', label: 'Health' },
  { value: 'culture', label: 'Culture' },
  { value: 'emergency', label: 'Emergency' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' },
]

export default function AnnouncementsPage() {
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data: announcements, isLoading } = useAnnouncements({
    category: category || undefined,
    priority: priority || undefined,
  })
  const markRead = useMarkAnnouncementRead()

  const handleClick = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id))
    const ann = announcements?.find((a) => a.id === id)
    if (ann && !ann.is_read) {
      markRead.mutate(id)
    }
  }

  return (
    <div>
      <PageHeader
        variant="dark"
        title="Announcements"
        subtitle="Stay informed about city updates and notices."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Announcements' }]}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <Select options={CATEGORY_OPTIONS} value={category} onChange={setCategory} containerClassName="w-44" />
        <Select options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} containerClassName="w-40" />
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : !announcements?.length ? (
        <EmptyState
          variant="dark"
          icon={<Megaphone className="w-12 h-12" />}
          title="No announcements"
          description="There are no announcements matching your filters."
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id}>
              <AnnouncementCard announcement={ann} onClick={() => handleClick(ann.id)} />
              {expanded === ann.id && (
                <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg px-5 py-4 -mt-1">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{ann.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
