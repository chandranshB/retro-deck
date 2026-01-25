import React from 'react'
import { Trophy as TrophyIcon, Monitor, HardDrive, Gamepad2 } from 'lucide-react'
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
  onOpenTrophies,
  onOpenMemoryCard,
  onOpenController,
  crtFilterEnabled,
  onToggleCrtFilter,
}) => {
  if (!game) return null

  const totalTrophies =
    userProfile.trophies.platinum * 300 +
    userProfile.trophies.gold * 90 +
    userProfile.trophies.silver * 30 +
    userProfile.trophies.bronze * 15

  return (
    <div className="px-5 sm:px-8 lg:px-12 pb-8 select-none">
      <div className="flex items-center gap-2">

        <QuickCard onClick={() => { sound.playSelect(); onOpenTrophies() }} label="Trophies">
          <TrophyIcon className="w-4 h-4 text-amber-400 mb-2" strokeWidth={2} />
          <span className="text-[12px] font-semibold text-white">Trophies</span>
          <span className="text-[10px] text-[#3d4557] mt-0.5 font-mono">{totalTrophies} pts</span>
        </QuickCard>

        <QuickCard onClick={() => { sound.playSelect(); onOpenMemoryCard() }} label="Saves">
          <HardDrive className="w-4 h-4 text-indigo-400 mb-2" strokeWidth={2} />
          <span className="text-[12px] font-semibold text-white">Saves</span>
          <span className="text-[10px] text-[#3d4557] mt-0.5">Memory card</span>
        </QuickCard>

        <QuickCard
          onClick={() => { sound.playToggle(); onToggleCrtFilter() }}
          label="CRT"
          active={crtFilterEnabled}
        >
          <Monitor className={`w-4 h-4 mb-2 ${crtFilterEnabled ? 'text-amber-400' : 'text-[#5a6478]'}`} strokeWidth={2} />
          <span className="text-[12px] font-semibold text-white">CRT</span>
          <span className={`text-[10px] mt-0.5 ${crtFilterEnabled ? 'text-amber-400' : 'text-[#3d4557]'}`}>
            {crtFilterEnabled ? 'On' : 'Off'}
          </span>
        </QuickCard>

        <QuickCard onClick={() => { sound.playSelect(); onOpenController() }} label="Controller">
          <Gamepad2 className="w-4 h-4 text-purple-400 mb-2" strokeWidth={2} />
          <span className="text-[12px] font-semibold text-white">Controller</span>
          <span className="text-[10px] text-[#3d4557] mt-0.5">Input</span>
        </QuickCard>

      </div>
    </div>
  )
}

const QuickCard: React.FC<{
  onClick: () => void
  label: string
  active?: boolean
  children: React.ReactNode
}> = ({ onClick, label, active, children }) => (
  <button
    onClick={onClick}
    onMouseEnter={() => sound.playHover()}
    aria-label={label}
    className={`flex flex-col items-start p-3.5 rounded-2xl min-w-[100px] transition-all duration-200 hover:scale-[1.02] ${
      active ? 'glass border border-amber-500/20' : 'glass hover:border-white/10'
    }`}
  >
    {children}
  </button>
)
