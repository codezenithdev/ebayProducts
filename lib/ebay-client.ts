import type { EbayItem } from '../types/ebay'
import { clearAccessTokenCache, getAccessToken } from './ebay-auth'

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
  limit: number = 20
): Promise<EbayItem[]> {
  const base = process.env.EBAY_API_BASE
  if (!base) {
    throw new Error('Missing EBAY_API_BASE environment variable')
  }

  const url = `${base}/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=${limit}`
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
    return []
  }

  return summaries.map(mapItemToEbayItem)
}
