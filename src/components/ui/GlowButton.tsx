import { motion } from 'framer-motion'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles = {
  primary:   'bg-brand text-white hover:bg-brand-bright shadow-button',
  secondary: 'bg-sunken text-text border border-border hover:border-text-muted',
  danger:    'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
  ghost:     'bg-transparent text-text-muted hover:text-text',
}

const sizeStyles = {
  sm: 'px-3.5 py-1.5 text-[13px]',
  md: 'px-4 py-2.5 text-[14px]',
  lg: 'px-6 py-3 text-[16px]',
}

/**
 * Brand-styled button with a consistent press-flicker (whileTap scale).
 *
 * The whileTap is the "haptic visual" stand-in — phones without native
 * haptic feedback get a quick scale dip so a tap feels confirmed.  This
 * is in addition to the `.app-btn:active { scale(0.97) }` CSS rule, which
 * stays as a fallback for mouse / keyboard-trigger presses.
 */
export const GlowButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: Props) => (
  <motion.button
    whileTap={disabled ? undefined : { scale: 0.96 }}
    transition={{ type: 'spring', stiffness: 600, damping: 30 }}
    disabled={disabled}
    className={`app-btn flex items-center justify-center gap-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    {...props}
  >
    {children}
  </motion.button>
)
