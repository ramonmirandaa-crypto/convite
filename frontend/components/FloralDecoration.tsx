export function FloralCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const positions = {
    'top-left': '-top-4 -left-4 rotate-0',
    'top-right': '-top-4 -right-4 rotate-90',
    'bottom-left': '-bottom-4 -left-4 -rotate-90',
    'bottom-right': '-bottom-4 -right-4 rotate-180',
  }

  return (
    <div className={`absolute ${positions[position]} w-24 h-24 sm:w-32 sm:h-32 pointer-events-none opacity-60`}>
      <svg viewBox="0 0 100 100" className="w-full h-full text-rose-200">
        <defs>
          <linearGradient id={`floral-gradient-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="100%" stopColor="#fda4af" />
          </linearGradient>
        </defs>
        {/* Pétalas */}
        <circle cx="50" cy="20" r="15" fill={`url(#floral-gradient-${position})`} />
        <circle cx="80" cy="50" r="15" fill={`url(#floral-gradient-${position})`} />
        <circle cx="50" cy="80" r="15" fill={`url(#floral-gradient-${position})`} />
        <circle cx="20" cy="50" r="15" fill={`url(#floral-gradient-${position})`} />
        <circle cx="65" cy="35" r="12" fill={`url(#floral-gradient-${position})`} opacity="0.7" />
        <circle cx="65" cy="65" r="12" fill={`url(#floral-gradient-${position})`} opacity="0.7" />
        <circle cx="35" cy="65" r="12" fill={`url(#floral-gradient-${position})`} opacity="0.7" />
        <circle cx="35" cy="35" r="12" fill={`url(#floral-gradient-${position})`} opacity="0.7" />
        {/* Centro */}
        <circle cx="50" cy="50" r="10" fill="#fbbf24" />
        {/* Folhas */}
        <ellipse cx="10" cy="30" rx="8" ry="15" fill="#86efac" transform="rotate(-30 10 30)" />
        <ellipse cx="30" cy="10" rx="8" ry="15" fill="#86efac" transform="rotate(30 30 10)" />
      </svg>
    </div>
  )
}

export function FloralDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-8">
      <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-rose-300 flex-1 max-w-[100px]" />
      <svg width="40" height="40" viewBox="0 0 40 40" className="text-rose-400">
        <circle cx="20" cy="10" r="5" fill="currentColor" />
        <circle cx="30" cy="20" r="5" fill="currentColor" />
        <circle cx="20" cy="30" r="5" fill="currentColor" />
        <circle cx="10" cy="20" r="5" fill="currentColor" />
        <circle cx="20" cy="20" r="4" fill="#fbbf24" />
      </svg>
      <div className="h-px bg-gradient-to-l from-transparent via-rose-300 to-rose-300 flex-1 max-w-[100px]" />
    </div>
  )
}

export function HeartDecoration({ className = '' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={`w-6 h-6 text-rose-400 ${className}`}
      fill="currentColor"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}
