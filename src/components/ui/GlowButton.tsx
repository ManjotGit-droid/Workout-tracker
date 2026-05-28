import { motion } from 'framer-motion'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles = {
  // Primary uses the .app-btn-primary class so it picks up the gradient
  // + soft accent halo defined once in index.css.
  primary:   'app-btn-primary',
  secondary: 'app-btn-secondary',
  danger:    'bg-transparent text-danger border border-danger/40 hover:bg-danger/10',
  ghost:     'bg-transparent text-text-muted hover:text-text',
}

const sizeStyles = {
  sm: 'px-3.5 py-1.5 text-[13px]',
  md: 'px-4 py-2.5 text-[14px]',
  lg: 'px-6 py-3 text-[16px]',
}

export const GlowButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: Props) => (
  <motion.button
    whileTap={disabled ? undefined : { scale: 0.97 }}
    transition={{ type: 'spring', stiffness: 600, damping: 30 }}
    disabled={disabled}
    className={`app-btn flex items-center justify-center gap-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    {...props}
  >
    {children}
  </motion.button>
)
