import { describe, expect, it, vi } from 'vitest'

describe('getAccessToken', () => {
  it('throws if required OAuth env vars are missing', async () => {
    delete process.env.EBAY_CLIENT_ID
    delete process.env.EBAY_CLIENT_SECRET
    delete process.env.EBAY_OAUTH_URL

    const { getAccessToken } = await import('@/lib/ebay-auth')

    await expect(getAccessToken()).rejects.toThrow(
      'Missing eBay OAuth configuration'
    )
  })

  it('fetches token and sends correct request payload', async () => {
    process.env.EBAY_CLIENT_ID = 'client-id'
    process.env.EBAY_CLIENT_SECRET = 'client-secret'
    process.env.EBAY_OAUTH_URL = 'https://example.com/oauth/token'

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ access_token: 'token-123', expires_in: 3600 }), {
        status: 200,
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { getAccessToken } = await import('@/lib/ebay-auth')
    const token = await getAccessToken()

    expect(token).toBe('token-123')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const requestInit = fetchMock.mock.calls[0]?.[1]
    expect(requestInit).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    })
    expect(
      (requestInit as { headers: Record<string, string> }).headers.Authorization
    ).toBe(`Basic ${Buffer.from('client-id:client-secret').toString('base64')}`)
  })

  it('reuses cached token across requests before expiry', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    process.env.EBAY_CLIENT_ID = 'client-id'
    process.env.EBAY_CLIENT_SECRET = 'client-secret'
    process.env.EBAY_OAUTH_URL = 'https://example.com/oauth/token'

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ access_token: 'cached-token', expires_in: 3600 }), {
        status: 200,
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { getAccessToken } = await import('@/lib/ebay-auth')

    const first = await getAccessToken()
    const second = await getAccessToken()

    expect(first).toBe('cached-token')
    expect(second).toBe('cached-token')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('throws a descriptive error when oauth response is not ok', async () => {
    process.env.EBAY_CLIENT_ID = 'client-id'
    process.env.EBAY_CLIENT_SECRET = 'client-secret'
    process.env.EBAY_OAUTH_URL = 'https://example.com/oauth/token'

    const fetchMock = vi.fn().mockResolvedValue(
      new Response('nope', { status: 401, statusText: 'Unauthorized' })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { getAccessToken } = await import('@/lib/ebay-auth')

    await expect(getAccessToken()).rejects.toThrow(
      'eBay OAuth token request failed: HTTP 401 Unauthorized'
    )
  })
})
