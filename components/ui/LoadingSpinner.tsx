type LoadingSpinnerProps = {
  message?: string
}

export function LoadingSpinner({ message = 'Searching eBay...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <svg
        className="h-12 w-12 animate-spin text-[#f5c518]"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          d="M12 2a10 10 0 0 1 10 10"
        />
      </svg>
      <p className="text-sm text-zinc-400">{message}</p>
    </div>
  )
}
