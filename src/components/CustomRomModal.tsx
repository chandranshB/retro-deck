import React, { useState, useRef } from 'react'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { Game, SystemType } from '../types/game'
import { storage } from '../services/storage'
import { sound } from '../services/sound'

interface CustomRomModalProps {
  isOpen: boolean
  onClose: () => void
  onGameAdded: (game: Game) => void
  onTrophyUnlock: (trophyId: string) => void
}

export const CustomRomModal: React.FC<CustomRomModalProps> = ({
  isOpen,
  onClose,
  onGameAdded,
  onTrophyUnlock,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [gameTitle, setGameTitle] = useState('')
  const [system, setSystem] = useState<SystemType>('gba')
  const [coverUrl, setCoverUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const detectSystemFromFilename = (filename: string): SystemType => {
    const ext = filename.toLowerCase().split('.').pop()
    switch (ext) {
      case 'gba':
        return 'gba'
      case 'nes':
        return 'nes'
      case 'smc':
      case 'sfc':
        return 'snes'
      case 'gen':
      case 'md':
      case 'bin':
        return 'genesis'
      case 'iso':
      case 'cue':
      case 'pbp':
        return 'psx'
      case 'n64':
      case 'z64':
        return 'n64'
      default:
        return 'gba'
    }
  }

  const handleFile = (file: File) => {
    setErrorMsg('')
    setSelectedFile(file)
    const rawName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
    // Clean up title (remove underscores, brackets like [U], (USA), etc.)
    const cleanedTitle = rawName.replace(/[(_[][^)]+][)]/g, '').replace(/_/g, ' ').trim()
    setGameTitle(cleanedTitle)
    const detected = detectSystemFromFilename(file.name)
    setSystem(detected)

    // Default stylish wallpaper placeholders based on system
    const defaultCover =
      detected === 'psx'
        ? 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
        : detected === 'gba'
        ? 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80'
        : detected === 'snes'
        ? 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'
        : detected === 'nes'
        ? 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80'

    setCoverUrl(defaultCover)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setErrorMsg('Please select or drop a ROM file.')
      return
    }
    if (!gameTitle.trim()) {
      setErrorMsg('Please enter a title for the game.')
      return
    }

    setIsSaving(true)
    try {
      const getSystemLabel = (sys: SystemType) => {
        switch (sys) {
          case 'psx':
            return 'PlayStation 1'
          case 'gba':
            return 'Game Boy Advance'
          case 'snes':
            return 'Super Nintendo'
          case 'nes':
            return 'NES (8-Bit)'
          case 'genesis':
            return 'Sega Genesis'
          case 'n64':
            return 'Nintendo 64'
          default:
            return 'Custom System'
        }
      }

      const id = `custom-${Date.now()}`
      const newGame: Game = {
        id,
        title: gameTitle.trim(),
        system,
        systemLabel: getSystemLabel(system),
        genre: 'Custom ROM',
        year: new Date().getFullYear(),
        developer: 'User Library',
        description: `Imported ROM file (${selectedFile.name}). Saved securely inside your browser's IndexedDB.`,
        coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        heroUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80',
        romUrl: '',
        players: '1 - 2 Players',
        rating: 5.0,
        isCustom: true,
        customRomBlob: selectedFile,
        addedAt: Date.now(),
      }

      await storage.saveCustomGame(newGame, selectedFile)
      sound.playSelect()

      // Unlock Custom ROM Pioneer trophy
      const unlocked = storage.unlockTrophy('custom_rom_pilot')
      if (unlocked) {
        onTrophyUnlock('custom_rom_pilot')
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        })
      }

      onGameAdded(newGame)
      onClose()
    } catch (err: unknown) {
      setErrorMsg('Failed to store ROM in IndexedDB: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl p-6 rounded-3xl bg-[#080d1e] border border-white/10 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import Custom ROM</h2>
              <p className="text-xs text-slate-400">
                100% Client-Side. Saved locally in your browser storage.
              </p>
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

        {/* Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-emerald-400 bg-emerald-500/10'
                : selectedFile
                ? 'border-blue-500/60 bg-blue-500/5'
                : 'border-white/15 hover:border-white/30 bg-white/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".gba,.nes,.sfc,.smc,.bin,.iso,.cue,.md,.gen,.zip"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0])
                }
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
                <span className="text-sm font-semibold text-white">{selectedFile.name}</span>
                <span className="text-xs text-slate-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Click to replace file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <UploadCloud className="w-8 h-8 text-[#0070d1]" />
                <span className="text-sm font-semibold text-white">
                  Drag and drop your game ROM here
                </span>
                <span className="text-xs text-slate-400">
                  Or click to browse files (.gba, .nes, .smc, .sfc, .md, .bin, .zip)
                </span>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Game Title</label>
            <input
              type="text"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="e.g., Castlevania: Aria of Sorrow"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#0070d1]"
            />
          </div>

          {/* System Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Emulation Core
              </label>
              <select
                value={system}
                onChange={(e) => setSystem(e.target.value as SystemType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d142d] border border-white/10 text-sm text-white focus:outline-none focus:border-[#0070d1]"
              >
                <option value="psx">PlayStation 1 (PSX)</option>
                <option value="gba">Game Boy Advance (GBA)</option>
                <option value="snes">Super Nintendo (SNES)</option>
                <option value="nes">Nintendo NES (8-Bit)</option>
                <option value="genesis">Sega Genesis / Mega Drive</option>
                <option value="n64">Nintendo 64 (N64)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cover Art URL (Optional)
              </label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#0070d1]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                sound.playBack()
                onClose()
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !selectedFile}
              className="px-6 py-2.5 rounded-xl bg-[#0070d1] hover:bg-[#007ef0] disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-[#0070d1]/30 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <span>Writing to Local DB...</span>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Mount & Save ROM</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomRomModal
