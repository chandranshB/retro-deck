import React from 'react'
import { CrossGlyph, CircleGlyph, TriangleGlyph, SquareGlyph, KeyGlyph } from './PlayStationGlyphs'

interface FooterHintsProps {
  gamepadConnected: boolean
  viewMode?: 'tv' | 'grid'
}

export const FooterHints: React.FC<FooterHintsProps> = ({ gamepadConnected, viewMode = 'tv' }) => {
  return (
    <footer className="fixed bottom-0 inset-x-0 z-30 py-2.5 px-6 sm:px-10 apple-glass flex items-center justify-between text-xs select-none border-t border-white/10 backdrop-blur-2xl">
      {/* Brand tagline & performance metrics */}
      <div className="flex items-center gap-2.5 text-slate-400 font-normal">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
        <span className="hidden sm:inline font-medium text-slate-300">
          PlayStation 60 FPS Engine • Low-Latency WebAssembly • DualSense Ready
        </span>
        <span className="sm:hidden font-medium text-slate-300">60 FPS WebAssembly</span>
      </div>

      {/* Dynamic Controller / Keyboard Prompts Bar */}
      <div className="flex items-center gap-3 sm:gap-5">
        {gamepadConnected ? (
          <>
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <CrossGlyph size={16} />
              <span>Play</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <CircleGlyph size={16} />
              <span>Back</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <TriangleGlyph size={16} />
              <span>Favorite</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <SquareGlyph size={16} />
              <span>Details</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="px-1.5 py-0.5 rounded apple-glass text-[10px] font-mono">L1/R1</span>
              <span>Systems</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-slate-200 font-medium">
              <KeyGlyph text="Enter" />
              <span>Play</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200 font-medium">
              <KeyGlyph text="F" />
              <span>Favorite</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200 font-medium">
              <KeyGlyph text="I" />
              <span>Details</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-200 font-medium">
              <KeyGlyph text="/" />
              <span>Search</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-200 font-medium">
              <KeyGlyph text="V" />
              <span>{viewMode === 'tv' ? 'Grid' : 'Showcase'}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <KeyGlyph text="◄ ►" />
              <span>Browse</span>
            </div>
          </>
        )}
      </div>
    </footer>
  )
}
