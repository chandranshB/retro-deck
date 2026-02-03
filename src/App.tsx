import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import {
  Home, Flame, Gamepad2, Heart, Plus, Search,
  Volume2, VolumeX, Maximize2, Minimize2, Settings,
  ChevronRight, Play, Info, Star, Trash2, Monitor,
} from 'lucide-react'
import type { Game, CategoryFilter, UserProfile } from './types/game'
import { BUILTIN_GAMES } from './data/games'
import { storage } from './services/storage'
import { sound } from './services/sound'
import { useGamepad } from './hooks/useGamepad'
import { TrophyToast } from './components/TrophyToast'

const EmulatorModal             = lazy(() => import('./components/EmulatorModal'))
const CustomRomModal            = lazy(() => import('./components/CustomRomModal'))
const SettingsModal             = lazy(() => import('./components/SettingsModal'))
const GameDetailsModal          = lazy(() => import('./components/GameDetailsModal'))
const QuickSearchModal          = lazy(() => import('./components/QuickSearchModal').then(m => ({ default: m.QuickSearchModal })))
const ControllerVisualizerModal = lazy(() => import('./components/ControllerVisualizerModal').then(m => ({ default: m.ControllerVisualizerModal })))
const MemoryCardModal           = lazy(() => import('./components/MemoryCardModal').then(m => ({ default: m.MemoryCardModal })))

const DEFAULT_PROFILE: UserProfile = {
  gamerTag: 'DualSense_Pilot',
  avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  level: 42,
  trophies: { platinum: 3, gold: 14, silver: 29, bronze: 84 },
}

interface AppProps { isSSG?: boolean }

