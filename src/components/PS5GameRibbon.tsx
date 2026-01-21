import React, { useRef, useEffect, useState } from 'react'
import { Plus, Heart, ChevronLeft, ChevronRight, LayoutGrid, Tv } from 'lucide-react'
import type { Game, CategoryFilter, SystemType } from '../types/game'
import { sound } from '../services/sound'

interface PS5GameRibbonProps {
  games: Game[]
  selectedGameId: string | null
  onSelectGame: (game: Game) => void
  onOpenUpload: () => void
  favorites: string[]
  currentCategory: CategoryFilter
  onSelectCategory: (cat: CategoryFilter) => void
  viewMode: 'tv' | 'grid'
  onToggleViewMode: () => void
  favoritesCount: number
  customGamesCount: number
}

export const PS5GameRibbon: React.FC<PS5GameRibbonProps> = ({
  games,
  selectedGameId,
  onSelectGame,
  onOpenUpload,
  favorites,
  currentCategory,
  onSelectCategory,
  viewMode,
  onToggleViewMode,
  favoritesCount,
  customGamesCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [tiltMap, setTiltMap] = useState<{ [id: string]: { x: number; y: number; active: boolean } }>({})

  // Auto-center selected card smoothly
  useEffect(() => {
    if (selectedGameId && itemRefs.current.has(selectedGameId)) {
      const el = itemRefs.current.get(selectedGameId)
      if (el && containerRef.current) {
        el.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        })
      }
    }
  }, [selectedGameId])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const rotX = ((y - 50) / 50) * -12
    const rotY = ((x - 50) / 50) * 12
    setTiltMap((prev) => ({
      ...prev,
      [id]: { x: rotX, y: rotY, active: true },
    }))
  }

  const handleMouseLeave = (id: string) => {
    setTiltMap((prev) => ({
      ...prev,
      [id]: { x: 0, y: 0, active: false },
    }))
  }

  const scrollBy = (offset: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const getSystemBadge = (sys: SystemType | string) => {
    switch (sys) {
      case 'psx':
        return { label: 'PS1', bg: 'bg-[#0070d1]' }
      case 'gba':
        return { label: 'GBA', bg: 'bg-[#7c3aed]' }
      case 'snes':
        return { label: 'SNES', bg: 'bg-[#4f46e5]' }
      case 'nes':
        return { label: 'NES', bg: 'bg-[#dc2626]' }
      case 'genesis':
        return { label: 'SEGA', bg: 'bg-[#d97706]' }
      default:
        return { label: 'ROM', bg: 'bg-[#059669]' }
    }
  }

  const categoryPills: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'All Titles' },
    { id: 'psx', label: 'PlayStation' },
    { id: 'nintendo', label: 'Nintendo' },
    { id: 'sega', label: 'Sega' },
    { id: 'favorites', label: `Favorites (${favoritesCount})` },
    { id: 'custom', label: `My ROMs (${customGamesCount})` },
  ]

  return (
    <div className="relative z-30 w-full px-6 sm:px-10 pt-2 pb-4 select-none">
      {/* Platform Category Selector Bar + View Mode Switcher */}
      <div className="flex items-center justify-between mb-3 gap-2 overflow-x-auto scrollbar-none pb-1">
        <div className="p-1 rounded-full apple-glass flex items-center gap-1">
          {categoryPills.map((cat) => {
            const isActive = currentCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (currentCategory !== cat.id) {
                    sound.playCategorySwitch()
                    onSelectCategory(cat.id)
                  }
                }}
                onMouseEnter={() => sound.playHover()}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-white/20 shadow-md shadow-black/40 border border-white/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* View Mode Toggle: TV Ribbon vs Full Grid */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              sound.playToggle()
              onToggleViewMode()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full apple-glass-pill text-xs font-bold text-slate-200 hover:text-white transition-all hover:scale-105"
            title="Switch View Mode (Press V)"
          >
            {viewMode === 'tv' ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                <span>Grid View</span>
              </>
            ) : (
              <>
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ribbon View</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              sound.playSelect()
              onOpenUpload()
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all hover:scale-105 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload ROM</span>
          </button>
        </div>
      </div>

      {/* PS5 Horizontal Game Ribbon (Visible in 'tv' view mode) */}
      {viewMode === 'tv' && (
        <div className="relative w-full">
          {/* Scroll Nav Buttons */}
          <button
            onClick={() => {
              sound.playHover()
              scrollBy(-320)
            }}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md shadow-2xl hover:scale-110 transition-all hidden sm:flex items-center justify-center"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playHover()
              scrollBy(320)
            }}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md shadow-2xl hover:scale-110 transition-all hidden sm:flex items-center justify-center"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={containerRef}
            className="flex items-center gap-4 sm:gap-5 overflow-x-auto py-3 scrollbar-none snap-x perspective-[1200px]"
            style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
          >
            {games.map((game) => {
              const isSelected = game.id === selectedGameId
              const isFav = favorites.includes(game.id)
              const badge = getSystemBadge(game.system)
              const tilt = tiltMap[game.id] || { x: 0, y: 0, active: false }

              return (
                <div
                  key={game.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(game.id, el)
                    else itemRefs.current.delete(game.id)
                  }}
                  onClick={() => {
                    sound.playHover()
                    onSelectGame(game)
                  }}
                  onMouseEnter={() => {
                    if (!isSelected) {
                      sound.playHover()
                      onSelectGame(game)
                    }
                  }}
                  onMouseMove={(e) => handleMouseMove(e, game.id)}
                  onMouseLeave={() => handleMouseLeave(game.id)}
                  className="relative flex-shrink-0 cursor-pointer snap-center group"
                >
                  {/* PS5 / Apple TV Signature Card Container */}
                  <div
                    className={`relative w-28 sm:w-32 md:w-36 aspect-[1/1] rounded-2xl overflow-hidden transition-all duration-300 ${
                      isSelected
                        ? 'ps5-card-active scale-110 -translate-y-2 z-20 ring-2 ring-white'
                        : 'border border-white/10 hover:border-white/30 bg-slate-900/60 opacity-75 hover:opacity-100 hover:scale-102'
                    }`}
                    style={{
                      transform: tilt.active
                        ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.12)`
                        : isSelected
                        ? 'scale(1.10) translateY(-6px)'
                        : 'scale(0.96)',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease',
                    }}
                  >
                    {/* Game Cover Art */}
                    <img
                      src={game.coverUrl}
                      alt={game.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Specular Glare */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                      style={{
                        background: tilt.active
                          ? `radial-gradient(circle at ${50 + tilt.y * 3}% ${50 - tilt.x * 3}%, rgba(255,255,255,0.3) 0%, transparent 65%)`
                          : 'transparent',
                        opacity: tilt.active ? 1 : 0,
                      }}
                    />

                    {/* System Tag */}
                    <span
                      className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase text-white shadow-md backdrop-blur-md ${badge.bg}`}
                    >
                      {badge.label}
                    </span>

                    {/* Favorite Star */}
                    {isFav && (
                      <span className="absolute top-2 right-2 p-1 rounded-full bg-black/60 backdrop-blur-md">
                        <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                      </span>
                    )}

                    {/* Bottom Selected Indicator Gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                  </div>

                  {/* Title Preview under icon */}
                  <div className="mt-2 text-center w-28 sm:w-32 md:w-36 px-1">
                    <span
                      className={`text-[11px] font-bold block truncate transition-colors ${
                        isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {game.title}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Custom ROM Upload Card */}
            <div
              onClick={() => {
                sound.playSelect()
                onOpenUpload()
              }}
              onMouseEnter={() => sound.playHover()}
              className="relative flex-shrink-0 w-28 sm:w-32 md:w-36 aspect-[1/1] rounded-2xl apple-glass flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 group snap-center hover:scale-105 hover:border-emerald-400/50 hover:shadow-[0_10px_30px_rgba(16,185,129,0.25)]"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-emerald-500/20 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 transition-all">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-emerald-300">
                Add ROM
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
