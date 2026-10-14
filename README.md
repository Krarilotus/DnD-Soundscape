# 🎲 DnD-Soundscape

[![Release](https://img.shields.io/badge/release-v1.0.0-gold.svg)](https://github.com/Krarilotus/DnD-Soundscape/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](https://github.com/Krarilotus/DnD-Soundscape)

**DnD-Soundscape** is an offline-ready tabletop audio manager and soundboard built for Dungeon Masters and TTRPG session runners. Orchestrate background music, atmospheric ambience, and one-shot sound effects with interactive map markers, seamless crossfading, and mobile remote control.

---

## 🚀 Quickstart

1. **Launch the server:**
   - **Windows:** Double-click [`start.bat`](start.bat)
   - **macOS / Linux:** Run `./start.sh`
   - **Python:** `python tools/serve.py 8777`
   - **Node.js:** `npm start`
2. **Open in your browser:** Navigate to **`http://localhost:8777`** and click **"Click to Start Audio"**.

---

## ✨ Key Features

- **🎚️ 3-Layer Audio Mixer:** Concurrent channels for **Music**, **Ambience**, and **SFX** with smooth equal-power crossfading.
- **⚡ Collapsible Scene Effect Board:** Dockable soundboard with customizable buttons (short names, symbols, hotkeys) and 30+ bundled offline fantasy sound effects.
- **🗺️ Interactive Map Markers:** Place location pins directly on your campaign artwork or battle maps to trigger scenes.
- **📱 Phone Remote (LAN & QR Code):** Scan the on-screen QR code to control playback from your phone behind the DM screen.
- **🎧 YouTube & Spotify Streaming:** Link directly to YouTube videos/playlists or Spotify tracks without downloading files.
- **🎙️ DM Narration Ducking:** Tap <kbd>Space</kbd> to dip music to 35% during narration and speech.
- **🛠️ Visual Adventure Studio:** Drag-and-drop audio files, set cue points (`startSec`/`endSec`), and edit stages live in the browser.
- **📦 Pre-packaged Campaign:** Includes *Lost Mine of Phandelver* with 6 configured scenes and soundscapes ready to play.

---

## ⌨️ Tabletop Controls

| Key | Action | Description |
|:---:|:---|:---|
| <kbd>1</kbd>–<kbd>9</kbd> | **Switch Stage** | Crossfades smoothly to stage 1 through 9 |
| <kbd>Space</kbd> | **Narration Ducking** | Dips music for DM reading; tap again to restore |
| <kbd>M</kbd> | **Live Mixer** | Opens volume faders for Music, Ambience, and SFX |
| <kbd>B</kbd> | **SFX Soundboard** | Toggles one-shot trigger pads |
| <kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd> | **Quick SFX** | Fires active stage sound effects |
| <kbd>Esc</kbd> | **Silence / Close** | Fades audio out over 3 seconds or closes open modals |
| <kbd>+</kbd> / <kbd>-</kbd> | **Master Volume** | Adjusts master volume (±5%) |
| <kbd>F</kbd> | **Fullscreen** | Toggles distraction-free mode |

---

## 📱 Mobile Remote & PWA

- **Remote DM Controller (LAN):** Click **📱 Mobile Connect** in the top bar to display a local Wi-Fi QR code. Scan it with your phone camera to trigger stages and SFX while audio plays through your PC speakers.
- **Standalone PWA:** Open the URL on mobile Safari or Chrome and select **"Add to Home Screen"** for full-screen offline use.

---

## 🎧 Streaming & Audio Formats

- **Local Files:** Native support for `.mp3`, `.ogg`, `.opus`, `.wav`, `.m4a`, `.webm`, `.flac`, and `.aac`.
- **YouTube & Spotify:** Paste video, track, or playlist URLs directly into any stage's track list in the Adventure Studio or `adventure.json`.
- **Mix & Match:** Combine a YouTube soundtrack, local atmospheric rain `.wav`, and soundboard effects simultaneously.

---

## 📁 Adventures & Custom Campaigns

Adventures live in self-contained folders inside `adventures/<adventure_id>/`:

```text
adventures/
└── my_campaign/
    ├── adventure.json      # Stages, layers, coordinates & audio mappings
    ├── img/                # Cover thumbnail & 16:9 panoramic map
    └── audio/              # music/, ambience/, and effects/ subdirectories
```

### Creating & Managing Adventures
- **Visual Editor:** Use the in-app **Adventure Studio (🛠️)** to create stages, drag location pins on the map, and adjust volume levels.
- **Audio Importer:** Automatically sort audio files into your campaign folder:
  ```bash
  python tools/organize_audio.py <adventure_id> "C:/Path/To/Audio/Folder"
  ```

<details>
<summary><b>View sample <code>adventure.json</code> configuration</b></summary>

```json
{
  "id": "my_adventure",
  "title": "Curse of the Shadow Fell",
  "previewImage": "img/panorama.jpg",
  "coverImage": "img/cover.jpg",
  "defaultCrossfadeSec": 4.0,
  "stages": [
    {
      "id": "tavern",
      "label": "1. The Weary Traveler",
      "type": "roleplay",
      "icon": "🍺",
      "hotkey": "1",
      "hotspot": { "x": 32.5, "y": 74.0, "r": 6 },
      "layers": {
        "music": {
          "volume": 0.65,
          "tracks": [{ "title": "Tavern Lute", "file": "audio/music/tavern.wav" }]
        },
        "ambience": {
          "volume": 0.50,
          "tracks": [{ "title": "Campfire", "file": "audio/ambience/fire.wav" }]
        },
        "effects": {
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
</details>

---

## 🎙️ Discord Streaming via Kenku FM

**[Kenku FM](https://www.kenku.fm/)** is the standard tool for piping high-quality desktop audio into Discord voice channels during online tabletop sessions. You can stream DnD-Soundscape directly through Kenku FM with zero additional audio cables:

1. **Launch DnD-Soundscape:** Start the server on your PC (`start.bat` or `python tools/serve.py 8777`).
2. **Open Kenku FM:** Connect your Kenku FM bot to your Discord voice channel.
3. **Open the Web Browser in Kenku FM:** Open a new tab in Kenku FM's internal browser and navigate to:
   ```text
   http://localhost:8777
   ```
4. **Start Audio:** Click **"Click to Start Audio"** inside Kenku FM. All background music, atmospheric loops, and soundboard effects are now routed in full stereo directly to your players in Discord!

---

## 📜 License

MIT License © 2026 [Krarilotus](https://github.com/Krarilotus)


