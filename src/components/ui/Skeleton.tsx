interface Props {
  className?: string
  /** Make it round (avatars). */
  rounded?: boolean
}

/**
 * Pulsing placeholder block used during initial IDB hydration.
 * Honours reduce-motion via the global rule in index.css.
 */
export const Skeleton = ({ className = '', rounded = false }: Props) => (
  <div
    aria-hidden="true"
    className={`bg-elevated/70 border border-border/40 ${rounded ? 'rounded-full' : 'rounded-lg'} skeleton-pulse ${className}`}
  />
)