export function App({ isSSG = false }: AppProps) {
  const [customGames, setCustomGames]   = useState<Game[]>([])
  const [selectedId,  setSelectedId]    = useState<string>(BUILTIN_GAMES[0].id)
  const [category,    setCategory]      = useState<CategoryFilter>('all')
  const [favorites,   setFavorites]     = useState<string[]>([])
  const [profile,     setProfile]       = useState<UserProfile>(DEFAULT_PROFILE)
  const [unlockedTrophies, setUnlocked] = useState<string[]>(['welcome'])
  const [isMuted,    setIsMuted]        = useState(false)
  const [crtOn,      setCrtOn]          = useState(false)
  const [isFs,       setIsFs]           = useState(false)
  const [searchQuery, setSearchQuery]   = useState('')
  const [activeTrophyId, setTrophyId]  = useState<string | null>(null)

  // Modals
  const [playingGame,       setPlayingGame]       = useState<Game | null>(null)
  const [isUploadOpen,      setIsUploadOpen]      = useState(false)
  const [isSettingsOpen,    setIsSettingsOpen]    = useState(false)
  const [isSearchOpen,      setIsSearchOpen]      = useState(false)
  const [isControllerOpen,  setIsControllerOpen]  = useState(false)
  const [isMemoryCardOpen,  setIsMemoryCardOpen]  = useState(false)
  const [settingsTab,       setSettingsTab]        = useState<'settings'|'trophies'>('settings')
  const [detailsGame,       setDetailsGame]        = useState<Game | null>(null)

  const isAnyModalOpen = !!(playingGame||isUploadOpen||isSettingsOpen||detailsGame||isSearchOpen||isControllerOpen||isMemoryCardOpen)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setFavorites(storage.getFavorites())
    setProfile(storage.getUserProfile())
    setUnlocked(storage.getUnlockedTrophies())
    setIsMuted(sound.getMuted())
    storage.getCustomGames().then(g => setCustomGames(g))
    const fn = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', fn)
    return () => document.removeEventListener('fullscreenchange', fn)
  }, [])

  const allGames = useMemo(() => [...customGames, ...BUILTIN_GAMES], [customGames])

  const filteredGames = useMemo(() => {
    let base: Game[]
    switch (category) {
      case 'psx':       base = allGames.filter(g => g.system === 'psx'); break
      case 'nintendo':  base = allGames.filter(g => ['gba','snes','nes','n64'].includes(g.system)); break
      case 'sega':      base = allGames.filter(g => g.system === 'genesis'); break
      case 'favorites': base = allGames.filter(g => favorites.includes(g.id)); break
      case 'custom':    base = allGames.filter(g => g.isCustom); break
      default:          base = allGames
    }
    if (!searchQuery.trim()) return base
    const q = searchQuery.toLowerCase()
    return base.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.genre.toLowerCase().includes(q) ||
      g.developer.toLowerCase().includes(q)
    )
  }, [allGames, category, favorites, searchQuery])

  const selectedGame = useMemo(() =>
    filteredGames.find(g => g.id === selectedId) ||
    allGames.find(g => g.id === selectedId) ||
    filteredGames[0] || null,
    [filteredGames, allGames, selectedId]
  )



  const handleSelect    = useCallback((g: Game) => { sound.playHover(); setSelectedId(g.id) }, [])
  const handlePlay      = useCallback((g: Game) => setPlayingGame(g), [])
  const handleToggleFav = useCallback((g: Game) => {
    const added = storage.toggleFavorite(g.id)
    const next  = storage.getFavorites()
    setFavorites(next)
    if (added && next.length >= 3) {
      if (storage.unlockTrophy('favorite_collector')) setTrophyId('favorite_collector')
    }
  }, [])
  const handleCustomAdded  = useCallback((g: Game) => { setCustomGames(p => [g,...p]); setSelectedId(g.id); setCategory('custom') }, [])
  const handleDeleteCustom = useCallback(async (id: string) => {
    await storage.deleteCustomGame(id)
    setCustomGames(p => p.filter(g => g.id !== id))
    setSelectedId(BUILTIN_GAMES[0].id)
  }, [])
  const toggleMute  = useCallback(() => setIsMuted(sound.toggleMute()), [])
  const toggleCrt   = useCallback(() => setCrtOn(v => !v), [])
  const toggleFs    = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {})
    else document.exitFullscreen().catch(() => {})
  }, [])
  const saveProfile = useCallback((p: UserProfile) => { storage.saveUserProfile(p); setProfile(p) }, [])
  const onTrophyUnlock = useCallback((id: string) => {
    setTrophyId(id); setUnlocked(storage.getUnlockedTrophies()); setProfile(storage.getUserProfile())
  }, [])
  const closeModals = useCallback(() => {
    sound.playBack()
    setPlayingGame(null); setIsUploadOpen(false); setIsSettingsOpen(false)
    setDetailsGame(null); setIsSearchOpen(false); setIsControllerOpen(false); setIsMemoryCardOpen(false)
  }, [])

  const cats: CategoryFilter[] = useMemo(() => ['all','psx','nintendo','sega','favorites','custom'], [])
  const navigateCarousel = useCallback((dir: 'left'|'right') => {
    if (!filteredGames.length) return
    const i = filteredGames.findIndex(g => g.id === selectedId)
    const next = dir === 'left'
      ? (i <= 0 ? filteredGames.length - 1 : i - 1)
      : (i >= filteredGames.length - 1 ? 0 : i + 1)
    const g = filteredGames[next]
    if (g) { sound.playHover(); setSelectedId(g.id) }
  }, [filteredGames, selectedId])

  const switchCat = useCallback((dir: 'prev'|'next') => {
    const idx  = cats.indexOf(category)
    const next = dir === 'prev' ? (idx<=0?cats.length-1:idx-1) : (idx>=cats.length-1?0:idx+1)
    sound.playCategorySwitch(); setCategory(cats[next])
  }, [cats, category])

  const { gamepadConnected, gamepadName } = useGamepad({
    onLeft:           () => navigateCarousel('left'),
    onRight:          () => navigateCarousel('right'),
    onSelect:         () => { if (selectedGame) { sound.playGameStart(); handlePlay(selectedGame) } },
    onBack:           () => { if (isAnyModalOpen) closeModals() },
    onActionTriangle: () => { if (selectedGame) handleToggleFav(selectedGame) },
    onActionSquare:   () => { if (selectedGame) setDetailsGame(selectedGame) },
    onPrevTab:        () => switchCat('prev'),
    onNextTab:        () => switchCat('next'),
  }, isSSG || isAnyModalOpen)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT','SELECT','TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      if (e.key === 'Escape') { if (isAnyModalOpen) closeModals(); return }
      if (isAnyModalOpen) return
      if (e.key === 'ArrowLeft')  { e.preventDefault(); navigateCarousel('left') }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigateCarousel('right') }
      if (e.key === 'Enter'||e.key===' ') { e.preventDefault(); if (selectedGame) { sound.playGameStart(); handlePlay(selectedGame) } }
      if (e.key.toLowerCase()==='f') { if (selectedGame) handleToggleFav(selectedGame) }
      if (e.key.toLowerCase()==='i') { if (selectedGame) setDetailsGame(selectedGame) }
      if (e.key==='/'||(e.key.toLowerCase()==='k'&&(e.metaKey||e.ctrlKey))) { e.preventDefault(); sound.playSearch(); setIsSearchOpen(true) }
      if (e.key.toLowerCase()==='c') { e.preventDefault(); toggleCrt() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isAnyModalOpen, navigateCarousel, selectedGame, handlePlay, handleToggleFav, toggleCrt, closeModals])

  // Group games into sections for the content area
  const psxGames      = allGames.filter(g => g.system === 'psx')
  const nintendoGames = allGames.filter(g => ['gba','snes','nes'].includes(g.system))
  const segaGames     = allGames.filter(g => g.system === 'genesis')
  const savedGames    = allGames.filter(g => favorites.includes(g.id))

  const catLabels: Record<CategoryFilter, string> = {
    all: 'Home', psx: 'PlayStation', nintendo: 'Nintendo', sega: 'Sega', favorites: 'Saved', custom: 'My ROMs',
  }
  const navSections: { id: CategoryFilter; icon: React.ReactNode; label: string }[] = [
    { id: 'all',       icon: <Home  size={15} strokeWidth={2} />, label: 'Home' },
    { id: 'psx',       icon: <Gamepad2 size={15} strokeWidth={2} />, label: 'PlayStation' },
    { id: 'nintendo',  icon: <Star  size={15} strokeWidth={2} />, label: 'Nintendo' },
    { id: 'sega',      icon: <Flame size={15} strokeWidth={2} />, label: 'Sega' },
    { id: 'favorites', icon: <Heart size={15} strokeWidth={2} />, label: 'Saved' },
    { id: 'custom',    icon: <Plus  size={15} strokeWidth={2} />, label: 'My ROMs' },
  ]

  // Featured = first game in filtered list
  const featured     = filteredGames[0] || null
  const restGames    = filteredGames.slice(1, 5)

  return (
    <div className="app-shell">
      {/* CRT overlay */}
      {crtOn && <div className="crt" style={{ position:'fixed', inset:0, zIndex:9999, pointerEvents:'none' }} />}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ padding: '0 20px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #0065c2, #3db3ff)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: '-0.05em' }}>PS</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>RetroStation</span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', margin: '0 10px 16px' }}>
          <Search size={13} strokeWidth={2.3} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          <input
            className="search-input"
            placeholder="Search games..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ userSelect: 'text' }}
          />
        </div>

        {/* Nav */}
        <div style={{ marginBottom: 8 }}>
          {navSections.map(({ id, icon, label }) => (
            <div
              key={id}
              className={`nav-item${category === id ? ' active' : ''}`}
              onClick={() => { sound.playCategorySwitch(); setCategory(id); setSearchQuery('') }}
            >
              <span style={{ opacity: category === id ? 1 : 0.6, flexShrink: 0 }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Library section */}
        <div className="nav-section">Library</div>
        <div
          className="nav-item"
          onClick={() => { sound.playSelect(); setIsUploadOpen(true) }}
        >
          <Plus size={15} strokeWidth={2} style={{ opacity: 0.6, flexShrink: 0 }} />
          Upload ROM
        </div>
        <div
          className="nav-item"
          onClick={() => { sound.playSelect(); setIsMemoryCardOpen(true) }}
        >
          <Star size={15} strokeWidth={2} style={{ opacity: 0.6, flexShrink: 0 }} />
          Memory Card
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Account */}
        <div className="nav-section">Account</div>
        <div
          className="nav-item"
          onClick={() => { sound.playSelect(); setSettingsTab('trophies'); setIsSettingsOpen(true) }}
        >
          <Star size={15} strokeWidth={2} style={{ opacity: 0.6, flexShrink: 0 }} />
          Trophies
        </div>
        <div
          className="nav-item"
          onClick={() => { sound.playSelect(); setSettingsTab('settings'); setIsSettingsOpen(true) }}
          style={{ marginBottom: 0 }}
        >
          <img src={profile.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          {profile.gamerTag}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="main">
        {/* Top bar */}
        <div className="topbar">
          <button
            onClick={toggleCrt}
            title="Toggle CRT shader"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 30, padding: '0 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: crtOn ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.07)',
              color: crtOn ? 'rgba(251,191,36,0.9)' : 'rgba(255,255,255,0.4)',
              fontSize: 11, fontWeight: 500,
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            <Monitor size={12} strokeWidth={2.2} />
            <span>CRT</span>
          </button>

          <button onClick={toggleMute} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.07)', display: 'grid', placeItems: 'center', color: isMuted ? 'rgba(244,63,94,0.8)' : 'rgba(255,255,255,0.4)', transition: 'color 0.15s ease' }}>
            {isMuted ? <VolumeX size={13} strokeWidth={2.2} /> : <Volume2 size={13} strokeWidth={2.2} />}
          </button>

          <button onClick={toggleFs} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.07)', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.4)' }}>
            {isFs ? <Minimize2 size={13} strokeWidth={2.2} /> : <Maximize2 size={13} strokeWidth={2.2} />}
          </button>

          <button onClick={() => { sound.playSelect(); setIsSearchOpen(true) }} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 30, padding: '0 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500 }}>
            <Search size={12} strokeWidth={2.3} />
            <span>Search</span>
          </button>

          <div
            onClick={() => { sound.playSelect(); setSettingsTab('settings'); setIsSettingsOpen(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px 0 2px', cursor: 'pointer', borderRadius: 6 }}
          >
            <img src={profile.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
            <Settings size={13} strokeWidth={2.2} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>

          {gamepadConnected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 8px', height: 28, borderRadius: 6, background: 'rgba(52,211,153,0.12)', color: 'rgba(52,211,153,0.85)', fontSize: 11 }}>
              <Gamepad2 size={12} strokeWidth={2.2} />
              <span className="hidden sm:inline">Connected</span>
            </div>
          )}
        </div>

        {/* Section: featured + sidebar cards */}
        {featured && (
          <>
            <div className="section-header">
              {searchQuery ? (
                <>Results for <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight:400 }}>"{searchQuery}"</span></>
              ) : (
                <>{catLabels[category]} <ChevronRight size={15} strokeWidth={2.5} className="more" /></>
              )}
            </div>

            {/* Hero row: big featured card + up to 4 smaller cards */}
            <div style={{ display: 'flex', gap: 10, padding: '0 24px', alignItems: 'stretch' }}>

              {/* Featured card */}
              <div
                className="hero-card fade-in"
                key={featured.id}
                style={{ flex: '0 0 auto', width: 'clamp(300px, 42%, 520px)', minHeight: 280 }}
                onClick={() => handleSelect(featured)}
              >
                {/* Background image */}
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url('${featured.heroUrl || featured.coverUrl}')`,
                    backgroundSize: 'cover', backgroundPosition: 'center top',
                  }}
                />
                {/* Gradient */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />

                {/* Content */}
                <div style={{ position: 'relative', padding: '20px 20px 18px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  {/* System badge */}
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                    {featured.systemLabel}
                  </span>

                  {/* Title */}
                  <h2 style={{ margin: '0 0 6px', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: '14ch' }}>
                    {featured.title}
                  </h2>

                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(100,220,100,0.9)' }}>
                      {Math.round(featured.rating * 20)}% Match
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{featured.year}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{featured.players}</span>
                  </div>

                  {/* Genre */}
                  <p style={{ margin: '0 0 8px', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    {featured.genre} · {featured.developer}
                  </p>

                  {/* Description */}
                  <p style={{ margin: '0 0 14px', fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, maxWidth: '40ch', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {featured.description}
                  </p>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-white"
                      onClick={e => { e.stopPropagation(); sound.playGameStart(); handlePlay(featured) }}
                    >
                      <Play size={13} style={{ fill: '#0f0f0f', flexShrink: 0 }} strokeWidth={0} />
                      Play
                    </button>
                    <button
                      className="btn btn-dim"
                      onClick={e => { e.stopPropagation(); sound.playSelect(); setDetailsGame(featured) }}
                    >
                      <Info size={13} style={{ flexShrink: 0 }} strokeWidth={2} />
                      More Info
                    </button>
                    {favorites.includes(featured.id) && (
                      <button
                        className="btn btn-dim"
                        onClick={e => { e.stopPropagation(); sound.playSelect(); handleToggleFav(featured) }}
                        style={{ background: 'rgba(244,63,94,0.15)', color: 'rgba(244,63,94,0.9)' }}
                      >
                        <Heart size={13} style={{ fill: 'rgba(244,63,94,0.9)', flexShrink: 0 }} strokeWidth={0} />
                        Saved
                      </button>
                    )}
                    {!favorites.includes(featured.id) && (
                      <button
                        className="btn btn-dim"
                        onClick={e => { e.stopPropagation(); sound.playSelect(); handleToggleFav(featured) }}
                      >
                        <Heart size={13} style={{ flexShrink: 0 }} strokeWidth={2} />
                        Save
                      </button>
                    )}
                    {featured.isCustom && (
                      <button
                        className="btn btn-dim"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                        onClick={e => { e.stopPropagation(); sound.playBack(); if (confirm(`Remove "${featured.title}"?`)) handleDeleteCustom(featured.id) }}
                      >
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Smaller cards alongside */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, minWidth: 0 }}>
                {restGames.map((g) => (
                  <div
                    key={g.id}
                    className="small-card fade-in"
                    style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '16/10', cursor: 'pointer' }}
                    onClick={() => handleSelect(g)}
                    onDoubleClick={() => handlePlay(g)}
                  >
                    <img src={g.heroUrl || g.coverUrl} alt={g.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px 10px' }}>
                      <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'rgba(255,100,100,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                        {g.systemLabel}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                        {g.title}
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                        {g.genre}
                      </p>
                    </div>
                    {/* Play on hover */}
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.35)', opacity: 0, transition: 'opacity 0.18s ease',
                    }}
                      className="play-overlay"
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity='1' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity='0' }}
                      onClick={e => { e.stopPropagation(); sound.playGameStart(); handlePlay(g) }}
                    >
                      <button className="btn btn-white" style={{ height: 32, padding: '0 14px 0 12px', fontSize: 12 }}>
                        <Play size={12} style={{ fill: '#0f0f0f' }} strokeWidth={0} />
                        Play
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Shelves ─────────────────────────────────────── */}
        <GameShelf
          title="PlayStation 1"
          games={psxGames}
          favorites={favorites}
          onPlay={handlePlay}
          onSelect={handleSelect}
          onToggleFav={handleToggleFav}
        />
        <GameShelf
          title="Nintendo"
          games={nintendoGames}
          favorites={favorites}
          onPlay={handlePlay}
          onSelect={handleSelect}
          onToggleFav={handleToggleFav}
        />
        {segaGames.length > 0 && (
          <GameShelf
            title="Sega"
            games={segaGames}
            favorites={favorites}
            onPlay={handlePlay}
            onSelect={handleSelect}
            onToggleFav={handleToggleFav}
          />
        )}
        {savedGames.length > 0 && (
          <GameShelf
            title="Saved"
            games={savedGames}
            favorites={favorites}
            onPlay={handlePlay}
            onSelect={handleSelect}
            onToggleFav={handleToggleFav}
          />
        )}
        {customGames.length > 0 && (
          <GameShelf
            title="My ROMs"
            games={customGames}
            favorites={favorites}
            onPlay={handlePlay}
            onSelect={handleSelect}
            onToggleFav={handleToggleFav}
          />
        )}
      </main>

      {/* Trophy toast */}
      <TrophyToast trophyId={activeTrophyId} onDismiss={() => setTrophyId(null)} />

      {/* Modals */}
      <Suspense fallback={null}>
        {playingGame    && <EmulatorModal game={playingGame} onClose={() => setPlayingGame(null)} onTrophyUnlock={onTrophyUnlock} />}
        {isUploadOpen   && <CustomRomModal isOpen onClose={() => setIsUploadOpen(false)} onGameAdded={handleCustomAdded} onTrophyUnlock={onTrophyUnlock} />}
        {isSettingsOpen && <SettingsModal isOpen onClose={() => setIsSettingsOpen(false)} userProfile={profile} onSaveProfile={saveProfile} isMuted={isMuted} onToggleMute={toggleMute} unlockedTrophies={unlockedTrophies} initialTab={settingsTab} />}
        {detailsGame    && <GameDetailsModal game={detailsGame} onClose={() => setDetailsGame(null)} onPlay={handlePlay} />}
        {isSearchOpen   && <QuickSearchModal isOpen onClose={() => setIsSearchOpen(false)} games={allGames} onSelectGame={handleSelect} onPlayGame={handlePlay} />}
        {isControllerOpen && <ControllerVisualizerModal isOpen onClose={() => setIsControllerOpen(false)} gamepadConnected={gamepadConnected} gamepadName={gamepadName} />}
        {isMemoryCardOpen && <MemoryCardModal isOpen onClose={() => setIsMemoryCardOpen(false)} />}
      </Suspense>
    </div>
  )
}

// ── GameShelf ──────────────────────────────────────────────────────────────────

interface ShelfProps {
  title: string
  games: Game[]
  favorites: string[]
  onPlay: (g: Game) => void
  onSelect: (g: Game) => void
  onToggleFav: (g: Game) => void
}

function GameShelf({ title, games, favorites, onPlay, onSelect, onToggleFav }: ShelfProps) {
  const [_hovered, setHovered] = useState<string | null>(null)

  if (!games.length) return null

  return (
    <div style={{ marginTop: 28 }}>
      <div className="section-header">
        {title}
        <ChevronRight size={15} strokeWidth={2.5} className="more" />
      </div>
      <div className="shelf">
        {games.map((g, i) => {
          const isFav = favorites.includes(g.id)

          return (
            <div
              key={g.id}
              className="shelf-card fade-up"
              style={{
                width: 'clamp(120px, 11vw, 155px)',
                aspectRatio: '2/3',
                animationDelay: `${Math.min(i * 40, 320)}ms`,
              }}
              onMouseEnter={() => setHovered(g.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(g)}
            >
              <img
                src={g.coverUrl}
                alt={g.title}
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />

              {/* Saved dot */}
              {isFav && (
                <div style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: 'rgba(244,63,94,0.9)', boxShadow: '0 0 0 1.5px rgba(15,15,15,0.9)' }} />
              )}

              {/* Hover info overlay */}
              <div className="shelf-card-info">
                <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                  {g.title}
                </p>
                <p style={{ margin: '0 0 8px', fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                  {g.genre}
                </p>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button
                    className="btn btn-white"
                    style={{ height: 26, padding: '0 10px 0 8px', fontSize: 11, gap: 5 }}
                    onClick={e => { e.stopPropagation(); sound.playGameStart(); onPlay(g) }}
                  >
                    <Play size={10} style={{ fill: '#0f0f0f' }} strokeWidth={0} />
                    Play
                  </button>
                  <button
                    style={{ width: 26, height: 26, borderRadius: 5, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', color: isFav ? 'rgba(244,63,94,0.9)' : 'rgba(255,255,255,0.6)', transition: 'background 0.15s ease' }}
                    onClick={e => { e.stopPropagation(); sound.playSelect(); onToggleFav(g) }}
                  >
                    <Heart size={11} style={{ fill: isFav ? 'rgba(244,63,94,0.9)' : 'none' }} strokeWidth={isFav ? 0 : 1.8} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
