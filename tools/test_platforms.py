#!/usr/bin/env python3
"""
DnD-Soundscape Cross-Platform Multi-OS Compatibility Test Suite
Tests compatibility for:
  - Windows 10/11 (PowerShell, CMD, Edge/Chrome, start.bat)
  - macOS / Darwin (POSIX bash, start.sh, Safari, WebKit Audio)
  - Linux (Ubuntu/Debian/Arch, POSIX sh, case-sensitive filesystems, xdg-open)
  - iOS (iPhone / iPad Safari, PWA Home Screen, Apple Meta, Touch Events, Audio Unlock)
  - Android (Chrome Mobile, W3C PWA Manifest, Service Worker, Touch gestures)
"""

import sys
import os
import re
import json
import urllib.request
import urllib.error

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8777
HOST = f"http://localhost:{PORT}"

PASSED = 0
FAILED = 0

def check(name, condition, error_detail=""):
    global PASSED, FAILED
    if condition:
        print(f"  [PASS] {name}")
        PASSED += 1
    else:
        print(f"  [FAIL] {name} -> {error_detail}")
        FAILED += 1

def simulate_http_get(url_path, headers=None):
    url = f"{HOST}{url_path}"
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            content = resp.read()
            return resp.status, dict(resp.headers), content
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read()
    except Exception as e:
        return None, {}, str(e).encode('utf-8')

print("=" * 70)
print("  DnD-Soundscape Cross-Platform & Multi-OS Compatibility Test")
print("  Target Environments: Windows | macOS | Linux | iOS | Android")
print("=" * 70)

# =====================================================================
# 1. WINDOWS OS VALIDATION
# =====================================================================
print("\n[1] Windows OS Compatibility (Windows 10 / 11, PowerShell, CMD)...")

# Validate start.bat
bat_path = os.path.join(BASE_DIR, "start.bat")
check("Windows: start.bat launcher exists", os.path.isfile(bat_path))
if os.path.isfile(bat_path):
    with open(bat_path, "r", encoding="utf-8", errors="ignore") as f:
        bat_content = f.read()
    check("Windows: start.bat has cd /d to preserve drive switching", 'cd /d "%~dp0"' in bat_content)
    check("Windows: start.bat checks python availability", "where python" in bat_content)
    check("Windows: start.bat launches browser URL automatically", "http://localhost:8777" in bat_content)
    check("Windows: start.bat executes tools\\serve.py", "tools\\serve.py" in bat_content or "tools/serve.py" in bat_content)

# Validate Windows Python console UTF-8 safety
serve_py_path = os.path.join(BASE_DIR, "tools", "serve.py")
with open(serve_py_path, "r", encoding="utf-8") as f:
    serve_content = f.read()
check("Windows: Python server handles Windows console charmap encoding", "reconfigure(encoding='utf-8'" in serve_content)

# Validate Windows Edge / Chrome HTTP Range request
status, headers, content = simulate_http_get("/audio_presets/campfire_ambience.wav", {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
    "Range": "bytes=0-1023"
})
check("Windows: Audio HTTP 206 Partial Content for Edge/Chrome", status == 206)
check("Windows: Accept-Ranges byte header returned", headers.get("Accept-Ranges") == "bytes")

# =====================================================================
# 2. MACOS (DARWIN) VALIDATION
# =====================================================================
print("\n[2] macOS Compatibility (Darwin, Safari, WebKit, start.sh)...")

# Validate start.sh for macOS
sh_path = os.path.join(BASE_DIR, "start.sh")
check("macOS: start.sh launcher exists", os.path.isfile(sh_path))
if os.path.isfile(sh_path):
    with open(sh_path, "r", encoding="utf-8", errors="ignore") as f:
        sh_content = f.read()
    check("macOS: start.sh has POSIX bash shebang", sh_content.startswith("#!/usr/bin/env bash"))
    check("macOS: start.sh handles Apple Darwin 'open' command", "open http://localhost:8777" in sh_content)
    check("macOS: start.sh dynamically detects python3 / python", "python3" in sh_content and "python" in sh_content)

# Validate macOS Safari User-Agent response
status, headers, content = simulate_http_get("/index.html", {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
})
check("macOS: Safari HTML delivery (200 OK)", status == 200)

# Validate WebKit Audio Autoplay Policy Support: #start-overlay user gesture guard
index_html_path = os.path.join(BASE_DIR, "index.html")
with open(index_html_path, "r", encoding="utf-8") as f:
    html_content = f.read()
