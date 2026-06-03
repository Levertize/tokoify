'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = []
  const maxVisible = 5

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'p-2 rounded border border-border transition-colors',
          currentPage === 1
            ? 'cursor-not-allowed opacity-50'
            : 'hover:bg-muted'
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={cn(
            'min-w-10 px-2.5 py-1.5 rounded border transition-colors text-sm font-medium',
            page === '...'
              ? 'cursor-default border-transparent'
              : page === currentPage
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border hover:bg-muted'
          )}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 rounded border border-border transition-colors',
          currentPage === totalPages
            ? 'cursor-not-allowed opacity-50'
            : 'hover:bg-muted'
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
