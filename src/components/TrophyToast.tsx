import React, { useEffect } from 'react'
import { Trophy as TrophyIcon } from 'lucide-react'
import { TROPHIES } from '../data/games'
import { sound } from '../services/sound'

interface TrophyToastProps {
  trophyId: string | null
  onDismiss: () => void
}

export const TrophyToast: React.FC<TrophyToastProps> = ({ trophyId, onDismiss }) => {
  useEffect(() => {
    if (!trophyId) return

    sound.playTrophyUnlock()
    const timer = setTimeout(() => {
      onDismiss()
    }, 4500)

    return () => clearTimeout(timer)
  }, [trophyId])

  if (!trophyId) return null

  const trophy = TROPHIES.find((t) => t.id === trophyId) || {
    id: trophyId,
    title: 'Milestone Achieved',
    description: 'You unlocked a new milestone.',
    tier: 'bronze' as const,
  }

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'from-cyan-400 to-blue-500'
      case 'gold':
        return 'from-amber-400 to-yellow-600'
      case 'silver':
        return 'from-slate-200 to-slate-400'
      default:
        return 'from-amber-600 to-yellow-800'
    }
  }

  return (
    <div className="fixed top-5 right-5 z-50 pointer-events-none animate-apple-toast">
      <div className="flex items-center gap-3.5 px-4 py-3 rounded-full apple-glass shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/20 backdrop-blur-3xl max-w-sm">
        {/* Glowing Tier Badge */}
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getTierGradient(
            trophy.tier
          )} flex items-center justify-center shadow-md flex-shrink-0`}
        >
          <TrophyIcon className="w-4 h-4 text-black/80" />
        </div>

        {/* Text */}
        <div className="flex flex-col pr-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] inline-block" />
            <span>Trophy Unlocked</span>
            <span className="text-slate-400 font-medium">({trophy.tier})</span>
          </div>
          <span className="text-xs font-bold text-white tracking-tight">{trophy.title}</span>
          <span className="text-[11px] text-slate-300 line-clamp-1">{trophy.description}</span>
        </div>
      </div>
    </div>
  )
}
