'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { EbayItem } from '@/types/ebay'
import { SearchBar } from '@/components/SearchBar'
import { ProductGrid } from '@/components/ProductGrid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

type PageStatus = 'idle' | 'loading' | 'results' | 'empty' | 'error'

function SearchPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<EbayItem[]>([])
  const [status, setStatus] = useState<PageStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [currentQuery, setCurrentQuery] = useState('')
  const initialLoadDone = useRef(false)

  const handleSearch = useCallback(
    async (query: string) => {
      if (query.trim() === '') {
        setItems([])
        setStatus('idle')
        setErrorMessage('')
        setCurrentQuery('')
        router.replace(pathname)
        return
      }

      setStatus('loading')
      setErrorMessage('')
      setCurrentQuery(query.trim())

      const next = `${pathname}?q=${encodeURIComponent(query.trim())}`
      router.replace(next)

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        )
        const data: unknown = await res.json()

        if (!res.ok) {
          const err =
            typeof data === 'object' &&
            data !== null &&
            'error' in data &&
            typeof (data as { error: unknown }).error === 'string'
              ? (data as { error: string }).error
              : 'Something went wrong.'
          setErrorMessage(err)
          setStatus('error')
          setItems([])
          return
        }

        const parsed = data as { items?: EbayItem[]; total?: number }
        const nextItems = Array.isArray(parsed.items) ? parsed.items : []

        if (nextItems.length === 0) {
          setItems([])
          setStatus('empty')
        } else {
          setItems(nextItems)
          setStatus('results')
        }
      } catch {
        setErrorMessage('Failed to fetch results. Please try again.')
        setStatus('error')
        setItems([])
      }
    },
    [pathname, router]
  )

  useEffect(() => {
    if (initialLoadDone.current) {
      return
    }
    initialLoadDone.current = true
    const q = searchParams.get('q')
    if (q !== null && q.trim() !== '') {
      void handleSearch(q)
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

      {status === 'idle' ? (
        <p className="py-16 text-center text-zinc-400">
          Search for anything on eBay
        </p>
      ) : null}

      {status === 'loading' ? <LoadingSpinner /> : null}

      {status === 'results' ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            {items.length} result{items.length === 1 ? '' : 's'} for &quot;
            {currentQuery}&quot;
          </p>
          <ProductGrid items={items} />
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
