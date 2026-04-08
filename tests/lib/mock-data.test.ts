import { describe, expect, it } from 'vitest'
import { mockItems } from '@/lib/mock-data'

describe('mockItems', () => {
  it('contains expected number of items', () => {
    expect(mockItems).toHaveLength(20)
  })

  it('all items have required fields', () => {
    mockItems.forEach((item, index) => {
      expect(item.id).toBeDefined()
      expect(typeof item.id).toBe('string')
      expect(item.title).toBeDefined()
      expect(typeof item.title).toBe('string')
      expect(item.price).toBeDefined()
      expect(typeof item.price).toBe('string')
      expect(item.currency).toBeDefined()
      expect(item.condition).toBeDefined()
      expect(item.imageUrl).toBeDefined()
      expect(item.itemWebUrl).toBeDefined()

      if (item.id === '') {
        throw new Error(`Item at index ${index} has empty id`)
      }
    })
  })

  it('all items have valid URLs', () => {
    mockItems.forEach((item, index) => {
      if (item.imageUrl !== '') {
        try {
          new URL(item.imageUrl)
        } catch {
          throw new Error(
            `Item at index ${index} ("${item.title}") has invalid imageUrl: ${item.imageUrl}`
          )
        }
      }

      if (item.itemWebUrl !== '') {
        try {
          new URL(item.itemWebUrl)
        } catch {
          throw new Error(
            `Item at index ${index} ("${item.title}") has invalid itemWebUrl: ${item.itemWebUrl}`
          )
        }
      }
    })
  })

  it('all itemWebUrls are valid eBay links', () => {
    mockItems.forEach((item) => {
      if (item.itemWebUrl) {
        expect(item.itemWebUrl).toMatch(/^https:\/\/www\.ebay\.com\/itm\/\d+$/)
      }
    })
  })

  it('prices are valid format (N/A or numeric)', () => {
    mockItems.forEach((item) => {
      if (item.price !== 'N/A') {
        expect(parseFloat(item.price)).toBeGreaterThan(0)
      }
    })
  })

  it('all conditions are valid strings', () => {
    mockItems.forEach((item) => {
      expect(item.condition).toMatch(/^(New|Used|Refurbished|For parts or not working)$/)
    })
  })

  it('all currencies are valid ISO 4217 codes', () => {
    mockItems.forEach((item) => {
      expect(item.currency).toMatch(/^[A-Z]{3}$/)
    })
  })

  it('image URLs use supported domains', () => {
    const supportedDomains = [
      'i.ebayimg.com',
      'ir.ebaystatic.com',
      'ebayimg.com',
      'images-na.ssl-images-amazon.com',
      'store.storeimages.cdn-apple.com',
      'picsum.photos',
    ]

    mockItems.forEach((item) => {
      if (item.imageUrl !== '') {
        const url = new URL(item.imageUrl)
        const matches = supportedDomains.some((domain) => url.hostname.includes(domain))
        expect(matches).toBe(true)
      }
    })
  })

  it('item titles are meaningful and not empty', () => {
    mockItems.forEach((item) => {
      expect(item.title.length).toBeGreaterThan(10)
      expect(item.title).not.toMatch(/^test|^placeholder|^mock/i)
    })
  })

  it('item IDs are unique', () => {
    const ids = mockItems.map((item) => item.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
