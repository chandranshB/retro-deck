import React from 'react'
import { X, Play, Calendar, Users, Star, Award, Layers, Sparkles } from 'lucide-react'
import type { Game } from '../types/game'
import { CrossGlyph } from './PlayStationGlyphs'
import { sound } from '../services/sound'

interface GameDetailsModalProps {
  game: Game | null
  onClose: () => void
  onPlay: (game: Game) => void
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({ game, onClose, onPlay }) => {
  if (!game) return null

  const getSystemControls = (sys: string) => {
    switch (sys) {
      case 'psx':
        return [
          { original: 'D-Pad', pc: 'Arrow Keys', pad: 'D-Pad / Left Stick' },
          { original: 'Cross ✕', pc: 'Z key', pad: 'Cross [X]' },
          { original: 'Circle ◯', pc: 'X key', pad: 'Circle [O]' },
          { original: 'Square ▢', pc: 'A key', pad: 'Square [ ]' },
          { original: 'Triangle △', pc: 'S key', pad: 'Triangle [/\\\\]' },
          { original: 'L1 / R1', pc: 'Q / E keys', pad: 'L1 / R1 Bumpers' },
          { original: 'Start', pc: 'Enter', pad: 'Options / Start' },
          { original: 'Select', pc: 'Right Shift', pad: 'Share / Select' },
        ]
      case 'gba':
        return [
          { original: 'D-Pad', pc: 'Arrow Keys', pad: 'D-Pad / Left Stick' },
          { original: 'Button A', pc: 'Z key', pad: 'Cross [X]' },
          { original: 'Button B', pc: 'X key', pad: 'Circle [O]' },
          { original: 'L Trigger', pc: 'A key', pad: 'L1 Bumper' },
          { original: 'R Trigger', pc: 'S key', pad: 'R1 Bumper' },
          { original: 'Start', pc: 'Enter', pad: 'Options / Start' },
          { original: 'Select', pc: 'Shift', pad: 'Share / Select' },
        ]
      case 'snes':
        return [
          { original: 'D-Pad', pc: 'Arrow Keys', pad: 'D-Pad / Left Stick' },
          { original: 'B / A', pc: 'Z / X keys', pad: 'Cross / Circle' },
          { original: 'Y / X', pc: 'A / S keys', pad: 'Square / Triangle' },
          { original: 'L / R', pc: 'Q / W keys', pad: 'L1 / R1 Bumpers' },
          { original: 'Start / Select', pc: 'Enter / Shift', pad: 'Start / Select' },
        ]
      case 'genesis':
        return [
          { original: 'D-Pad', pc: 'Arrow Keys', pad: 'D-Pad / Left Stick' },
          { original: 'Button A / B / C', pc: 'A / Z / X keys', pad: 'Square / Cross / Circle' },
          { original: 'Start', pc: 'Enter', pad: 'Options / Start' },
        ]
      default:
        return [
          { original: 'D-Pad', pc: 'Arrow Keys', pad: 'D-Pad / Left Stick' },
          { original: 'Primary Action', pc: 'Z key', pad: 'Cross [X]' },
          { original: 'Secondary Action', pc: 'X key', pad: 'Circle [O]' },
          { original: 'Start', pc: 'Enter', pad: 'Options / Start' },
          { original: 'Select', pc: 'Shift', pad: 'Share / Select' },
        ]
    }
  }

  const controls = getSystemControls(game.system)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl bg-[#080d20]/95 border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.9)] text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Backdrop */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-900 flex-shrink-0">
          <img
            src={game.heroUrl || game.coverUrl}
            alt={game.title}
            className="w-full h-full object-cover opacity-60 transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080d20] via-[#080d20]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080d20]/80 via-transparent to-[#080d20]/80" />

          {/* Close button */}
          <button
            onClick={() => {
              sound.playBack()
              onClose()
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all hover:scale-105 border border-white/10"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Details with Poster Overlay */}
        <div className="px-6 -mt-16 relative z-10 flex gap-4 items-end pb-4 border-b border-white/10 flex-shrink-0">
          <img
            src={game.coverUrl}
            alt={game.title}
            className="w-24 h-32 rounded-2xl object-cover border-2 border-white/30 shadow-2xl flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0070d1] text-white tracking-wider shadow-sm">
              {game.systemLabel}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 truncate tracking-tight">
              {game.title}
            </h2>
            <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
              {game.genre} • Developed by {game.developer}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playGameStart()
              onPlay(game)
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-slate-100 text-xs font-black shadow-xl hover:scale-105 transition-all flex-shrink-0"
          >
            <CrossGlyph size={18} className="bg-black/10 text-black border-transparent" />
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>PLAY</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Metadata Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Release</span>
              </span>
              <span className="text-xs font-black text-white mt-1">{game.year}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Players</span>
              </span>
              <span className="text-xs font-black text-white mt-1">{game.players}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Rating</span>
              </span>
              <span className="text-xs font-black text-white mt-1">{game.rating.toFixed(1)} / 5.0</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Engine</span>
              </span>
              <span className="text-xs font-black text-white mt-1">WebAssembly 60 FPS</span>
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>Game Overview</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              {game.description}
            </p>
          </div>

          {/* System Control Guide */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Controller & Keyboard Layout</span>
            </h3>
            <div className="overflow-hidden rounded-2xl border border-white/10 text-xs bg-white/[0.02]">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-slate-400 font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-3">Original Console</th>
                    <th className="p-3">Keyboard Shortcut</th>
                    <th className="p-3">PlayStation / Gamepad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {controls.map((c, i) => (
                    <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-semibold text-white">{c.original}</td>
                      <td className="p-3 font-mono text-blue-300 font-medium">{c.pc}</td>
                      <td className="p-3 font-mono text-emerald-300 font-medium">{c.pad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameDetailsModal
