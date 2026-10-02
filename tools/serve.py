#!/usr/bin/env python3
"""
DnD-Soundscape - Standalone HTTP Server & Adventure Backend
Features:
- Threaded multi-client serving
- Full HTTP Range (206 Partial Content) streaming for HTML5 audio
- REST API for adventure management, direct saving, folder creation, audio organization, and asset uploads
"""

import base64
import json
import mimetypes
import os
import re
import shutil
import sys
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from socketserver import ThreadingMixIn

MIME_MAP = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".ogg": "audio/ogg",
    ".opus": "audio/opus",
    ".webm": "audio/webm",
    ".wav": "audio/wav",
    ".flac": "audio/flac",
    ".aac": "audio/aac",
}

AUDIO_EXTS = {".mp3", ".m4a", ".ogg", ".opus", ".webm", ".wav", ".flac", ".aac"}

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class SoundscapeRequestHandler(BaseHTTPRequestHandler):
    server_version = "DnD-Soundscape-Server/1.0"

    @property
    def app_dir(self) -> Path:
        script_dir = Path(__file__).resolve().parent
        return script_dir.parent if script_dir.name == "tools" else script_dir

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Range")
        self.end_headers()

    def do_HEAD(self):
        self.handle_static_get(send_body=False)

    def do_GET(self):
        if self.path.startswith("/api/"):
            self.handle_api_get()
        else:
            self.handle_static_get(send_body=True)

    def do_POST(self):
        if self.path.startswith("/api/"):
            self.handle_api_post()
        else:
            self.send_error(404, "Endpoint Not Found")

    # =========================================================================
    # REST API Handlers
    # =========================================================================

    def send_json(self, data: dict, status_code: int = 200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def handle_api_get(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query_params = urllib.parse.parse_qs(parsed.query)

        if path == "/api/adventures":
            adventures_dir = self.app_dir / "adventures"
            index_file = adventures_dir / "index.json"
            
            adventures_list = []
            if index_file.exists():
                try:
                    with open(index_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        adventures_list = data.get("adventures", [])
                except Exception as e:
                    print(f"Error reading index.json: {e}")
            
            if adventures_dir.exists():
                for sub in sorted(adventures_dir.iterdir()):
                    if sub.is_dir() and (sub / "adventure.json").exists():
                        adv_id = sub.name
                        if not any(a.get("id") == adv_id for a in adventures_list):
                            try:
                                with open(sub / "adventure.json", "r", encoding="utf-8") as af:
                                    adv_data = json.load(af)
                                    adventures_list.append({
                                        "id": adv_id,
                                        "title": adv_data.get("title", adv_id),
                                        "subtitle": adv_data.get("subtitle", ""),
                                        "author": adv_data.get("author", "DM"),
                                        "description": adv_data.get("description", ""),
                                        "stageCount": len(adv_data.get("stages", [])),
                                        "previewImage": f"adventures/{adv_id}/{adv_data.get('previewImage', 'img/panorama.jpg')}",
                                        "coverImage": f"adventures/{adv_id}/{adv_data.get('coverImage', 'img/cover.jpg')}",
                                        "path": f"adventures/{adv_id}/adventure.json",
                                        "tags": ["Custom"]
                                    })
                            except Exception:
                                pass

            self.send_json({"adventures": adventures_list, "count": len(adventures_list)})

        elif path == "/api/audio-files":
            adv_id = query_params.get("adventure", ["phandelver"])[0]
            safe_id = re.sub(r'[^a-zA-Z0-9_\-]', '', adv_id)
            
            files = {"music": [], "ambience": [], "effects": [], "presets": []}
            
            # Scan adventure audio
            adv_audio = self.app_dir / "adventures" / safe_id / "audio"
            if adv_audio.exists():
                for cat in ["music", "ambience", "effects"]:
                    cat_dir = adv_audio / cat
                    if cat_dir.exists():
                        for f in sorted(cat_dir.iterdir()):
                            if f.is_file() and f.suffix.lower() in AUDIO_EXTS:
                                files[cat].append({
                                    "name": f.stem.replace("_", " ").title(),
                                    "filename": f.name,
                                    "path": f"audio/{cat}/{f.name}",
                                    "sizeBytes": f.stat().st_size
                                })

            # Scan global presets
            presets_dir = self.app_dir / "audio_presets"
            if presets_dir.exists():
                for f in sorted(presets_dir.iterdir()):
                    if f.is_file() and f.suffix.lower() in AUDIO_EXTS:
                        files["presets"].append({
                            "name": f.stem.replace("_", " ").title(),
                            "filename": f.name,
                            "path": f"../../audio_presets/{f.name}",
                            "sizeBytes": f.stat().st_size
                        })

            self.send_json({"adventureId": safe_id, "files": files})
        else:
            self.send_json({"error": "Unknown API endpoint"}, 404)

    def handle_api_post(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_len = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_len) if content_len > 0 else b"{}"

        try:
            payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        except Exception:
            payload = {}

        if path == "/api/save-adventure":
            adv_id = payload.get("id")
            adventure_data = payload.get("adventure")
            if not adv_id or not adventure_data:
                self.send_json({"success": False, "error": "Missing 'id' or 'adventure' data"}, 400)
                return

            safe_id = re.sub(r'[^a-zA-Z0-9_\-]', '', adv_id)
            adv_folder = self.app_dir / "adventures" / safe_id
            adv_folder.mkdir(parents=True, exist_ok=True)
            (adv_folder / "img").mkdir(parents=True, exist_ok=True)
            (adv_folder / "audio" / "music").mkdir(parents=True, exist_ok=True)
            (adv_folder / "audio" / "ambience").mkdir(parents=True, exist_ok=True)
            (adv_folder / "audio" / "effects").mkdir(parents=True, exist_ok=True)

            adv_file = adv_folder / "adventure.json"
            with open(adv_file, "w", encoding="utf-8") as f:
                json.dump(adventure_data, f, indent=2, ensure_ascii=False)

            self.update_adventure_index(safe_id, adventure_data)
            self.send_json({"success": True, "message": f"Saved adventure '{safe_id}'", "path": f"adventures/{safe_id}/adventure.json"})

        elif path == "/api/create-adventure":
            title = payload.get("title", "New Adventure")
            author = payload.get("author", "Dungeon Master")
            adv_id = payload.get("id") or re.sub(r'[^a-z0-9_]', '_', title.lower()).strip('_')
            safe_id = re.sub(r'[^a-zA-Z0-9_\-]', '', adv_id)

            adv_folder = self.app_dir / "adventures" / safe_id
            adv_folder.mkdir(parents=True, exist_ok=True)
            (adv_folder / "img").mkdir(parents=True, exist_ok=True)
            (adv_folder / "audio" / "music").mkdir(parents=True, exist_ok=True)
            (adv_folder / "audio" / "ambience").mkdir(parents=True, exist_ok=True)
            (adv_folder / "audio" / "effects").mkdir(parents=True, exist_ok=True)

            new_adv = {
                "id": safe_id,
                "title": title,
                "subtitle": payload.get("subtitle", "Custom D&D Campaign"),
                "author": author,
                "version": "1.0.0",
                "description": payload.get("description", "A custom adventure soundscape created with DnD-Soundscape."),
                "previewImage": payload.get("previewImage", "../../adventures/phandelver/img/panorama.jpg"),
                "coverImage": payload.get("coverImage", "../../adventures/phandelver/img/cover.jpg"),
                "theme": payload.get("theme", "fantasy"),
                "defaultCrossfadeSec": payload.get("defaultCrossfadeSec", 4.0),
                "duckLevel": 0.35,
                "masterVolume": 0.8,
                "stages": payload.get("stages", [
                    {
                        "id": "stage_1",
                        "label": "1. Starting Tavern / Town",
                        "type": "roleplay",
                        "icon": "🍺",
                        "hotkey": "1",
                        "crossfadeSec": 4.0,
                        "hotspot": { "x": 30.0, "y": 70.0, "r": 6 },
                        "description": "Where the adventurers assemble.",
                        "layers": {
                            "music": {
                                "name": "Tavern Atmosphere",
                                "volume": 0.65,
                                "playlistMode": "loopAll",
                                "tracks": [
                                    { "title": "Tavern Lute", "file": "../../audio_presets/tavern_lute.wav", "loopStart": 0, "loopEnd": None }
                                ]
                            },
                            "ambience": {
                                "name": "Campfire Ambience",
                                "volume": 0.50,
                                "playlistMode": "loopAll",
                                "tracks": [
                                    { "title": "Campfire", "file": "../../audio_presets/campfire_ambience.wav", "loopStart": 0, "loopEnd": None }
                                ]
                            },
                            "effects": {
                                "name": "Scene FX",
                                "volume": 0.85,
                                "triggers": [
                                    { "id": "spell", "label": "Spell Spark", "icon": "✨", "hotkey": "Q", "file": "../../audio_presets/spell_surge.wav" }
                                ]
                            }
                        }
                    }
                ])
            }

            with open(adv_folder / "adventure.json", "w", encoding="utf-8") as f:
                json.dump(new_adv, f, indent=2, ensure_ascii=False)

            self.update_adventure_index(safe_id, new_adv)
            self.send_json({"success": True, "id": safe_id, "adventure": new_adv})

        elif path == "/api/delete-adventure":
            adv_id = payload.get("id")
            if not adv_id or adv_id in ["phandelver"]:
                self.send_json({"success": False, "error": "Cannot delete protected default adventure"}, 400)
                return

            safe_id = re.sub(r'[^a-zA-Z0-9_\-]', '', adv_id)
            adv_folder = self.app_dir / "adventures" / safe_id
            if adv_folder.exists():
                shutil.rmtree(adv_folder)

            # Update index.json
            index_file = self.app_dir / "adventures" / "index.json"
            if index_file.exists():
                try:
                    with open(index_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    data["adventures"] = [a for a in data.get("adventures", []) if a.get("id") != safe_id]
                    with open(index_file, "w", encoding="utf-8") as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                except Exception:
                    pass

            self.send_json({"success": True, "message": f"Deleted adventure '{safe_id}'"})

        elif path == "/api/upload-file":
            adv_id = payload.get("adventureId")
            filename = payload.get("filename")
            category = payload.get("category", "music") # 'music' | 'ambience' | 'effects' | 'img'
            data_b64 = payload.get("dataBase64")

            if not adv_id or not filename or not data_b64:
                self.send_json({"success": False, "error": "Missing upload parameters"}, 400)
                return

            safe_id = re.sub(r'[^a-zA-Z0-9_\-]', '', adv_id)
            safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', filename)

            if category == "img":
                dest_dir = self.app_dir / "adventures" / safe_id / "img"
            else:
                dest_dir = self.app_dir / "adventures" / safe_id / "audio" / category

            dest_dir.mkdir(parents=True, exist_ok=True)
            dest_file = dest_dir / safe_name

            # Strip data URL header if present
            if "," in data_b64:
                data_b64 = data_b64.split(",", 1)[1]

            raw_bytes = base64.b64decode(data_b64)
            with open(dest_file, "wb") as f:
                f.write(raw_bytes)

            rel_path = f"img/{safe_name}" if category == "img" else f"audio/{category}/{safe_name}"
            self.send_json({"success": True, "path": rel_path, "filename": safe_name})

        else:
            self.send_json({"error": "Unknown API endpoint"}, 404)

    def update_adventure_index(self, adv_id: str, adv_data: dict):
        index_file = self.app_dir / "adventures" / "index.json"
        index_data = {"adventures": []}
        if index_file.exists():
            try:
                with open(index_file, "r", encoding="utf-8") as f:
                    index_data = json.load(f)
            except Exception:
                index_data = {"adventures": []}

        entries = index_data.get("adventures", [])
        entry = {
            "id": adv_id,
            "title": adv_data.get("title", adv_id),
            "subtitle": adv_data.get("subtitle", ""),
            "author": adv_data.get("author", "DM"),
            "description": adv_data.get("description", ""),
            "stageCount": len(adv_data.get("stages", [])),
            "previewImage": f"adventures/{adv_id}/{adv_data.get('previewImage', 'img/panorama.jpg')}",
            "coverImage": f"adventures/{adv_id}/{adv_data.get('coverImage', 'img/cover.jpg')}",
            "path": f"adventures/{adv_id}/adventure.json",
            "tags": ["Custom"]
        }

        existing_idx = next((i for i, a in enumerate(entries) if a.get("id") == adv_id), None)
        if existing_idx is not None:
            entries[existing_idx] = entry
        else:
            entries.append(entry)

        index_data["adventures"] = entries
        with open(index_file, "w", encoding="utf-8") as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)

    # =========================================================================
    # Static Files & HTTP 206 Partial Content Range Support
    # =========================================================================

    def handle_static_get(self, send_body=True):
        req_path = self.path.split("?")[0].split("#")[0].lstrip("/")
        if not req_path:
            req_path = "index.html"

        file_path = (self.app_dir / req_path).resolve()

        try:
            file_path.relative_to(self.app_dir)
        except ValueError:
            self.send_error(403, "Forbidden")
            return

        if not file_path.exists() or not file_path.is_file():
            self.send_error(404, f"File Not Found: {req_path}")
            return

        total_size = file_path.stat().st_size
        suffix = file_path.suffix.lower()
        content_type = MIME_MAP.get(suffix, mimetypes.guess_type(str(file_path))[0] or "application/octet-stream")

        range_header = self.headers.get("Range")
        if range_header and range_header.startswith("bytes="):
            self.handle_range_request(file_path, total_size, content_type, range_header, send_body)
        else:
            self.handle_full_request(file_path, total_size, content_type, send_body)

    def handle_full_request(self, file_path: Path, total_size: int, content_type: str, send_body: bool):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(total_size))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        if send_body:
            with open(file_path, "rb") as f:
                self.copyfile(f, self.wfile)

    def handle_range_request(self, file_path: Path, total_size: int, content_type: str, range_header: str, send_body: bool):
        match = re.match(r"bytes=(\d*)-(\d*)", range_header)
        if not match:
            self.send_error(400, "Bad Request")
            return

        start_str, end_str = match.groups()

        if not start_str and not end_str:
            self.send_error(400, "Bad Request")
            return

        if start_str and end_str:
            start = int(start_str)
            end = int(end_str)
        elif start_str:
            start = int(start_str)
            end = total_size - 1
        else:
            length = int(end_str)
            start = max(0, total_size - length)
            end = total_size - 1

        if start >= total_size or end >= total_size or start > end:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{total_size}")
            self.end_headers()
            return

        chunk_size = end - start + 1

        self.send_response(206)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Range", f"bytes {start}-{end}/{total_size}")
        self.send_header("Content-Length", str(chunk_size))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        if send_body:
            with open(file_path, "rb") as f:
                f.seek(start)
                bytes_left = chunk_size
                buffer_size = 64 * 1024
                while bytes_left > 0:
                    read_len = min(buffer_size, bytes_left)
                    data = f.read(read_len)
                    if not data:
                        break
                    try:
                        self.wfile.write(data)
                    except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
                        break
                    bytes_left -= len(data)

    def copyfile(self, source, outputfile):
        buffer_size = 64 * 1024
        while True:
            data = source.read(buffer_size)
            if not data:
                break
            try:
                outputfile.write(data)
            except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
                break

    def log_message(self, format, *args):
        pass

def get_lan_ip():
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    port = 8777
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    lan_ip = get_lan_ip()
    server_address = ("0.0.0.0", port)
    httpd = ThreadedHTTPServer(server_address, SoundscapeRequestHandler)
    print("=" * 65)
    print("  [+] DnD-Soundscape Server (v1.0.0)")
    print(f"  [+] Local PC Browser : http://localhost:{port}")
    if lan_ip != "127.0.0.1":
        print(f"  [+] Mobile / Phone   : http://{lan_ip}:{port}")
    print("  [+] Mobile App / PWA : Ready (Installable on iOS & Android)")
    print("  [+] Streaming Bridge : YouTube & Spotify Connectors active")
    print("  [+] HTTP-Range (206) : Partial Content Streaming active")
    print("=" * 65)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nDnD-Soundscape Server stopped.")
        httpd.server_close()

if __name__ == "__main__":
    main()
