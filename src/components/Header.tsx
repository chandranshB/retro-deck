import React, { useState, useEffect } from 'react'
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Gamepad2,
  Keyboard,
  Trophy as TrophyIcon,
  Plus,
  Search,
  LayoutGrid,
  Tv,
} from 'lucide-react'
import type { CategoryFilter, UserProfile } from '../types/game'
import { sound } from '../services/sound'

interface HeaderProps {
  currentCategory: CategoryFilter
  onSelectCategory: (category: CategoryFilter) => void
  userProfile: UserProfile
  gamepadConnected: boolean
  gamepadName: string
  isMuted: boolean
  onToggleMute: () => void
  onOpenSettings: () => void
  onOpenUpload: () => void
  onOpenTrophies: () => void
  onOpenSearch: () => void
  viewMode: 'tv' | 'grid'
  onToggleViewMode: () => void
  favoritesCount: number
  customGamesCount: number
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  userProfile,
  gamepadConnected,
  gamepadName,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenUpload,
  onOpenTrophies,
  onOpenSearch,
  viewMode,
  onToggleViewMode,
  favoritesCount,
  customGamesCount,
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

  const handleCategoryClick = (cat: CategoryFilter) => {
    if (cat !== currentCategory) {
      sound.playCategorySwitch()
      onSelectCategory(cat)
    }
  }

  const navTabs = [
    { id: 'all' as const, label: 'All Titles' },
    { id: 'psx' as const, label: 'PlayStation' },
    { id: 'nintendo' as const, label: 'Nintendo' },
    { id: 'sega' as const, label: 'Sega' },
    { id: 'favorites' as const, label: `Favorites (${favoritesCount})` },
    { id: 'custom' as const, label: `My ROMs (${customGamesCount})` },
  ]

  return (
    <header className="relative z-30 flex flex-col gap-3 px-6 sm:px-10 pt-4 pb-2">
      {/* Top Floating Glass Utility Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: PSN User Profile & Trophies */}
        <div className="flex items-center gap-2.5">
          <div
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 p-1 pr-3.5 rounded-full apple-glass-pill cursor-pointer transition-all duration-300 group hover:scale-[1.02]"
            title="Open PSN Profile Settings"
          >
            <div className="relative">
              <img
                src={userProfile.avatar}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#070b18]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12px] font-bold text-white tracking-tight leading-tight group-hover:text-blue-300 transition-colors">
                {userProfile.gamerTag}
              </span>
              <span className="text-[9px] font-medium text-slate-400">
                PSN • Level {userProfile.level}
              </span>
            </div>
          </div>

          {/* Trophy Capsule */}
          <div
            onClick={() => {
              sound.playSelect()
              onOpenTrophies()
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full apple-glass-pill text-xs cursor-pointer transition-all hover:scale-[1.02]"
            title="View Trophies"
          >
            <TrophyIcon className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex items-center gap-2 font-mono text-[10px] font-semibold text-slate-300">
              <span title="Platinum">🏆 {userProfile.trophies.platinum}</span>
              <span title="Gold">🥇 {userProfile.trophies.gold}</span>
              <span title="Silver">🥈 {userProfile.trophies.silver}</span>
              <span title="Bronze">🥉 {userProfile.trophies.bronze}</span>
            </div>
          </div>
        </div>

        {/* Center: Apple-styled PlayStation Minimalist Hardware Badge */}
        <div className="hidden lg:flex items-center gap-2.5 px-4 py-1.5 rounded-full apple-glass-pill shadow-sm">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0a84ff] to-[#38bdf8] flex items-center justify-center shadow-md">
            <span className="font-black text-[10px] tracking-tighter text-white">PS</span>
          </div>
          <span className="text-xs font-black tracking-widest text-slate-100 uppercase">
            Retro<span className="text-[#38bdf8]">Station</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold">
            60 FPS
          </span>
        </div>

        {/* Right: Quick Search, View Mode, Controller, Sound, Fullscreen, Clock */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <button
            onClick={() => {
              sound.playSearch()
              onOpenSearch()
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full apple-glass-pill text-slate-300 hover:text-white transition-all hover:scale-105"
            title="Quick Search (Press / or Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium hidden md:inline">Search</span>
            <kbd className="hidden md:inline px-1 py-0.2 rounded bg-white/10 text-[9px] font-mono text-slate-400">
              /
            </kbd>
          </button>

          {/* View Mode Switcher: TV Mode vs Grid Mode */}
          <button
            onClick={() => {
              sound.playToggle()
              onToggleViewMode()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full apple-glass-pill text-xs font-medium text-slate-300 hover:text-white transition-all hover:scale-105"
            title={viewMode === 'tv' ? 'Switch to Grid View' : 'Switch to TV Showcase View'}
          >
            {viewMode === 'tv' ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Grid</span>
              </>
            ) : (
              <>
                <Tv className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Showcase</span>
              </>
            )}
          </button>

          {/* Controller status indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
              gamepadConnected
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'apple-glass-pill text-slate-400'
            }`}
          >
            {gamepadConnected ? (
              <>
                <Gamepad2 className="w-3.5 h-3.5 animate-pulse text-blue-400" />
                <span className="hidden xl:inline font-semibold">{gamepadName}</span>
              </>
            ) : (
              <>
                <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xl:inline">Keyboard</span>
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

          {/* Settings */}
          <button
            onClick={() => {
              sound.playSelect()
              onOpenSettings()
            }}
            className="p-2 rounded-full apple-glass-pill text-slate-300 hover:text-white transition-all hover:scale-105"
            title="System Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Realtime Clock */}
          <div className="pl-1 text-xs font-mono font-medium text-slate-300 hidden sm:block">
            {timeStr}
          </div>
        </div>
      </div>

      {/* Apple-styled Fluid Segmented Capsule Navigation */}
      <div className="flex items-center justify-between overflow-x-auto pb-1 scrollbar-none gap-2">
        <div className="p-1 rounded-full apple-glass flex items-center gap-1 shadow-sm">
          {navTabs.map((tab) => {
            const isActive = currentCategory === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleCategoryClick(tab.id)}
                onMouseEnter={() => sound.playHover()}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-white/20 shadow-md shadow-black/30 border border-white/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Upload Custom ROM CTA */}
        <button
          onClick={() => {
            sound.playSelect()
            onOpenUpload()
          }}
          onMouseEnter={() => sound.playHover()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold whitespace-nowrap transition-all shadow-sm hover:scale-[1.02]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload ROM</span>
        </button>
      </div>
    </header>
  )
}
