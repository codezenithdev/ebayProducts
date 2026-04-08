let cache: { token: string; expiresAt: number } | null = null

export async function getAccessToken(): Promise<string> {
  const clientId = process.env.EBAY_CLIENT_ID
  const clientSecret = process.env.EBAY_CLIENT_SECRET
  const oauthUrl = process.env.EBAY_OAUTH_URL

  if (!clientId || !clientSecret || !oauthUrl) {
    throw new Error(
      'Missing eBay OAuth configuration (EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, or EBAY_OAUTH_URL)'
    )
  }

  if (cache !== null && Date.now() < cache.expiresAt - 60_000) {
    return cache.token
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(oauthUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body:
      'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
  })

  if (!response.ok) {
    throw new Error(
      `eBay OAuth token request failed: HTTP ${response.status} ${response.statusText}`
    )
  }

  const data: unknown = await response.json()
  if (
    typeof data !== 'object' ||
    data === null ||
    !('access_token' in data) ||
    !('expires_in' in data) ||
    typeof (data as { access_token: unknown }).access_token !== 'string' ||
    typeof (data as { expires_in: unknown }).expires_in !== 'number'
  ) {
    throw new Error('eBay OAuth response missing access_token or expires_in')
  }

  const accessToken = (data as { access_token: string }).access_token
  const expiresIn = (data as { expires_in: number }).expires_in
  const expiresAt = Date.now() + expiresIn * 1000

  cache = { token: accessToken, expiresAt }

  return accessToken
}
