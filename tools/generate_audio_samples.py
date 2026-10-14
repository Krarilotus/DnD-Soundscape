#!/usr/bin/env python3
"""
Generates high-quality, royalty-free synthesized audio presets (WAV format)
for DnD-Soundscape. Provides immediate out-of-the-box working audio for
music, ambience, and one-shot effects without requiring external downloads.
"""

import math
import random
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44100

def write_wav(file_path: Path, samples: list[float], sample_rate: int = SAMPLE_RATE, channels: int = 2):
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(file_path), 'w') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(sample_rate)
        
        raw_data = bytearray()
        for s in samples:
            # clamp to -1.0 to 1.0
            val = max(-1.0, min(1.0, s))
            int_val = int(val * 32767.0)
            packed = struct.pack('<h', int_val)
            if channels == 1:
                raw_data.extend(packed)
            elif channels == 2:
                # Stereo duplication or interleaved
                raw_data.extend(packed)
                raw_data.extend(packed)
        wav_file.writeframes(raw_data)
    print(f"Generated: {file_path} ({len(samples)/sample_rate:.1f}s)")

def generate_tavern_lute(duration_sec=16.0):
    """Generates an atmospheric medieval lute/harp melody with warm harmonic resonance."""
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    # Chord notes in D minor / Dorian (D3, F3, A3, C4, D4, E4, F4, G4, A4)
    # Frequencies in Hz:
    frequencies = {
        'D3': 146.83, 'F3': 174.61, 'A3': 220.00, 'C4': 261.63,
        'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00
    }
    
    # 16-bar arpeggio pattern: (time_sec, note_name, velocity)
    pattern = [
        # Bar 1 (Dm)
        (0.0, 'D3', 0.8), (0.5, 'A3', 0.6), (1.0, 'D4', 0.7), (1.5, 'F4', 0.75),
        (2.0, 'A4', 0.85), (2.5, 'F4', 0.6), (3.0, 'D4', 0.65), (3.5, 'A3', 0.5),
        # Bar 2 (C / F)
        (4.0, 'C4', 0.75), (4.5, 'E4', 0.6), (5.0, 'G4', 0.7), (5.5, 'A4', 0.8),
        (6.0, 'G4', 0.65), (6.5, 'E4', 0.6), (7.0, 'C4', 0.55), (7.5, 'A3', 0.5),
        # Bar 3 (Bb / Gm)
        (8.0, 'F3', 0.75), (8.5, 'A3', 0.6), (9.0, 'D4', 0.7), (9.5, 'F4', 0.75),
        (10.0, 'G4', 0.8), (10.5, 'F4', 0.6), (11.0, 'D4', 0.65), (11.5, 'A3', 0.5),
        # Bar 4 (A7 sus to Dm resolution)
        (12.0, 'A3', 0.8), (12.5, 'C4', 0.6), (13.0, 'E4', 0.7), (13.5, 'G4', 0.75),
        (14.0, 'F4', 0.7), (14.5, 'E4', 0.6), (15.0, 'D4', 0.85), (15.5, 'A3', 0.5)
    ]
    
    for t_start, note, vel in pattern:
        freq = frequencies[note]
        start_idx = int(t_start * SAMPLE_RATE)
        note_len = int(2.5 * SAMPLE_RATE) # Decay length
        for i in range(note_len):
            idx = (start_idx + i) % num_samples
            t = i / SAMPLE_RATE
            # Plucked string physical modeling: fundamental + decaying harmonics
            env = math.exp(-t * 2.8) * (1.0 - math.exp(-t * 60.0))
            # Harmonics
            h1 = math.sin(2.0 * math.pi * freq * t)
            h2 = 0.5 * math.sin(2.0 * math.pi * freq * 2.0 * t) * math.exp(-t * 3.5)
            h3 = 0.25 * math.sin(2.0 * math.pi * freq * 3.0 * t) * math.exp(-t * 4.5)
            h4 = 0.12 * math.sin(2.0 * math.pi * freq * 4.0 * t) * math.exp(-t * 6.0)
            
            # Subtle vibrato
            vib = 1.0 + 0.003 * math.sin(2.0 * math.pi * 5.0 * t)
            
            sig = (h1 + h2 + h3 + h4) * env * vel * 0.32
            out[idx] += sig

    # Normalize gently and add seamless loop fade
    max_val = max(abs(x) for x in out) or 1.0
    for i in range(num_samples):
        out[i] = (out[i] / max_val) * 0.75
    return out

