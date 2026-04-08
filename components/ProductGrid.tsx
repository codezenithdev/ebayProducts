import type { EbayItem } from '@/types/ebay'
import { ProductCard } from './ProductCard'

type ProductGridProps = {
  items: EbayItem[]
}

export function ProductGrid({ items }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  )
}