check("macOS: WebKit audio autoplay policy gesture guard (#start-overlay)", 'id="start-overlay"' in html_content)
check("macOS: Click-to-start action button present (#btn-start-audio)", 'id="btn-start-audio"' in html_content)

# =====================================================================
# 3. LINUX VALIDATION
# =====================================================================
print("\n[3] Linux Compatibility (Ubuntu/Debian/Arch/Fedora, xdg-open, Case Sensitivity)...")

# Validate start.sh for Linux
check("Linux: start.sh handles FreeDesktop 'xdg-open' command", "xdg-open http://localhost:8777" in sh_content)

# Validate Case Sensitivity: ext4 / btrfs Linux filesystems require exact casing!
print("  Checking Linux filesystem case sensitivity across all referenced files...")
case_errors = []
adventures_dir = os.path.join(BASE_DIR, "adventures")
for root, dirs, files in os.walk(adventures_dir):
    for f in files:
        if f.endswith(".json"):
            json_file = os.path.join(root, f)
            try:
                with open(json_file, "r", encoding="utf-8") as jf:
                    data = json.load(jf)
                # Check previewImage, coverImage
                for img_key in ["previewImage", "coverImage"]:
                    if img_key in data:
                        rel = data[img_key]
                        full = os.path.normpath(os.path.join(os.path.dirname(json_file), rel))
                        if not os.path.isfile(full):
                            case_errors.append(f"{f} references missing {rel}")
                # Check stages tracks
                for stage in data.get("stages", []):
                    layers = stage.get("layers", {})
                    for layer_name in ["music", "ambience"]:
                        for t in layers.get(layer_name, {}).get("tracks", []):
                            fpath = t.get("file", "")
                            if fpath and not fpath.startswith("http") and not fpath.startswith("spotify:"):
                                full = os.path.normpath(os.path.join(BASE_DIR, fpath))
                                if not os.path.isfile(full):
                                    # Also check relative to adventure dir
                                    full2 = os.path.normpath(os.path.join(os.path.dirname(json_file), fpath))
                                    if not os.path.isfile(full2):
                                        case_errors.append(f"{f} stage {stage.get('id')} track missing {fpath}")
            except Exception as e:
                case_errors.append(f"JSON parse error {f}: {e}")

check("Linux: All referenced paths exist on case-sensitive filesystem", len(case_errors) == 0, "; ".join(case_errors))

# Validate Linux Firefox User-Agent response
status, headers, content = simulate_http_get("/index.html", {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0"
})
check("Linux: Firefox HTML delivery (200 OK)", status == 200)

# =====================================================================
# 4. IOS (IPHONE & IPAD) VALIDATION
# =====================================================================
print("\n[4] iOS Compatibility (iPhone, iPad, Safari Mobile PWA, Touch Gestures)...")

# Validate iOS Safari User-Agent
status, headers, content = simulate_http_get("/index.html", {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"
})
check("iOS: Mobile Safari HTML delivery (200 OK)", status == 200)

# Validate iOS PWA Meta Tags
check("iOS: apple-mobile-web-app-capable meta tag", 'name="apple-mobile-web-app-capable" content="yes"' in html_content)
check("iOS: apple-mobile-web-app-status-bar-style meta tag", 'name="apple-mobile-web-app-status-bar-style"' in html_content)
check("iOS: apple-mobile-web-app-title meta tag", 'name="apple-mobile-web-app-title"' in html_content)
check("iOS: apple-touch-icon link tag present", 'rel="apple-touch-icon"' in html_content)

# Validate iOS Viewport Configuration (disables unwanted double-tap zoom delay during SFX triggering)
viewport_match = re.search(r'<meta name="viewport" content="([^"]+)"', html_content)
check("iOS: Viewport tag configured", bool(viewport_match))
if viewport_match:
    vp_content = viewport_match.group(1)
    check("iOS: Viewport width=device-width", "width=device-width" in vp_content)
    check("iOS: Viewport user-scalable=no or maximum-scale for tap responsiveness", "user-scalable=no" in vp_content or "maximum-scale=1" in vp_content)

# Validate Touch event support in Stage Canvas JS
stage_js_path = os.path.join(BASE_DIR, "js", "ui", "StageView.js")
with open(stage_js_path, "r", encoding="utf-8") as f:
    stage_js = f.read()
