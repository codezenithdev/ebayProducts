import { searchItems } from '@/lib/ebay-client'

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')

  if (q === null || q.trim() === '') {
    return Response.json(
      { error: 'Query parameter q is required' },
      { status: 400 }
    )
  }

  try {
    const items = await searchItems(q.trim())
    return Response.json({ items, total: items.length }, { status: 200 })
  } catch {
    return Response.json(
      { error: 'Failed to fetch results. Please try again.' },
      { status: 500 }
    )
  }
}
