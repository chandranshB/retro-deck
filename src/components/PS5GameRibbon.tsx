import React, { useRef, useEffect, useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, LayoutGrid, Tv } from 'lucide-react'
import type { Game, CategoryFilter } from '../types/game'
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
  // hoveredId is purely visual — never triggers scroll or parent state change
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Scroll selected card into view ONLY when selectedGameId changes
  // (not on hover — that's what caused the jitter)
  useEffect(() => {
    const el = selectedGameId ? itemRefs.current.get(selectedGameId) : null
    if (el) {
      // Use requestAnimationFrame to let React finish painting first
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      })
    }
  }, [selectedGameId])

  const scrollTrack = (offset: number) => {
    containerRef.current?.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all',       label: 'All' },
    { id: 'psx',       label: 'PlayStation' },
    { id: 'nintendo',  label: 'Nintendo' },
    { id: 'sega',      label: 'Sega' },
    { id: 'favorites', label: favoritesCount > 0 ? `Favorites  ${favoritesCount}` : 'Favorites' },
    { id: 'custom',    label: customGamesCount > 0 ? `My ROMs  ${customGamesCount}` : 'My ROMs' },
  ]

  return (
    <div className="w-full px-5 sm:px-8 lg:px-12 pt-1 pb-2 select-none">

      {/* ── Filter + controls row ─────────────────────────── */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
        {/* Category pills */}
        <div className="flex items-center gap-0.5 p-1 rounded-full glass flex-shrink-0">
          {categories.map(({ id, label }) => {
            const active = currentCategory === id
            return (
              <button
                key={id}
                onClick={() => { if (!active) { sound.playCategorySwitch(); onSelectCategory(id) } }}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-white/14 text-white border border-white/15'
                    : 'text-[#5a6478] hover:text-[#9aa3b4] border border-transparent'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          <button
            onClick={() => { sound.playToggle(); onToggleViewMode() }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full pill text-[11px] font-semibold text-[#5a6478] hover:text-[#9aa3b4]"
            title="Switch view  V"
          >
            {viewMode === 'tv'
              ? <><LayoutGrid className="w-3.5 h-3.5" strokeWidth={2.4} /><span className="hidden sm:inline">Grid</span></>
              : <><Tv         className="w-3.5 h-3.5" strokeWidth={2.4} /><span className="hidden sm:inline">Showcase</span></>
            }
          </button>
          <button
            onClick={() => { sound.playSelect(); onOpenUpload() }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full pill text-[11px] font-semibold text-[#5a6478] hover:text-[#9aa3b4]"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">Upload ROM</span>
          </button>
        </div>
      </div>

      {/* ── Ribbon ───────────────────────────────────────── */}
      {viewMode === 'tv' && (
        <div className="relative mt-3">
          {/* Scroll buttons */}
          <button
            onClick={() => scrollTrack(-300)}
            className="absolute -left-2 top-[calc(50%-8px)] z-20 w-8 h-8 hidden sm:grid place-items-center rounded-full bg-black/70 border border-white/10 text-white hover:bg-black/90 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => scrollTrack(300)}
            className="absolute -right-2 top-[calc(50%-8px)] z-20 w-8 h-8 hidden sm:grid place-items-center rounded-full bg-black/70 border border-white/10 text-white hover:bg-black/90 transition-colors"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>

          {/* Track */}
          <div
            ref={containerRef}
            className="flex gap-4 overflow-x-auto scrollbar-none py-5 px-1"
          >
            {games.map(game => {
              const isSelected = game.id === selectedGameId
              const isHovered = hoveredId === game.id
              const glow = game.themeColor || '#2e8fff'
              // Use a fixed size — clamp avoids reflow on viewport resize mid-hover
              const SZ = 'clamp(100px, 10vw, 128px)'

              return (
                <div
                  key={game.id}
                  ref={el => { if (el) itemRefs.current.set(game.id, el); else itemRefs.current.delete(game.id) }}
                  // Click → commit selection (this triggers scrollIntoView)
                  onClick={() => { sound.playHover(); onSelectGame(game) }}
                  // Hover → local visual state only, zero parent setState
                  onMouseEnter={() => setHoveredId(game.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="ribbon-item"
                  style={{ width: SZ }}
                >
                  {/* Spotlight bloom — position:absolute, layout-inert */}
                  <div
                    className={`spotlight ${isSelected ? 'on' : ''}`}
                    style={{ backgroundColor: glow }}
                  />

                  {/* Card — all transforms live here, not on the wrapper */}
                  <div
                    className={`card ${isSelected ? 'is-selected' : ''}`}
                    style={{ width: SZ, height: SZ }}
                  >
                    <img src={game.coverUrl} alt={game.title} loading="lazy" />
                    <div className="card-fade" />

                    {/* Favorite dot */}
                    {favorites.includes(game.id) && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 grid place-items-center rounded-full bg-black/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      </div>
                    )}
                  </div>

                  {/* Label — transitions handled by CSS .card transition chain */}
                  <p className={`mt-2 text-[11px] font-medium text-center truncate px-0.5 transition-colors duration-250 ${
                    isSelected || isHovered ? 'text-white' : 'text-[#3d4557]'
                  }`}>
                    {game.title}
                  </p>
                </div>
              )
            })}

            {/* Add ROM slot */}
            <div
              onClick={() => { sound.playSelect(); onOpenUpload() }}
              onMouseEnter={() => setHoveredId('__add__')}
              onMouseLeave={() => setHoveredId(null)}
              className="ribbon-item flex-shrink-0"
              style={{ width: 'clamp(100px, 10vw, 128px)' }}
            >
              <div
                className="card glass flex items-center justify-center"
                style={{ width: 'clamp(100px, 10vw, 128px)', height: 'clamp(100px, 10vw, 128px)' }}
              >
                <Plus className={`w-5 h-5 transition-colors duration-200 ${hoveredId === '__add__' ? 'text-white' : 'text-[#3d4557]'}`} strokeWidth={1.8} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
