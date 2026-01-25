import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import type { Game, CategoryFilter, UserProfile } from './types/game'
import { BUILTIN_GAMES } from './data/games'
import { storage } from './services/storage'
import { sound } from './services/sound'
import { useGamepad } from './hooks/useGamepad'

import { PS5TopBar } from './components/PS5TopBar'
import { PS5GameStage } from './components/PS5GameStage'
import { GameGridView } from './components/GameGridView'
import { TrophyToast } from './components/TrophyToast'
import { FooterHints } from './components/FooterHints'

const EmulatorModal       = lazy(() => import('./components/EmulatorModal'))
const CustomRomModal      = lazy(() => import('./components/CustomRomModal'))
const SettingsModal       = lazy(() => import('./components/SettingsModal'))
const GameDetailsModal    = lazy(() => import('./components/GameDetailsModal'))
const QuickSearchModal    = lazy(() => import('./components/QuickSearchModal').then(m => ({ default: m.QuickSearchModal })))
const ControllerVisualizerModal = lazy(() => import('./components/ControllerVisualizerModal').then(m => ({ default: m.ControllerVisualizerModal })))
const MemoryCardModal     = lazy(() => import('./components/MemoryCardModal').then(m => ({ default: m.MemoryCardModal })))

const DEFAULT_PROFILE: UserProfile = {
  gamerTag: 'DualSense_Pilot',
  avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  level: 42,
  trophies: { platinum: 3, gold: 14, silver: 29, bronze: 84 },
}

interface AppProps { isSSG?: boolean }