def generate_campfire_ambience(duration_sec=16.0):
    """Generates continuous crackling campfire background ambience with embers."""
    random.seed(42)
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    # 1. Warm low rumble & roar (filtered pink noise)
    b0, b1, b2 = 0.0, 0.0, 0.0
    for i in range(num_samples):
        white = (random.random() * 2.0 - 1.0)
        b0 = 0.99 * b0 + white * 0.05
        b1 = 0.95 * b1 + white * 0.03
        b2 = 0.90 * b2 + white * 0.02
        low_rumble = (b0 + b1 + b2) * 0.25
        out[i] = low_rumble

    # 2. Intermittent crackles & pops
    num_crackles = int(duration_sec * 24)
    for _ in range(num_crackles):
        t_pos = random.random() * duration_sec
        pop_len = random.randint(100, 600)
        pop_amp = random.uniform(0.2, 0.7)
        start_idx = int(t_pos * SAMPLE_RATE)
        for j in range(pop_len):
            idx = (start_idx + j) % num_samples
            decay = math.exp(-j / (pop_len * 0.25))
            noise = (random.random() * 2.0 - 1.0) * pop_amp * decay
            out[idx] += noise

    # Smooth loop edges
    seam_len = int(0.1 * SAMPLE_RATE)
    for i in range(seam_len):
        w = i / seam_len
        out[i] = out[i] * w + out[num_samples - seam_len + i] * (1.0 - w)

    return out

def generate_dungeon_drone(duration_sec=16.0):
    """Generates deep, eerie subterranean dungeon atmospheric drone."""
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    # Deep drone fundamentals: C2 (65.41Hz), G2 (98.0Hz), Eb2 (77.78Hz)
    f1, f2, f3 = 65.41, 98.00, 77.78
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Slow pulsating LFOs
        lfo1 = 0.5 + 0.5 * math.sin(2.0 * math.pi * 0.12 * t)
        lfo2 = 0.5 + 0.5 * math.sin(2.0 * math.pi * 0.08 * t + 1.5)
        
        # Sub harmonic synth
        s1 = math.sin(2.0 * math.pi * f1 * t) * 0.35
        s2 = math.sin(2.0 * math.pi * f2 * t) * 0.20 * lfo1
        s3 = math.sin(2.0 * math.pi * f3 * t) * 0.15 * lfo2
        # Eerie high overtone
        s4 = math.sin(2.0 * math.pi * (f1 * 5.0) * t) * 0.04 * math.sin(2.0 * math.pi * 0.25 * t)
        
        out[i] = s1 + s2 + s3 + s4

    # Smooth loop edges
    seam_len = int(0.2 * SAMPLE_RATE)
    for i in range(seam_len):
        w = i / seam_len
        out[i] = out[i] * w + out[num_samples - seam_len + i] * (1.0 - w)

    return out

def generate_cave_drips(duration_sec=16.0):
    """Generates cavernous dripping water with spatial acoustic echo."""
    random.seed(123)
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    # Background low cavern wind
    low_val = 0.0
    for i in range(num_samples):
        white = (random.random() * 2.0 - 1.0)
        low_val = 0.992 * low_val + white * 0.02
        out[i] = low_val * 0.3
        
    # Drops
    num_drops = int(duration_sec * 5)
    for _ in range(num_drops):
        t_pos = random.random() * duration_sec
        drop_freq = random.uniform(1200, 2600)
        drop_amp = random.uniform(0.3, 0.7)
        start_idx = int(t_pos * SAMPLE_RATE)
        drop_len = int(0.25 * SAMPLE_RATE)
        
        for j in range(drop_len):
            idx = (start_idx + j) % num_samples
            t = j / SAMPLE_RATE
            # Pitch blip upwards on impact then downwards
            cur_freq = drop_freq * (1.0 + 0.5 * math.exp(-t * 80.0) - 0.2 * t)
            env = math.exp(-t * 22.0)
            sig = math.sin(2.0 * math.pi * cur_freq * t) * env * drop_amp
            
            # Simple reverb taps
            out[idx] += sig
            echo1_idx = (idx + int(0.06 * SAMPLE_RATE)) % num_samples
            out[echo1_idx] += sig * 0.35
            echo2_idx = (idx + int(0.14 * SAMPLE_RATE)) % num_samples
            out[echo2_idx] += sig * 0.18

    return out

def generate_combat_drums(duration_sec=16.0):
    """Generates driving cinematic war drums & combat rhythm."""
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    # 120 BPM: 0.5s per beat, 4/4 meter = 2.0s per bar (8 bars in 16s)
    beat_sec = 0.5
    num_beats = int(duration_sec / beat_sec)
    
    for b in range(num_beats):
        t_beat = b * beat_sec
        bar_beat = b % 4
        
        # Heavy Taiko on 0, 2; Snare/Rim on 1, 3; subdivisions
        hits = [(0.0, 65.0, 0.85, 0.4)] # (offset_sec, pitch_hz, velocity, decay_sec)
        if bar_beat == 0:
            hits.append((0.25, 90.0, 0.45, 0.2))
        elif bar_beat == 1:
            hits.append((0.0, 180.0, 0.6, 0.15))
            hits.append((0.375, 75.0, 0.5, 0.2))
        elif bar_beat == 2:
            hits.append((0.0, 60.0, 0.9, 0.5))
            hits.append((0.25, 80.0, 0.55, 0.25))
        elif bar_beat == 3:
            hits.append((0.0, 200.0, 0.7, 0.18))
            hits.append((0.25, 85.0, 0.5, 0.2))
            hits.append((0.375, 95.0, 0.6, 0.2))
            
        for offset, base_pitch, vel, decay in hits:
            start_idx = int((t_beat + offset) * SAMPLE_RATE)
            hit_len = int(decay * 1.5 * SAMPLE_RATE)
            for j in range(hit_len):
                idx = (start_idx + j) % num_samples
                t = j / SAMPLE_RATE
                pitch = base_pitch * (1.0 + 1.8 * math.exp(-t * 40.0))
                env = math.exp(-t / (decay * 0.4))
                drum = math.sin(2.0 * math.pi * pitch * t) * env * vel * 0.65
                noise = (random.random() * 2.0 - 1.0) * env * vel * 0.15
                out[idx] += (drum + noise)

    return out

def generate_thunderclap():
    """Generates dramatic thunderclap one-shot SFX."""
    duration_sec = 4.5
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    random.seed(999)
    # Initial explosive transient followed by low rolling rumble
    b0, b1 = 0.0, 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0)
        # Low pass filter
        b0 = 0.985 * b0 + noise * 0.08
        b1 = 0.970 * b1 + noise * 0.05
        
        # Explosion envelope: sharp rise (10ms) then exponential decay
        env = math.exp(-t * 0.8) * (1.0 - math.exp(-t * 80.0))
        # Rumble waves
        rumble = math.sin(2.0 * math.pi * (35.0 + 15.0 * math.sin(2.0 * math.pi * 3.0 * t)) * t) * 0.4
        
        out[i] = (b0 + b1 + rumble) * env * 0.95
    return out

def generate_sword_clash():
    """Generates metallic sword clash one-shot SFX."""
    duration_sec = 2.0
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 6.0)
        # Ring frequencies of high-carbon steel: 1250Hz, 2400Hz, 3800Hz, 5100Hz
        r1 = math.sin(2.0 * math.pi * 1250.0 * t) * 0.4
        r2 = math.sin(2.0 * math.pi * 2420.0 * t) * 0.3
        r3 = math.sin(2.0 * math.pi * 3810.0 * t) * 0.2
        r4 = math.sin(2.0 * math.pi * 5150.0 * t) * 0.15
        
        # Impact noise
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 50.0) * 0.6
        out[i] = (r1 + r2 + r3 + r4 + noise) * env * 0.8
    return out

