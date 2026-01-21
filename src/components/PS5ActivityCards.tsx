import React from 'react'
import { Trophy as TrophyIcon, Monitor, HardDrive, Gamepad2, Play, Flame, ShieldCheck } from 'lucide-react'
import type { Game, UserProfile } from '../types/game'
import { sound } from '../services/sound'

interface PS5ActivityCardsProps {
  game: Game | null
  userProfile: UserProfile
  onPlay: (game: Game) => void
  onOpenTrophies: () => void
  onOpenMemoryCard: () => void
  onOpenController: () => void
  crtFilterEnabled: boolean
  onToggleCrtFilter: () => void
}

export const PS5ActivityCards: React.FC<PS5ActivityCardsProps> = ({
  game,
  userProfile,
  onPlay,
  onOpenTrophies,
  onOpenMemoryCard,
  onOpenController,
  crtFilterEnabled,
  onToggleCrtFilter,
}) => {
  if (!game) return null

  return (
    <div className="relative z-30 w-full px-6 sm:px-10 py-5 select-none">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0070d1]" />
          <span>Game Activities & System Hub</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-400">
          PlayStation Hub • {game.title}
        </span>
      </div>

      {/* Grid of 5 PS5-style Activity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* Card 1: Instant Resume / Play Activity */}
        <div
          onClick={() => {
            sound.playGameStart()
            onPlay(game)
          }}
          className="group relative rounded-2xl apple-glass p-4 cursor-pointer overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(0,112,209,0.3)]"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider">
              Launch Game
            </span>
            <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            </div>
          </div>
          <h3 className="text-sm font-black text-white mt-3 group-hover:text-blue-300 transition-colors">
            Start {game.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            60 FPS WebAssembly runtime with zero input latency.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Ready • 60 FPS</span>
          </div>
        </div>

        {/* Card 2: Trophy Vault Activity */}
        <div
          onClick={() => {
            sound.playSelect()
            onOpenTrophies()
          }}
          className="group relative rounded-2xl apple-glass p-4 cursor-pointer overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(234,179,8,0.2)]"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              Trophy Vault
            </span>
            <TrophyIcon className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-sm font-black text-white mt-3 group-hover:text-amber-300 transition-colors">
            Trophy Milestones
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Track your PSN achievements across retro gaming milestones.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-slate-300 font-bold">
            <span>🏆 {userProfile.trophies.platinum}</span>
            <span>🥇 {userProfile.trophies.gold}</span>
            <span>🥈 {userProfile.trophies.silver}</span>
            <span>🥉 {userProfile.trophies.bronze}</span>
          </div>
        </div>

        {/* Card 3: Virtual Memory Card */}
        <div
          onClick={() => {
            sound.playSelect()
            onOpenMemoryCard()
          }}
          className="group relative rounded-2xl apple-glass p-4 cursor-pointer overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(99,102,241,0.25)]"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
              Memory Card
            </span>
            <HardDrive className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-sm font-black text-white mt-3 group-hover:text-indigo-300 transition-colors">
            Save States & Slots
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            15 block PS1 virtual memory card with instant cloud export.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-indigo-300">
            <span>15 Blocks • Browser Storage</span>
          </div>
        </div>

        {/* Card 4: CRT Video Shader Mode */}
        <div
          onClick={() => {
            sound.playToggle()
            onToggleCrtFilter()
          }}
          className={`group relative rounded-2xl p-4 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] border ${
            crtFilterEnabled
              ? 'bg-amber-500/15 border-amber-500/40 shadow-[0_12px_30px_rgba(245,158,11,0.25)]'
              : 'apple-glass border-white/10 hover:border-white/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                crtFilterEnabled ? 'bg-amber-500/30 text-amber-300' : 'bg-white/10 text-slate-300'
              }`}
            >
              CRT: {crtFilterEnabled ? 'ON' : 'OFF'}
            </span>
            <Monitor className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-sm font-black text-white mt-3 group-hover:text-amber-300 transition-colors">
            Trinitron CRT Mode
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Authentic retro scanline phosphor glow shader.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Click to toggle filter</span>
          </div>
        </div>

        {/* Card 5: Controller Mapping & DualSense Hub */}
        <div
          onClick={() => {
            sound.playSelect()
            onOpenController()
          }}
          className="group relative rounded-2xl apple-glass p-4 cursor-pointer overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(168,85,247,0.2)]"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider">
              Input Config
            </span>
            <Gamepad2 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-sm font-black text-white mt-3 group-hover:text-purple-300 transition-colors">
            DualSense Visualizer
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Real-time button latency and control tester.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-purple-300">
            <span>Live Hardware Polling</span>
          </div>
        </div>
      </div>
    </div>
  )
}
