'use client'

import { Grid3x3, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewControlsProps {
  sortBy: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating'
  onSortChange: (sort: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating') => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  totalResults: number
}

export function ViewControls({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalResults,
}: ViewControlsProps) {
  const sortOptions = [
    { value: 'newest' as const, label: 'Terbaru' },
    { value: 'price-low' as const, label: 'Harga Terendah' },
    { value: 'price-high' as const, label: 'Harga Tertinggi' },
    { value: 'popular' as const, label: 'Terlaris' },
    { value: 'rating' as const, label: 'Rating Tertinggi' },
  ]

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-semibold text-foreground">{totalResults}</span> produk
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="appearance-none rounded border border-border bg-card px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <svg className="size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 rounded border border-border bg-card p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'grid'
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-muted'
            )}
            title="Grid view"
          >
            <Grid3x3 className="size-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'list'
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-muted'
            )}
            title="List view"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
