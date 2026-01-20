import React, { useEffect, useState, useRef } from 'react'
import type { Game } from '../types/game'
import { sound } from '../services/sound'
import { storage } from '../services/storage'

interface EmulatorModalProps {
  game: Game | null
  onClose: () => void
  onTrophyUnlock: (trophyId: string) => void
}

export const EmulatorModal: React.FC<EmulatorModalProps> = ({
  game,
  onClose,
  onTrophyUnlock,
}) => {
  const [playerSrc, setPlayerSrc] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!game) return

    // Record game play in history
    storage.recordPlay(game.id)

    // Check for "First Game" trophy
    const unlocked = storage.unlockTrophy('first_game')
    if (unlocked) {
      onTrophyUnlock('first_game')
      import('canvas-confetti').then((c) => {
        c.default({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
      })
    }

    // Build URL for our own client-side WebAssembly emulator
    let romParam = game.romUrl || ''
    let sessionKey = ''

    // If custom ROM blob exists, put blob URL into sessionStorage
    if (game.customRomBlob) {
      sessionKey = `ps_rom_${game.id}`
      const blobUrl = URL.createObjectURL(game.customRomBlob)
      sessionStorage.setItem(sessionKey, blobUrl)
      romParam = ''
    }

    const query = new URLSearchParams({
      core: game.system,
      title: game.title,
      rom: romParam,
    })

    if (sessionKey) {
      query.set('sessionRomKey', sessionKey)
    }

    setPlayerSrc(`/emulator/?${query.toString()}`)

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PS_EXIT_GAME') {
        sound.playBack()
        onClose()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
      if (sessionKey) {
        sessionStorage.removeItem(sessionKey)
      }
    }
  }, [game])

  if (!game) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white animate-in fade-in duration-300">
      <div id="emulator-screen-container" className="relative flex-1 w-full h-full bg-black flex items-center justify-center">
        {playerSrc && (
          <iframe
            ref={iframeRef}
            src={playerSrc}
            className="w-full h-full border-0"
            allow="autoplay; gamepad; fullscreen; cross-origin-isolated"
            title={game.title}
          />
        )}
      </div>
    </div>
  )
}

export default EmulatorModal