def generate_spell_surge():
    """Generates magic spell surge / arcane shimmer SFX."""
    duration_sec = 3.2
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * min(1.0, t / 2.8)) * math.exp(-max(0.0, t - 1.5) * 2.0)
        
        # Rising glissando arpeggio
        freq = 300.0 + 900.0 * (t / duration_sec) ** 1.8
        sig = math.sin(2.0 * math.pi * freq * t) * 0.4
        shimmer = math.sin(2.0 * math.pi * (freq * 2.01) * t) * 0.25 * math.sin(2.0 * math.pi * 12.0 * t)
        chime = math.sin(2.0 * math.pi * 1760.0 * t) * 0.2 * math.exp(-((t - 1.2) ** 2) * 10.0)
        
        out[i] = (sig + shimmer + chime) * env * 0.75
    return out

def generate_monster_roar():
    """Generates terrifying subterranean beast roar SFX."""
    duration_sec = 3.5
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = (1.0 - math.exp(-t * 15.0)) * math.exp(-max(0.0, t - 0.8) * 1.5)
        
        # Growl pitch modulation
        f_base = 75.0 - 25.0 * (t / duration_sec)
        mod = 1.0 + 0.3 * math.sin(2.0 * math.pi * 28.0 * t) # Growl oscillation
        
        sig = math.sin(2.0 * math.pi * f_base * mod * t) * 0.5
        sig_sub = math.sin(2.0 * math.pi * (f_base * 0.5) * t) * 0.35
        noise = (random.random() * 2.0 - 1.0) * 0.25 * env
        
        out[i] = (sig + sig_sub + noise) * env * 0.85
    return out

def generate_forest_wind(duration_sec=16.0):
    """Generates whistling wilderness wind ambience."""
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    b0, b1 = 0.0, 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        white = (random.random() * 2.0 - 1.0)
        
        # Wind gust modulation
        gust = 0.5 + 0.5 * math.sin(2.0 * math.pi * 0.15 * t + math.sin(2.0 * math.pi * 0.05 * t))
        b0 = 0.96 * b0 + white * 0.04
        b1 = 0.92 * b1 + white * 0.06
        
        # Whistle resonance
        whistle = math.sin(2.0 * math.pi * (420.0 + 120.0 * math.sin(2.0 * math.pi * 0.2 * t)) * t) * 0.08 * gust
        out[i] = (b0 + b1) * gust * 0.5 + whistle

    # Loop seam smoothing
    seam_len = int(0.2 * SAMPLE_RATE)
    for i in range(seam_len):
        w = i / seam_len
        out[i] = out[i] * w + out[num_samples - seam_len + i] * (1.0 - w)
        
    return out

def generate_shield_block():
    """Generates heavy shield deflection / block SFX."""
    duration_sec = 1.2
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 9.0)
        # Deep wood-metal resonance
        r1 = math.sin(2.0 * math.pi * 320.0 * (1.0 + 0.8 * math.exp(-t * 40.0)) * t) * 0.5
        r2 = math.sin(2.0 * math.pi * 780.0 * t) * 0.35 * math.exp(-t * 14.0)
        r3 = math.sin(2.0 * math.pi * 1450.0 * t) * 0.25 * math.exp(-t * 22.0)
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 55.0) * 0.7
        out[i] = (r1 + r2 + r3 + noise) * env * 0.85
    return out

def generate_fireball():
    """Generates whooshing fireball explosion SFX."""
    duration_sec = 2.6
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    b0, b1 = 0.0, 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0)
        b0 = 0.96 * b0 + noise * 0.06
        b1 = 0.93 * b1 + noise * 0.08
        
        # Explosion envelope: quick whoosh rise then rolling fiery decay
        env = (1.0 - math.exp(-t * 25.0)) * math.exp(-t * 1.5)
        flame = math.sin(2.0 * math.pi * (55.0 + 35.0 * math.exp(-t * 3.0)) * t) * 0.45
        out[i] = (b0 + b1 + flame) * env * 0.9
    return out

