import React, { useState } from 'react'
import {
  X,
  User,
  Sliders,
  Trophy as TrophyIcon,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
} from 'lucide-react'
import type { UserProfile } from '../types/game'
import { TROPHIES } from '../data/games'
import { CrossGlyph, CircleGlyph, TriangleGlyph, SquareGlyph } from './PlayStationGlyphs'
import { sound } from '../services/sound'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  userProfile: UserProfile
  onSaveProfile: (profile: UserProfile) => void
  isMuted: boolean
  onToggleMute: () => void
  unlockedTrophies: string[]
  initialTab?: 'settings' | 'trophies'
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  isMuted,
  onToggleMute,
  unlockedTrophies,
  initialTab = 'settings',
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'trophies' | 'controls'>(initialTab)
  const [gamerTag, setGamerTag] = useState(userProfile.gamerTag)
  const [avatar, setAvatar] = useState(userProfile.avatar)
  const [savedSuccess, setSavedSuccess] = useState(false)

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveProfile({
      ...userProfile,
      gamerTag: gamerTag.trim() || 'Player_1',
      avatar: avatar.trim() || userProfile.avatar,
    })
    setSavedSuccess(true)
    sound.playSelect()
    setTimeout(() => setSavedSuccess(false), 2000)
  }

  const avatarPresets = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-[#080d1e] border border-white/10 shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0070d1] flex items-center justify-center font-bold text-xs text-white">
              PS
            </div>
            <div>
              <h2 className="text-base font-bold text-white">PlayStation Settings</h2>
              <p className="text-xs text-slate-400">System Preferences, Profile & Trophies</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playBack()
              onClose()
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 px-6 gap-2 bg-[#060913]/40">
          <button
            onClick={() => {
              sound.playHover()
              setActiveTab('settings')
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-[#0070d1] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Profile & Audio</span>
          </button>

          <button
            onClick={() => {
              sound.playHover()
              setActiveTab('controls')
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'controls'
                ? 'border-[#0070d1] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Controls & Mapping</span>
          </button>

          <button
            onClick={() => {
              sound.playHover()
              setActiveTab('trophies')
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'trophies'
                ? 'border-[#0070d1] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrophyIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Trophies ({unlockedTrophies.length}/{TROPHIES.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'settings' && (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Profile Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Gamer Identity
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    PlayStation Network ID
                  </label>
                  <input
                    type="text"
                    value={gamerTag}
                    onChange={(e) => setGamerTag(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#0070d1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Choose Avatar
                  </label>
                  <div className="flex items-center gap-3">
                    {avatarPresets.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Preset"
                        onClick={() => setAvatar(url)}
                        className={`w-12 h-12 rounded-full object-cover cursor-pointer transition-all ${
                          avatar === url
                            ? 'ring-4 ring-[#0070d1] scale-105'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* System Sound */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Audio & Sound Effects
                </h3>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-red-400" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-emerald-400" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-white">Synthesized UI Sound FX</div>
                      <div className="text-[11px] text-slate-400">
                        PlayStation chimes and navigation plucks
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSelect()
                      onToggleMute()
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isMuted
                        ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                        : 'bg-[#0070d1] text-white shadow-md shadow-[#0070d1]/30'
                    }`}
                  >
                    {isMuted ? 'Muted' : 'Enabled'}
                  </button>
                </div>
              </div>

              {/* Reset Data */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-400">Clear Cache & Local Saves</div>
                  <div className="text-[11px] text-slate-400">
                    Resets favorites, recent plays, and local custom ROMs
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your local data?')) {
                      localStorage.clear()
                      window.location.reload()
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0070d1] hover:bg-[#007ef0] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#0070d1]/30"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-xs font-bold text-[#0070d1] uppercase mb-2">
                  DualSense / Controller Mapping
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CrossGlyph />
                    <span className="text-slate-300">Play / Confirm Selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleGlyph />
                    <span className="text-slate-300">Back / Close Modal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TriangleGlyph />
                    <span className="text-slate-300">Toggle Favorite</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SquareGlyph />
                    <span className="text-slate-300">Game Information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">
                      D-Pad
                    </span>
                    <span className="text-slate-300">Navigate Cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">
                      L1 / R1
                    </span>
                    <span className="text-slate-300">Switch Category Tabs</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">
                  Keyboard Shortcuts
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">
                      Arrow Keys
                    </kbd>
                    <span className="text-slate-300">Navigate library</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">
                      Enter
                    </kbd>
                    <span className="text-slate-300">Launch selected game</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">
                      Escape
                    </kbd>
                    <span className="text-slate-300">Back / Exit player</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">
                      F
                    </kbd>
                    <span className="text-slate-300">Bookmark favorite</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trophies' && (
            <div className="space-y-3">
              {TROPHIES.map((trophy) => {
                const isUnlocked = unlockedTrophies.includes(trophy.id)
                return (
                  <div
                    key={trophy.id}
                    className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${
                      isUnlocked
                        ? 'bg-white/5 border-[#0070d1]/40'
                        : 'bg-white/[0.02] border-white/5 opacity-40'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                        isUnlocked
                          ? trophy.tier === 'platinum'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : trophy.tier === 'gold'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-500/20 text-slate-300'
                          : 'bg-white/5 text-slate-600'
                      }`}
                    >
                      🏆
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{trophy.title}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          [{trophy.tier}]
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{trophy.description}</p>
                    </div>
                    <div>
                      {isUnlocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-500 text-[10px]">
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
