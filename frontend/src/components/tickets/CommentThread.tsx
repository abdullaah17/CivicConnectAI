'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { Send, Lock, Globe } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Textarea } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { timeAgo } from '@/utils/formatDate'
import { useAuthStore } from '@/store/authStore'
import type { Comment } from '@/types/ticket'

interface CommentThreadProps {
  comments: Comment[]
  onAddComment: (body: string, isInternal: boolean) => Promise<void>
  isSubmitting?: boolean
}

export const CommentThread = ({ comments, onAddComment, isSubmitting }: CommentThreadProps) => {
  const { user } = useAuthStore()
  const [body, setBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const isStaff = user?.role === 'staff' || user?.role === 'dept_admin' || user?.role === 'super_admin'

  const visibleComments = isStaff
    ? comments
    : comments.filter((c) => !c.is_internal)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    await onAddComment(body.trim(), isInternal)
    setBody('')
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-gray-900">
        Comments {visibleComments.length > 0 && `(${visibleComments.length})`}
      </h3>

      {/* Comment list */}
      <div className="space-y-3" aria-live="polite" aria-label="Comment thread">
        {visibleComments.length === 0 && (
          <p className="text-sm text-gray-400 italic">No comments yet.</p>
        )}
        {visibleComments.map((comment) => (
          <div
            key={comment.id}
            className={clsx(
              'flex gap-3 p-3 rounded-lg',
              comment.is_internal
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-gray-50 border border-gray-100'
            )}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {comment.author.profile_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={comment.author.profile_photo_url} alt={comment.author.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary-700">
                  {comment.author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-gray-900">{comment.author.name}</span>
                {comment.is_internal && (
                  <Badge variant="warning">
                    <Lock className="w-3 h-3 mr-1" aria-hidden="true" />
                    INTERNAL
                  </Badge>
                )}
                <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Compose */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          label="Add a comment"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your comment..."
          maxLength={2000}
          showCount
          required
        />

        <div className="flex items-center justify-between gap-2">
          {isStaff && (
            <button
              type="button"
              onClick={() => setIsInternal((v) => !v)}
              className={clsx(
                'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border transition-colors',
                isInternal
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
              )}
              aria-pressed={isInternal}
            >
              {isInternal ? (
                <><Lock className="w-3.5 h-3.5" aria-hidden="true" /> Internal Note</>
              ) : (
                <><Globe className="w-3.5 h-3.5" aria-hidden="true" /> Public Reply</>
              )}
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            loading={isSubmitting}
            disabled={!body.trim()}
            rightIcon={<Send className="w-4 h-4" />}
            className="ml-auto"
          >
            Post
          </Button>
        </div>
      </form>
    </div>
  )
}
