import React from 'react'
import { KeyGlyph, CrossGlyph, CircleGlyph, TriangleGlyph, SquareGlyph } from './PlayStationGlyphs'

interface FooterHintsProps {
  gamepadConnected: boolean
  viewMode?: 'tv' | 'grid'
}

export const FooterHints: React.FC<FooterHintsProps> = ({ gamepadConnected }) => (
  <footer
    className="fixed bottom-0 inset-x-0 z-30 h-8 px-6 sm:px-10 lg:px-14 flex items-center justify-end gap-5 select-none"
    style={{ background: 'linear-gradient(to top, rgba(8,9,14,0.95), transparent)' }}
  >
    {gamepadConnected ? (
      <>
        <Hint icon={<CrossGlyph size={12} />}    label="Play"    />
        <Hint icon={<CircleGlyph size={12} />}   label="Back"    />
        <Hint icon={<TriangleGlyph size={12} />} label="Save"    />
        <Hint icon={<SquareGlyph size={12} />}   label="Details" />
      </>
    ) : (
      <>
        <Hint icon={<KeyGlyph text="↵" />}  label="Play"    />
        <Hint icon={<KeyGlyph text="F" />}  label="Save"    />
        <Hint icon={<KeyGlyph text="I" />}  label="Details" />
        <Hint icon={<KeyGlyph text="/" />}  label="Search"  />
      </>
    )}
  </footer>
)

const Hint: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 text-[10px] text-white/18">
    {icon}
    <span>{label}</span>
  </div>
)
