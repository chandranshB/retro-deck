import React, { useState, useEffect } from 'react'
import { X, Gamepad2, CheckCircle, Info } from 'lucide-react'
import { sound } from '../services/sound'
import { CrossGlyph, CircleGlyph, TriangleGlyph, SquareGlyph } from './PlayStationGlyphs'

interface ControllerVisualizerModalProps {
  isOpen: boolean
  onClose: () => void
  gamepadConnected: boolean
  gamepadName: string
}

export const ControllerVisualizerModal: React.FC<ControllerVisualizerModalProps> = ({
  isOpen,
  onClose,
  gamepadConnected,
  gamepadName,
}) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKeys((prev) => new Set(prev).add(e.key.toLowerCase()))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys((prev) => {
        const next = new Set(prev)
        next.delete(e.key.toLowerCase())
        return next
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isOpen])

  if (!isOpen) return null

  const isPressed = (key: string) => activeKeys.has(key.toLowerCase())

  const controllerMap = [
    { label: 'D-Pad Up / Down / Left / Right', keyboard: 'Arrow Keys', ps: 'D-Pad / Left Stick' },
    { label: 'Cross (Primary Action)', keyboard: 'Z key / Enter', ps: '✕ Cross (Bottom)' },
    { label: 'Circle (Cancel / Back)', keyboard: 'X key / Esc', ps: '◯ Circle (Right)' },
    { label: 'Square (Secondary / Punch)', keyboard: 'A key', ps: '▢ Square (Left)' },
    { label: 'Triangle (High / Kick / Special)', keyboard: 'S key', ps: '△ Triangle (Top)' },
    { label: 'L1 / R1 Bumpers', keyboard: 'Q / E keys', ps: 'L1 / R1' },
    { label: 'Start / Pause', keyboard: 'Enter / Return', ps: 'Options / Start' },
    { label: 'Select / Coin', keyboard: 'Right Shift', ps: 'Share / Create' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl bg-[#080d20]/95 border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.9)] text-white overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40 shadow-sm">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                DualSense & Keyboard Hub
              </h2>
              <p className="text-xs text-slate-400">
                Real-time input tester, vibration haptics & control mapping
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
          {/* Connection Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              gamepadConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="text-xs font-black uppercase tracking-wider block">
                  {gamepadConnected ? 'Hardware Controller Active' : 'Keyboard Controller Emulation'}
                </span>
                <span className="text-xs text-slate-300">
                  {gamepadConnected
                    ? `${gamepadName} connected with 0ms input polling.`
                    : 'Standard keyboard input active. Plug in any USB/Bluetooth gamepad anytime!'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Interactive Button Test Area */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Interactive Button Test (Press keys on keyboard)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  isPressed('z') || isPressed('enter')
                    ? 'bg-blue-500/30 border-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.4)] scale-105'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <CrossGlyph size={24} />
                <div>
                  <span className="text-xs font-bold block text-white">Cross [X]</span>
                  <span className="text-[10px] font-mono text-slate-400">Z or Enter</span>
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  isPressed('x') || isPressed('escape')
                    ? 'bg-red-500/30 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-105'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <CircleGlyph size={24} />
                <div>
                  <span className="text-xs font-bold block text-white">Circle [O]</span>
                  <span className="text-[10px] font-mono text-slate-400">X or Esc</span>
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  isPressed('s')
                    ? 'bg-emerald-500/30 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <TriangleGlyph size={24} />
                <div>
                  <span className="text-xs font-bold block text-white">Triangle [/\]</span>
                  <span className="text-[10px] font-mono text-slate-400">S key</span>
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  isPressed('a')
                    ? 'bg-pink-500/30 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)] scale-105'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <SquareGlyph size={24} />
                <div>
                  <span className="text-xs font-bold block text-white">Square [ ]</span>
                  <span className="text-[10px] font-mono text-slate-400">A key</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Key Mapping Table */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
              Default Input Mapping
            </h3>
            <div className="overflow-hidden rounded-2xl border border-white/10 text-xs bg-white/[0.02]">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-slate-400 font-bold border-b border-white/10">
                  <tr>
                    <th className="p-3">Action</th>
                    <th className="p-3">Keyboard</th>
                    <th className="p-3">PlayStation DualSense</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {controllerMap.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-white font-semibold">{row.label}</td>
                      <td className="p-3 font-mono text-blue-300">{row.keyboard}</td>
                      <td className="p-3 font-mono text-emerald-300">{row.ps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