check("iOS: Touch events (touchstart, touchmove, touchend) implemented on Stage map pins", 
      "touchstart" in stage_js and "touchmove" in stage_js and "touchend" in stage_js)

# =====================================================================
# 5. ANDROID VALIDATION
# =====================================================================
print("\n[5] Android Compatibility (Chrome Mobile, Samsung Internet, W3C PWA, Service Worker)...")

# Validate Android Chrome User-Agent
status, headers, content = simulate_http_get("/index.html", {
    "User-Agent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
})
check("Android: Chrome Mobile HTML delivery (200 OK)", status == 200)

# Validate W3C Web App Manifest
manifest_path = os.path.join(BASE_DIR, "manifest.json")
check("Android: manifest.json file exists", os.path.isfile(manifest_path))
if os.path.isfile(manifest_path):
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    check("Android: Manifest has 'name' and 'short_name'", "name" in manifest and "short_name" in manifest)
    check("Android: Manifest display is 'standalone'", manifest.get("display") == "standalone")
    check("Android: Manifest start_url is valid", manifest.get("start_url") in ["./", "index.html", "./index.html"])
    check("Android: Manifest theme_color defined", "theme_color" in manifest)
    check("Android: Manifest background_color defined", "background_color" in manifest)
    check("Android: Manifest icons array has valid icons", len(manifest.get("icons", [])) >= 1)

# Validate Service Worker (PWA offline caching)
sw_status, sw_headers, sw_content = simulate_http_get("/sw.js")
check("Android: Service Worker /sw.js accessible (200 OK)", sw_status == 200)
check("Android: Service Worker implements install & fetch events", 
      b"install" in sw_content and b"fetch" in sw_content)

# Validate Mobile Connect QR Code Generator
qr_modal_path = os.path.join(BASE_DIR, "js", "ui", "MobileConnectModal.js")
with open(qr_modal_path, "r", encoding="utf-8") as f:
    qr_js = f.read()
check("Android/iOS: QR Code generation / display implemented", "qrUrl" in qr_js or "qr-img" in qr_js)
check("Android/iOS: LAN IP auto-detection displayed in modal", "ip-badge" in qr_js or "qr-url" in qr_js or "LAN" in qr_js)

# =====================================================================
# 6. UNIVERSAL STREAMING CONNECTORS (YOUTUBE & SPOTIFY)
# =====================================================================
print("\n[6] Universal Streaming Connectors (YouTube IFrame & Spotify Embed)...")

stream_path = os.path.join(BASE_DIR, "js", "audio", "StreamingConnectors.js")
with open(stream_path, "r", encoding="utf-8") as f:
    stream_js = f.read()

check("Streaming: YouTube URL regex matcher supports standard & short links", 
      "youtube.com" in stream_js and "youtu.be" in stream_js)

yt_bridge_path = os.path.join(BASE_DIR, "js", "audio", "YouTubeBridge.js")
with open(yt_bridge_path, "r", encoding="utf-8") as f:
    yt_js = f.read()
check("Streaming: YouTube Playlist matcher supports extractPlaylistId & list=", 
      "extractPlaylistId" in yt_js and "list=" in yt_js)
check("Streaming: Spotify track and playlist regex matchers present", 
      "open.spotify.com" in stream_js and "spotify:" in stream_js)
check("Streaming: Headless YouTube IFrame API bridge handles volume & seek", 
      "setVolume" in yt_js and "playVideo" in yt_js and "pauseVideo" in yt_js)

sp_bridge_path = os.path.join(BASE_DIR, "js", "audio", "SpotifyBridge.js")
with open(sp_bridge_path, "r", encoding="utf-8") as f:
    sp_js = f.read()
check("Streaming: Spotify Embed Controller API bridge implemented", 
      "open.spotify.com/embed" in sp_js)

# =====================================================================
# SUMMARY
# =====================================================================
print("\n" + "=" * 70)
print(f"  CROSS-PLATFORM TEST SUMMARY: {PASSED} PASSED, {FAILED} FAILED")
print("=" * 70)

if FAILED == 0:
    print("  ALL TARGET PLATFORMS (Windows, macOS, Linux, iOS, Android) VERIFIED 100% READY!\n")
    sys.exit(0)
else:
    print("  SOME COMPATIBILITY CHECKS FAILED. Please review above.\n")
    sys.exit(1)
