/**
 * Apple-Calibrated Tactile Sound Synthesizer
 * Uses Web Audio API with low-pass resonant filtering and smooth Bezier envelopes
 * to produce warm, refined acoustic haptics similar to Apple tvOS / iOS / macOS.
 */

class SoundService {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false

  constructor() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('ps_sound_muted')
      if (saved !== null) {
        this.isMuted = saved === 'true'
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ps_sound_muted', String(this.isMuted))
    }
    return this.isMuted
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  /**
   * Apple Tactile Focus Tick
   * Soft resonant pop (1200Hz -> 400Hz) with gentle lowpass dampening
   */
  public playHover() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1200, now)
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(2400, now)

      gain.gain.setValueAtTime(0.045, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.04)
    } catch {
      // Safe fallback
    }
  }

  /**
   * Apple Confirmation Chime
   * Warm, elegant major chord (F#5 + C#6) with velvet decay
   */
  public playSelect() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime

      // Tone 1: F#5 (739.99 Hz)
      const osc1 = ctx.createOscillator()
      const filter1 = ctx.createBiquadFilter()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(739.99, now)
      filter1.type = 'lowpass'
      filter1.frequency.setValueAtTime(3200, now)
      gain1.gain.setValueAtTime(0.07, now)
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)
      osc1.connect(filter1)
      filter1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.28)

      // Tone 2: C#6 (1108.73 Hz) with subtle 30ms offset
      const osc2 = ctx.createOscillator()
      const filter2 = ctx.createBiquadFilter()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1108.73, now + 0.035)
      filter2.type = 'lowpass'
      filter2.frequency.setValueAtTime(3600, now + 0.035)
      gain2.gain.setValueAtTime(0.065, now + 0.035)
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.38)
      osc2.connect(filter2)
      filter2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.035)
      osc2.stop(now + 0.38)
    } catch {
      // Safe fallback
    }
  }

  /**
   * Apple Dismissal / Back Tone
   * Gentle descending teardrop
   */
  public playBack() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, now) // D5
      osc.frequency.exponentialRampToValueAtTime(392.0, now + 0.15) // G4

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1800, now)

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.16)
    } catch {
      // Safe fallback
    }
  }

  /**
   * Fluid Capsule Switch (Swoosh)
   */
  public playCategorySwitch() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(2000, now)

      gain.gain.setValueAtTime(0.035, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.09)
    } catch {
      // Safe fallback
    }
  }

  /**
   * Cinematic App Launch Fanfare
   */
  public playGameStart() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime

      // Warm cinematic sub rumble
      const sub = ctx.createOscillator()
      const subGain = ctx.createGain()
      sub.type = 'sine'
      sub.frequency.setValueAtTime(120, now)
      sub.frequency.exponentialRampToValueAtTime(45, now + 0.5)
      subGain.gain.setValueAtTime(0.12, now)
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)
      sub.connect(subGain)
      subGain.connect(ctx.destination)
      sub.start(now)
      sub.stop(now + 0.55)

      // Harmonious ascending triad (D4, A4, D5, F#5)
      const freqs = [293.66, 440.0, 587.33, 739.99]
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const filter = ctx.createBiquadFilter()
        const g = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.04)
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(4000, now)

        g.gain.setValueAtTime(0.05, now + idx * 0.04)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.75)

        osc.connect(filter)
        filter.connect(g)
        g.connect(ctx.destination)

        osc.start(now + idx * 0.04)
        osc.stop(now + 0.75)
      })
    } catch {
      // Safe fallback
    }
  }

  /**
   * Trophy / Achievement Unlock Fanfare
   */
  public playTrophyUnlock() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [659.25, 830.61, 987.77, 1318.51] // E5, G#5, B5, E6

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const startTime = now + i * 0.05

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0.08, startTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + 0.4)
      })
    } catch {
      // Safe fallback
    }
  }

  /**
   * Search Palette Open Sound (Crisp High-Frequency Glass Swoosh)
   */
  public playSearch() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.09)

      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1200, now)

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.1)
    } catch {
      // Safe fallback
    }
  }

  /**
   * View Mode Switch / Toggle Sound
   */
  public playToggle() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.07)

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.08)
    } catch {
      // Safe fallback
    }
  }
}

export const sound = new SoundService()
