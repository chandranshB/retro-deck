import React from 'react'
import { Play, Heart, Info, Star, Users, Calendar, Sparkles, HardDrive, Trash2 } from 'lucide-react'
import type { Game } from '../types/game'
import { CrossGlyph, TriangleGlyph, SquareGlyph } from './PlayStationGlyphs'
import { sound } from '../services/sound'

interface PS5GameStageProps {
  game: Game | null
  isFavorite: boolean
  onPlay: (game: Game) => void
  onToggleFavorite: (game: Game) => void
  onOpenDetails: (game: Game) => void
  onOpenMemoryCard: () => void
  onDeleteCustom?: (id: string) => void
}

export const PS5GameStage: React.FC<PS5GameStageProps> = ({
  game,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onOpenDetails,
  onOpenMemoryCard,
  onDeleteCustom,
}) => {
  if (!game) {
    return (
      <div className="relative h-[48vh] min-h-[380px] flex items-center justify-center text-slate-500">
        <p>Select a title from the ribbon</p>
      </div>
    )
  }

  const themeGlow = game.themeColor || '#0070d1'

  return (
    <div className="relative w-full min-h-[46vh] flex flex-col justify-end px-6 sm:px-10 pb-6 select-none overflow-hidden">
      {/* Full-bleed Wallpaper Backdrop with Smooth Crossfade */}
      <div
        key={game.id}
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out transform scale-105"
        style={{ backgroundImage: `url('${game.heroUrl || game.coverUrl}')` }}
      >
        {/* Multilayered Apple TV / PS5 Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030612] via-[#030612]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030612] via-[#030612]/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-transparent via-[#030612]/30 to-[#030612]/90" />

        {/* Dynamic Game-Specific Ambient Lighting Halo */}
        <div
          className="absolute -top-32 left-1/4 w-[700px] h-[700px] rounded-full blur-[190px] opacity-25 pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: themeGlow }}
        />
      </div>

      {/* Stage Content */}
      <div className="relative z-10 max-w-4xl flex flex-col gap-3">
        {/* Metadata Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase apple-glass text-blue-300 border-blue-400/30 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {game.systemLabel}
          </span>

          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full apple-glass text-slate-300 text-[11px] font-semibold">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{game.year}</span>
          </span>

          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full apple-glass text-slate-300 text-[11px] font-semibold">
            <Users className="w-3 h-3 text-slate-400" />
            <span>{game.players}</span>
          </span>

          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full apple-glass text-amber-300 text-[11px] font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{game.rating.toFixed(1)}</span>
          </span>

          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full apple-glass text-emerald-300 text-[10px] font-mono font-bold">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>60 FPS WebAssembly</span>
          </span>
        </div>

        {/* Game Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] leading-tight">
          {game.title}
        </h1>

        {/* Subtitle / Developer */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300">
          <span className="text-[#38bdf8]">{game.genre}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Developed by {game.developer}</span>
        </div>

        {/* Synopsis */}
        <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-3 leading-relaxed max-w-2xl font-normal drop-shadow">
          {game.description}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          {/* Play Button */}
          <button
            onClick={() => {
              sound.playGameStart()
              onPlay(game)
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-white text-black hover:bg-slate-100 active:scale-95 font-black text-xs sm:text-sm tracking-tight shadow-[0_10px_40px_rgba(255,255,255,0.35)] transition-all duration-300 hover:scale-[1.04]"
          >
            <CrossGlyph size={18} className="bg-black/10 text-black border-transparent" />
            <Play className="w-4 h-4 fill-black" />
            <span>PLAY GAME</span>
          </button>

          {/* Details & Manual */}
          <button
            onClick={() => {
              sound.playSelect()
              onOpenDetails(game)
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full apple-glass font-bold text-xs tracking-tight text-slate-200 transition-all duration-300 hover:scale-[1.03]"
          >
            <SquareGlyph size={16} />
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Manual & Controls</span>
          </button>

          {/* Favorite */}
          <button
            onClick={() => {
              sound.playSelect()
              onToggleFavorite(game)
            }}
            onMouseEnter={() => sound.playHover()}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-full apple-glass font-bold text-xs tracking-tight transition-all duration-300 hover:scale-[1.03] ${
              isFavorite
                ? 'text-rose-300 border-rose-500/40 bg-rose-500/20 shadow-md shadow-rose-500/20'
                : 'text-slate-200'
            }`}
          >
            <TriangleGlyph size={16} />
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-400 text-rose-400' : 'text-slate-400'}`} />
            <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>

          {/* Memory Card Saves */}
          <button
            onClick={() => {
              sound.playSelect()
              onOpenMemoryCard()
            }}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-2 px-4 py-3.5 rounded-full apple-glass font-bold text-xs tracking-tight text-slate-300 transition-all duration-300 hover:scale-[1.03]"
            title="Open Virtual Memory Card Save Manager"
          >
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Memory Card</span>
          </button>

          {/* Custom ROM Delete */}
          {game.isCustom && onDeleteCustom && (
            <button
              onClick={() => {
                sound.playBack()
                if (confirm(`Remove custom ROM "${game.title}"?`)) {
                  onDeleteCustom(game.id)
                }
              }}
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-full apple-glass font-bold text-xs text-rose-400 hover:bg-rose-500/20 border-rose-500/30 transition-all"
              title="Delete Custom ROM"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
