import React, { useState, useEffect } from 'react'
import { Search, Volume2, VolumeX, Maximize2, Minimize2, Settings, Gamepad2 } from 'lucide-react'
import type { UserProfile } from '../types/game'
import { sound } from '../services/sound'

interface PS5TopBarProps {
  activeTab: 'games' | 'trophies' | 'memory' | 'controller'
  onChangeTab: (tab: 'games' | 'trophies' | 'memory' | 'controller') => void
  userProfile: UserProfile
  gamepadConnected: boolean
  gamepadName: string
  isMuted: boolean
  onToggleMute: () => void
  onOpenSettings: () => void
  onOpenSearch: () => void
  crtFilterEnabled: boolean
  onToggleCrtFilter: () => void
}

export const PS5TopBar: React.FC<PS5TopBarProps> = ({
  userProfile,
  gamepadConnected,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenSearch,
}) => {
  const [time, setTime] = useState('')
  const [fs, setFs] = useState(false)

  useEffect(() => {
    const tick = () => setTime(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const fn = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', fn)
    return () => document.removeEventListener('fullscreenchange', fn)
  }, [])

  const toggleFs = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {})
    else document.exitFullscreen().catch(() => {})
  }

  return (
    <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 sm:px-10 lg:px-14 pt-5 select-none">
      {/* Left — wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[#0070d1] to-[#38b6ff] grid place-items-center">
          <span className="text-[10px] font-black text-white tracking-tighter leading-none">PS</span>
        </div>
        <span className="text-[13px] font-semibold text-white/75 tracking-tight hidden sm:block">
          RetroStation
        </span>
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-1.5">
        {/* Search — the wider pill the user likes */}
        <button
          onClick={() => { sound.playSearch(); onOpenSearch() }}
          className="flex items-center gap-2 h-8 pl-3 pr-3.5 rounded-full chip text-[11px] font-medium text-white/40 hover:text-white/80 transition-colors"
          title="Search  /"
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.3} />
          <span className="hidden sm:inline">Search</span>
        </button>

        {/* Mute */}
        <button
          onClick={() => { sound.playSelect(); onToggleMute() }}
          className="w-8 h-8 grid place-items-center rounded-full chip text-white/40 hover:text-white/80 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted
            ? <VolumeX className="w-3.5 h-3.5 text-rose-400/80" strokeWidth={2.3} />
            : <Volume2  className="w-3.5 h-3.5"                  strokeWidth={2.3} />
          }
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFs}
          className="w-8 h-8 grid place-items-center rounded-full chip text-white/40 hover:text-white/80 transition-colors"
          title="Fullscreen"
        >
          {fs
            ? <Minimize2 className="w-3.5 h-3.5" strokeWidth={2.3} />
            : <Maximize2 className="w-3.5 h-3.5" strokeWidth={2.3} />
          }
        </button>

        {/* Gamepad status — indicator only */}
        <div
          className="w-8 h-8 grid place-items-center rounded-full chip"
          title={gamepadConnected ? 'Controller connected' : 'Keyboard mode'}
        >
          <Gamepad2
            className={`w-3.5 h-3.5 transition-colors ${gamepadConnected ? 'text-emerald-400' : 'text-white/20'}`}
            strokeWidth={2.3}
          />
        </div>

        {/* Profile / Settings — one button */}
        <button
          onClick={() => { sound.playSelect(); onOpenSettings() }}
          className="flex items-center gap-2 h-8 pl-1 pr-3 ml-1 rounded-full chip"
          title="Settings"
        >
          <img src={userProfile.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
          <span className="text-[11px] font-medium text-white/55 hidden sm:block">{userProfile.gamerTag}</span>
          <Settings className="w-3 h-3 text-white/25 hidden sm:block" strokeWidth={2.3} />
        </button>

        {/* Clock */}
        <span className="text-[11px] font-mono text-white/25 pl-1 hidden md:block tabular-nums">{time}</span>
      </div>
    </header>
  )
}
