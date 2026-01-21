import React, { useState, useEffect } from 'react'
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Gamepad2,
  Keyboard,
  Search,
  Monitor,
  Trophy as TrophyIcon,
  HardDrive,
  Sliders,
} from 'lucide-react'
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
  activeTab,
  onChangeTab,
  userProfile,
  gamepadConnected,
  gamepadName,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenSearch,
  crtFilterEnabled,
  onToggleCrtFilter,
}) => {
  const [timeStr, setTimeStr] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const toggleFullscreen = () => {
    sound.playSelect()
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const navItems = [
    { id: 'games' as const, label: 'Games', icon: Gamepad2 },
    { id: 'trophies' as const, label: 'Trophies', icon: TrophyIcon },
    { id: 'memory' as const, label: 'Memory Card', icon: HardDrive },
    { id: 'controller' as const, label: 'DualSense Hub', icon: Sliders },
  ]

  return (
    <header className="relative z-40 w-full px-6 sm:px-10 pt-4 pb-2 flex items-center justify-between select-none">
      {/* Left: PlayStation Emblem + OS Navigation Tabs */}
      <div className="flex items-center gap-6">
        {/* PS Family Badge */}
        <div
          onClick={() => {
            sound.playSelect()
            onChangeTab('games')
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0070d1] to-[#38bdf8] flex items-center justify-center shadow-[0_0_20px_rgba(0,112,209,0.5)] group-hover:scale-105 transition-transform">
            <span className="font-black text-sm tracking-tighter text-white">PS</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-widest uppercase text-white leading-none">
              PlayStation<span className="text-[#38bdf8]"> Retro</span>
            </span>
            <span className="text-[9px] font-mono font-semibold text-slate-400 mt-0.5">
              System OS v5.02
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Games, Trophies, Memory Card, DualSense Hub) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full apple-glass shadow-inner">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playCategorySwitch()
                  onChangeTab(item.id)
                }}
                onMouseEnter={() => sound.playHover()}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-black shadow-md shadow-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Right: Quick Search, CRT Toggle, Gamepad status, Audio, Fullscreen, Profile, Clock */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Search */}
        <button
          onClick={() => {
            sound.playSearch()
            onOpenSearch()
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full apple-glass-pill text-xs font-semibold text-slate-300 hover:text-white transition-all hover:scale-105"
          title="Search all games (Press / or Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden lg:inline">Search</span>
          <kbd className="hidden lg:inline px-1 py-0.2 rounded bg-white/10 text-[9px] font-mono text-slate-400">
            /
          </kbd>
        </button>

        {/* CRT Retro Filter Toggle */}
        <button
          onClick={() => {
            sound.playToggle()
            onToggleCrtFilter()
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 ${
            crtFilterEnabled
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'apple-glass-pill text-slate-300 hover:text-white'
          }`}
          title="Toggle CRT Scanline Retro Shader"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CRT {crtFilterEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Controller Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
            gamepadConnected
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'apple-glass-pill text-slate-400'
          }`}
          title={gamepadConnected ? `Connected: ${gamepadName}` : 'Keyboard Controls Active'}
        >
          {gamepadConnected ? (
            <>
              <Gamepad2 className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span className="hidden xl:inline">{gamepadName}</span>
            </>
          ) : (
            <>
              <Keyboard className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden xl:inline">DualSense / Keyboard</span>
            </>
          )}
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => {
            sound.playSelect()
            onToggleMute()
          }}
          className="p-2 rounded-full apple-glass-pill text-slate-300 hover:text-white transition-all hover:scale-105"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full apple-glass-pill text-slate-300 hover:text-white transition-all hover:scale-105"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* PSN Profile Pill */}
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2 p-1 pr-3 rounded-full apple-glass-pill cursor-pointer transition-all hover:scale-105"
          title="Open PSN Profile & System Settings"
        >
          <div className="relative">
            <img
              src={userProfile.avatar}
              alt="Avatar"
              className="w-6 h-6 rounded-full object-cover ring-1 ring-white/30"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#070b18]" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight hidden sm:inline">
            {userProfile.gamerTag}
          </span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-600/60 text-[9px] font-bold text-white font-mono hidden md:inline">
            Lv.{userProfile.level}
          </span>
        </div>

        {/* Settings Gear */}
        <button
          onClick={() => {
            sound.playSelect()
            onOpenSettings()
          }}
          className="p-2 rounded-full apple-glass-pill text-slate-300 hover:text-white transition-all hover:scale-105"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Realtime Clock */}
        <div className="pl-1 text-xs font-mono font-bold text-slate-200 hidden md:block">
          {timeStr}
        </div>
      </div>
    </header>
  )
}
