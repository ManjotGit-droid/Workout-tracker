import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // ── Apple-minimalist tokens (preferred for new code) ──────────────
        bg:          'var(--bg)',
        elevated:    'var(--bg-elevated)',
        sunken:      'var(--bg-sunken)',
        surface:     'var(--surface)',
        border:      'var(--border)',
        'border-soft': 'var(--border-soft)',
        separator:   'var(--separator)',

        text:        'var(--text)',
        'text-soft': 'var(--text-soft)',
        'text-muted':'var(--text-muted)',
        'text-faint':'var(--text-faint)',

        accent:      'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        brand:       'var(--brand)',
        'brand-bright': 'var(--brand-bright)',
        gold:        'var(--gold)',
        danger:      'var(--danger)',
        success:     'var(--success)',

        // ── Legacy sl-* tokens — now mapped to theme variables ────────────
        // Keeps existing class names working without rewriting every file.
        sl: {
          bg:        'var(--bg)',
          surface:   'var(--bg-elevated)',
          border:    'var(--border)',
          purple:    'var(--brand)',
          'purple-dim':    'var(--brand-soft)',
          'purple-bright': 'var(--brand-bright)',
          blue:      'var(--brand)',
          'blue-dim':'var(--brand-soft)',
          gold:      'var(--gold)',
          'gold-bright': 'var(--accent)',
          text:      'var(--text)',
          muted:     'var(--text-muted)',
          danger:    'var(--danger)',
          success:   'var(--success)',
        },
      },
      animation: {
        'glow-pulse': 'glowPulse 1.5s ease-in-out infinite',
        'rank-appear': 'rankAppear 0.6s ease-out',
        'float-in': 'floatIn 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 2px var(--brand))' },
          '50%':      { filter: 'drop-shadow(0 0 10px var(--brand))' },
        },
        rankAppear: {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '80%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        floatIn: {
          '0%':   { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      fontFamily: {
        // SF Pro / Inter — Apple-style sans
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Inter"', 'system-ui', 'sans-serif'],
        sans:    ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"SF Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '22px',
        '3xl': '28px',
      },
      boxShadow: {
        card:   'var(--shadow-card)',
        modal:  'var(--shadow-modal)',
        button: 'var(--shadow-button)',
        // Legacy aliases mapped to subtle shadow (no neon glow)
        'neon-purple': '0 0 0 1px var(--brand-soft)',
        'neon-blue':   '0 0 0 1px var(--brand-soft)',
        'neon-gold':   '0 0 0 1px rgba(217, 119, 6, 0.18)',
        'neon-sm':     'var(--shadow-button)',
      },
      letterSpacing: {
        tight: '-0.02em',
        snug:  '-0.01em',
      },
    },
  },
  plugins: [],
} satisfies Config
