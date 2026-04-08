export type EbayItem = {
  id: string
  title: string
  price: string
  currency: string
  condition: string
  imageUrl: string
  itemWebUrl: string
}

export type SearchResponse = {
  items: EbayItem[]
  total: number
}

export type SearchError = {
  error: string
}

export type SearchFilters = {
  minPrice?: number
  maxPrice?: number
  condition?: string  // empty string means "all conditions"
}
