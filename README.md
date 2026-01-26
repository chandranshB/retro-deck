# RetroStation

A browser-based retro gaming interface. Runs entirely client-side via WebAssembly — no server, no streaming, no lag. Supports PS1, GBA, SNES, NES, and Sega Genesis.

---

## Features

- Full-bleed cinematic game browser with keyboard and gamepad navigation
- Multi-system emulation via WebAssembly (EmulatorJS)
- DualSense, DualShock, Xbox, and standard gamepad support via the Gamepad API
- Custom ROM importer — drag in any `.gba`, `.nes`, `.smc`, `.md`, `.bin`, or `.zip`
- Virtual PS1 memory card with save state management
- Procedural audio engine — all UI sounds synthesized via Web Audio API, zero audio files
- CRT scanline shader toggle
- Offline-capable, all storage via IndexedDB

## Controls

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Play | Enter | Cross |
| Back | Escape | Circle |
| Save | F | Triangle |
| Details | I | Square |
| Browse | Arrow keys | D-Pad / Left stick |
| Search | / or Ctrl+K | — |
| Switch view | V | — |
| Switch category | 1–6 | L1 / R1 |

## Stack

- React 19, TypeScript, Vite 8
- Tailwind CSS v4
- Lucide icons
- Web Audio API (procedural sound)
- IndexedDB (custom ROM and save storage)
- EmulatorJS + WebAssembly (emulation core)
- Cloudflare Pages (deployment target)

## Getting started

```bash
git clone https://github.com/chandranshB/retro-deck.git
cd retro-deck
npm install
npm run dev
```

```bash
# Production build with SSG pre-rendering
npm run build
```

## License

MIT