def generate_potion_drink():
    """Generates potion cork pop and liquid drinking SFX."""
    duration_sec = 1.8
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    # Cork pop at start
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Pop transient (0 to 0.15s)
        pop = 0.0
        if t < 0.15:
            pop_env = math.exp(-t * 40.0)
            pop = math.sin(2.0 * math.pi * (520.0 + 300.0 * (1.0 - t / 0.15)) * t) * pop_env * 0.8
        
        # 3 liquid glugs
        glugs = 0.0
        for g_idx, g_time in enumerate([0.35, 0.75, 1.15]):
            if t >= g_time and t < g_time + 0.3:
                gt = t - g_time
                g_env = math.sin(math.pi * (gt / 0.3)) ** 2
                g_pitch = 380.0 + (g_idx * 40.0) + 120.0 * gt
                glugs += math.sin(2.0 * math.pi * g_pitch * gt) * g_env * 0.45
        
        out[i] = pop + glugs
    return out

def generate_wooden_chest():
    """Generates heavy wooden treasure chest opening creak and thud SFX."""
    duration_sec = 2.0
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Wooden friction creak
        creak_env = math.sin(math.pi * min(1.0, t / 1.4)) * 0.5
        creak_freq = 210.0 + 80.0 * math.sin(2.0 * math.pi * 7.5 * t)
        creak = math.sin(2.0 * math.pi * creak_freq * t) * creak_env * 0.35
        
        # Heavy lid thud at 1.4s
        thud = 0.0
        if t >= 1.3:
            tt = t - 1.3
            thud_env = math.exp(-tt * 8.0)
            thud_sig = math.sin(2.0 * math.pi * 75.0 * tt) * 0.6
            thud_noise = (random.random() * 2.0 - 1.0) * math.exp(-tt * 35.0) * 0.4
            thud = (thud_sig + thud_noise) * thud_env
            
        out[i] = creak + thud
    return out

def generate_lockpick():
    """Generates mechanical lockpick tension scrape and tumbler clicks SFX."""
    duration_sec = 1.3
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Scrape noise
        scrape = (random.random() * 2.0 - 1.0) * math.exp(-t * 2.5) * 0.1
        
        # Click 1 at 0.35s
        c1 = 0.0
        if t >= 0.35 and t < 0.5:
            ct = t - 0.35
            c1 = math.sin(2.0 * math.pi * 3200.0 * ct) * math.exp(-ct * 70.0) * 0.7
            
        # Click 2 at 0.75s
        c2 = 0.0
        if t >= 0.75 and t < 0.95:
            ct = t - 0.75
            c2 = math.sin(2.0 * math.pi * 4100.0 * ct) * math.exp(-ct * 60.0) * 0.8
            
        out[i] = scrape + c1 + c2
    return out

def generate_temple_bell():
    """Generates resonant cathedral / temple bronze bell chime SFX."""
    duration_sec = 4.0
    num_samples = int(duration_sec * SAMPLE_RATE)
    out = [0.0] * num_samples
    
    # Bronze bell frequencies: fundamental 340Hz + overtones
    partials = [
        (340.0, 0.45, 1.2),
        (560.0, 0.35, 1.8),
        (840.0, 0.25, 2.5),
        (1250.0, 0.18, 3.2),
        (1850.0, 0.12, 4.0)
    ]
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        sig = 0.0
        for freq, amp, damp in partials:
            env = math.exp(-t * damp)
            sig += math.sin(2.0 * math.pi * freq * t) * env * amp
        out[i] = sig * 0.8
    return out

