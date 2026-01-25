import React, { useRef, useEffect, useState } from 'react'
import { Play, Heart, Info, Plus, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import type { Game, CategoryFilter } from '../types/game'
import { sound } from '../services/sound'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PS5GameStageProps {
  game: Game | null
  isFavorite: boolean
  onPlay: (game: Game) => void
  onToggleFavorite: (game: Game) => void
  onOpenDetails: (game: Game) => void
  onOpenMemoryCard: () => void
  onDeleteCustom?: (id: string) => void
  // ribbon props — unified into one component
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

// ─── Component ────────────────────────────────────────────────────────────────

export const PS5GameStage: React.FC<PS5GameStageProps> = ({
  game,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onOpenDetails,
  onDeleteCustom,
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
  const trackRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Scroll selected tile into view — only when selectedGameId changes, never on hover
  useEffect(() => {
    const el = selectedGameId ? tileRefs.current.get(selectedGameId) : null
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    })
  }, [selectedGameId])

  const scrollTrack = (d: number) =>
    trackRef.current?.scrollBy({ left: d, behavior: 'smooth' })

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all',       label: 'All' },
    { id: 'psx',       label: 'PlayStation' },
    { id: 'nintendo',  label: 'Nintendo' },
    { id: 'sega',      label: 'Sega' },
    { id: 'favorites', label: favoritesCount > 0 ? `Saved · ${favoritesCount}` : 'Saved' },
    { id: 'custom',    label: customGamesCount > 0 ? `My ROMs · ${customGamesCount}` : 'My ROMs' },
  ]

  const TILE = 'clamp(96px, 9.5vw, 120px)'

  return (
    <div className="relative w-full h-dvh flex flex-col overflow-hidden select-none">

      {/* ── Full-bleed backdrop ─────────────────────────────── */}
      {game && (
        <div key={game.id} className="absolute inset-0 fade-in">
          <div
            className="absolute inset-0 bg-cover bg-center kb"
            style={{ backgroundImage: `url('${game.heroUrl || game.coverUrl}')` }}
          />
          {/* deep vignette so text reads without needing a backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090e] via-[#08090e]/60 to-[#08090e]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090e]/80 via-transparent to-transparent" />
          {/* theme halo — barely there */}
          <div
            className="absolute inset-0 ambient pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 65% 40%, ${game.themeColor || '#2e8fff'}26 0%, transparent 70%)`,
            }}
          />
        </div>
      )}

      {/* ── Game info — left side, vertically centered ─────── */}
      {game && (
        <div
          key={game.id + '-info'}
          className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 slide-up"
          style={{ paddingBottom: '200px' }} /* leave room for the ribbon shelf */
        >
          <p className="text-[11px] font-medium text-white/35 tracking-widest uppercase mb-3">
            {game.systemLabel} · {game.year}
          </p>

          <h1 className="text-[clamp(2rem,5vw,3.75rem)] font-bold text-white leading-[1.0] tracking-tight max-w-xl">
            {game.title}
          </h1>

          <p className="mt-3 text-[13px] text-white/40 leading-relaxed max-w-md line-clamp-2">
            {game.description}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => { sound.playGameStart(); onPlay(game) }}
              className="flex items-center gap-2 h-10 pl-5 pr-6 rounded-full bg-white text-[#08090e] font-semibold text-[13px] hover:bg-white/90 active:scale-95 transition-all duration-150 shadow-[0_2px_20px_rgba(255,255,255,0.15)]"
            >
              <Play className="w-3.5 h-3.5 fill-[#08090e]" strokeWidth={0} />
              Play
            </button>

            <button
              onClick={() => { sound.playSelect(); onToggleFavorite(game) }}
              className={`flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-medium transition-all duration-150 ${
                isFavorite
                  ? 'bg-white/8 border border-white/12 text-rose-400'
                  : 'bg-white/6 border border-white/8 text-white/40 hover:text-white/70'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-all ${isFavorite ? 'fill-rose-400 scale-110' : ''}`}
                strokeWidth={isFavorite ? 0 : 1.8}
              />
              {isFavorite ? 'Saved' : 'Save'}
            </button>

            <button
              onClick={() => { sound.playSelect(); onOpenDetails(game) }}
              className="flex items-center gap-2 h-10 px-4 rounded-full bg-white/6 border border-white/8 text-[13px] font-medium text-white/40 hover:text-white/70 transition-colors"
            >
              <Info className="w-3.5 h-3.5" strokeWidth={2} />
              Details
            </button>

            {game.isCustom && onDeleteCustom && (
              <button
                onClick={() => { sound.playBack(); if (confirm(`Remove "${game.title}"?`)) onDeleteCustom(game.id) }}
                className="h-10 w-10 grid place-items-center rounded-full bg-white/6 border border-white/8 text-white/30 hover:text-rose-400/80 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom shelf: filter row + ribbon ──────────────── */}
      <div className="relative z-10 pb-6 px-6 sm:px-10 lg:px-14">

        {/* Filter + view toggle row */}
        <div className="flex items-center justify-between mb-3">
          {/* Category pills */}
          <div className="flex items-center gap-0.5 no-scroll overflow-x-auto">
            {categories.map(({ id, label }) => {
              const active = currentCategory === id
              return (
                <button
                  key={id}
                  onClick={() => { if (!active) { sound.playCategorySwitch(); onSelectCategory(id) } }}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-150 ${
                    active
                      ? 'bg-white/12 text-white border border-white/12'
                      : 'text-white/30 hover:text-white/55 border border-transparent'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
            <button
              onClick={() => { sound.playToggle(); onToggleViewMode() }}
              className="flex items-center gap-1.5 h-7 px-3 rounded-full chip text-[11px] text-white/35 hover:text-white/65 transition-colors"
              title="Switch view  V"
            >
              <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span className="hidden sm:inline">{viewMode === 'tv' ? 'Grid' : 'Showcase'}</span>
            </button>
            <button
              onClick={() => { sound.playSelect(); onOpenUpload() }}
              className="flex items-center gap-1.5 h-7 px-3 rounded-full chip text-[11px] text-white/35 hover:text-white/65 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">Upload ROM</span>
            </button>
          </div>
        </div>

        {/* Ribbon track */}
        <div className="relative">
          {/* Scroll arrows */}
          <button
            onClick={() => scrollTrack(-280)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 hidden sm:grid place-items-center rounded-full bg-black/60 border border-white/8 text-white/50 hover:text-white transition-colors"
            style={{ marginTop: '-12px' }} /* offset for label below */
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => scrollTrack(280)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 hidden sm:grid place-items-center rounded-full bg-black/60 border border-white/8 text-white/50 hover:text-white transition-colors"
            style={{ marginTop: '-12px' }}
          >
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>

          <div
            ref={trackRef}
            className="flex gap-3 overflow-x-auto no-scroll py-2"
          >
            {games.map(game => {
              const isSel = game.id === selectedGameId
              const isHov = hoveredId === game.id

              return (
                <div
                  key={game.id}
                  ref={el => { if (el) tileRefs.current.set(game.id, el); else tileRefs.current.delete(game.id) }}
                  onClick={() => { sound.playHover(); onSelectGame(game) }}
                  onMouseEnter={() => setHoveredId(game.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="tile"
                  style={{ width: TILE }}
                >
                  {/* Glow bloom — layout-inert absolute */}
                  <div
                    className={`tile-glow ${isSel ? 'on' : ''}`}
                    style={{ backgroundColor: game.themeColor || '#2e8fff' }}
                  />

                  {/* Card */}
                  <div
                    className={`tile-inner ${isSel ? 'sel' : ''}`}
                    style={{ width: TILE, height: TILE }}
                  >
                    <img src={game.coverUrl} alt={game.title} loading="lazy" />

                    {/* Bottom fade */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    {/* Saved dot */}
                    {favorites.includes(game.id) && (
                      <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 grid place-items-center rounded-full bg-black/50 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <p
                    className="mt-1.5 text-[10px] font-medium text-center truncate px-0.5 transition-colors duration-200"
                    style={{ color: isSel || isHov ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)' }}
                  >
                    {game.title}
                  </p>
                </div>
              )
            })}

            {/* Add ROM tile */}
            <div
              onClick={() => { sound.playSelect(); onOpenUpload() }}
              onMouseEnter={() => setHoveredId('__add')}
              onMouseLeave={() => setHoveredId(null)}
              className="tile flex-shrink-0"
              style={{ width: TILE }}
            >
              <div
                className="tile-inner glass flex items-center justify-center"
                style={{ width: TILE, height: TILE, border: '1px dashed rgba(255,255,255,0.1)' }}
              >
                <Plus
                  className="w-5 h-5 transition-colors duration-200"
                  style={{ color: hoveredId === '__add' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
