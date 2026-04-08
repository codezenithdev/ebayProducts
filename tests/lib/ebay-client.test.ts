import { beforeEach, describe, expect, it, vi } from 'vitest'

const getAccessTokenMock = vi.fn<() => Promise<string>>()
const clearAccessTokenCacheMock = vi.fn<() => void>()

vi.mock('@/lib/ebay-auth', () => ({
  getAccessToken: getAccessTokenMock,
  clearAccessTokenCache: clearAccessTokenCacheMock,
}))

describe('searchItems', () => {
  beforeEach(() => {
    process.env.EBAY_API_BASE = 'https://api.sandbox.ebay.com'
    getAccessTokenMock.mockResolvedValue('oauth-token')
    clearAccessTokenCacheMock.mockReset()
  })

  it('maps eBay item summaries into normalized EbayItem objects', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          itemSummaries: [
            {
              itemId: 'v1|123|0',
              title: 'Nintendo Switch Console',
              price: { value: '199.99', currency: 'USD' },
              condition: 'Used',
              image: { imageUrl: 'https://i.ebayimg.com/images/1.jpg' },
              itemWebUrl: 'https://www.ebay.com/itm/123',
            },
            {
              itemId: 'v1|456|0',
              title: 'Mystery Item',
            },
          ],
          total: 2,
        }),
        { status: 200 }
      )
    )
    vi.stubGlobal('fetch', fetchMock)

    const { searchItems } = await import('@/lib/ebay-client')
    const result = await searchItems('switch', 2, 0)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q=switch&limit=2&offset=0',
      {
        headers: {
          Authorization: 'Bearer oauth-token',
        },
      }
    )
    expect(result.items).toEqual([
      {
        id: 'v1|123|0',
        title: 'Nintendo Switch Console',
        price: '199.99',
        currency: 'USD',
        condition: 'Used',
        imageUrl: 'https://i.ebayimg.com/images/1.jpg',
        itemWebUrl: 'https://www.ebay.com/itm/123',
      },
      {
        id: 'v1|456|0',
        title: 'Mystery Item',
        price: 'N/A',
        currency: 'USD',
        condition: 'Unknown',
        imageUrl: '',
        itemWebUrl: '',
      },
    ])
    expect(result.total).toBe(2)
  })

  it('returns an empty array when itemSummaries is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))
    )

    const { searchItems } = await import('@/lib/ebay-client')
    const result = await searchItems('anything', 20, 0)

    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
  })

  it('throws with status code when browse API response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('error', { status: 503 })))

    const { searchItems } = await import('@/lib/ebay-client')

    await expect(searchItems('query', 20, 0)).rejects.toThrow('eBay Browse API error: 503')
  })

  describe('searchItems — live path: offset and filter in URL', () => {
    beforeEach(() => {
      process.env.EBAY_API_BASE = 'https://api.sandbox.ebay.com'
      getAccessTokenMock.mockResolvedValue('oauth-token')
    })

    it('appends offset to URL when provided', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ itemSummaries: [], total: 100 }), { status: 200 })
      )
      vi.stubGlobal('fetch', fetchMock)

      const { searchItems } = await import('@/lib/ebay-client')
      await searchItems('phone', 20, 40)

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q=phone&limit=20&offset=40',
        expect.any(Object)
      )
    })

    it('appends price filter when minPrice and maxPrice are provided', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ itemSummaries: [], total: 0 }), { status: 200 })
      )
      vi.stubGlobal('fetch', fetchMock)

      const { searchItems } = await import('@/lib/ebay-client')
      await searchItems('watch', 20, 0, { minPrice: 50, maxPrice: 200 })

      const calledUrl = fetchMock.mock.calls[0]?.[0] as string
      expect(decodeURIComponent(calledUrl)).toContain('filter=price:[50..200]')
    })

    it('appends condition filter when condition is provided', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ itemSummaries: [], total: 0 }), { status: 200 })
      )
      vi.stubGlobal('fetch', fetchMock)

      const { searchItems } = await import('@/lib/ebay-client')
      await searchItems('shoes', 20, 0, { condition: 'New' })

      const calledUrl = fetchMock.mock.calls[0]?.[0] as string
      expect(decodeURIComponent(calledUrl)).toContain('filter=conditions:{NEW}')
    })

    it('uses total from eBay response when present', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            itemSummaries: [{ itemId: '1', title: 'Test' }],
            total: 347,
          }),
          { status: 200 }
        )
      )
      vi.stubGlobal('fetch', fetchMock)

      const { searchItems } = await import('@/lib/ebay-client')
      const result = await searchItems('test', 20, 0)

      expect(result.total).toBe(347)
    })

    it('throws when EBAY_API_BASE is missing', async () => {
      delete process.env.EBAY_API_BASE

      const { searchItems } = await import('@/lib/ebay-client')
      await expect(searchItems('query', 20, 0)).rejects.toThrow(
        'Missing EBAY_API_BASE environment variable'
      )
    })
  })

  describe('searchItems — mock path', () => {
    beforeEach(() => {
      process.env.EBAY_USE_MOCK = 'true'
    })

    it('returns items matching query title in mock mode', async () => {
      const { searchItems } = await import('@/lib/ebay-client')
      const result = await searchItems('apple', 20, 0)

      expect(result.items.length).toBeGreaterThan(0)
      expect(result.total).toBe(result.items.length)
      result.items.forEach((item) => {
        expect(item.title.toLowerCase()).toContain('apple')
      })
    })

    it('returns empty result when query matches no mock items', async () => {
      const { searchItems } = await import('@/lib/ebay-client')
      const result = await searchItems('zzznomatch', 20, 0)

      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    })

    it('applies pagination via offset and limit in mock mode', async () => {
      const { searchItems } = await import('@/lib/ebay-client')

      const fullResult = await searchItems('used', 20, 0)
      const page1 = await searchItems('used', 2, 0)
      const page2 = await searchItems('used', 2, 2)

      expect(page1.items.length).toBeLessThanOrEqual(2)
      expect(page2.items.length).toBeLessThanOrEqual(2)
      expect(page1.total).toBe(fullResult.total)
      expect(page2.total).toBe(fullResult.total)
      const page1Ids = new Set(page1.items.map((i) => i.id))
      page2.items.forEach((item) => expect(page1Ids.has(item.id)).toBe(false))
    })

    it('filters mock items by minPrice', async () => {
      const { searchItems } = await import('@/lib/ebay-client')
      const result = await searchItems('used', 20, 0, { minPrice: 200 })

      result.items.forEach((item) => {
        expect(parseFloat(item.price)).toBeGreaterThanOrEqual(200)
      })
    })

    it('filters mock items by maxPrice', async () => {
      const { searchItems } = await import('@/lib/ebay-client')
      const result = await searchItems('apple', 20, 0, { maxPrice: 300 })

      result.items.forEach((item) => {
        expect(parseFloat(item.price)).toBeLessThanOrEqual(300)
      })
      expect(result.items.some((i) => i.title.includes('AirPods'))).toBe(true)
      expect(result.items.some((i) => i.title.includes('MacBook'))).toBe(false)
    })

    it('filters mock items by exact condition', async () => {
      const { searchItems } = await import('@/lib/ebay-client')
      const result = await searchItems('apple', 20, 0, { condition: 'New' })

      expect(result.items.length).toBeGreaterThan(0)
      result.items.forEach((item) => {
        expect(item.condition.toLowerCase()).toBe('new')
      })
      expect(result.items.some((i) => i.title.includes('AirPods'))).toBe(true)
      expect(result.items.some((i) => i.title.includes('iPhone'))).toBe(false)
    })

    it('total reflects filtered count before pagination slice', async () => {
      const { searchItems } = await import('@/lib/ebay-client')
      const full = await searchItems('apple', 20, 0)
      const paged = await searchItems('apple', 1, 0)

      expect(full.total).toBe(paged.total)
      expect(paged.items.length).toBe(1)
    })
  })

  it('refreshes token and retries once on 401 before succeeding', async () => {
    getAccessTokenMock
      .mockResolvedValueOnce('stale-token')
      .mockResolvedValueOnce('fresh-token')

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('expired', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            itemSummaries: [{ itemId: '1', title: 'After Retry' }],
            total: 1,
          }),
          { status: 200 }
        )
      )
    vi.stubGlobal('fetch', fetchMock)

    const { searchItems } = await import('@/lib/ebay-client')
    const result = await searchItems('retry', 20, 0)

    expect(clearAccessTokenCacheMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.items).toEqual([
      {
        id: '1',
        title: 'After Retry',
        price: 'N/A',
        currency: 'USD',
        condition: 'Unknown',
        imageUrl: '',
        itemWebUrl: '',
      },
    ])
    expect(result.total).toBe(1)
  })
})
