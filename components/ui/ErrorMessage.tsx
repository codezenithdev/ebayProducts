type ErrorMessageProps = {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 rounded-xl border border-red-900/50 bg-red-950/40 px-6 py-8 text-center"
      role="alert"
    >
      <svg
        className="h-10 w-10 text-red-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-red-100">{message}</p>
      {onRetry !== undefined ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-red-900/80 px-5 py-2 text-sm font-medium text-red-50 transition duration-150 ease-out hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 active:scale-95"
        >
          Try again
        </button>
      ) : null}
    </div>
  )
}
