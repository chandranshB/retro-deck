import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import type { Game, CategoryFilter, UserProfile } from './types/game'
import { BUILTIN_GAMES } from './data/games'
import { storage } from './services/storage'
import { sound } from './services/sound'
import { useGamepad } from './hooks/useGamepad'

import { PS5TopBar } from './components/PS5TopBar'
import { PS5GameRibbon } from './components/PS5GameRibbon'
import { PS5GameStage } from './components/PS5GameStage'
import { PS5ActivityCards } from './components/PS5ActivityCards'
import { GameGridView } from './components/GameGridView'
import { TrophyToast } from './components/TrophyToast'
import { FooterHints } from './components/FooterHints'

// Lazy-loaded modals for minimal initial JS footprint
const EmulatorModal = lazy(() => import('./components/EmulatorModal'))
const CustomRomModal = lazy(() => import('./components/CustomRomModal'))
const SettingsModal = lazy(() => import('./components/SettingsModal'))
const GameDetailsModal = lazy(() => import('./components/GameDetailsModal'))
const QuickSearchModal = lazy(() =>
  import('./components/QuickSearchModal').then((m) => ({ default: m.QuickSearchModal }))
)
const ControllerVisualizerModal = lazy(() =>
  import('./components/ControllerVisualizerModal').then((m) => ({ default: m.ControllerVisualizerModal }))
)
const MemoryCardModal = lazy(() =>
  import('./components/MemoryCardModal').then((m) => ({ default: m.MemoryCardModal }))
)