export function App({ isSSG = false }: AppProps) {
  const [customGames, setCustomGames]     = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string>(BUILTIN_GAMES[0].id)
  const [category, setCategory]           = useState<CategoryFilter>('all')
  const [favorites, setFavorites]         = useState<string[]>([])
  const [userProfile, setUserProfile]     = useState<UserProfile>(DEFAULT_PROFILE)
  const [unlockedTrophies, setUnlockedTrophies] = useState<string[]>(['welcome'])
  const [isMuted, setIsMuted]             = useState(false)
  const [viewMode, setViewMode]           = useState<'tv' | 'grid'>('tv')
  const [crtFilterEnabled, setCrtFilter]  = useState(false)

  const [playingGame, setPlayingGame]     = useState<Game | null>(null)
  const [isUploadOpen, setIsUploadOpen]   = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen]   = useState(false)
  const [isControllerOpen, setIsControllerOpen] = useState(false)
  const [isMemoryCardOpen, setIsMemoryCardOpen] = useState(false)
  const [settingsInitialTab, setSettingsInitialTab] = useState<'settings' | 'trophies'>('settings')
  const [detailsGame, setDetailsGame]     = useState<Game | null>(null)
  const [activeTrophyId, setActiveTrophyId] = useState<string | null>(null)

  const isAnyModalOpen = !!(playingGame || isUploadOpen || isSettingsOpen || detailsGame || isSearchOpen || isControllerOpen || isMemoryCardOpen)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setFavorites(storage.getFavorites())
    setUserProfile(storage.getUserProfile())
    setUnlockedTrophies(storage.getUnlockedTrophies())
    setIsMuted(sound.getMuted())
    storage.getCustomGames().then(g => setCustomGames(g))
  }, [])

  const allGames      = useMemo(() => [...customGames, ...BUILTIN_GAMES], [customGames])
  const filteredGames = useMemo(() => {
    switch (category) {
      case 'psx':       return allGames.filter(g => g.system === 'psx')
      case 'nintendo':  return allGames.filter(g => ['gba','snes','nes','n64'].includes(g.system))
      case 'sega':      return allGames.filter(g => g.system === 'genesis')
      case 'favorites': return allGames.filter(g => favorites.includes(g.id))
      case 'custom':    return allGames.filter(g => g.isCustom)
      default:          return allGames
    }
  }, [allGames, category, favorites])

  const selectedGame = useMemo(() =>
    filteredGames.find(g => g.id === selectedGameId) ||
    allGames.find(g => g.id === selectedGameId) ||
    filteredGames[0] || null,
    [filteredGames, allGames, selectedGameId]
  )

  const handleSelectGame    = useCallback((g: Game) => setSelectedGameId(g.id), [])
  const handlePlayGame      = useCallback((g: Game) => setPlayingGame(g), [])
  const handleToggleFav     = useCallback((g: Game) => {
    const isFav = storage.toggleFavorite(g.id)
    const next  = storage.getFavorites()
    setFavorites(next)
    if (isFav && next.length >= 3) {
      const unlocked = storage.unlockTrophy('favorite_collector')
      if (unlocked) setActiveTrophyId('favorite_collector')
    }
  }, [])
  const handleCustomAdded   = useCallback((g: Game) => {
    setCustomGames(prev => [g, ...prev])
    setSelectedGameId(g.id)
    setCategory('custom')
  }, [])
  const handleDeleteCustom  = useCallback(async (id: string) => {
    await storage.deleteCustomGame(id)
    setCustomGames(prev => prev.filter(g => g.id !== id))
    setSelectedGameId(BUILTIN_GAMES[0].id)
  }, [])
  const handleToggleMute    = useCallback(() => setIsMuted(sound.toggleMute()), [])
  const handleToggleView    = useCallback(() => setViewMode(v => v === 'tv' ? 'grid' : 'tv'), [])
  const handleToggleCrt     = useCallback(() => setCrtFilter(v => !v), [])
  const handleSaveProfile   = useCallback((p: UserProfile) => { storage.saveUserProfile(p); setUserProfile(p) }, [])
  const handleTrophyUnlock  = useCallback((id: string) => {
    setActiveTrophyId(id)
    setUnlockedTrophies(storage.getUnlockedTrophies())
    setUserProfile(storage.getUserProfile())
  }, [])

  const categoriesList: CategoryFilter[] = useMemo(() => ['all','psx','nintendo','sega','favorites','custom'], [])

  const navigateCarousel = useCallback((dir: 'left' | 'right') => {
    if (!filteredGames.length) return
    const i = filteredGames.findIndex(g => g.id === selectedGameId)
    const next = dir === 'left'
      ? (i <= 0 ? filteredGames.length - 1 : i - 1)
      : (i >= filteredGames.length - 1 ? 0 : i + 1)
    const g = filteredGames[next]
    if (g) { sound.playHover(); setSelectedGameId(g.id) }
  }, [filteredGames, selectedGameId])

  const switchCategory = useCallback((dir: 'prev' | 'next') => {
    const idx = categoriesList.indexOf(category)
    const next = dir === 'prev'
      ? (idx <= 0 ? categoriesList.length - 1 : idx - 1)
      : (idx >= categoriesList.length - 1 ? 0 : idx + 1)
    sound.playCategorySwitch()
    setCategory(categoriesList[next])
  }, [categoriesList, category])

  const closeAllModals = useCallback(() => {
    sound.playBack()
    setPlayingGame(null); setIsUploadOpen(false); setIsSettingsOpen(false)
    setDetailsGame(null); setIsSearchOpen(false); setIsControllerOpen(false); setIsMemoryCardOpen(false)
  }, [])

  const { gamepadConnected, gamepadName } = useGamepad({
    onLeft:          () => navigateCarousel('left'),
    onRight:         () => navigateCarousel('right'),
    onSelect:        () => { if (selectedGame) { sound.playGameStart(); handlePlayGame(selectedGame) } },
    onBack:          () => { if (isAnyModalOpen) closeAllModals() },
    onActionTriangle:() => { if (selectedGame) { sound.playSelect(); handleToggleFav(selectedGame) } },
    onActionSquare:  () => { if (selectedGame) { sound.playSelect(); setDetailsGame(selectedGame) } },
    onPrevTab:       () => switchCategory('prev'),
    onNextTab:       () => switchCategory('next'),
  }, isSSG || isAnyModalOpen)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT','SELECT','TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      if (e.key === 'Escape') { if (isAnyModalOpen) closeAllModals(); return }
      if (isAnyModalOpen) return
      if (e.key === 'ArrowLeft')  { e.preventDefault(); navigateCarousel('left')  }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigateCarousel('right') }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (selectedGame) { sound.playGameStart(); handlePlayGame(selectedGame) } }
      if (e.key.toLowerCase() === 'f') { if (selectedGame) { sound.playSelect(); handleToggleFav(selectedGame) } }
      if (e.key.toLowerCase() === 'i') { if (selectedGame) { sound.playSelect(); setDetailsGame(selectedGame) } }
      if (e.key === '/' || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); sound.playSearch(); setIsSearchOpen(true) }
      if (e.key.toLowerCase() === 'v') { e.preventDefault(); handleToggleView() }
      if (e.key.toLowerCase() === 'c') { e.preventDefault(); handleToggleCrt() }
      if (e.key >= '1' && e.key <= '6') { const i = parseInt(e.key) - 1; if (categoriesList[i]) { sound.playCategorySwitch(); setCategory(categoriesList[i]) } }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isAnyModalOpen, navigateCarousel, selectedGame, handlePlayGame, handleToggleFav, handleToggleView, handleToggleCrt, categoriesList, closeAllModals])

  return (
    <div className="relative w-full h-dvh bg-[#08090e] text-[#e8edf2] overflow-hidden font-sans">
      {/* CRT */}
      {crtFilterEnabled && <div className="fixed inset-0 crt z-50 pointer-events-none" />}

      {/* Top bar — floats over everything */}
      <PS5TopBar
        activeTab="games"
        onChangeTab={tab => {
          if (tab === 'trophies')    { setSettingsInitialTab('trophies'); setIsSettingsOpen(true) }
          else if (tab === 'memory') setIsMemoryCardOpen(true)
          else if (tab === 'controller') setIsControllerOpen(true)
        }}
        userProfile={userProfile}
        gamepadConnected={gamepadConnected}
        gamepadName={gamepadName}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSettings={() => { setSettingsInitialTab('settings'); setIsSettingsOpen(true) }}
        onOpenSearch={() => setIsSearchOpen(true)}
        crtFilterEnabled={crtFilterEnabled}
        onToggleCrtFilter={handleToggleCrt}
      />

      {/* Main content */}
      {viewMode === 'tv' ? (
        <PS5GameStage
          game={selectedGame}
          isFavorite={selectedGame ? favorites.includes(selectedGame.id) : false}
          onPlay={handlePlayGame}
          onToggleFavorite={handleToggleFav}
          onOpenDetails={g => setDetailsGame(g)}
          onOpenMemoryCard={() => setIsMemoryCardOpen(true)}
          onDeleteCustom={handleDeleteCustom}
          games={filteredGames}
          selectedGameId={selectedGame?.id || null}
          onSelectGame={handleSelectGame}
          onOpenUpload={() => setIsUploadOpen(true)}
          favorites={favorites}
          currentCategory={category}
          onSelectCategory={c => setCategory(c)}
          viewMode={viewMode}
          onToggleViewMode={handleToggleView}
          favoritesCount={favorites.length}
          customGamesCount={customGames.length}
        />
      ) : (
        <>
          <GameGridView
            games={filteredGames}
            favorites={favorites}
            onPlayGame={handlePlayGame}
            onToggleFavorite={handleToggleFav}
            onOpenDetails={g => setDetailsGame(g)}
            onSelectGame={handleSelectGame}
          />
          {/* Category filter row visible in grid mode too */}
          <div className="fixed bottom-8 inset-x-0 flex justify-center z-20 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-0.5 px-1 py-1 rounded-full glass">
              {(['all','psx','nintendo','sega','favorites','custom'] as CategoryFilter[]).map(id => {
                const labels: Record<CategoryFilter, string> = {
                  all: 'All', psx: 'PlayStation', nintendo: 'Nintendo',
                  sega: 'Sega', favorites: 'Saved', custom: 'My ROMs',
                }
                const active = category === id
                return (
                  <button
                    key={id}
                    onClick={() => { sound.playCategorySwitch(); setCategory(id) }}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-150 ${
                      active ? 'bg-white/12 text-white border border-white/12' : 'text-white/30 hover:text-white/55 border border-transparent'
                    }`}
                  >
                    {labels[id]}
                  </button>
                )
              })}
              <button
                onClick={() => { sound.playToggle(); handleToggleView() }}
                className="ml-1 h-7 px-3 rounded-full chip text-[11px] text-white/35 hover:text-white/65"
              >
                Showcase
              </button>
            </div>
          </div>
        </>
      )}

      {/* Footer hints */}
      <FooterHints gamepadConnected={gamepadConnected} viewMode={viewMode} />

      {/* Trophy toast */}
      <TrophyToast trophyId={activeTrophyId} onDismiss={() => setActiveTrophyId(null)} />

      {/* Modals */}
      <Suspense fallback={null}>
        {playingGame    && <EmulatorModal game={playingGame} onClose={() => setPlayingGame(null)} onTrophyUnlock={handleTrophyUnlock} />}
        {isUploadOpen   && <CustomRomModal isOpen onClose={() => setIsUploadOpen(false)} onGameAdded={handleCustomAdded} onTrophyUnlock={handleTrophyUnlock} />}
        {isSettingsOpen && <SettingsModal isOpen onClose={() => setIsSettingsOpen(false)} userProfile={userProfile} onSaveProfile={handleSaveProfile} isMuted={isMuted} onToggleMute={handleToggleMute} unlockedTrophies={unlockedTrophies} initialTab={settingsInitialTab} />}
        {detailsGame    && <GameDetailsModal game={detailsGame} onClose={() => setDetailsGame(null)} onPlay={handlePlayGame} />}
        {isSearchOpen   && <QuickSearchModal isOpen onClose={() => setIsSearchOpen(false)} games={allGames} onSelectGame={handleSelectGame} onPlayGame={handlePlayGame} />}
        {isControllerOpen && <ControllerVisualizerModal isOpen onClose={() => setIsControllerOpen(false)} gamepadConnected={gamepadConnected} gamepadName={gamepadName} />}
        {isMemoryCardOpen && <MemoryCardModal isOpen onClose={() => setIsMemoryCardOpen(false)} />}
      </Suspense>
    </div>
  )
}

export default App
