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
  const minPriceRef = useRef<HTMLInputElement>(null)
  const maxPriceRef = useRef<HTMLInputElement>(null)
  const conditionRef = useRef<HTMLSelectElement>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const nextMin = minPriceRef.current?.value ?? ''
      const nextMax = maxPriceRef.current?.value ?? ''
      const nextCondition = conditionRef.current?.value ?? ''
      onFiltersChange({
        minPrice: nextMin,
        maxPrice: nextMax,
        condition: nextCondition,
      })
    },
    [onFiltersChange]
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-zinc-400">Price:</label>
        <input
          ref={minPriceRef}
          type="number"
          min={0}
          placeholder="Min"
          defaultValue={minPrice}
          disabled={disabled}
          className="w-24 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-[#fafafa] placeholder:text-zinc-500 focus:border-yellow-400 focus:outline-none"
        />
        <span className="text-zinc-500">–</span>
        <input
          ref={maxPriceRef}
          type="number"
          min={0}
          placeholder="Max"
          defaultValue={maxPrice}
          disabled={disabled}
          className="w-24 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-[#fafafa] placeholder:text-zinc-500 focus:border-yellow-400 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-zinc-400">Condition:</label>
        <select
          ref={conditionRef}
          defaultValue={condition}
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
      <button
        type="submit"
        disabled={disabled}
        className="ml-auto rounded-md bg-yellow-400 px-4 py-1 text-sm font-medium text-black hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Apply
      </button>
    </form>
  )
}
