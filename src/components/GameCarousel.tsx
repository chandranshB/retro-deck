import React, { useRef, useEffect, useState } from 'react'
import { Plus, Heart, Sparkles, ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react'
import type { Game, SystemType } from '../types/game'
import { sound } from '../services/sound'

interface GameCarouselProps {
  games: Game[]
  selectedGameId: string | null
  onSelectGame: (game: Game) => void
  onOpenUpload: () => void
  favorites: string[]
}

export const GameCarousel: React.FC<GameCarouselProps> = ({
  games,
  selectedGameId,
  onSelectGame,
  onOpenUpload,
  favorites,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [tiltMap, setTiltMap] = useState<{ [id: string]: { x: number; y: number; active: boolean } }>({})

  // Keep selected card centered smoothly in the viewport
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
    const rotX = ((y - 50) / 50) * -10
    const rotY = ((x - 50) / 50) * 10
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
        return { text: 'PS1', color: 'bg-blue-600', ring: 'border-blue-400/40' }
      case 'gba':
        return { text: 'GBA', color: 'bg-purple-600', ring: 'border-purple-400/40' }
      case 'snes':
        return { text: 'SNES', color: 'bg-indigo-600', ring: 'border-indigo-400/40' }
      case 'nes':
        return { text: 'NES', color: 'bg-red-600', ring: 'border-red-400/40' }
      case 'genesis':
        return { text: 'GENESIS', color: 'bg-amber-600', ring: 'border-amber-400/40' }
      default:
        return { text: 'ROM', color: 'bg-emerald-600', ring: 'border-emerald-400/40' }
    }
  }

  return (
    <div className="relative w-full px-6 sm:px-10 py-5 z-20">
      {/* Carousel Header Bar */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0a84ff] animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Curated Showcase</span>
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-slate-300">
            {games.length} titles
          </span>
        </div>

        {/* Carousel controls & hints */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 hidden md:inline-flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Navigate with D-Pad or</span>
            <kbd className="px-1.5 py-0.5 rounded apple-glass text-[10px] text-slate-300 font-mono">◄ ►</kbd>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                sound.playHover()
                scrollBy(-300)
              }}
              className="p-1.5 rounded-full apple-glass text-slate-300 hover:text-white hover:scale-105 transition-all"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playHover()
                scrollBy(300)
              }}
              className="p-1.5 rounded-full apple-glass text-slate-300 hover:text-white hover:scale-105 transition-all"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Track Container */}
      <div
        ref={containerRef}
        className="flex items-center gap-5 sm:gap-6 overflow-x-auto pb-6 pt-3 scrollbar-thin snap-x perspective-[1200px]"
        style={{ scrollPaddingLeft: '2rem', scrollPaddingRight: '2rem' }}
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
              className="relative flex-shrink-0 w-44 sm:w-48 md:w-52 cursor-pointer snap-center group select-none"
            >
              {/* Apple TV 4K & PS5 3D Parallax Tilt Poster Card */}
              <div
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 sm:ring-4 ring-white shadow-[0_20px_60px_rgba(0,112,209,0.55)] z-20'
                    : 'border border-white/10 hover:border-white/30 bg-slate-900/60 shadow-lg opacity-80 hover:opacity-100'
                }`}
                style={{
                  transform: tilt.active
                    ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.08)`
                    : isSelected
                    ? 'scale(1.05) translateY(-6px)'
                    : 'scale(0.96)',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, opacity 0.2s ease',
                }}
              >
                {/* Poster Cover Art */}
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Apple TV-style Dynamic Specular Light Glare */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                  style={{
                    background: tilt.active
                      ? `radial-gradient(circle at ${50 + tilt.y * 3}% ${50 - tilt.x * 3}%, rgba(255,255,255,0.28) 0%, transparent 65%)`
                      : 'transparent',
                    opacity: tilt.active ? 1 : 0,
                  }}
                />

                {/* System Hardware Badge */}
                <span
                  className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-md backdrop-blur-md border ${badge.ring} ${badge.color}`}
                >
                  {badge.text}
                </span>

                {/* Favorite Heart Badge */}
                {isFav && (
                  <span className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/70 backdrop-blur-md shadow-md border border-rose-500/30">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  </span>
                )}

                {/* Bottom Card Gradient & Play Prompt on Focus */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none flex items-end p-2.5">
                  {isSelected && (
                    <div className="w-full flex items-center justify-between text-[10px] font-bold text-white tracking-tight animate-in fade-in duration-200">
                      <span className="flex items-center gap-1 text-blue-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Selected
                      </span>
                      <span className="font-mono text-slate-300">★ {game.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Metadata Beneath Card */}
              <div className="mt-2.5 px-1">
                <h3
                  className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                    isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {game.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400 truncate mt-0.5">
                  <span className="truncate">{game.genre}</span>
                  <span className="font-mono text-slate-500 text-[10px] flex-shrink-0">{game.year}</span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Apple-styled "Add Custom ROM" Card */}
        <div
          onClick={() => {
            sound.playSelect()
            onOpenUpload()
          }}
          onMouseEnter={() => sound.playHover()}
          className="relative flex-shrink-0 w-44 sm:w-48 md:w-52 aspect-[3/4] rounded-2xl apple-glass flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 group snap-center hover:scale-[1.04] hover:border-emerald-400/50 hover:shadow-[0_16px_40px_rgba(16,185,129,0.2)]"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-emerald-500/20 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 transition-all shadow-inner">
            <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-center px-4">
            <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
              Add Custom ROM
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Supports GBA, SNES, NES, PS1, Genesis
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
