'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'

type SearchBarProps = {
  onSearch: (query: string) => void
  isLoading: boolean
  initialValue?: string
}

export function SearchBar({
  onSearch,
  isLoading,
  initialValue = '',
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const clearDebounce = useCallback(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }, [])

  const scheduleDebouncedSearch = useCallback(
    (next: string) => {
      clearDebounce()
      debounceRef.current = setTimeout(() => {
        onSearch(next.trim())
      }, 300)
    },
    [clearDebounce, onSearch]
  )

  useEffect(() => {
    return () => clearDebounce()
  }, [clearDebounce])

  const handleChange = (next: string) => {
    setValue(next)
    scheduleDebouncedSearch(next)
  }

  const submitNow = () => {
    clearDebounce()
    onSearch(value.trim())
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submitNow()
  }

  const handleClear = () => {
    clearDebounce()
    setValue('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex w-full items-center">
        <input
          type="search"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isLoading}
          aria-label="Search eBay products"
          placeholder="Search products..."
          className="w-full rounded-full border border-zinc-800 bg-[#18181b] py-3 pl-5 pr-24 text-[#fafafa] placeholder:text-zinc-500 transition duration-150 ease-out focus:border-[#f5c518] focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {value.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="absolute right-14 rounded-full p-1.5 text-zinc-400 transition duration-150 ease-out hover:bg-zinc-800 hover:text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
            aria-label="Clear search"
          >
            ×
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isLoading}
          aria-label="Search"
          className="absolute right-1.5 rounded-full bg-[#f5c518] px-4 py-2 text-sm font-semibold text-zinc-950 transition duration-150 ease-out hover:bg-[#e6b800] focus:outline-none focus:ring-2 focus:ring-yellow-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Search
        </button>
      </div>
    </form>
  )
}
