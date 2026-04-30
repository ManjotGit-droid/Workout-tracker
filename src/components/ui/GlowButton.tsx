import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles = {
  primary:   'bg-sl-purple text-white border border-sl-purple hover:bg-purple-700 shadow-neon-sm active:scale-95',
  secondary: 'bg-sl-surface text-sl-text border border-sl-border hover:border-sl-purple/60 active:scale-95',
  danger:    'bg-sl-danger/10 text-sl-danger border border-sl-danger/40 hover:bg-sl-danger/20 active:scale-95',
  ghost:     'bg-transparent text-sl-muted border border-transparent hover:text-sl-text active:scale-95',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function GlowButton({ children, variant = 'primary', size = 'md', className = '', ...props }: Props) {
  return (
    <button
      className={`font-display font-semibold tracking-wide rounded-lg transition-all duration-150 flex items-center gap-2 justify-center disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
