#!/usr/bin/env python3
"""
DnD-Soundscape Audio Organizer
Scans a source folder (or downloads directory) of audio files and helps
sort and place them concisely into the adventure's audio structure:
  adventures/<adventure_id>/audio/music/
  adventures/<adventure_id>/audio/ambience/
  adventures/<adventure_id>/audio/effects/
"""

import argparse
import json
import os
import shutil
import sys
from pathlib import Path

SUPPORTED_EXTS = {'.mp3', '.m4a', '.ogg', '.opus', '.webm', '.wav', '.flac', '.aac'}

def organize_files(adventure_id: str, source_folder: Path, category_override: str = None):
    root = Path(__file__).resolve().parent.parent
    adv_dir = root / "adventures" / adventure_id
    if not adv_dir.exists():
        print(f"Error: Adventure '{adventure_id}' not found at {adv_dir}")
        return

    music_dir = adv_dir / "audio" / "music"
    ambience_dir = adv_dir / "audio" / "ambience"
    effects_dir = adv_dir / "audio" / "effects"
    
    music_dir.mkdir(parents=True, exist_ok=True)
    ambience_dir.mkdir(parents=True, exist_ok=True)
    effects_dir.mkdir(parents=True, exist_ok=True)

    audio_files = [p for p in source_folder.rglob('*') if p.suffix.lower() in SUPPORTED_EXTS]
    print(f"Found {len(audio_files)} audio file(s) in {source_folder}")

    copied_count = 0
    for src_file in audio_files:
        name_lower = src_file.name.lower()
        target_category = category_override
        
        if not target_category:
            if any(k in name_lower for k in ['sfx', 'effect', 'hit', 'spell', 'sword', 'roar', 'punch', 'clash', 'thunder', 'bell']):
                target_category = 'effects'
            elif any(k in name_lower for k in ['ambience', 'ambient', 'bg', 'wind', 'rain', 'fire', 'tavern', 'stream', 'forest', 'cave', 'drip', 'drone']):
                target_category = 'ambience'
            else:
                target_category = 'music'

        dest_dir = adv_dir / "audio" / target_category
        dest_file = dest_dir / src_file.name
        
        shutil.copy2(src_file, dest_file)
        print(f" -> [{target_category.upper()}] Copied {src_file.name} to {dest_file.relative_to(root)}")
        copied_count += 1

    print(f"\nSuccessfully organized {copied_count} file(s) into adventure '{adventure_id}'.")

def main():
    parser = argparse.ArgumentParser(description="Organize audio files into a DnD-Soundscape adventure folder structure.")
    parser.add_argument("adventure_id", help="Target adventure ID (e.g. phandelver, hochsattel)")
    parser.add_argument("source_folder", help="Path to folder containing audio files")
    parser.add_argument("--category", choices=['music', 'ambience', 'effects'], help="Force all files into this layer category")
    
    args = parser.parse_args()
    source_p = Path(args.source_folder)
    if not source_p.exists():
        print(f"Error: Source folder '{source_p}' does not exist.")
        sys.exit(1)
        
    organize_files(args.adventure_id, source_p, args.category)

if __name__ == "__main__":
    main()
