'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { EbayItem } from '@/types/ebay'
import { mockItems } from '@/lib/mock-data'
import { SearchBar } from '@/components/SearchBar'
import { ProductGrid } from '@/components/ProductGrid'
import { FilterPanel } from '@/components/FilterPanel'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

type PageStatus = 'idle' | 'loading' | 'results' | 'empty' | 'error'

type Filters = {
  minPrice: string
  maxPrice: string
  condition: string
}

function buildSearchParams(
  query: string,
  page: number,
  filters: Filters
): URLSearchParams {
  const params = new URLSearchParams({ q: query })
  if (page > 1) params.set('page', String(page))
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  if (filters.condition) params.set('condition', filters.condition)
  return params
}

function SearchPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<EbayItem[]>([])
  const [status, setStatus] = useState<PageStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [currentQuery, setCurrentQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    minPrice: '',
    maxPrice: '',
    condition: '',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const initialLoadDone = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)


  const handleSearch = useCallback(
    async (
      query: string,
      opts?: { page?: number; filters?: Filters }
    ) => {
      // Cancel previous fetch if in progress
      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()

      if (query.trim() === '') {
        setItems([])
        setStatus('idle')
        setErrorMessage('')
        setCurrentQuery('')
        setPage(1)
        setTotalPages(1)
        setTotal(0)
        router.replace(pathname)
        return
      }

      const targetPage = opts?.page ?? 1
      const targetFilters = opts?.filters ?? filters

      // Handle "view all" request
      if (query === '*') {
        setStatus('loading')
        setErrorMessage('')
        setCurrentQuery('all products')
        setPage(targetPage)
        setFilters(targetFilters)

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 600))

        // Apply filters to all products
        let filtered = mockItems
        if (targetFilters.minPrice) {
          const minPrice = parseFloat(targetFilters.minPrice)
          filtered = filtered.filter((item) => parseFloat(item.price) >= minPrice)
        }
        if (targetFilters.maxPrice) {
          const maxPrice = parseFloat(targetFilters.maxPrice)
          filtered = filtered.filter((item) => parseFloat(item.price) <= maxPrice)
        }
        if (targetFilters.condition && targetFilters.condition !== '') {
          const condLower = targetFilters.condition.toLowerCase()
          filtered = filtered.filter(
            (item) => item.condition.toLowerCase() === condLower
          )
        }

        setItems(filtered)
        setTotal(filtered.length)
        setTotalPages(1)
        setStatus(filtered.length === 0 ? 'empty' : 'results')
        return
      }

      setStatus('loading')
      setErrorMessage('')
      setCurrentQuery(query.trim())
      setPage(targetPage)
      setFilters(targetFilters)

      // Build search params once and use for both URL and fetch
      const searchParams = buildSearchParams(query.trim(), targetPage, targetFilters)
      router.replace(`${pathname}?${searchParams.toString()}`)

      try {
        const res = await fetch(`/api/search?${searchParams.toString()}`, {
          signal: abortControllerRef.current.signal,
        })
        const data: unknown = await res.json()

        if (!res.ok) {
          const error = extractErrorMessage(data)
          setErrorMessage(error)
          setStatus('error')
          setItems([])
          return
        }

        const parsed = data as {
          items?: EbayItem[]
          total?: number
          page?: number
          totalPages?: number
        }
        const nextItems = Array.isArray(parsed.items) ? parsed.items : []

        setTotal(parsed.total ?? nextItems.length)
        setTotalPages(parsed.totalPages ?? 1)

        if (nextItems.length === 0) {
          setItems([])
          setStatus('empty')
        } else {
          setItems(nextItems)
          setStatus('results')
        }
      } catch (error) {
        // Ignore abort errors (from cancellation)
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        setErrorMessage('Failed to fetch results. Please try again.')
        setStatus('error')
        setItems([])
      }
    },
    [pathname, router, filters]
  )

  function extractErrorMessage(data: unknown): string {
    if (
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
    ) {
      return (data as { error: string }).error
    }
    return 'Something went wrong.'
  }

  const handleFiltersChange = useCallback(
    (next: typeof filters) => {
      setFilters(next)
      if (currentQuery) {
        // Use '*' for "all products" mode so filters apply correctly
        const queryToSearch = currentQuery === 'all products' ? '*' : currentQuery
        void handleSearch(queryToSearch, { page: 1, filters: next })
      }
    },
    [currentQuery, handleSearch]
  )

  const handlePageChange = useCallback(
    (next: number) => {
      // Use '*' for "all products" mode
      const queryToSearch = currentQuery === 'all products' ? '*' : currentQuery
      void handleSearch(queryToSearch, { page: next })
    },
    [currentQuery, handleSearch]
  )

  useEffect(() => {
    if (initialLoadDone.current) {
      return
    }
    initialLoadDone.current = true
    const q = searchParams.get('q')
    const urlPage = parseInt(searchParams.get('page') ?? '1', 10)
    const urlFilters = {
      minPrice: searchParams.get('minPrice') ?? '',
      maxPrice: searchParams.get('maxPrice') ?? '',
      condition: searchParams.get('condition') ?? '',
    }
    setFilters(urlFilters)
    setPage(urlPage)
    if (q !== null && q.trim() !== '') {
      void handleSearch(q, { page: urlPage, filters: urlFilters })
    } else {
      // Show all products on initial load
      void handleSearch('*')
    }
  }, [searchParams, handleSearch])

  return (
    <div className="flex min-h-[60vh] flex-col gap-10">
      <header className="space-y-2 text-center sm:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-[#fafafa]">
          eBay Search
        </h1>
        <p className="text-zinc-400">
          Find products on eBay — fast search, clear results.
        </p>
      </header>

      <SearchBar
        onSearch={handleSearch}
        isLoading={status === 'loading'}
        initialValue={searchParams.get('q') ?? ''}
      />

      <FilterPanel
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        condition={filters.condition}
        onFiltersChange={handleFiltersChange}
        disabled={status === 'loading'}
      />

      {status === 'idle' ? (
        <p className="py-16 text-center text-zinc-400">
          Enter a search term to explore products on eBay
        </p>
      ) : null}

      {status === 'loading' ? <LoadingSpinner /> : null}

      {status === 'results' ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            {currentQuery === 'all products'
              ? `Showing all ${items.length} products`
              : `${total} result${total === 1 ? '' : 's'} for "${currentQuery}"`}
          </p>
          <ProductGrid items={items} />
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-300 transition duration-150 ease-out hover:border-zinc-500 hover:bg-zinc-800 hover:text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-yellow-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-300 transition duration-150 ease-out hover:border-zinc-500 hover:bg-zinc-800 hover:text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-yellow-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {status === 'empty' ? (
        <p className="py-16 text-center text-zinc-400">
          No results found for &apos;{currentQuery}&apos;
        </p>
      ) : null}

      {status === 'error' ? (
        <ErrorMessage
          message={errorMessage}
          onRetry={() => void handleSearch(currentQuery)}
        />
      ) : null}
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-zinc-400">
          Loading…
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
