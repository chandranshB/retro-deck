import type { Game, UserProfile } from '../types/game'

const DB_NAME = 'PlayStationRetroDB'
const DB_VERSION = 1
const STORE_ROMS = 'custom_roms'
const STORE_SAVES = 'game_saves'

export class StorageService {
  private db: IDBDatabase | null = null
  private dbPromise: Promise<IDBDatabase> | null = null

  private getDB(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db)
    if (this.dbPromise) return this.dbPromise

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'))
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_ROMS)) {
          db.createObjectStore(STORE_ROMS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORE_SAVES)) {
          db.createObjectStore(STORE_SAVES, { keyPath: 'key' })
        }
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })

    return this.dbPromise
  }

  // --- CUSTOM ROMS VIA INDEXEDDB ---

  public async saveCustomGame(game: Game, romBlob: Blob): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ROMS, 'readwrite')
      const store = tx.objectStore(STORE_ROMS)

      const item = {
        id: game.id,
        title: game.title,
        system: game.system,
        systemLabel: game.systemLabel,
        genre: game.genre,
        year: game.year,
        developer: game.developer,
        description: game.description,
        coverUrl: game.coverUrl,
        heroUrl: game.heroUrl,
        players: game.players,
        rating: game.rating,
        isCustom: true,
        addedAt: Date.now(),
        romBlob: romBlob,
      }

      const req = store.put(item)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  public async getCustomGames(): Promise<Game[]> {
    try {
      if (typeof window === 'undefined') return []
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ROMS, 'readonly')
        const store = tx.objectStore(STORE_ROMS)
        const req = store.getAll()

        req.onsuccess = () => {
          const items = req.result || []
          const games: Game[] = items.map((item) => {
            const blobUrl = item.romBlob ? URL.createObjectURL(item.romBlob) : ''
            return {
              id: item.id,
              title: item.title,
              system: item.system,
              systemLabel: item.systemLabel,
              genre: item.genre,
              year: item.year,
              developer: item.developer,
              description: item.description,
              coverUrl: item.coverUrl,
              heroUrl: item.heroUrl,
              romUrl: blobUrl,
              players: item.players,
              rating: item.rating,
              isCustom: true,
              customRomBlob: item.romBlob,
              addedAt: item.addedAt,
            }
          })
          resolve(games)
        }

        req.onerror = () => reject(req.error)
      })
    } catch {
      return []
    }
  }

  public async deleteCustomGame(id: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ROMS, 'readwrite')
      const store = tx.objectStore(STORE_ROMS)
      const req = store.delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  // --- FAVORITES ---

  public getFavorites(): string[] {
    try {
      if (typeof localStorage === 'undefined') return []
      const data = localStorage.getItem('ps_favorites')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  public toggleFavorite(gameId: string): boolean {
    const favs = new Set(this.getFavorites())
    let isFav = false
    if (favs.has(gameId)) {
      favs.delete(gameId)
      isFav = false
    } else {
      favs.add(gameId)
      isFav = true
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ps_favorites', JSON.stringify(Array.from(favs)))
    }
    return isFav
  }

  // --- RECENTLY PLAYED ---

  public recordPlay(gameId: string) {
    try {
      if (typeof localStorage === 'undefined') return
      const recents: string[] = JSON.parse(localStorage.getItem('ps_recents') || '[]')
      const filtered = recents.filter((id) => id !== gameId)
      filtered.unshift(gameId)
      localStorage.setItem('ps_recents', JSON.stringify(filtered.slice(0, 15)))
    } catch {
      // safe fallback
    }
  }

  public getRecents(): string[] {
    try {
      if (typeof localStorage === 'undefined') return []
      return JSON.parse(localStorage.getItem('ps_recents') || '[]')
    } catch {
      return []
    }
  }

  // --- USER PROFILE & TROPHIES ---

  public getUserProfile(): UserProfile {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('ps_user_profile')
        if (saved) return JSON.parse(saved)
      }
    } catch {
      // fallback
    }

    const defaultProfile: UserProfile = {
      gamerTag: 'DualSense_Pilot',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      level: 42,
      trophies: {
        platinum: 3,
        gold: 14,
        silver: 29,
        bronze: 84,
      },
    }
    return defaultProfile
  }

  public saveUserProfile(profile: UserProfile) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ps_user_profile', JSON.stringify(profile))
    }
  }

  public getUnlockedTrophies(): string[] {
    try {
      if (typeof localStorage === 'undefined') return ['welcome']
      return JSON.parse(localStorage.getItem('ps_unlocked_trophies') || '["welcome"]')
    } catch {
      return ['welcome']
    }
  }

  public unlockTrophy(trophyId: string): boolean {
    const trophies = new Set(this.getUnlockedTrophies())
    if (trophies.has(trophyId)) return false

    trophies.add(trophyId)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ps_unlocked_trophies', JSON.stringify(Array.from(trophies)))
    }

    // Increment profile trophy count
    const profile = this.getUserProfile()
    profile.trophies.gold += 1
    profile.level += 1
    this.saveUserProfile(profile)

    return true
  }
}

export const storage = new StorageService()