const DEFAULT_PROFILE: UserProfile = {
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

interface AppProps {
  isSSG?: boolean
}

export function App({ isSSG = false }: AppProps) {
  const [customGames, setCustomGames] = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string>(BUILTIN_GAMES[0].id)
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [favorites, setFavorites] = useState<string[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [unlockedTrophies, setUnlockedTrophies] = useState<string[]>(['welcome'])
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<'tv' | 'grid'>('tv')
  const [crtFilterEnabled, setCrtFilterEnabled] = useState<boolean>(false)

  // Modals state
  const [playingGame, setPlayingGame] = useState<Game | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isControllerOpen, setIsControllerOpen] = useState(false)
  const [isMemoryCardOpen, setIsMemoryCardOpen] = useState(false)
  const [settingsInitialTab, setSettingsInitialTab] = useState<'settings' | 'trophies'>('settings')
  const [detailsGame, setDetailsGame] = useState<Game | null>(null)
  const [activeTrophyId, setActiveTrophyId] = useState<string | null>(null)

  const isAnyModalOpen = !!(
    playingGame ||
    isUploadOpen ||
    isSettingsOpen ||
    detailsGame ||
    isSearchOpen ||
    isControllerOpen ||
    isMemoryCardOpen
  )

  // Load persistent user data on client mount only (SSG safe)
  useEffect(() => {
    if (typeof window === 'undefined') return

    setFavorites(storage.getFavorites())
    setUserProfile(storage.getUserProfile())
    setUnlockedTrophies(storage.getUnlockedTrophies())
    setIsMuted(sound.getMuted())

    // Load custom ROMs from IndexedDB
    storage.getCustomGames().then((games) => {
      setCustomGames(games)
    })
  }, [])

  // All combined games
  const allGames = useMemo(() => {
    return [...customGames, ...BUILTIN_GAMES]
  }, [customGames])

  // Filtered games based on category
  const filteredGames = useMemo(() => {
    switch (category) {
      case 'psx':
        return allGames.filter((g) => g.system === 'psx')
      case 'nintendo':
        return allGames.filter((g) => ['gba', 'snes', 'nes', 'n64'].includes(g.system))
      case 'sega':
        return allGames.filter((g) => g.system === 'genesis')
      case 'favorites':
        return allGames.filter((g) => favorites.includes(g.id))
      case 'custom':
        return allGames.filter((g) => g.isCustom)
      default:
        return allGames
    }
  }, [allGames, category, favorites])

  // Current selected game object
  const selectedGame = useMemo(() => {
    return (
      filteredGames.find((g) => g.id === selectedGameId) ||
      allGames.find((g) => g.id === selectedGameId) ||
      filteredGames[0] ||
      null
    )
  }, [filteredGames, allGames, selectedGameId])

  // Actions
  const handleSelectGame = useCallback((game: Game) => {
    setSelectedGameId(game.id)
  }, [])

  const handlePlayGame = useCallback((game: Game) => {
    setPlayingGame(game)
  }, [])

  const handleToggleFavorite = useCallback(
    (game: Game) => {
      const isFav = storage.toggleFavorite(game.id)
      const newFavs = storage.getFavorites()
      setFavorites(newFavs)

      if (isFav && newFavs.length >= 3) {
        const unlocked = storage.unlockTrophy('favorite_collector')
        if (unlocked) {
          setActiveTrophyId('favorite_collector')
        }
      }
    },
    []
  )

  const handleCustomGameAdded = useCallback((newGame: Game) => {
    setCustomGames((prev) => [newGame, ...prev])
    setSelectedGameId(newGame.id)
    setCategory('custom')
  }, [])

  const handleDeleteCustomGame = useCallback(
    async (id: string) => {
      await storage.deleteCustomGame(id)
      setCustomGames((prev) => prev.filter((g) => g.id !== id))
      setSelectedGameId(BUILTIN_GAMES[0].id)
    },
    []
  )

  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute()
    setIsMuted(muted)
  }, [])

  const handleToggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'tv' ? 'grid' : 'tv'))
  }, [])

  const handleToggleCrtFilter = useCallback(() => {
    setCrtFilterEnabled((prev) => !prev)
  }, [])

  const handleSaveProfile = useCallback((profile: UserProfile) => {
    storage.saveUserProfile(profile)
    setUserProfile(profile)
  }, [])

  const handleTrophyUnlock = useCallback((id: string) => {
    setActiveTrophyId(id)
    setUnlockedTrophies(storage.getUnlockedTrophies())
    setUserProfile(storage.getUserProfile())
  }, [])

  // Navigation helpers
  const navigateCarousel = useCallback(
    (direction: 'left' | 'right') => {
      if (filteredGames.length === 0) return
      const currentIndex = filteredGames.findIndex((g) => g.id === selectedGameId)
      let nextIndex = 0

      if (direction === 'left') {
        nextIndex = currentIndex <= 0 ? filteredGames.length - 1 : currentIndex - 1
      } else {
        nextIndex = currentIndex >= filteredGames.length - 1 ? 0 : currentIndex + 1
      }

      const nextGame = filteredGames[nextIndex]
      if (nextGame) {
        sound.playHover()
        setSelectedGameId(nextGame.id)
      }
    },
    [filteredGames, selectedGameId]
  )

  const categoriesList: CategoryFilter[] = useMemo(
    () => ['all', 'psx', 'nintendo', 'sega', 'favorites', 'custom'],
    []
  )

  const switchCategoryTab = useCallback(
    (direction: 'prev' | 'next') => {
      const idx = categoriesList.indexOf(category)
      let nextIdx = 0
      if (direction === 'prev') {
        nextIdx = idx <= 0 ? categoriesList.length - 1 : idx - 1
      } else {
        nextIdx = idx >= categoriesList.length - 1 ? 0 : idx + 1
      }
      sound.playCategorySwitch()
      setCategory(categoriesList[nextIdx])
    },
    [categoriesList, category]
  )

  // Gamepad Hook
  const { gamepadConnected, gamepadName } = useGamepad(
    {
      onLeft: () => navigateCarousel('left'),
      onRight: () => navigateCarousel('right'),
      onSelect: () => {
        if (selectedGame) {
          sound.playGameStart()
          handlePlayGame(selectedGame)
        }
      },
      onBack: () => {
        if (isAnyModalOpen) {
          sound.playBack()
          setPlayingGame(null)
          setIsUploadOpen(false)
          setIsSettingsOpen(false)
          setDetailsGame(null)
          setIsSearchOpen(false)
          setIsControllerOpen(false)
          setIsMemoryCardOpen(false)
        }
      },
      onActionTriangle: () => {
        if (selectedGame) {
          sound.playSelect()
          handleToggleFavorite(selectedGame)
        }
      },
      onActionSquare: () => {
        if (selectedGame) {
          sound.playSelect()
          setDetailsGame(selectedGame)
        }
      },
      onPrevTab: () => switchCategoryTab('prev'),
      onNextTab: () => switchCategoryTab('next'),
    },
    isSSG || isAnyModalOpen
  )

  // Keyboard navigation
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if (e.key === 'Escape') {
        if (isAnyModalOpen) {
          sound.playBack()
          setPlayingGame(null)
          setIsUploadOpen(false)
          setIsSettingsOpen(false)
          setDetailsGame(null)
          setIsSearchOpen(false)
          setIsControllerOpen(false)
          setIsMemoryCardOpen(false)
        }
        return
      }

      if (isAnyModalOpen) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateCarousel('left')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateCarousel('right')
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (selectedGame) {
          sound.playGameStart()
          handlePlayGame(selectedGame)
        }
      } else if (e.key.toLowerCase() === 'f') {
        if (selectedGame) {
          sound.playSelect()
          handleToggleFavorite(selectedGame)
        }
      } else if (e.key.toLowerCase() === 'i') {
        if (selectedGame) {
          sound.playSelect()
          setDetailsGame(selectedGame)
        }
      } else if (e.key === '/' || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        sound.playSearch()
        setIsSearchOpen(true)
      } else if (e.key.toLowerCase() === 'v') {
        e.preventDefault()
        sound.playToggle()
        handleToggleViewMode()
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault()
        sound.playToggle()
        handleToggleCrtFilter()
      } else if (e.key >= '1' && e.key <= '6') {
        const catIdx = parseInt(e.key, 10) - 1
        if (categoriesList[catIdx]) {
          sound.playCategorySwitch()
          setCategory(categoriesList[catIdx])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isAnyModalOpen,
    navigateCarousel,
    selectedGame,
    handlePlayGame,
    handleToggleFavorite,
    handleToggleViewMode,
    handleToggleCrtFilter,
    categoriesList,
  ])

  const activeAmbientGlow = selectedGame?.themeColor || '#0070d1'

  return (
    <div className="relative min-h-screen bg-[#030612] text-[#f8fafc] flex flex-col justify-between overflow-x-hidden selection:bg-[#0070d1] selection:text-white pb-14 font-sans">
      {/* CRT Retro Filter Overlay */}
      {crtFilterEnabled && (
        <div className="fixed inset-0 crt-scanlines z-50 pointer-events-none" />
      )}

      {/* Dynamic Ambient Background Illumination */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/4 w-[850px] h-[850px] rounded-full blur-[200px] animate-ambient-drift transition-colors duration-1000 opacity-30"
          style={{ backgroundColor: activeAmbientGlow }}
        />
        <div className="absolute top-1/3 -right-40 w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[220px]" />
        <div className="absolute bottom-10 left-10 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[200px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Main Console UI Structure */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* PS5 Top Bar */}
        <PS5TopBar
          activeTab="games"
          onChangeTab={(tab) => {
            if (tab === 'trophies') {
              setSettingsInitialTab('trophies')
              setIsSettingsOpen(true)
            } else if (tab === 'memory') {
              setIsMemoryCardOpen(true)
            } else if (tab === 'controller') {
              setIsControllerOpen(true)
            }
          }}
          userProfile={userProfile}
          gamepadConnected={gamepadConnected}
          gamepadName={gamepadName}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenSettings={() => {
            setSettingsInitialTab('settings')
            setIsSettingsOpen(true)
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          crtFilterEnabled={crtFilterEnabled}
          onToggleCrtFilter={handleToggleCrtFilter}
        />

        {/* PS5 Game Ribbon (Top Shelf of Icons) */}
        <PS5GameRibbon
          games={filteredGames}
          selectedGameId={selectedGame?.id || null}
          onSelectGame={handleSelectGame}
          onOpenUpload={() => setIsUploadOpen(true)}
          favorites={favorites}
          currentCategory={category}
          onSelectCategory={(cat) => setCategory(cat)}
          viewMode={viewMode}
          onToggleViewMode={handleToggleViewMode}
          favoritesCount={favorites.length}
          customGamesCount={customGames.length}
        />

        {/* Dynamic Main Body: TV Console Stage vs Full Library Grid */}
        <main className="flex-1 flex flex-col">
          {viewMode === 'tv' ? (
            <>
              {/* PS5 Full-Bleed Game Stage */}
              <PS5GameStage
                game={selectedGame}
                isFavorite={selectedGame ? favorites.includes(selectedGame.id) : false}
                onPlay={handlePlayGame}
                onToggleFavorite={handleToggleFavorite}
                onOpenDetails={(game) => setDetailsGame(game)}
                onOpenMemoryCard={() => setIsMemoryCardOpen(true)}
                onDeleteCustom={handleDeleteCustomGame}
              />

              {/* PS5 Activity Cards Shelf */}
              <PS5ActivityCards
                game={selectedGame}
                userProfile={userProfile}
                onPlay={handlePlayGame}
                onOpenTrophies={() => {
                  setSettingsInitialTab('trophies')
                  setIsSettingsOpen(true)
                }}
                onOpenMemoryCard={() => setIsMemoryCardOpen(true)}
                onOpenController={() => setIsControllerOpen(true)}
                crtFilterEnabled={crtFilterEnabled}
                onToggleCrtFilter={handleToggleCrtFilter}
              />
            </>
          ) : (
            <GameGridView
              games={filteredGames}
              favorites={favorites}
              onPlayGame={handlePlayGame}
              onToggleFavorite={handleToggleFavorite}
              onOpenDetails={(game) => setDetailsGame(game)}
              onSelectGame={handleSelectGame}
            />
          )}
        </main>
      </div>

      {/* Controller / Keyboard Prompts Footer */}
      <FooterHints gamepadConnected={gamepadConnected} viewMode={viewMode} />

      {/* Trophy Notification Toast */}
      <TrophyToast trophyId={activeTrophyId} onDismiss={() => setActiveTrophyId(null)} />

      {/* Modals wrapped in Suspense */}
      <Suspense fallback={null}>
        {playingGame && (
          <EmulatorModal
            game={playingGame}
            onClose={() => setPlayingGame(null)}
            onTrophyUnlock={handleTrophyUnlock}
          />
        )}

        {isUploadOpen && (
          <CustomRomModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onGameAdded={handleCustomGameAdded}
            onTrophyUnlock={handleTrophyUnlock}
          />
        )}

        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            userProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            unlockedTrophies={unlockedTrophies}
            initialTab={settingsInitialTab}
          />
        )}

        {detailsGame && (
          <GameDetailsModal
            game={detailsGame}
            onClose={() => setDetailsGame(null)}
            onPlay={handlePlayGame}
          />
        )}

        {isSearchOpen && (
          <QuickSearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            games={allGames}
            onSelectGame={handleSelectGame}
            onPlayGame={handlePlayGame}
          />
        )}

        {isControllerOpen && (
          <ControllerVisualizerModal
            isOpen={isControllerOpen}
            onClose={() => setIsControllerOpen(false)}
            gamepadConnected={gamepadConnected}
            gamepadName={gamepadName}
          />
        )}

        {isMemoryCardOpen && (
          <MemoryCardModal
            isOpen={isMemoryCardOpen}
            onClose={() => setIsMemoryCardOpen(false)}
          />
        )}
      </Suspense>
    </div>
  )
}

export default App
