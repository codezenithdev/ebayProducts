import { searchItems } from '@/lib/ebay-client'
import type { SearchFilters } from '@/types/ebay'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const q = params.get('q')

  if (q === null || q.trim() === '') {
    return Response.json(
      { error: 'Query parameter q is required' },
      { status: 400 }
    )
  }

  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1)
  const limit = 20
  const offset = (page - 1) * limit

  const filters: SearchFilters = {}
  const minPriceStr = params.get('minPrice')
  const maxPriceStr = params.get('maxPrice')
  const condition = params.get('condition') ?? ''

  if (minPriceStr !== null && minPriceStr !== '') {
    const parsed = parseFloat(minPriceStr)
    if (!isNaN(parsed)) filters.minPrice = parsed
  }
  if (maxPriceStr !== null && maxPriceStr !== '') {
    const parsed = parseFloat(maxPriceStr)
    if (!isNaN(parsed)) filters.maxPrice = parsed
  }
  if (condition !== '') {
    filters.condition = condition
  }

  try {
    const { items, total } = await searchItems(q.trim(), limit, offset, filters)
    const totalPages = Math.ceil(total / limit)
    return Response.json({ items, total, page, totalPages }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Search API error for query "${q}":`, message)
    return Response.json(
      { error: 'Failed to fetch results. Please try again.' },
      { status: 500 }
    )
  }
}
