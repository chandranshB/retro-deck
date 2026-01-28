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
  const [fs,   setFs]   = useState(false)

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
    <header
      style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px clamp(24px, 6vw, 72px) 0',
      }}
    >
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 28, height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #0070d1, #38b6ff)',
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1 }}>PS</span>
        </div>
        <span
          className="hidden sm:block"
          style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '-0.01em' }}
        >
          RetroStation
        </span>
      </div>

      {/* Controls — all the same 32px height */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

        {/* Search */}
        <button
          className="chip chip-pad"
          onClick={() => { sound.playSearch(); onOpenSearch() }}
          title="Search  /"
          style={{ paddingLeft: 12, paddingRight: 14 }}
        >
          <Search style={{ width: 13, height: 13, flexShrink: 0 }} strokeWidth={2.3} />
          <span className="hidden sm:inline">Search</span>
        </button>

        {/* Mute */}
        <button
          className="chip chip-sq"
          onClick={() => { sound.playSelect(); onToggleMute() }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted
            ? <VolumeX style={{ width: 13, height: 13, color: 'rgba(244,63,94,0.75)' }} strokeWidth={2.2} />
            : <Volume2  style={{ width: 13, height: 13 }}                               strokeWidth={2.2} />
          }
        </button>

        {/* Fullscreen */}
        <button
          className="chip chip-sq"
          onClick={toggleFs}
          title="Fullscreen"
        >
          {fs
            ? <Minimize2 style={{ width: 13, height: 13 }} strokeWidth={2.2} />
            : <Maximize2 style={{ width: 13, height: 13 }} strokeWidth={2.2} />
          }
        </button>

        {/* Controller — status indicator, not interactive */}
        <div
          className="chip chip-sq"
          title={gamepadConnected ? 'Controller connected' : 'Keyboard mode'}
          style={{ cursor: 'default' }}
        >
          <Gamepad2
            style={{
              width: 13, height: 13,
              color: gamepadConnected ? 'rgba(52,211,153,0.9)' : 'rgba(255,255,255,0.18)',
              transition: 'color 0.3s ease',
            }}
            strokeWidth={2.2}
          />
        </div>

        {/* Profile + settings — single pill */}
        <button
          className="chip"
          onClick={() => { sound.playSelect(); onOpenSettings() }}
          title="Settings"
          style={{ padding: '0 12px 0 4px', gap: 8, marginLeft: 4 }}
        >
          <img
            src={userProfile.avatar}
            alt=""
            style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <span
            className="hidden sm:block"
            style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}
          >
            {userProfile.gamerTag}
          </span>
          <Settings style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.2)' }} className="hidden sm:block" strokeWidth={2.2} />
        </button>

        {/* Clock */}
        <span
          className="hidden md:block"
          style={{ fontSize: '11px', fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.2)', paddingLeft: 4, fontVariantNumeric: 'tabular-nums' }}
        >
          {time}
        </span>
      </div>
    </header>
  )
}
