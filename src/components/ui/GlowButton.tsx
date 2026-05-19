import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
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

export const GlowButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: Props) => (
  <button
    className={`app-btn flex items-center justify-center gap-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
)
