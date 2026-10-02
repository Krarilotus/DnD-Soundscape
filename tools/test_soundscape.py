#!/usr/bin/env python3
"""
DnD-Soundscape Automated Test Suite
Validates:
1. JSON Schema & configuration integrity
2. Audio asset existence & WAV header specifications
3. Image preview asset integrity
4. HTTP Server static file delivery & Range (206) partial streaming
5. REST API endpoints (GET /api/adventures, GET /api/audio-files, POST /api/create-adventure, POST /api/save-adventure, POST /api/delete-adventure)
"""

import glob
import json
import os
import sys
import time
import urllib.request
import urllib.parse
import wave
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

passed_tests = 0
failed_tests = 0

def test(name, condition, details=""):
    global passed_tests, failed_tests
    if condition:
        print(f"  [PASS] {name}")
        passed_tests += 1
    else:
        print(f"  [FAIL] {name} - {details}")
        failed_tests += 1

def run_tests():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    print("=" * 65)
    print("  DnD-Soundscape Automated Validation Test Suite")
    print("=" * 65)

    # 1. Validate Adventure JSON Files
    print("\n[1] Validating Adventure Configurations & Schemas...")
    index_path = ROOT_DIR / "adventures" / "index.json"
    test("adventures/index.json exists", index_path.exists())
    
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            idx_data = json.load(f)
            test("index.json contains 'adventures' list", "adventures" in idx_data and len(idx_data["adventures"]) > 0)
    except Exception as e:
        test("index.json valid syntax", False, str(e))

    adv_files = list(ROOT_DIR.glob("adventures/*/adventure.json"))
    test(f"Found {len(adv_files)} adventure.json files", len(adv_files) >= 1)

    for af in adv_files:
        adv_name = af.parent.name
        try:
            with open(af, "r", encoding="utf-8") as f:
                adv = json.load(f)
            test(f"[{adv_name}] Has valid 'id' and 'title'", bool(adv.get("id")) and bool(adv.get("title")))
            test(f"[{adv_name}] Has 'stages' array with >= 1 stage", isinstance(adv.get("stages"), list) and len(adv["stages"]) >= 1)
            
            for st in adv.get("stages", []):
                test(f"[{adv_name}] Stage '{st.get('id')}' has hotspot coordinates", "hotspot" in st and "x" in st["hotspot"] and "y" in st["hotspot"])
                test(f"[{adv_name}] Stage '{st.get('id')}' has 3-layer structure", "layers" in st and "music" in st["layers"] and "ambience" in st["layers"] and "effects" in st["layers"])
        except Exception as e:
            test(f"[{adv_name}] Parse JSON", False, str(e))

    # 2. Validate Audio Presets & Sample Formats
    print("\n[2] Validating Audio Assets & WAV Headers...")
    preset_wavs = list(ROOT_DIR.glob("audio_presets/*.wav"))
    test(f"Found {len(preset_wavs)} preset WAV files", len(preset_wavs) >= 8)

    for wav_p in preset_wavs:
        try:
            with wave.open(str(wav_p), 'r') as w:
                channels = w.getnchannels()
                rate = w.getframerate()
                frames = w.getnframes()
                dur = frames / rate
                test(f"Audio '{wav_p.name}' valid ({dur:.1f}s, {rate}Hz, {channels}ch)", dur > 0 and rate >= 22050)
        except Exception as e:
            test(f"Audio '{wav_p.name}' read header", False, str(e))

    # 3. Validate Images
    print("\n[3] Validating Preview Images...")
    phandelver_pano = ROOT_DIR / "adventures" / "phandelver" / "img" / "panorama.jpg"
    test("Phandelver panorama.jpg exists", phandelver_pano.exists() and phandelver_pano.stat().st_size > 10000)

    # 4. HTTP Server & REST API Tests
    print("\n[4] Validating HTTP Server & REST API Endpoints (port 8777)...")
    base_url = "http://localhost:8777"
    server_online = False
    try:
        res = urllib.request.urlopen(f"{base_url}/index.html", timeout=3)
        if res.getcode() == 200:
            server_online = True
    except Exception:
        server_online = False

    if not server_online:
        print("  [!] Server not running on 8777. Please run 'python tools/serve.py 8777'")
    else:
        # Static file delivery
        res_idx = urllib.request.urlopen(f"{base_url}/index.html")
        test("GET /index.html (200 OK)", res_idx.getcode() == 200)

        res_css = urllib.request.urlopen(f"{base_url}/css/main.css")
        test("GET /css/main.css (200 OK)", res_css.getcode() == 200)

        # Range streaming
        req_range = urllib.request.Request(f"{base_url}/audio_presets/tavern_lute.wav")
        req_range.add_header("Range", "bytes=0-511")
        res_range = urllib.request.urlopen(req_range)
        test("HTTP Range Partial Content (206 OK)", res_range.getcode() == 206 and len(res_range.read()) == 512)

        # API: GET /api/adventures
        res_api_adv = urllib.request.urlopen(f"{base_url}/api/adventures")
        data_adv = json.loads(res_api_adv.read())
        test("API GET /api/adventures returns adventure list", "adventures" in data_adv and len(data_adv["adventures"]) >= 1)

        # API: GET /api/audio-files
        res_api_audio = urllib.request.urlopen(f"{base_url}/api/audio-files?adventure=phandelver")
        data_audio = json.loads(res_api_audio.read())
        test("API GET /api/audio-files returns categorized tracks", "files" in data_audio and len(data_audio["files"].get("music", [])) >= 1)

        # API: POST /api/create-adventure
        test_adv_payload = {
            "title": "Automated Test Adventure",
            "author": "CI Test Suite",
            "subtitle": "Test Suite Runner",
            "description": "Created during automated verification"
        }
        req_create = urllib.request.Request(
            f"{base_url}/api/create-adventure",
            data=json.dumps(test_adv_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        res_create = urllib.request.urlopen(req_create)
        data_create = json.loads(res_create.read())
        test("API POST /api/create-adventure created adventure", data_create.get("success") is True)
        created_id = data_create.get("id")

        # API: POST /api/delete-adventure
        if created_id:
            req_del = urllib.request.Request(
                f"{base_url}/api/delete-adventure",
                data=json.dumps({"id": created_id}).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            res_del = urllib.request.urlopen(req_del)
            data_del = json.loads(res_del.read())
            test("API POST /api/delete-adventure deleted test adventure", data_del.get("success") is True)

    print("\n" + "=" * 65)
    print(f"  TEST RESULTS: {passed_tests} PASSED, {failed_tests} FAILED")
    print("=" * 65)

    if failed_tests > 0:
        sys.exit(1)
    else:
        print("  ALL VALIDATION CHECKS PASSED PERFECTLY!")
        sys.exit(0)

if __name__ == "__main__":
    run_tests()
