import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // ── Forge tokens (canvas, lines, text, single accent) ───────────────
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
        'text-ghost':'var(--text-ghost)',

        accent:      'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        'accent-soft': 'var(--accent-soft)',
        'accent-line': 'var(--accent-line)',

        // brand-* are legacy aliases — mapped to the single accent.
        brand:       'var(--brand)',
        'brand-soft':'var(--brand-soft)',
        'brand-bright': 'var(--brand-bright)',

        gold:        'var(--gold)',
        danger:      'var(--danger)',
        success:     'var(--success)',

        // ── Legacy sl-* tokens — kept as alias map so old class names work ──
        sl: {
          bg:        'var(--bg)',
          surface:   'var(--bg-elevated)',
          border:    'var(--border)',
          purple:    'var(--accent)',
          'purple-dim':    'var(--accent-soft)',
          'purple-bright': 'var(--brand-bright)',
          blue:      'var(--accent)',
          'blue-dim':'var(--accent-soft)',
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
          '0%, 100%': { filter: 'drop-shadow(0 0 2px var(--accent))' },
          '50%':      { filter: 'drop-shadow(0 0 8px var(--accent))' },
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
        // Geist for body/UI; Geist Mono for all numerics & eyebrows
        display: ['"Geist"', '-apple-system', 'BlinkMacSystemFont', '"Inter"', 'system-ui', 'sans-serif'],
        sans:    ['"Geist"', '-apple-system', 'BlinkMacSystemFont', '"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"Geist Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '22px',
        '3xl': '28px',
      },
      boxShadow: {
        card:   'var(--shadow-card)',
        modal:  'var(--shadow-modal)',
        button: 'var(--shadow-button)',
        // Legacy aliases — flat hairline, no neon.
        'neon-purple': '0 0 0 1px var(--accent-soft)',
        'neon-blue':   '0 0 0 1px var(--accent-soft)',
        'neon-gold':   '0 0 0 1px rgba(212, 160, 23, 0.18)',
        'neon-sm':     'var(--shadow-button)',
      },
      letterSpacing: {
        tight: '-0.02em',
        snug:  '-0.011em',
      },
    },
  },
  plugins: [],
} satisfies Config
