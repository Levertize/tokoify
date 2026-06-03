'use client'

import { useState } from 'react'
import { ChevronDown, SlidersHorizontal, Grid3x3, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterSidebarProps {
  selectedCategory: string[]
  onCategoryChange: (categories: string[]) => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  selectedRating: number | null
  onRatingChange: (rating: number | null) => void
  stockOnly: boolean
  onStockOnlyChange: (value: boolean) => void
}

export function FilterSidebar({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  selectedRating,
  onRatingChange,
  stockOnly,
  onStockOnlyChange,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const categories = [
    { id: 'fashion', label: 'Fashion' },
    { id: 'elektronik', label: 'Elektronik' },
    { id: 'rumah-tangga', label: 'Rumah Tangga' },
    { id: 'olahraga', label: 'Olahraga' },
    { id: 'kecantikan', label: 'Kecantikan' },
    { id: 'ibu-anak', label: 'Ibu & Anak' },
  ]

  const toggleCategory = (id: string) => {
    const newCategories = selectedCategory.includes(id)
      ? selectedCategory.filter(c => c !== id)
      : [...selectedCategory, id]
    onCategoryChange(newCategories)
  }

  const toggleRating = (rating: number) => {
    onRatingChange(selectedRating === rating ? null : rating)
  }

  return (
    <aside className="space-y-6">
      {/* Category Filter */}
      <div className="border-b border-border pb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mb-4 flex w-full items-center justify-between"
        >
          <h3 className="font-semibold text-foreground">Kategori</h3>
          <ChevronDown className={cn(
            'size-4 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </button>
        {isOpen && (
          <div className="space-y-3">
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategory.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="size-4 rounded border-border text-accent"
                />
                <span className="text-sm text-foreground">{cat.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="border-b border-border pb-6">
        <h3 className="mb-4 font-semibold text-foreground">Harga</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-2 block text-xs text-muted-foreground">Minimum</label>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
              className="w-full rounded border border-border bg-card px-3 py-2 text-sm text-foreground"
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-muted-foreground">Maksimum</label>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
              className="w-full rounded border border-border bg-card px-3 py-2 text-sm text-foreground"
              placeholder="Unlimited"
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="border-b border-border pb-6">
        <h3 className="mb-4 font-semibold text-foreground">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => toggleRating(rating)}
              className={cn(
                'flex w-full items-center gap-2 rounded px-3 py-2 transition-colors',
                selectedRating === rating
                  ? 'bg-accent/10 text-accent'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <span key={i} className="text-amber-400">★</span>
                ))}
              </div>
              <span className="text-sm">{rating > 1 ? `${rating} ke atas` : `${rating}`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={stockOnly}
            onChange={(e) => onStockOnlyChange(e.target.checked)}
            className="size-4 rounded border-border text-accent"
          />
          <span className="text-sm font-medium text-foreground">Hanya Tersedia</span>
        </label>
      </div>
    </aside>
  )
}
