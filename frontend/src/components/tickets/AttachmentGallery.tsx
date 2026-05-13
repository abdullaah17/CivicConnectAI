'use client'

import { useState } from 'react'
import { FileText, Download, X, ZoomIn } from 'lucide-react'
import { clsx } from 'clsx'
import type { Attachment } from '@/types/ticket'

interface AttachmentGalleryProps {
  attachments: Attachment[]
}

export const AttachmentGallery = ({ attachments }: AttachmentGalleryProps) => {
  const [preview, setPreview] = useState<Attachment | null>(null)

  if (!attachments.length) return null

  const isImage = (mime: string) => mime.startsWith('image/')

  return (
    <>
      <div>
        <h4 className="text-sm font-semibold text-gray-700 font-display mb-2">
          Attachments ({attachments.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {attachments.map((att) => (
            <button
              key={att.id}
              onClick={() => setPreview(att)}
              className={clsx(
                'group relative w-20 h-20 rounded border border-gray-200 overflow-hidden',
                'hover:border-primary-500 transition-colors focus-visible:ring-2 focus-visible:ring-primary-700',
                'bg-gray-50 flex items-center justify-center'
              )}
              aria-label={`Preview ${att.filename}`}
            >
              {isImage(att.mime_type) ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.url}
                    alt={att.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 p-2">
                  <FileText className="w-8 h-8 text-gray-400" aria-hidden="true" />
                  <span className="text-[10px] text-gray-500 text-center truncate w-full">
                    {att.filename}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${preview.filename}`}
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700 truncate">{preview.filename}</span>
              <div className="flex items-center gap-2">
                <a
                  href={preview.url}
                  download={preview.filename}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  aria-label={`Download ${preview.filename}`}
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  aria-label="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[80vh]">
              {isImage(preview.mime_type) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.url}
                  alt={preview.filename}
                  className="max-w-full h-auto"
                />
              ) : (
                <iframe
                  src={preview.url}
                  title={preview.filename}
                  className="w-full h-[70vh]"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
