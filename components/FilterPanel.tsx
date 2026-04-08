'use client'

import { useCallback, useRef } from 'react'

const CONDITIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'New', label: 'New' },
  { value: 'Used', label: 'Used' },
  { value: 'Refurbished', label: 'Refurbished' },
  { value: 'For parts or not working', label: 'For Parts' },
]

type FilterPanelProps = {
  minPrice: string
  maxPrice: string
  condition: string
  onFiltersChange: (filters: {
    minPrice: string
    maxPrice: string
    condition: string
  }) => void
  disabled: boolean
}

export function FilterPanel({
  minPrice,
  maxPrice,
  condition,
  onFiltersChange,
  disabled,
}: FilterPanelProps) {
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPriceDebounce = useCallback(() => {
    if (priceDebounceRef.current !== null) {
      clearTimeout(priceDebounceRef.current)
      priceDebounceRef.current = null
    }
  }, [])

  const schedulePriceChange = useCallback(
    (nextMin: string, nextMax: string) => {
      clearPriceDebounce()
      priceDebounceRef.current = setTimeout(() => {
        onFiltersChange({ minPrice: nextMin, maxPrice: nextMax, condition })
      }, 400)
    },
    [clearPriceDebounce, condition, onFiltersChange]
  )

  const handleConditionChange = useCallback(
    (next: string) => {
      onFiltersChange({ minPrice, maxPrice, condition: next })
    },
    [minPrice, maxPrice, onFiltersChange]
  )

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-zinc-400">Price:</label>
        <input
          type="number"
          min={0}
          placeholder="Min"
          defaultValue={minPrice}
          disabled={disabled}
          onChange={(e) => schedulePriceChange(e.target.value, maxPrice)}
          className="w-24 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-[#fafafa] placeholder:text-zinc-500 focus:border-yellow-400 focus:outline-none"
        />
        <span className="text-zinc-500">–</span>
        <input
          type="number"
          min={0}
          placeholder="Max"
          defaultValue={maxPrice}
          disabled={disabled}
          onChange={(e) => schedulePriceChange(minPrice, e.target.value)}
          className="w-24 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-[#fafafa] placeholder:text-zinc-500 focus:border-yellow-400 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-zinc-400">Condition:</label>
        <select
          value={condition}
          onChange={(e) => handleConditionChange(e.target.value)}
          disabled={disabled}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-[#fafafa] focus:border-yellow-400 focus:outline-none"
        >
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
