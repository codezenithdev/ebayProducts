import { beforeEach, describe, expect, it, vi } from 'vitest'

const getAccessTokenMock = vi.fn<() => Promise<string>>()

vi.mock('@/lib/ebay-auth', () => ({
  getAccessToken: getAccessTokenMock,
}))

describe('searchItems', () => {
  beforeEach(() => {
    process.env.EBAY_API_BASE = 'https://api.sandbox.ebay.com'
    getAccessTokenMock.mockResolvedValue('oauth-token')
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
        }),
        { status: 200 }
      )
    )
    vi.stubGlobal('fetch', fetchMock)

    const { searchItems } = await import('@/lib/ebay-client')
    const items = await searchItems('switch', 2)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q=switch&limit=2',
      {
        headers: {
          Authorization: 'Bearer oauth-token',
        },
      }
    )
    expect(items).toEqual([
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
  })

  it('returns an empty array when itemSummaries is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))
    )

    const { searchItems } = await import('@/lib/ebay-client')
    const items = await searchItems('anything')

    expect(items).toEqual([])
  })

  it('throws with status code when browse API response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('error', { status: 503 })))

    const { searchItems } = await import('@/lib/ebay-client')

    await expect(searchItems('query')).rejects.toThrow('eBay Browse API error: 503')
  })
})