def main():
    root = Path(__file__).resolve().parent.parent
    presets_dir = root / "audio_presets"
    presets_effects_dir = presets_dir / "effects"
    presets_dir.mkdir(parents=True, exist_ok=True)
    presets_effects_dir.mkdir(parents=True, exist_ok=True)
    
    phandelver_audio = root / "adventures" / "phandelver" / "audio"
    phandelver_effects = phandelver_audio / "effects"
    (phandelver_audio / "music").mkdir(parents=True, exist_ok=True)
    (phandelver_audio / "ambience").mkdir(parents=True, exist_ok=True)
    phandelver_effects.mkdir(parents=True, exist_ok=True)
    
    print("Generating DnD-Soundscape Audio Presets & 30-Effect Library...")
    
    # Music & Ambience presets
    lute = generate_tavern_lute(16.0)
    write_wav(presets_dir / "tavern_lute.wav", lute)
    write_wav(phandelver_audio / "music" / "stonehill_tavern_lute.wav", lute)
    
    campfire = generate_campfire_ambience(16.0)
    write_wav(presets_dir / "campfire_ambience.wav", campfire)
    write_wav(phandelver_audio / "ambience" / "stonehill_fireplace.wav", campfire)
    
    drone = generate_dungeon_drone(16.0)
    write_wav(presets_dir / "dungeon_drone.wav", drone)
    write_wav(phandelver_audio / "music" / "cragmaw_dungeon_drone.wav", drone)
    write_wav(phandelver_audio / "music" / "redbrand_hideout_theme.wav", drone)
    
    drips = generate_cave_drips(16.0)
    write_wav(presets_dir / "cave_drips.wav", drips)
    write_wav(phandelver_audio / "ambience" / "cragmaw_cave_drips.wav", drips)
    write_wav(phandelver_audio / "ambience" / "wave_echo_forge_hum.wav", drips)
    
    drums = generate_combat_drums(16.0)
    write_wav(presets_dir / "combat_drums.wav", drums)
    write_wav(phandelver_audio / "music" / "goblin_ambush_drums.wav", drums)
    write_wav(phandelver_audio / "music" / "wave_echo_climax_drums.wav", drums)
    
    wind = generate_forest_wind(16.0)
    write_wav(presets_dir / "forest_wind.wav", wind)
    write_wav(phandelver_audio / "ambience" / "triboar_trail_wind.wav", wind)
    write_wav(phandelver_audio / "ambience" / "thundertree_ruins_wind.wav", wind)
    
    # Synthesized Sound Effects
    thunder = generate_thunderclap()
    write_wav(presets_dir / "thunderclap.wav", thunder)
    write_wav(phandelver_effects / "thunderclap.wav", thunder)
    write_wav(presets_effects_dir / "thunderclap.wav", thunder)
    
    sword = generate_sword_clash()
    write_wav(presets_dir / "sword_clash.wav", sword)
    write_wav(phandelver_effects / "sword_clash.wav", sword)
    write_wav(presets_effects_dir / "sword_clash.wav", sword)
    
    magic = generate_spell_surge()
    write_wav(presets_dir / "spell_surge.wav", magic)
    write_wav(phandelver_effects / "spell_surge.wav", magic)
    write_wav(presets_effects_dir / "spell_surge.wav", magic)
    
    roar = generate_monster_roar()
    write_wav(presets_dir / "monster_roar.wav", roar)
    write_wav(phandelver_effects / "monster_roar.wav", roar)
    write_wav(presets_effects_dir / "monster_roar.wav", roar)
    
    shield = generate_shield_block()
    write_wav(presets_effects_dir / "shield_block.wav", shield)
    write_wav(phandelver_effects / "shield_block.wav", shield)
    
    fireball = generate_fireball()
    write_wav(presets_effects_dir / "fireball.wav", fireball)
    write_wav(phandelver_effects / "fireball.wav", fireball)
    
    potion = generate_potion_drink()
    write_wav(presets_effects_dir / "potion_drink.wav", potion)
    write_wav(phandelver_effects / "potion_drink.wav", potion)
    
    chest = generate_wooden_chest()
    write_wav(presets_effects_dir / "wooden_chest.wav", chest)
    write_wav(phandelver_effects / "wooden_chest.wav", chest)
    
    lock = generate_lockpick()
    write_wav(presets_effects_dir / "lockpick.wav", lock)
    write_wav(phandelver_effects / "lockpick.wav", lock)
    
    bell = generate_temple_bell()
    write_wav(presets_effects_dir / "temple_bell.wav", bell)
    write_wav(phandelver_effects / "temple_bell.wav", bell)
    
    # Copy all other curated adventure effects into presets_effects_dir
    import shutil
    for wav_file in phandelver_effects.glob("*.wav"):
        target_preset = presets_effects_dir / wav_file.name
        if not target_preset.exists():
            shutil.copy2(wav_file, target_preset)
            
    print(f"\n30-Effect Sound Library populated in {presets_effects_dir}: {len(list(presets_effects_dir.glob('*.wav')))} WAV files.")
    print("All DnD-Soundscape audio presets successfully generated!")

if __name__ == "__main__":
    main()
