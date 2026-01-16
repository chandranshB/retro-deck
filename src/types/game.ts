export type SystemType = 'psx' | 'gba' | 'snes' | 'nes' | 'genesis' | 'n64' | 'arcade' | 'custom'

export interface Game {
  id: string
  title: string
  system: SystemType
  systemLabel: string
  genre: string
  year: number | string
  developer: string
  description: string
  coverUrl: string
  heroUrl: string
  romUrl?: string // URL or Blob URL or placeholder
  embedUrl?: string // Direct playable embed gateway (e.g., retrogames embed)
  players: string
  rating: number
  featured?: boolean
  isCustom?: boolean
  customRomBlob?: Blob
  addedAt?: number
  themeColor?: string
}

export type CategoryFilter = 'all' | 'psx' | 'nintendo' | 'sega' | 'favorites' | 'custom'

export interface UserProfile {
  gamerTag: string
  avatar: string
  level: number
  trophies: {
    platinum: number
    gold: number
    silver: number
    bronze: number
  }
}

export interface Trophy {
  id: string
  title: string
  description: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  icon?: string
}
