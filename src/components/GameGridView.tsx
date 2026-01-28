import React, { useState } from 'react'
import { Play, Heart, Info } from 'lucide-react'
import type { Game } from '../types/game'
import { sound } from '../services/sound'

interface GameGridViewProps {
  games: Game[]
  favorites: string[]
  onPlayGame: (game: Game) => void
  onToggleFavorite: (game: Game) => void
  onOpenDetails: (game: Game) => void
  onSelectGame: (game: Game) => void
}

export const GameGridView: React.FC<GameGridViewProps> = ({
  games,
  favorites,
  onPlayGame,
  onToggleFavorite,
  onOpenDetails,
  onSelectGame,
}) => {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div
      className="no-scroll"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '96px clamp(24px, 6vw, 72px) 80px',
      }}
    >
      {/* Count */}
      <p style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.2)', marginBottom: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {games.length} titles
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 16,
        }}
      >
        {games.map(game => {
          const isFav = favorites.includes(game.id)
          const isHov = hovered === game.id

          return (
            <div
              key={game.id}
              style={{ cursor: 'pointer', position: 'relative' }}
              onMouseEnter={() => setHovered(game.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { sound.playHover(); onSelectGame(game) }}
            >
              {/* Poster */}
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '3 / 4',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#111318',
                  outline: `1.5px solid ${isHov ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.05)'}`,
                  outlineOffset: '-1.5px',
                  opacity: isHov ? 1 : 0.45,
                  transform: isHov ? 'translateY(-2px)' : 'none',
                  boxShadow: isHov ? '0 8px 28px rgba(0,0,0,0.55)' : '0 2px 10px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease, opacity 0.22s ease, box-shadow 0.2s ease, outline 0.2s ease',
                }}
              >
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />

                {/* Saved dot */}
                {isFav && (
                  <div
                    style={{
                      position: 'absolute', top: 7, right: 7,
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'rgba(244,63,94,0.9)',
                      boxShadow: '0 0 0 1.5px rgba(9,9,15,0.9)',
                    }}
                  />
                )}

                {/* Hover overlay */}
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.48)',
                    backdropFilter: 'blur(3px)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: isHov ? 1 : 0,
                    pointerEvents: isHov ? 'auto' : 'none',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <button
                    className="btn btn-white"
                    style={{ height: 32, padding: '0 16px 0 12px', fontSize: '11px' }}
                    onClick={e => { e.stopPropagation(); sound.playGameStart(); onPlayGame(game) }}
                  >
                    <Play style={{ width: 11, height: 11, fill: '#09090f', flexShrink: 0 }} strokeWidth={0} />
                    Play
                  </button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="chip chip-sq"
                      onClick={e => { e.stopPropagation(); sound.playSelect(); onToggleFavorite(game) }}
                    >
                      <Heart
                        style={{
                          width: 11, height: 11,
                          fill: isFav ? 'rgba(244,63,94,0.9)' : 'none',
                          color: isFav ? 'rgba(244,63,94,0.9)' : 'rgba(255,255,255,0.6)',
                        }}
                        strokeWidth={isFav ? 0 : 1.8}
                      />
                    </button>
                    <button
                      className="chip chip-sq"
                      onClick={e => { e.stopPropagation(); sound.playSelect(); onOpenDetails(game) }}
                    >
                      <Info style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.6)' }} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Title */}
              <p
                style={{
                  marginTop: 7,
                  fontSize: '11px',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: isHov ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.25)',
                  transition: 'color 0.2s ease',
                  lineHeight: 1.3,
                }}
              >
                {game.title}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
