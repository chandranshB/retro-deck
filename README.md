# 🎮 RetroDeck — Universal Retro Gaming Console OS

A client-side retro gaming web console and living-room gaming OS inspired by **PlayStation 5 Dashboard** and **Apple TV 4K (tvOS)**. Runs entirely inside your browser via **WebAssembly (WASM)** with **zero cloud streaming lag**, full **gamepad & DualSense support**, and multi-system retro emulation (**PS1, GBA, SNES, NES, Sega Genesis**).

![RetroDeck Preview](https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80)

---

## ✨ Features

### 1. Next-Gen Console Dashboard & Apple TV Interface
* **PS5 Game Ribbon**: Horizontal quick-access shelf of active game icons with active focus glow and smooth snap scrolling.
* **Apple TV 3D Parallax Tilt**: Specular glints and dynamic 3D tilt tracking cursor and gamepad thumbstick movements.
* **Full-Bleed Cinematic Stage**: Crossfading 4K wallpapers with game-specific ambient lighting.
* **Dual View Engine**: Seamlessly switch between **Showcase Mode** (TV console experience) and **Grid Mode** (Apple TV curated library).
* **Trinitron CRT Retro Shader**: Hardware-accelerated scanline and phosphor glow shader toggleable in real time (`Press C`).
* **PS5 Activity Cards**: Instant launch, live trophy progress, virtual memory card slots, display shaders, and controller diagnostics.
* **Universal Spotlight Search**: Press `/` or `Cmd/Ctrl + K` for instant fuzzy search across titles, systems, genres, and developers.

### 2. Full Gamepad, DualSense & Keyboard Support
* **Gamepad API Integration**: Plug in your **DualSense, DualShock 4, Xbox Controller**, or standard USB/Bluetooth gamepad:
  * **D-Pad / Left Stick**: Navigate game cards & tabs
  * **Cross [✕] / A**: Select & Launch Game
  * **Circle [◯] / B**: Back & Close Modal
  * **Triangle [△] / Y**: Toggle Favorite
  * **Square [▢] / X**: View Info & Controls
  * **L1 / R1**: Switch category tabs
* **Interactive DualSense Visualizer**: Live hardware button polling and latency tester.
* **Keyboard Shortcuts**: Complete desktop navigation (`Enter`, `Esc`, `F`, `I`, `Arrows`, `V`, `C`, `/`, `1-6`).

### 3. Procedural Audio Engine
* **Acoustic Haptics**: Procedurally synthesized console clicks, selection chords, fluid category whooshes, and cinematic launch rumbles via the Web Audio API — **zero external audio file dependencies**.

### 4. Virtual Memory Card & Offline Save States
* **15-Block PS1 Save System**: Track and manage browser-local save data with one-click `.sav` file backup/export.
* **IndexedDB Custom ROM Importer**: Drag & drop any `.gba`, `.nes`, `.smc`, `.sfc`, `.md`, `.bin`, `.iso`, or `.zip` file for permanent offline browser storage.

---

## 🛠️ Tech Stack

* **Frontend**: React 19 + TypeScript + Vite 8
* **Styling**: Tailwind CSS v4 + Lucide Icons
* **Audio**: Native Web Audio API procedural synthesis
* **Storage**: IndexedDB (via localforage-style native wrapper)
* **Emulation Core**: WebAssembly + EmulatorJS + HTML5 Canvas
* **Optimization**: Static Site Generation (SSG) pre-rendering pipeline

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/chandranshB/retro-deck.git
cd retro-deck

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production with SSG pre-rendering
npm run build
```

---

## 📄 License

MIT License. Crafted for retro gaming enthusiasts.
