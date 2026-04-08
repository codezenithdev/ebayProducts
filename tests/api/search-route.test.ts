import { describe, expect, it, vi } from 'vitest'
import type { SearchFilters } from '@/types/ebay'

const searchItemsMock = vi.fn<
  (
    query: string,
    limit: number,
    offset: number,
    filters: SearchFilters
  ) => Promise<{ items: Array<{ id: string }>; total: number }>
>()

vi.mock('@/lib/ebay-client', () => ({
  searchItems: searchItemsMock,
}))

describe('GET /api/search', () => {
  it('returns 400 when q is missing', async () => {
    const { GET } = await import('@/app/api/search/route')
    const response = await GET(new Request('http://localhost/api/search'))
    const json = (await response.json()) as { error: string }

    expect(response.status).toBe(400)
    expect(json).toEqual({ error: 'Query parameter q is required' })
  })

  it('returns normalized items and total on success', async () => {
    searchItemsMock.mockResolvedValueOnce({
      items: [{ id: '1' }, { id: '2' }],
      total: 2,
    })

    const { GET } = await import('@/app/api/search/route')
    const response = await GET(new Request('http://localhost/api/search?q=shoes'))
    const json = (await response.json()) as {
      items: Array<{ id: string }>
      total: number
      page: number
      totalPages: number
    }

    expect(response.status).toBe(200)
    expect(searchItemsMock).toHaveBeenCalledWith('shoes', 20, 0, {})
    expect(json.total).toBe(2)
    expect(json.items).toEqual([{ id: '1' }, { id: '2' }])
    expect(json.page).toBe(1)
    expect(json.totalPages).toBe(1)
  })

  it('returns generic 500 error when search fails (regression guard)', async () => {
    searchItemsMock.mockRejectedValueOnce(new Error('upstream blew up'))

    const { GET } = await import('@/app/api/search/route')
    const response = await GET(new Request('http://localhost/api/search?q=laptop'))
    const json = (await response.json()) as { error: string }

    expect(response.status).toBe(500)
    expect(json).toEqual({ error: 'Failed to fetch results. Please try again.' })
  })

  describe('pagination', () => {
    it('computes correct offset for page=2', async () => {
      searchItemsMock.mockResolvedValueOnce({
        items: [],
        total: 40,
      })

      const { GET } = await import('@/app/api/search/route')
      await GET(new Request('http://localhost/api/search?q=phone&page=2'))

      expect(searchItemsMock).toHaveBeenCalledWith('phone', 20, 20, {})
    })

    it('defaults to page=1 when page param is absent', async () => {
      searchItemsMock.mockResolvedValueOnce({
        items: [],
        total: 5,
      })

      const { GET } = await import('@/app/api/search/route')
      await GET(new Request('http://localhost/api/search?q=phone'))

      expect(searchItemsMock).toHaveBeenCalledWith('phone', 20, 0, {})
    })

    it('returns totalPages in response body', async () => {
      searchItemsMock.mockResolvedValueOnce({
        items: [],
        total: 45,
      })

      const { GET } = await import('@/app/api/search/route')
      const res = await GET(
        new Request('http://localhost/api/search?q=phone&page=1')
      )
      const json = (await res.json()) as { totalPages: number; page: number }

      expect(json.totalPages).toBe(3)
      expect(json.page).toBe(1)
    })
  })

  describe('filters', () => {
    it('forwards minPrice and maxPrice to searchItems', async () => {
      searchItemsMock.mockResolvedValueOnce({
        items: [],
        total: 0,
      })

      const { GET } = await import('@/app/api/search/route')
      await GET(
        new Request(
          'http://localhost/api/search?q=watch&minPrice=50&maxPrice=200'
        )
      )

      expect(searchItemsMock).toHaveBeenCalledWith('watch', 20, 0, {
        minPrice: 50,
        maxPrice: 200,
      })
    })

    it('forwards condition to searchItems', async () => {
      searchItemsMock.mockResolvedValueOnce({
        items: [],
        total: 0,
      })

      const { GET } = await import('@/app/api/search/route')
      await GET(
        new Request('http://localhost/api/search?q=shoes&condition=New')
      )

      expect(searchItemsMock).toHaveBeenCalledWith('shoes', 20, 0, {
        condition: 'New',
      })
    })

    it('ignores empty string minPrice/maxPrice and passes no price filters', async () => {
      searchItemsMock.mockResolvedValueOnce({
        items: [],
        total: 0,
      })

      const { GET } = await import('@/app/api/search/route')
      await GET(
        new Request(
          'http://localhost/api/search?q=bag&minPrice=&maxPrice='
        )
      )

      expect(searchItemsMock).toHaveBeenCalledWith('bag', 20, 0, {})
    })

    it('forwards all filters together with pagination', async () => {
      searchItemsMock.mockResolvedValueOnce({
        items: [],
        total: 0,
      })

      const { GET } = await import('@/app/api/search/route')
      await GET(
        new Request(
          'http://localhost/api/search?q=laptop&page=3&minPrice=100&maxPrice=500&condition=Used'
        )
      )

      expect(searchItemsMock).toHaveBeenCalledWith('laptop', 20, 40, {
        minPrice: 100,
        maxPrice: 500,
        condition: 'Used',
      })
    })
  })
})

describe('GET /search alias', () => {
  it('uses the same handler contract as /api/search', async () => {
    searchItemsMock.mockResolvedValueOnce({
      items: [{ id: 'alias-1' }],
      total: 1,
    })

    const { GET } = await import('@/app/search/route')
    const response = await GET(new Request('http://localhost/search?q=headphones'))
    const json = (await response.json()) as {
      items: Array<{ id: string }>
      total: number
      page: number
      totalPages: number
    }

    expect(response.status).toBe(200)
    expect(searchItemsMock).toHaveBeenCalledWith('headphones', 20, 0, {})
    expect(json.items).toEqual([{ id: 'alias-1' }])
    expect(json.total).toBe(1)
    expect(json.page).toBe(1)
    expect(json.totalPages).toBe(1)
  })
})
