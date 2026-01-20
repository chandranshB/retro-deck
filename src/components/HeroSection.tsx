import React from 'react'
import { Play, Heart, Info, Star, Users, Calendar, ChevronLeft, ChevronRight, Sparkles, Trash2 } from 'lucide-react'
import type { Game } from '../types/game'
import { CrossGlyph, TriangleGlyph, SquareGlyph } from './PlayStationGlyphs'
import { sound } from '../services/sound'

interface HeroSectionProps {
  game: Game | null
  isFavorite: boolean
  onPlay: (game: Game) => void
  onToggleFavorite: (game: Game) => void
  onOpenDetails: (game: Game) => void
  onPrevGame?: () => void
  onNextGame?: () => void
  onDeleteCustom?: (id: string) => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  game,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onOpenDetails,
  onPrevGame,
  onNextGame,
  onDeleteCustom,
}) => {
  if (!game) {
    return (
      <div className="relative h-[52vh] min-h-[440px] flex items-center justify-center text-slate-500">
        <p>Select a title to explore</p>
      </div>
    )
  }

  const themeGlow = game.themeColor || '#0a84ff'

  return (
    <div className="relative h-[54vh] min-h-[440px] max-h-[580px] w-full overflow-hidden select-none">
      {/* Dynamic Cinematic Backdrop with Smooth Crossfade & Scaling */}
      <div
        key={game.id}
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out transform scale-105"
        style={{ backgroundImage: `url('${game.heroUrl || game.coverUrl}')` }}
      >
        {/* Multilayered Apple TV / PS5 Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070f] via-[#05070f]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070f] via-[#05070f]/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-transparent via-[#05070f]/20 to-[#05070f]/80" />

        {/* Dynamic Game-Specific Ambient Lighting Halo */}
        <div
          className="absolute -top-24 left-1/4 w-[600px] h-[600px] rounded-full blur-[170px] opacity-25 pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: themeGlow }}
        />
      </div>

      {/* Main Content Stage */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-end pb-6 sm:pb-8">
        <div className="max-w-2xl flex flex-col gap-3.5">
          {/* Metadata Badges Bar */}
          <div className="flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* System Badge */}
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase apple-glass text-blue-300 border-blue-400/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {game.systemLabel}
            </span>

            {/* Release Year */}
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full apple-glass text-slate-300 text-[11px] font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{game.year}</span>
            </span>

            {/* Player Capacity */}
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full apple-glass text-slate-300 text-[11px] font-medium">
              <Users className="w-3 h-3 text-slate-400" />
              <span>{game.players}</span>
            </span>

            {/* Star Rating */}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full apple-glass text-amber-300 text-[11px] font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{game.rating.toFixed(1)}</span>
            </span>

            {/* 60 FPS / Wasm indicator */}
            <span className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full apple-glass text-emerald-300 text-[10px] font-mono font-medium">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>60 FPS WebAssembly</span>
            </span>
          </div>

          {/* Game Title with Heroic Editorial Hierarchy */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] leading-tight">
            {game.title}
          </h1>

          {/* Genre & Developer Subtitle */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
            <span className="text-blue-400 font-bold tracking-wide">{game.genre}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Developed by {game.developer}</span>
          </div>

          {/* Game Description */}
          <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-3 leading-relaxed max-w-xl font-normal drop-shadow-md">
            {game.description}
          </p>

          {/* Primary Action Controls */}
          <div className="flex items-center gap-3 pt-2 sm:pt-3 flex-wrap">
            {/* Play Button */}
            <button
              onClick={() => {
                sound.playGameStart()
                onPlay(game)
              }}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center gap-2.5 px-7 py-3 rounded-full bg-white text-black hover:bg-slate-100 active:scale-95 font-black text-xs sm:text-sm tracking-tight shadow-[0_10px_35px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-[1.04]"
            >
              <CrossGlyph size={18} className="bg-black/10 text-black border-black/20" />
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>PLAY NOW</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => {
                sound.playSelect()
                onToggleFavorite(game)
              }}
              onMouseEnter={() => sound.playHover()}
              className={`flex items-center gap-2 px-4.5 py-3 rounded-full apple-glass font-medium text-xs tracking-tight transition-all duration-300 hover:scale-[1.03] ${
                isFavorite
                  ? 'text-rose-300 border-rose-500/40 bg-rose-500/15 shadow-sm shadow-rose-500/20'
                  : 'text-slate-200'
              }`}
            >
              <TriangleGlyph size={16} />
              <Heart
                className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-400 text-rose-400' : 'text-slate-400'}`}
              />
              <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
            </button>

            {/* Info / Manual Button */}
            <button
              onClick={() => {
                sound.playSelect()
                onOpenDetails(game)
              }}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center gap-2 px-4.5 py-3 rounded-full apple-glass font-medium text-xs tracking-tight text-slate-200 transition-all duration-300 hover:scale-[1.03]"
            >
              <SquareGlyph size={16} />
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Details & Manual</span>
            </button>

            {/* Custom ROM Delete Button */}
            {game.isCustom && onDeleteCustom && (
              <button
                onClick={() => {
                  sound.playBack()
                  if (confirm(`Delete custom ROM "${game.title}"?`)) {
                    onDeleteCustom(game.id)
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-3 rounded-full apple-glass font-medium text-xs text-rose-400 hover:bg-rose-500/20 border-rose-500/30 transition-all"
                title="Delete this Custom ROM from storage"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            {/* Quick Hero Nav Arrows (for mouse users) */}
            {(onPrevGame || onNextGame) && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                {onPrevGame && (
                  <button
                    onClick={() => {
                      sound.playHover()
                      onPrevGame()
                    }}
                    className="p-2.5 rounded-full apple-glass text-slate-300 hover:text-white hover:scale-105 transition-all"
                    title="Previous Title"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {onNextGame && (
                  <button
                    onClick={() => {
                      sound.playHover()
                      onNextGame()
                    }}
                    className="p-2.5 rounded-full apple-glass text-slate-300 hover:text-white hover:scale-105 transition-all"
                    title="Next Title"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
