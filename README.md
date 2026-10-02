# 🎲 DnD-Soundscape – Adventure Audio Management System

[![Release](https://img.shields.io/badge/release-v1.0.0-gold.svg)](https://github.com/Krarilotus/DnD-Soundscape/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](https://github.com/Krarilotus/DnD-Soundscape)
[![Author](https://img.shields.io/badge/author-Krarilotus-orange.svg)](https://github.com/Krarilotus)

**DnD-Soundscape** is a professional, offline-ready tabletop audio management system, multi-layer soundboard, and stage orchestrator designed specifically for **Dungeon Masters (DMs)** and **TTRPG session runners**.

Transform your tabletop adventures with seamless equal-power crossfading, concurrent 3-layer audio control (Music, Ambience, and One-Shot Effects), interactive 16:9 panoramic map markers, live DM narration ducking, and an integrated visual Adventure Studio.

---

## ✨ Features at a Glance

- 📱 **Mobile & PWA App (iOS & Android)**:
  - Installable as a native standalone app on iPhone, iPad, and Android with full touch gestures, responsive UI, offline asset caching, and no app store required.
  - **Live LAN / QR Code Remote Pairing**: Host on your PC and scan the live QR code to control the entire soundscape seamlessly from your phone behind the DM screen.
- 🎧 **Direct Streaming Connectors (YouTube & Spotify)**:
  - Link YouTube videos/playlists and Spotify tracks/playlists directly without needing to own, convert, or download local audio files.
  - Automatic URL parser with seamless crossfading, synchronized volume control, and stage switching.
- 🏔️ **Multi-Adventure Hub & Project Structure**: Manage multiple campaigns and one-shots within dedicated, self-contained project folders (`adventures/<adventure_id>/`).
- 🎚️ **3-Layer Live Audio Mixer**: Independent, concurrent audio channels for each stage:
  1. **🎵 Music Layer**: Soundtracks, combat tracks, playlists with gapless looping and seam smoothing.
  2. **🌲 Ambience Layer**: Continuous environmental soundscapes (hearthfires, wind, cave drips, dungeon drones).
  3. **⚡ Effects Layer (SFX Pad)**: Instant one-shot trigger pads for spells, sword clashes, thunderclaps, and monster roars.
- 🗺️ **Visual Stage Arranger on Preview Image / Map**:
  - Load any regional map or panoramic illustration.
  - Interactive drag-and-drop location markers with percentage coordinates (`x%`, `y%`) that scale pixel-perfect on any screen resolution or aspect ratio.
  - Distinct stage types: 🍺 Roleplay / Tavern, 🕯️ Exploration, ⚔️ Combat, 💀 Boss / Climax, ✨ Atmosphere.
- 🔀 **Equal-Power Cosine/Sine Crossfading**:
  - Smooth, dip-free transitions between scenes.
  - Adjustable fade profiles: *Instant (0s)*, *Fast (1.5s)*, *Default (4.0s)*, *Slow (8.0s)*, or *Custom seconds*.
- 🎙️ **DM Voice Ducking ("Vorlesen")**:
  - One-touch <kbd>Space</kbd> toggle smoothly dips background music to 35% during DM narration, then gracefully restores volume.
- 🔊 **Universal Audio Codec Support**:
  - Native support for `.mp3`, `.ogg`, `.opus`, `.wav`, `.m4a`, `.webm`, `.flac`, and `.aac`.
  - Built-in **Web Audio Procedural Synthesizer** for zero-dependency soundscape fallbacks.
- 🛠️ **Visual Map-Centric Studio & Stage Popup Inspector**:
  - Direct on-map editing: drag location pins to reposition them anywhere on the preview artwork in real time.
  - One-click Stage Inspector popup: configure stage name, scene type, and choose from a rich **RPG Emoji Catalog** (🍺 ⚔️ 🕯️ 💀 🌲 🏰 🌊 ⚡ 🐉 ⛺ 🏔️ 🚪 💰 ⛪ 🔮).
  - Built-in volume faders for all 3 layers (Music, Ambience, Effects) directly in the stage inspector.
  - **Start & End Second Cue Points (`startSec` & `endSec`)**: loop or play exact segments of any song, with one-click "Whole Song" reset.
  - **Drag & Drop Audio Support**: drop audio files directly onto the map to spawn new stages at those coordinates, or drop onto existing pins to add tracks.
  - Quick **➕ Add Stage** button to expand your campaign with unlimited locations.
- 📦 **Pre-packaged Showcase Campaign: Lost Mine of Phandelver**:
  - The quintessential D&D 5e adventure with 6 fully configured, multi-layer stages:
    1. **The Stonehill Inn (Phandalin)**: Cozy tavern strings & crackling hearthfire ambience with Faerûn bard YouTube and Spotify streams.
    2. **Goblin Ambush (Triboar Trail)**: War drums, wilderness wind, sword clashing & goblin shrieks.
    3. **Cragmaw Hideout**: Subterranean drones, dripping cave stream, and stealth blades.
    4. **Tresendar Manor**: Redbrand cellars, sinister drones, and evil spell surges.
    5. **Ruins of Thundertree**: Desolate ashen wind, dragon roars, and lightning storm.
    6. **Wave Echo Cave**: Climax Forge of Spells, subterranean surges, and arcane spell sword clashing.

---

## 🚀 Quickstart

### 1. Launch on PC / Host Machine

- **Windows**: Double-click [`start.bat`](start.bat)
- **macOS / Linux**: Run `./start.sh`
- **Python (Any OS)**:
  ```bash
  python tools/serve.py 8777
  ```
- **Node.js / NPX**:
  ```bash
  npm start
  ```

Open your browser at **`http://localhost:8777`**, click **"Click to Start Audio"**, and you are ready for your session!

---

## 📱 Mobile Setup & Remote DM Control (iPhone & Android)

DnD-Soundscape is a full **Progressive Web App (PWA)** that can be used directly in mobile browsers or installed as a standalone app on your phone.

### Option A: Remote DM Controller (Phone connects to PC Audio)
When playing at a table or hosting on Discord/speakers:
1. Start the server on your PC (`start.bat`).
2. In the top navigation bar, click the **📱 Mobile Connect** button.
3. A modal appears showing your local Wi-Fi URL (e.g. `http://192.168.1.45:8777`) and an **interactive QR Code**.
4. Scan the QR code with your iPhone or Android camera to open the Soundscape interface on your phone.
5. Tap stages and soundboard triggers on your phone to control the audio playback playing through your computer's high-quality sound system!

### Option B: Standalone Mobile App (Install to Home Screen)
You can also run everything natively on mobile:
- **iPhone / iPad (iOS Safari)**:
  1. Open the Soundscape URL in **Safari**.
  2. Tap the **Share** button (box with upward arrow) at the bottom.
  3. Scroll down and tap **"Add to Home Screen"** (➕).
  4. An app icon appears on your home screen. Tapping it opens DnD-Soundscape in full-screen standalone mode without browser bars.
- **Android (Chrome)**:
  1. Open the Soundscape URL in **Chrome**.
  2. Tap the **⋮** menu (or the install banner that appears).
  3. Tap **"Add to Home screen"** or **"Install app"**.
  4. Launches as a standalone native app.

---

## 🎧 Direct Streaming Connectors (YouTube & Spotify)

Instead of downloading, converting, and organizing local `.mp3` or `.wav` files, you can link music and ambience directly from **YouTube** or **Spotify**.

### How It Works
The audio engine automatically detects streaming URLs and bridges them into the stage audio graph:
- **YouTube**: Powered by the headless YouTube IFrame API. Supports individual videos, ambient 1-hour loops, and public playlists. Volume and crossfades synchronize automatically.
- **Spotify**: Powered by the Spotify Embed Controller API. Supports tracks and playlists for users with Spotify accounts.

### Supported URL Examples in Adventure Studio or `adventure.json`:
```json
{
  "music": {
    "name": "Epic Tavern Ambience (YouTube)",
    "volume": 0.70,
    "tracks": [
      {
        "title": "Tavern Lute Session",
        "file": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        "title": "Medieval Bard Playlist",
        "file": "https://www.youtube.com/playlist?list=PLrAl6PkyG9g..."
      }
    ]
  },
  "ambience": {
    "name": "Rain & Thunder (Spotify)",
    "volume": 0.50,
    "tracks": [
      {
        "title": "Rain Ambience",
        "file": "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
      }
    ]
  }
}
```
*You can also mix and match:* Use a YouTube video for your background music, a local `.wav` for rain ambience, and built-in procedural soundboard pads for lightning and sword clashes!

---

## ⌨️ Tabletop Keyboard Controls

| Key | Action | Description |
|:---:|:---|:---|
| <kbd>1</kbd>–<kbd>9</kbd> | **Switch Stage** | Crossfades smoothly to stage 1 through 9. |
| <kbd>Space</kbd> | **Vorlesen (Ducking)** | Smoothly dips music volume for DM reading; tap again to restore. |
| <kbd>M</kbd> | **3-Layer Live Mixer** | Opens the channel faders for Music, Ambience, and Effects. |
| <kbd>B</kbd> | **SFX Soundboard** | Opens the one-shot sound effects trigger pad. |
| <kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd> | **Instant SFX Trigger** | Fires active stage sound effects immediately. |
| <kbd>Esc</kbd> | **Stille / Silence** | Fades all active audio to silence over 3 seconds (or closes modals). |
| <kbd>+</kbd> / <kbd>-</kbd> | **Master Volume** | Adjusts master volume up or down in 5% increments. |
| <kbd>F</kbd> | **Fullscreen** | Toggles full-screen distraction-free mode. |

---

## 📁 Adventure Folder Structure

Each adventure is self-contained in `adventures/<adventure_id>/`:

```text
DnD-Soundscape/
├── adventures/
│   ├── index.json                    # Registry of installed adventures
│   ├── phandelver/
│   │   ├── adventure.json            # Stages, layers, coordinates & settings
│   │   ├── img/
│   │   │   ├── cover.jpg             # Hub card thumbnail
│   │   │   └── panorama.jpg          # 16:9 stage preview & marker map
│   │   └── audio/
│   │       ├── music/                # Background tracks & combat music
│   │       ├── ambience/             # Continuous environmental loops
│   │       └── effects/              # One-shot sound effects
│   └── hochsattel/
│       ├── adventure.json
│       ├── img/
│       └── audio/
├── audio_presets/                    # Royalty-free fallback WAV sounds
├── tools/
│   ├── serve.py                      # Multi-threaded HTTP Range server & REST API
│   ├── organize_audio.py             # Automatic audio sorter for DMs
│   └── generate_audio_samples.py     # Procedural audio generator
├── start.bat                         # 1-Click Windows launcher
├── start.sh                          # 1-Click Unix launcher
└── index.html                        # Single Page Web App
```

### Organizing Your Audio Files
To quickly copy and sort existing audio files into your adventure:
```bash
python tools/organize_audio.py phandelver "C:/Path/To/Your/Audio/Folder"
```
The script automatically categorizes files into `music/`, `ambience/`, and `effects/`.

---

## 🛠️ Adventure Configuration (`adventure.json`)

You can create and edit adventures directly in the **Adventure Studio (🛠️)** in the UI, or edit `adventure.json` manually:

```json
{
  "id": "my_adventure",
  "title": "Curse of the Shadow Fell",
  "subtitle": "A Gothic Horror Campaign",
  "author": "Krarilotus",
  "version": "1.0.0",
  "previewImage": "img/panorama.jpg",
  "coverImage": "img/cover.jpg",
  "defaultCrossfadeSec": 4.0,
  "duckLevel": 0.35,
  "stages": [
    {
      "id": "tavern",
      "label": "1. The Weary Traveler Inn",
      "type": "roleplay",
      "icon": "🍺",
      "hotkey": "1",
      "crossfadeSec": 4.0,
      "hotspot": { "x": 32.5, "y": 74.0, "r": 6 },
      "description": "Flickering tallow candles and low murmurs among nervous villagers.",
      "layers": {
        "music": {
          "name": "Cozy Tavern Lute",
          "volume": 0.65,
          "playlistMode": "loopAll",
          "tracks": [{ "title": "Lute Ballad", "file": "audio/music/tavern_lute.wav" }]
        },
        "ambience": {
          "name": "Hearthfire & Rain",
          "volume": 0.50,
          "tracks": [{ "title": "Campfire", "file": "audio/ambience/campfire.wav" }]
        },
        "effects": {
          "name": "Tavern FX",
          "volume": 0.85,
          "triggers": [
            { "id": "brawl", "label": "Brawl", "icon": "🥊", "hotkey": "Q", "file": "audio/effects/clash.wav" }
          ]
        }
      }
    }
  ]
}
```

---

## 🌐 GitHub Release & CI Packaging

The repository includes a ready-to-run GitHub Actions workflow in [`.github/workflows/release.yml`](.github/workflows/release.yml) which:
1. Validates all adventure JSON schemas.
2. Synthesizes and tests audio assets.
3. Automatically creates a release `.zip` bundle and publishes GitHub Releases when pushing version tags (`git tag v1.0.0 && git push --tags`).

---

## 📜 License

MIT License © 2026 [Krarilotus](https://github.com/Krarilotus)
