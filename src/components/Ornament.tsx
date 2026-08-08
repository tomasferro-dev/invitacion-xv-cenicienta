/** Divisor ornamental dorado (estrella + filetes). */
export default function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60 sm:w-24" />
      <svg width="18" height="18" viewBox="0 0 24 24" className="animate-twinkle">
        <path
          d="M12 2l2.2 6.4L21 9l-5.4 4.1L17.6 20 12 16.2 6.4 20l2-6.9L3 9l6.8-.6z"
          fill="currentColor"
        />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60 sm:w-24" />
    </div>
  )
}
