import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Play, Heart, Info, Plus, ChevronLeft, ChevronRight, LayoutGrid, Trash2 } from 'lucide-react'
import type { Game, CategoryFilter } from '../types/game'
import { sound } from '../services/sound'

interface PS5GameStageProps {
  game: Game | null
  isFavorite: boolean
  onPlay: (game: Game) => void
  onToggleFavorite: (game: Game) => void
  onOpenDetails: (game: Game) => void
  onOpenMemoryCard: () => void
  onDeleteCustom?: (id: string) => void
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

const TILE = 110   // px — single source of truth for tile dimensions
const GAP  = 10    // px — gap between tiles

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
  const [hoveredId,      setHoveredId]      = useState<string | null>(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    // small delay so DOM is painted before measuring
    const t = setTimeout(updateArrows, 80)
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => { clearTimeout(t); el.removeEventListener('scroll', updateArrows); ro.disconnect() }
  }, [updateArrows, games])

  useEffect(() => {
    const el = selectedGameId ? tileRefs.current.get(selectedGameId) : null
    if (!el) return
    requestAnimationFrame(() =>
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    )
  }, [selectedGameId])

  const scrollTrack = (d: number) =>
    trackRef.current?.scrollBy({ left: d, behavior: 'smooth' })

  const cats: { id: CategoryFilter; label: string }[] = [
    { id: 'all',       label: 'All' },
    { id: 'psx',       label: 'PlayStation' },
    { id: 'nintendo',  label: 'Nintendo' },
    { id: 'sega',      label: 'Sega' },
    { id: 'favorites', label: favoritesCount > 0 ? `Saved · ${favoritesCount}` : 'Saved' },
    { id: 'custom',    label: customGamesCount > 0 ? `My ROMs · ${customGamesCount}` : 'My ROMs' },
  ]

  // Shelf height: tile + label + gap + filter row + bottom padding
  const SHELF_H = TILE + 18 + 16 + 32 + 24  // ≈ 220px

  return (
    <div className="relative w-full h-dvh flex flex-col select-none">

      {/* ── Hero backdrop ─────────────────────────────────────
          position:fixed + z-index:0 means it is NEVER subject
          to parent overflow:hidden or transform clipping.
          The KB animation can scale freely.
          A new keyed div fades in on each game change.
      ─────────────────────────────────────────────────────── */}
      {game && (
        <div key={'bg-' + game.id} className="h-fade" style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          {/* Image layer — KB animation scales from 1.0 to 1.07 */}
          <div
            className="kb"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${game.heroUrl || game.coverUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              transformOrigin: 'center center',
            }}
          />

          {/* Bottom vignette — primary legibility layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #09090f 28%, rgba(9,9,15,0.75) 55%, rgba(9,9,15,0.3) 75%, rgba(9,9,15,0.1) 100%)',
            }}
          />

          {/* Left vignette — keeps text readable */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(9,9,15,0.88) 0%, rgba(9,9,15,0.5) 40%, transparent 75%)',
            }}
          />

          {/* Theme halo — subtle color tint in upper-right quadrant */}
          <div
            className="breathe"
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse 50% 40% at 72% 35%, ${game.themeColor || '#1a6fff'}1a 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* ── Game info ─────────────────────────────────────────
          z-index:10 so it renders above the fixed backdrop.
          Uses flex-1 to take remaining space above the shelf.
          paddingBottom reserves exact room for the shelf so
          info text is vertically centered in the visible area.
      ─────────────────────────────────────────────────────── */}
      <div
        className="relative flex-1 flex flex-col justify-center"
        style={{ zIndex: 10, paddingBottom: SHELF_H, paddingInline: 'clamp(24px, 6vw, 72px)' }}
      >
        {game ? (
          <>
            {/* System · year  —  level 3 typography: small caps, low opacity */}
            <p
              className="i-up"
              style={{
                animationDelay: '0ms',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.32)',
                marginBottom: '12px',
              }}
            >
              {game.systemLabel}&thinsp;&middot;&thinsp;{game.year}
            </p>

            {/* Title  —  level 1: large, bold, tight */}
            <h1
              className="i-up"
              style={{
                animationDelay: '60ms',
                fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                fontWeight: 700,
                lineHeight: 1.0,
                letterSpacing: '-0.025em',
                color: 'rgba(255,255,255,0.95)',
                maxWidth: '18ch',
                margin: 0,
              }}
            >
              {game.title}
            </h1>

            {/* Description  —  level 2: readable body, muted */}
            <p
              className="i-up"
              style={{
                animationDelay: '115ms',
                fontSize: '13px',
                fontWeight: 400,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.38)',
                maxWidth: '48ch',
                marginTop: '12px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {game.description}
            </p>

            {/* Actions — 28px below description */}
            <div
              className="i-up"
              style={{
                animationDelay: '170ms',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '28px',
                flexWrap: 'wrap',
              }}
            >
              <button
                className="btn btn-white"
                onClick={() => { sound.playGameStart(); onPlay(game) }}
              >
                <Play style={{ width: 13, height: 13, fill: '#09090f', flexShrink: 0 }} strokeWidth={0} />
                Play
              </button>

              <button
                className={`btn btn-ghost${isFavorite ? ' saved' : ''}`}
                onClick={() => { sound.playSelect(); onToggleFavorite(game) }}
              >
                <Heart
                  style={{
                    width: 13, height: 13, flexShrink: 0,
                    fill: isFavorite ? 'rgba(244,63,94,0.9)' : 'none',
                    transition: 'fill 0.2s ease',
                  }}
                  strokeWidth={isFavorite ? 0 : 1.8}
                />
                {isFavorite ? 'Saved' : 'Save'}
              </button>

              <button
                className="btn btn-ghost"
                onClick={() => { sound.playSelect(); onOpenDetails(game) }}
              >
                <Info style={{ width: 13, height: 13, flexShrink: 0 }} strokeWidth={1.8} />
                Details
              </button>

              {game.isCustom && onDeleteCustom && (
                <button
                  className="btn btn-ghost"
                  onClick={() => { sound.playBack(); if (confirm(`Remove "${game.title}"?`)) onDeleteCustom(game.id) }}
                  style={{ color: 'rgba(255,255,255,0.22)', padding: '0 12px' }}
                >
                  <Trash2 style={{ width: 13, height: 13, flexShrink: 0 }} strokeWidth={1.8} />
                </button>
              )}
            </div>
          </>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '13px' }}>Select a game</p>
        )}
      </div>

      {/* ── Bottom shelf ──────────────────────────────────────
          z-index:10, sits at the bottom of the screen.
          Filter row above the ribbon track.
      ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          paddingBottom: '24px',
          paddingInline: 'clamp(24px, 6vw, 72px)',
        }}
      >
        {/* Filter row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            gap: '8px',
          }}
        >
          {/* Category tabs */}
          <div className="no-scroll" style={{ display: 'flex', alignItems: 'center', gap: '2px', overflowX: 'auto' }}>
            {cats.map(({ id, label }) => (
              <button
                key={id}
                className={`cat${currentCategory === id ? ' on' : ''}`}
                onClick={() => { if (currentCategory !== id) { sound.playCategorySwitch(); onSelectCategory(id) } }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right: view toggle + upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              className="chip chip-pad"
              onClick={() => { sound.playToggle(); onToggleViewMode() }}
              title="V"
            >
              <LayoutGrid style={{ width: 13, height: 13, flexShrink: 0 }} strokeWidth={2} />
              <span className="hidden sm:inline" style={{ fontSize: '11px' }}>
                {viewMode === 'tv' ? 'Grid' : 'Showcase'}
              </span>
            </button>
            <button
              className="chip chip-pad"
              onClick={() => { sound.playSelect(); onOpenUpload() }}
            >
              <Plus style={{ width: 13, height: 13, flexShrink: 0 }} strokeWidth={2.5} />
              <span className="hidden sm:inline" style={{ fontSize: '11px' }}>Upload</span>
            </button>
          </div>
        </div>

        {/* Ribbon — arrows live outside the track, track has matching padding */}
        <div style={{ position: 'relative' }}>

          {/* Left arrow */}
          {canScrollLeft && (
            <button
              className="arrow hidden sm:grid"
              onClick={() => scrollTrack(-(TILE + GAP) * 4)}
              style={{ left: 0, top: TILE / 2 - 14, transform: 'none' }}
              aria-label="Scroll left"
            >
              <ChevronLeft style={{ width: 14, height: 14 }} strokeWidth={2.5} />
            </button>
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <button
              className="arrow hidden sm:grid"
              onClick={() => scrollTrack((TILE + GAP) * 4)}
              style={{ right: 0, top: TILE / 2 - 14, transform: 'none' }}
              aria-label="Scroll right"
            >
              <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
            </button>
          )}

          {/* Track — arrows live in the 34px padding zones */}
          <div
            ref={trackRef}
            className="no-scroll"
            style={{
              display: 'flex',
              gap: GAP,
              overflowX: 'auto',
              paddingLeft:  canScrollLeft  ? 34 : 0,
              paddingRight: canScrollRight ? 34 : 0,
              paddingTop: 4,
              paddingBottom: 4,
              transition: 'padding 0.18s ease',
            }}
          >
            {games.map((g, i) => {
              const isSel = g.id === selectedGameId
              const isHov = hoveredId === g.id

              return (
                <div
                  key={g.id}
                  ref={el => { if (el) tileRefs.current.set(g.id, el); else tileRefs.current.delete(g.id) }}
                  className="tile tile-in"
                  style={{ width: TILE, animationDelay: `${Math.min(i * 28, 220)}ms` }}
                  onClick={() => { sound.playHover(); onSelectGame(g) }}
                  onMouseEnter={() => setHoveredId(g.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Glow — z-index:-1 paints behind tile, outside overflow */}
                  <div
                    className={`tile-glow${isSel ? ' on' : ''}`}
                    style={{ backgroundColor: g.themeColor || '#1a6fff' }}
                  />

                  {/* Card image */}
                  <div
                    className={`tile-img${isSel ? ' sel' : ''}`}
                    style={{ width: TILE, height: TILE }}
                  >
                    <img src={g.coverUrl} alt={g.title} loading="lazy" />

                    {/* Bottom fade for label readability */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 'auto 0 0 0',
                        height: '45%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Saved indicator */}
                    {favorites.includes(g.id) && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 7, right: 7,
                          width: 7, height: 7,
                          borderRadius: '50%',
                          background: 'rgba(244,63,94,0.9)',
                          boxShadow: '0 0 0 1.5px rgba(9,9,15,0.9)',
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: '10px',
                      fontWeight: 500,
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      paddingInline: 2,
                      lineHeight: 1.3,
                      color: isSel ? 'rgba(255,255,255,0.85)' : isHov ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                      transition: 'color 0.22s ease',
                    }}
                  >
                    {g.title}
                  </p>
                </div>
              )
            })}

            {/* Add ROM */}
            <div
              className="tile"
              style={{ width: TILE }}
              onClick={() => { sound.playSelect(); onOpenUpload() }}
              onMouseEnter={() => setHoveredId('__add')}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className="tile-img"
                style={{
                  width: TILE, height: TILE,
                  border: '1px dashed rgba(255,255,255,0.1)',
                  opacity: hoveredId === '__add' ? 0.65 : 0.28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'opacity 0.2s ease',
                }}
              >
                <Plus style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.5)' }} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
