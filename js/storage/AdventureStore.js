/**
 * DnD-Soundscape: Adventure Store & Persistence Manager
 * Manages adventure registry, loading, saving, creating, exporting, importing, and deleting.
 */

export class AdventureStore {
  constructor() {
    this.adventures = [];
    this.currentAdventure = null;
    this.storageKey = 'dnd_soundscape_adventures';
  }

  async loadAdventureList() {
    try {
      const resp = await fetch('/api/adventures');
      if (resp.ok) {
        const data = await resp.json();
        this.adventures = data.adventures || [];
        return this.adventures;
      }
    } catch (e) {
      console.warn('Could not fetch /api/adventures, checking index.json fallback:', e);
    }

    try {
      const resp = await fetch('adventures/index.json');
      if (resp.ok) {
        const data = await resp.json();
        this.adventures = data.adventures || [];
        return this.adventures;
      }
    } catch (e) {}

    const local = localStorage.getItem(this.storageKey);
    if (local) {
      try {
        this.adventures = JSON.parse(local);
        return this.adventures;
      } catch (err) {}
    }

    return [];
  }

  async loadAdventure(adventureId) {
    const path = `adventures/${adventureId}/adventure.json`;
    try {
      const resp = await fetch(path);
      if (resp.ok) {
        const data = await resp.json();
        this.currentAdventure = data;
        return data;
      }
    } catch (e) {
      console.warn(`Could not fetch ${path}, checking local cache:`, e);
    }

    const local = localStorage.getItem(`adv_${adventureId}`);
    if (local) {
      try {
        this.currentAdventure = JSON.parse(local);
        return this.currentAdventure;
      } catch (e) {}
    }

    return null;
  }

  async saveAdventure(adventureData) {
    const advId = adventureData.id;
    this.currentAdventure = adventureData;

    localStorage.setItem(`adv_${advId}`, JSON.stringify(adventureData));

    try {
      const resp = await fetch('/api/save-adventure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: advId, adventure: adventureData })
      });
      if (resp.ok) {
        const res = await resp.json();
        return { success: true, api: true, res };
      }
    } catch (e) {}

    return { success: true, api: false, message: 'Saved to browser local storage.' };
  }

  async deleteAdventure(adventureId) {
    localStorage.removeItem(`adv_${adventureId}`);
    this.adventures = this.adventures.filter(a => a.id !== adventureId);
    localStorage.setItem(this.storageKey, JSON.stringify(this.adventures));

    try {
      const resp = await fetch('/api/delete-adventure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adventureId })
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (e) {}

    return { success: true };
  }

  async createAdventure(meta) {
    const newId = meta.id || meta.title.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const newAdv = {
      id: newId,
      title: meta.title,
      subtitle: meta.subtitle || 'Custom Adventure',
      author: meta.author || 'Dungeon Master',
      version: '1.0.0',
      description: meta.description || 'Custom adventure soundscape.',
      previewImage: meta.previewImage || '../../adventures/phandelver/img/panorama.jpg',
      coverImage: meta.coverImage || '../../adventures/phandelver/img/cover.jpg',
      theme: meta.theme || 'fantasy',
      defaultCrossfadeSec: meta.defaultCrossfadeSec || 4.0,
      duckLevel: 0.35,
      masterVolume: 0.8,
      stages: meta.stages || [
        {
          id: 'stage_1',
          label: '1. Starting Location',
          type: 'roleplay',
          icon: '🍺',
          hotkey: '1',
          crossfadeSec: 4.0,
          hotspot: { x: 35.0, y: 70.0, r: 6 },
          description: 'The journey begins.',
          layers: {
            music: {
              name: 'Atmospheric Melody',
              volume: 0.65,
              playlistMode: 'loopAll',
              tracks: [{ title: 'Tavern Lute', file: '../../audio_presets/tavern_lute.wav', loopStart: 0, loopEnd: null }]
            },
            ambience: {
              name: 'Campfire',
              volume: 0.50,
              playlistMode: 'loopAll',
              tracks: [{ title: 'Campfire', file: '../../audio_presets/campfire_ambience.wav', loopStart: 0, loopEnd: null }]
            },
            effects: {
              name: 'SFX',
              volume: 0.80,
              triggers: [{ id: 'spell', label: 'Magic', icon: '✨', hotkey: 'Q', file: '../../audio_presets/spell_surge.wav' }]
            }
          }
        }
      ]
    };

    await this.saveAdventure(newAdv);

    const entry = {
      id: newId,
      title: newAdv.title,
      subtitle: newAdv.subtitle,
      author: newAdv.author,
      description: newAdv.description,
      stageCount: newAdv.stages.length,
      previewImage: newAdv.previewImage,
      coverImage: newAdv.coverImage,
      path: `adventures/${newId}/adventure.json`,
      tags: ['Custom']
    };
    
    const existingIdx = this.adventures.findIndex(a => a.id === newId);
    if (existingIdx !== -1) {
      this.adventures[existingIdx] = entry;
    } else {
      this.adventures.push(entry);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(this.adventures));

    return newAdv;
  }

  exportAdventureJson(adventureData) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(adventureData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${adventureData.id}_adventure.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  async importAdventureJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.id || !parsed.stages) {
            throw new Error('Invalid Adventure JSON format (missing id or stages)');
          }
          await this.saveAdventure(parsed);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}
