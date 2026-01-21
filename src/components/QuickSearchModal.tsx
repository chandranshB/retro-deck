import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Star, Calendar, ArrowRight } from 'lucide-react'
import type { Game, SystemType } from '../types/game'
import { sound } from '../services/sound'
import { CrossGlyph, KeyGlyph } from './PlayStationGlyphs'

interface QuickSearchModalProps {
  isOpen: boolean
  onClose: () => void
  games: Game[]
  onSelectGame: (game: Game) => void
  onPlayGame: (game: Game) => void
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  games,
  onSelectGame,
  onPlayGame,
}) => {
  const [query, setQuery] = useState('')
  const [selectedSystem, setSelectedSystem] = useState<string>('all')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Filter games based on search text and system filter
  const filteredGames = games.filter((g) => {
    const matchesSystem = selectedSystem === 'all' || g.system === selectedSystem
    const q = query.toLowerCase().trim()
    if (!q) return matchesSystem
    const matchesText =
      g.title.toLowerCase().includes(q) ||
      g.genre.toLowerCase().includes(q) ||
      g.developer.toLowerCase().includes(q) ||
      g.systemLabel.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
    return matchesSystem && matchesText
  })

  // Keyboard navigation within search results
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        sound.playHover()
        setHighlightedIndex((prev) => (prev < filteredGames.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        sound.playHover()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredGames.length - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = filteredGames[highlightedIndex]
        if (selected) {
          sound.playGameStart()
          onPlayGame(selected)
          onClose()
        }
      } else if (e.key === 'Escape') {
        sound.playBack()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredGames, highlightedIndex, onPlayGame, onClose])

  if (!isOpen) return null

  const systems: { id: string; label: string }[] = [
    { id: 'all', label: 'All Systems' },
    { id: 'psx', label: 'PlayStation' },
    { id: 'gba', label: 'GBA' },
    { id: 'snes', label: 'SNES' },
    { id: 'nes', label: 'NES' },
    { id: 'genesis', label: 'Genesis' },
  ]

  const getSystemColor = (sys: SystemType | string) => {
    switch (sys) {
      case 'psx':
        return 'text-blue-400 bg-blue-500/15 border-blue-500/30'
      case 'gba':
        return 'text-purple-400 bg-purple-500/15 border-purple-500/30'
      case 'snes':
        return 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30'
      case 'nes':
        return 'text-red-400 bg-red-500/15 border-red-500/30'
      case 'genesis':
        return 'text-amber-400 bg-amber-500/15 border-amber-500/30'
      default:
        return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl flex flex-col rounded-3xl bg-[#090d1f]/95 border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.8)] text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-6 py-4.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setHighlightedIndex(0)
            }}
            placeholder="Search titles, genres, systems, developers..."
            className="w-full bg-transparent text-sm md:text-base font-medium text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              sound.playBack()
              onClose()
            }}
            className="px-2 py-1 rounded-md text-[11px] font-mono text-slate-400 border border-white/10 hover:bg-white/10"
          >
            ESC
          </button>
        </div>

        {/* System Filter Pills */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 overflow-x-auto border-b border-white/5 scrollbar-none bg-white/[0.02]">
          {systems.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                sound.playHover()
                setSelectedSystem(s.id)
                setHighlightedIndex(0)
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-tight transition-all whitespace-nowrap ${
                selectedSystem === s.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Result List */}
        <div className="max-h-[50vh] overflow-y-auto divide-y divide-white/5 p-2">
          {filteredGames.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Search className="w-8 h-8 text-slate-600 mb-1" />
              <p className="text-sm font-semibold">No titles found</p>
              <p className="text-xs text-slate-500">Try adjusting your search query or selected system</p>
            </div>
          ) : (
            filteredGames.map((game, idx) => {
              const isHighlighted = idx === highlightedIndex
              return (
                <div
                  key={game.id}
                  onClick={() => {
                    sound.playGameStart()
                    onPlayGame(game)
                    onClose()
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isHighlighted
                      ? 'bg-blue-600/20 border border-blue-500/40 shadow-md shadow-blue-500/10'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={game.coverUrl}
                      alt={game.title}
                      className="w-12 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0 shadow-md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                          {game.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getSystemColor(
                            game.system
                          )}`}
                        >
                          {game.systemLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{game.genre}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {game.year}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {game.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        sound.playHover()
                        onSelectGame(game)
                        onClose()
                      }}
                      className="hidden sm:inline-flex px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        sound.playGameStart()
                        onPlayGame(game)
                        onClose()
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 group-hover:scale-105 transition-all"
                    >
                      <CrossGlyph size={14} className="bg-white/20 text-white border-transparent" />
                      <span>Play</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-6 py-2.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <KeyGlyph text="▲ ▼" /> Navigate
            </span>
            <span className="flex items-center gap-1">
              <KeyGlyph text="Enter" /> Launch Game
            </span>
          </div>
          <span>{filteredGames.length} matching</span>
        </div>
      </div>
    </div>
  )
}
