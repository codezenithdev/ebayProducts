import { describe, expect, it, vi } from 'vitest'

const searchItemsMock = vi.fn<(query: string) => Promise<Array<{ id: string }>>>()

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
    searchItemsMock.mockResolvedValueOnce([
      { id: '1' },
      { id: '2' },
    ])

    const { GET } = await import('@/app/api/search/route')
    const response = await GET(new Request('http://localhost/api/search?q=shoes'))
    const json = (await response.json()) as { items: Array<{ id: string }>; total: number }

    expect(response.status).toBe(200)
    expect(searchItemsMock).toHaveBeenCalledWith('shoes')
    expect(json.total).toBe(2)
    expect(json.items).toEqual([{ id: '1' }, { id: '2' }])
  })

  it('returns generic 500 error when search fails (regression guard)', async () => {
    searchItemsMock.mockRejectedValueOnce(new Error('upstream blew up'))

    const { GET } = await import('@/app/api/search/route')
    const response = await GET(new Request('http://localhost/api/search?q=laptop'))
    const json = (await response.json()) as { error: string }

    expect(response.status).toBe(500)
    expect(json).toEqual({ error: 'Failed to fetch results. Please try again.' })
  })
})
