import type { EbayItem, SearchFilters } from '../types/ebay'
import { clearAccessTokenCache, getAccessToken } from './ebay-auth'
import { mockItems } from './mock-data'

const USE_MOCK = process.env.EBAY_USE_MOCK === 'true'

type EbayBrowsePrice = {
  value?: string
  currency?: string
}

type EbayBrowseImage = {
  imageUrl?: string
}

type EbayBrowseItemSummary = {
  itemId?: string
  title?: string
  price?: EbayBrowsePrice
  condition?: string
  image?: EbayBrowseImage
  itemWebUrl?: string
}

type EbayBrowseSearchResponse = {
  itemSummaries?: EbayBrowseItemSummary[]
  total?: number
}

function mapItemToEbayItem(item: EbayBrowseItemSummary): EbayItem {
  return {
    id: item.itemId ?? '',
    title: item.title ?? '',
    price: item.price?.value ?? 'N/A',
    currency: item.price?.currency ?? 'USD',
    condition: item.condition ?? 'Unknown',
    imageUrl: item.image?.imageUrl ?? '',
    itemWebUrl: item.itemWebUrl ?? '',
  }
}

export async function searchItems(
  query: string,
  limit: number = 20,
  offset: number = 0,
  filters?: SearchFilters
): Promise<{ items: EbayItem[]; total: number }> {
  if (USE_MOCK) {
    const q = query.toLowerCase().trim()
    if (!q) return { items: [], total: 0 }

    let filtered = mockItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.condition.toLowerCase().includes(q)
    )

    if (filters?.minPrice !== undefined) {
      filtered = filtered.filter(
        (item) => parseFloat(item.price) >= filters.minPrice!
      )
    }
    if (filters?.maxPrice !== undefined) {
      filtered = filtered.filter(
        (item) => parseFloat(item.price) <= filters.maxPrice!
      )
    }
    if (filters?.condition && filters.condition !== '') {
      const condLower = filters.condition.toLowerCase()
      filtered = filtered.filter(
        (item) => item.condition.toLowerCase() === condLower
      )
    }

    const total = filtered.length
    const items = filtered.slice(offset, offset + limit)

    // Simulate network delay so loading state is visible
    await new Promise((resolve) => setTimeout(resolve, 600))
    return { items, total }
  }

  const base = process.env.EBAY_API_BASE
  if (!base) {
    throw new Error('Missing EBAY_API_BASE environment variable')
  }

  // Build eBay filter string
  const filterParts: string[] = []
  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    const min = filters?.minPrice ?? 0
    const max = filters?.maxPrice ?? ''
    filterParts.push(`price:[${min}..${max}]`)
  }
  if (filters?.condition && filters.condition !== '') {
    // Map UI condition string to eBay API condition enum
    const conditionMap: Record<string, string> = {
      new: 'NEW',
      used: 'USED',
      refurbished: 'VERY_GOOD',
      'for parts or not working': 'UNSPECIFIED_CONDITION',
    }
    const ebayCondition =
      conditionMap[filters.condition.toLowerCase()] ??
      filters.condition.toUpperCase()
    filterParts.push(`conditions:{${ebayCondition}}`)
  }

  let url = `${base}/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`
  if (filterParts.length > 0) {
    url += `&filter=${filterParts.join(',')}`
  }

  const getResponseWithToken = async (): Promise<Response> => {
    const token = await getAccessToken()
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  let response = await getResponseWithToken()
  if (response.status === 401) {
    // Token may be expired/revoked even if local cache says otherwise.
    clearAccessTokenCache()
    response = await getResponseWithToken()
  }
  if (!response.ok) {
    throw new Error(`eBay Browse API error: ${response.status}`)
  }

  const data: unknown = await response.json()
  const parsed = data as EbayBrowseSearchResponse
  const summaries = parsed.itemSummaries

  if (!Array.isArray(summaries) || summaries.length === 0) {
    return { items: [], total: parsed.total ?? 0 }
  }

  return {
    items: summaries.map(mapItemToEbayItem),
    total: parsed.total ?? summaries.length,
  }
}
