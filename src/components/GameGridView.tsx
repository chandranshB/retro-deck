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
    <div className="flex-1 overflow-y-auto no-scroll px-6 sm:px-10 lg:px-14 pt-24 pb-8">
      <p className="text-[11px] font-medium text-white/25 mb-5 tracking-wide uppercase">
        {games.length} titles
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4">
        {games.map(game => {
          const isFav = favorites.includes(game.id)
          const isHov = hovered === game.id

          return (
            <div
              key={game.id}
              onMouseEnter={() => setHovered(game.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { sound.playHover(); onSelectGame(game) }}
              className="relative cursor-pointer"
            >
              <div
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#0c0e16]"
                style={{
                  border: `1px solid ${isHov ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  opacity: isHov ? 1 : 0.5,
                  transform: isHov ? 'translateY(-3px)' : 'none',
                  boxShadow: isHov
                    ? '0 0 0 1px rgba(255,255,255,0.3), 0 10px 28px rgba(0,0,0,0.4)'
                    : '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.25s ease',
                }}
              >
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {isFav && (
                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 grid place-items-center rounded-full bg-black/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  </div>
                )}

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(2px)',
                    opacity: isHov ? 1 : 0,
                    pointerEvents: isHov ? 'auto' : 'none',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <button
                    onClick={e => { e.stopPropagation(); sound.playGameStart(); onPlayGame(game) }}
                    className="flex items-center gap-1.5 h-8 pl-3.5 pr-4 rounded-full bg-white text-[#08090e] font-semibold text-[11px] hover:bg-white/90 active:scale-95 transition-all"
                  >
                    <Play className="w-3 h-3 fill-[#08090e]" strokeWidth={0} />
                    Play
                  </button>
                  <div className="flex gap-1.5">
                    <button
                      onClick={e => { e.stopPropagation(); sound.playSelect(); onToggleFavorite(game) }}
                      className="w-7 h-7 grid place-items-center rounded-full bg-white/10 hover:bg-white/18 transition-colors"
                    >
                      <Heart
                        className={`w-3 h-3 ${isFav ? 'fill-rose-400 text-rose-400' : 'text-white/70'}`}
                        strokeWidth={0}
                      />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); sound.playSelect(); onOpenDetails(game) }}
                      className="w-7 h-7 grid place-items-center rounded-full bg-white/10 hover:bg-white/18 transition-colors"
                    >
                      <Info className="w-3 h-3 text-white/70" strokeWidth={2.3} />
                    </button>
                  </div>
                </div>
              </div>

              <p
                className="mt-1.5 text-[10px] font-medium truncate transition-colors duration-200"
                style={{ color: isHov ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.28)' }}
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
