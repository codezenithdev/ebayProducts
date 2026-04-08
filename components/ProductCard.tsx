import { useState } from 'react'
import Image from 'next/image'
import type { EbayItem } from '@/types/ebay'

type ProductCardProps = {
  item: EbayItem
}

function conditionBadgeClass(condition: string): string {
  const c = condition.trim().toLowerCase()
  if (c === 'new') {
    return 'bg-green-600/20 text-green-400 border-green-700/50'
  }
  if (c === 'used') {
    return 'bg-yellow-600/20 text-yellow-400 border-yellow-700/50'
  }
  return 'bg-zinc-800 text-zinc-400 border-zinc-700'
}

export function ProductCard({ item }: ProductCardProps) {
  const priceUnavailable = item.price === 'N/A'
  const [imageError, setImageError] = useState(false)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#18181b] shadow-black/20 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50">
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-900">
        {item.imageUrl !== '' && !imageError ? (
          <Image
            src={item.imageUrl}
            alt={`${item.title}`}
            fill
            className="object-contain p-2 transition duration-200 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-14 w-14"
              aria-hidden
            >
              <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
              <path
                fillRule="evenodd"
                d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.402c.81 1.392 2.86 1.905 4.469.674l1.04-.914c.78-.682 1.986-.706 2.804-.043 1.17.94 1.845 2.38 1.845 3.904v6.815c0 1.53-.675 2.965-1.845 3.904-.818.663-2.026.639-2.804-.043l-1.04-.914c-1.61-1.23-3.66-.718-4.469.674l-.821 1.402c-.502.805-1.364 1.338-2.332 1.391-1.896.098-3.818.098-5.714 0-.967-.053-1.83-.586-2.332-1.391l-.821-1.402c-.81-1.392-2.86-1.905-4.469-.674l-1.04.914c-.778.682-1.986.706-2.804.043C3.675 20.635 3 19.2 3 17.67V10.855c0-1.524.675-2.965 1.845-3.904.818-.663 2.026-.639 2.804.043l1.04.914c1.61 1.23 3.66.718 4.469-.674l.821-1.402c.502-.805 1.365-1.338 2.332-1.39zM12 15a6 6 0 100-12 6 6 0 000 12z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-[#fafafa]">
          {item.title}
        </h2>
        <p
          className={`font-mono text-base font-semibold ${priceUnavailable ? 'text-zinc-500' : 'text-[#fafafa]'}`}
        >
          {priceUnavailable
            ? 'Price unavailable'
            : `${item.currency} ${item.price}`}
        </p>
        <span
          className={`inline-flex w-fit rounded-full border px-2 py-0.5 font-mono text-xs ${conditionBadgeClass(item.condition)}`}
        >
          {item.condition}
        </span>
        <a
          href={item.itemWebUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/80 py-2 text-center text-sm font-medium text-[#f5c518] transition duration-150 ease-out hover:border-[#f5c518] hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 active:scale-95"
        >
          View on eBay
        </a>
      </div>
    </article>
  )
}
