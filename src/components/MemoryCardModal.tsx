import React, { useState } from 'react'
import { X, HardDrive, Download, Check, Trash2 } from 'lucide-react'
import { sound } from '../services/sound'

interface MemoryCardModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SaveBlock {
  slot: number
  title: string
  gameTitle: string
  system: string
  timestamp: string
  blocksUsed: number
}

const DEFAULT_BLOCKS: SaveBlock[] = [
  {
    slot: 1,
    title: 'Tekken 3 - Arcade Mode Clear',
    gameTitle: 'Tekken 3',
    system: 'PlayStation 1',
    timestamp: 'Today, 11:42 PM',
    blocksUsed: 1,
  },
  {
    slot: 2,
    title: 'Castlevania: SotN - Inverted Castle (Alucard Lv.45)',
    gameTitle: 'Castlevania: SotN',
    system: 'PlayStation 1',
    timestamp: 'Yesterday, 8:15 PM',
    blocksUsed: 2,
  },
  {
    slot: 3,
    title: 'Crash Bandicoot - Wumpa Islands (26 Gems)',
    gameTitle: 'Crash Bandicoot',
    system: 'PlayStation 1',
    timestamp: '3 days ago',
    blocksUsed: 1,
  },
  {
    slot: 4,
    title: 'Pokémon Emerald - Rayquaza Captured (8 Badges)',
    gameTitle: 'Pokémon Emerald',
    system: 'Game Boy Advance',
    timestamp: '5 days ago',
    blocksUsed: 1,
  },
]

export const MemoryCardModal: React.FC<MemoryCardModalProps> = ({ isOpen, onClose }) => {
  const [saves, setSaves] = useState<SaveBlock[]>(DEFAULT_BLOCKS)
  const [copiedSlot, setCopiedSlot] = useState<number | null>(null)

  if (!isOpen) return null

  const totalBlocks = 15
  const usedBlocks = saves.reduce((acc, s) => acc + s.blocksUsed, 0)
  const freeBlocks = Math.max(0, totalBlocks - usedBlocks)

  const handleDeleteSave = (slot: number) => {
    sound.playBack()
    setSaves((prev) => prev.filter((s) => s.slot !== slot))
  }

  const handleExport = (save: SaveBlock) => {
    sound.playSelect()
    setCopiedSlot(save.slot)
    setTimeout(() => setCopiedSlot(null), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl bg-[#080d20]/95 border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.9)] text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40 shadow-sm">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                PlayStation Virtual Memory Card
              </h2>
              <p className="text-xs text-slate-400">
                15 Block Standard PS1 Memory Card • Local Browser State Manager
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Blocks Capacity Status Bar */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>Memory Card 1 (Internal Storage)</span>
              </span>
              <span className="font-mono text-slate-300 font-semibold">
                {usedBlocks} / {totalBlocks} Blocks Used ({freeBlocks} Free)
              </span>
            </div>

            {/* 15 block graphical slots */}
            <div className="grid grid-cols-15 gap-1.5 h-4 w-full">
              {Array.from({ length: totalBlocks }).map((_, idx) => {
                const isOccupied = idx < usedBlocks
                return (
                  <div
                    key={idx}
                    className={`h-full rounded-sm transition-all ${
                      isOccupied
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.5)]'
                        : 'bg-white/10 border border-white/10'
                    }`}
                    title={`Block ${idx + 1}: ${isOccupied ? 'Occupied' : 'Free'}`}
                  />
                )
              })}
            </div>
          </div>

          {/* Saved Game Slots List */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3">
              Recorded Game Save Data
            </h3>

            <div className="space-y-3">
              {saves.map((save) => (
                <div
                  key={save.slot}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                      PS1
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{save.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="text-indigo-300 font-medium">{save.system}</span>
                        <span>•</span>
                        <span>{save.timestamp}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{save.blocksUsed} Block(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExport(save)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
                      title="Export Save File (.sav)"
                    >
                      {copiedSlot === save.slot ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Exported!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Backup</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteSave(save.slot)}
                      className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                      title="Delete Save Block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
