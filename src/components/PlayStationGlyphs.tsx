import React from 'react'

interface GlyphProps {
  size?: number
  className?: string
}

export const CrossGlyph: React.FC<GlyphProps> = ({ size = 20, className = '' }) => (
  <span
    style={{ width: size, height: size }}
    className={`inline-flex items-center justify-center rounded-full bg-[#0070d1]/20 border border-[#0070d1]/60 text-[#38bdf8] shadow-[0_0_10px_rgba(0,112,209,0.4)] flex-shrink-0 font-black select-none ${className}`}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="3" y1="3" x2="13" y2="13" />
      <line x1="13" y1="3" x2="3" y2="13" />
    </svg>
  </span>
)

export const CircleGlyph: React.FC<GlyphProps> = ({ size = 20, className = '' }) => (
  <span
    style={{ width: size, height: size }}
    className={`inline-flex items-center justify-center rounded-full bg-[#ea1b24]/20 border border-[#ea1b24]/60 text-[#f87171] shadow-[0_0_10px_rgba(234,27,36,0.4)] flex-shrink-0 font-black select-none ${className}`}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  </span>
)

export const TriangleGlyph: React.FC<GlyphProps> = ({ size = 20, className = '' }) => (
  <span
    style={{ width: size, height: size }}
    className={`inline-flex items-center justify-center rounded-full bg-[#00b140]/20 border border-[#00b140]/60 text-[#4ade80] shadow-[0_0_10px_rgba(0,177,64,0.4)] flex-shrink-0 font-black select-none ${className}`}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
      <polygon points="8,2 14,13 2,13" />
    </svg>
  </span>
)

export const SquareGlyph: React.FC<GlyphProps> = ({ size = 20, className = '' }) => (
  <span
    style={{ width: size, height: size }}
    className={`inline-flex items-center justify-center rounded-full bg-[#ff65b2]/20 border border-[#ff65b2]/60 text-[#f472b6] shadow-[0_0_10px_rgba(255,101,178,0.4)] flex-shrink-0 font-black select-none ${className}`}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="3" y="3" width="10" height="10" rx="1.5" />
    </svg>
  </span>
)

export const DPadGlyph: React.FC<GlyphProps> = ({ size = 20, className = '' }) => (
  <span
    style={{ width: size, height: size }}
    className={`inline-flex items-center justify-center text-slate-300 ${className}`}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 2h4v7h7v4h-7v7h-4v-7H3V9h7V2z" opacity="0.8" />
    </svg>
  </span>
)

export const KeyGlyph: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
  <kbd
    className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono font-bold text-slate-200 bg-white/10 rounded-md border border-white/20 shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${className}`}
  >
    {text}
  </kbd>
)
