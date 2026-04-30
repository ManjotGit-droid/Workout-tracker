import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sl: {
          bg: '#090910',
          surface: '#0f0f1a',
          border: '#1a1a2e',
          purple: '#9333ea',
          'purple-dim': '#4a1a7a',
          'purple-bright': '#c084fc',
          blue: '#3b82f6',
          'blue-dim': '#1e3a5f',
          gold: '#f59e0b',
          'gold-bright': '#fde68a',
          text: '#e2e8f0',
          muted: '#64748b',
          danger: '#ef4444',
          success: '#22c55e',
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
          '0%, 100%': { filter: 'drop-shadow(0 0 4px #9333ea)' },
          '50%': { filter: 'drop-shadow(0 0 18px #9333ea) drop-shadow(0 0 35px #9333ea)' },
        },
        rankAppear: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '80%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        floatIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-purple': '0 0 12px #9333ea, 0 0 30px rgba(147,51,234,0.3)',
        'neon-blue': '0 0 12px #3b82f6, 0 0 30px rgba(59,130,246,0.3)',
        'neon-gold': '0 0 12px #f59e0b, 0 0 30px rgba(245,158,11,0.3)',
        'neon-sm': '0 0 6px rgba(147,51,234,0.6)',
      },
    },
  },
  plugins: [],
} satisfies Config
