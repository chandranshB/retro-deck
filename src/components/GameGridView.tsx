import React, { useState } from 'react'
import { Play, Heart, Info, Star, ArrowUpDown } from 'lucide-react'
import type { Game, SystemType } from '../types/game'
import { sound } from '../services/sound'
import { CrossGlyph } from './PlayStationGlyphs'

interface GameGridViewProps {
  games: Game[]
  favorites: string[]
  onPlayGame: (game: Game) => void
  onToggleFavorite: (game: Game) => void
  onOpenDetails: (game: Game) => void
  onSelectGame: (game: Game) => void
}

type SortOption = 'rating' | 'year-desc' | 'year-asc' | 'title'

export const GameGridView: React.FC<GameGridViewProps> = ({
  games,
  favorites,
  onPlayGame,
  onToggleFavorite,
  onOpenDetails,
  onSelectGame,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null)

  const sortedGames = [...games].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'year-desc':
        return Number(b.year) - Number(a.year)
      case 'year-asc':
        return Number(a.year) - Number(b.year)
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const getSystemBadge = (sys: SystemType | string) => {
    switch (sys) {
      case 'psx':
        return { label: 'PS1', bg: 'bg-blue-600' }
      case 'gba':
        return { label: 'GBA', bg: 'bg-purple-600' }
      case 'snes':
        return { label: 'SNES', bg: 'bg-indigo-600' }
      case 'nes':
        return { label: 'NES', bg: 'bg-red-600' }
      case 'genesis':
        return { label: 'SEGA', bg: 'bg-amber-600' }
      default:
        return { label: 'ROM', bg: 'bg-emerald-600' }
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 animate-in fade-in duration-300">
      {/* Grid Subheader Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>PlayStation & Retro Collection</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono font-medium">
              {games.length} titles
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse high-definition retro titles optimized for 60 FPS WebAssembly emulation
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              sound.playSelect()
              setSortBy(e.target.value as SortOption)
            }}
            className="apple-glass-pill px-3 py-1.5 text-xs font-semibold text-white rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="rating" className="bg-[#090d1f] text-white">
              Highest Rated ★
            </option>
            <option value="year-desc" className="bg-[#090d1f] text-white">
              Release Year (Newest)
            </option>
            <option value="year-asc" className="bg-[#090d1f] text-white">
              Release Year (Classic)
            </option>
            <option value="title" className="bg-[#090d1f] text-white">
              Title (A - Z)
            </option>
          </select>
        </div>
      </div>

      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {sortedGames.map((game) => {
          const isFav = favorites.includes(game.id)
          const badge = getSystemBadge(game.system)
          const isHovered = hoveredGameId === game.id

          return (
            <div
              key={game.id}
              onMouseEnter={() => {
                sound.playHover()
                setHoveredGameId(game.id)
              }}
              onMouseLeave={() => setHoveredGameId(null)}
              onClick={() => {
                sound.playHover()
                onSelectGame(game)
              }}
              className="group relative flex flex-col cursor-pointer"
            >
              {/* Poster Card Container with Apple Parallax Feel */}
              <div
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border transition-all duration-300 ${
                  isHovered
                    ? 'scale-[1.05] -translate-y-2 border-white/40 shadow-[0_20px_40px_rgba(0,112,209,0.35)] ring-2 ring-white/60 z-20'
                    : 'border-white/10 hover:border-white/25 shadow-lg'
                }`}
              >
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* System Badge */}
                <span
                  className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-md backdrop-blur-md ${badge.bg}`}
                >
                  {badge.label}
                </span>

                {/* Favorite Heart */}
                {isFav && (
                  <span className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/60 backdrop-blur-md shadow-md">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  </span>
                )}

                {/* Star Rating Badge */}
                <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{game.rating.toFixed(1)}</span>
                </span>

                {/* Hover Quick Action Overlay */}
                <div
                  className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 transition-opacity duration-200 ${
                    isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      sound.playGameStart()
                      onPlayGame(game)
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black hover:bg-slate-100 font-bold text-xs tracking-tight shadow-xl hover:scale-105 transition-all"
                  >
                    <CrossGlyph size={16} className="bg-black/10 text-black border-transparent" />
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>PLAY</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        sound.playSelect()
                        onToggleFavorite(game)
                      }}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110"
                      title={isFav ? 'Remove Favorite' : 'Add Favorite'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-rose-400 text-rose-400' : 'text-white'
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        sound.playSelect()
                        onOpenDetails(game)
                      }}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110"
                      title="View Details"
                    >
                      <Info className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="mt-2.5 px-1">
                <h3 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                  {game.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                  <span className="truncate">{game.genre}</span>
                  <span className="font-mono text-slate-500">{game.year}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
