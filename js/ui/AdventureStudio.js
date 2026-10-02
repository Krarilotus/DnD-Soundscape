/**
 * DnD-Soundscape: Modern Studio Manager & Map-Centric Orchestrator
 * Integrates StageView visual dragging, StageInspectorModal popup window,
 * emoji catalog picker, 3-layer volume sliders, cue points, and drag-and-drop file imports.
 */

import { generateId, showToast } from '../utils/helpers.js';
import { StageInspectorModal } from './StageInspectorModal.js';

export class AdventureStudio {
  constructor(adventureStore, onSaveCallback, stageViewRef = null) {
    this.store = adventureStore;
    this.onSaveCallback = onSaveCallback;
    this.stageView = stageViewRef;

    this.adventure = null;
    this.isStudioActive = false;

    this.inspectorModal = new StageInspectorModal({
      onSave: (stage) => this.onStageSaved(stage),
      onDelete: (stageId) => this.deleteStage(stageId),
      onStageUpdated: (stage) => this.onLiveStageUpdated(stage)
    });
  }

  init() {
    this.inspectorModal.init();
  }

  setStageView(stageView) {
    this.stageView = stageView;
  }

  toggleStudioMode(adventure) {
    if (this.isStudioActive) {
      this.exitStudioMode();
    } else {
      this.enterStudioMode(adventure);
    }
  }

  enterStudioMode(adventure) {
    this.adventure = JSON.parse(JSON.stringify(adventure)); // deep clone
    this.isStudioActive = true;

    if (this.stageView) {
      this.stageView.adventure = this.adventure;
      this.stageView.setEditMode(true);
    }

    document.getElementById('btn-nav-studio')?.classList.add('active');
  }

  exitStudioMode() {
    this.isStudioActive = false;
    if (this.stageView) {
      this.stageView.setEditMode(false);
    }
    document.getElementById('btn-nav-studio')?.classList.remove('active');
  }

  openStageInspector(stage) {
    if (!this.adventure) return;
    const existing = this.adventure.stages.find(s => s.id === stage.id);
    this.inspectorModal.open(existing || stage, this.adventure);
  }

  addNewStage(coords = { x: 50, y: 50 }, initialTrack = null) {
    if (!this.adventure) return;
    if (!this.adventure.stages) this.adventure.stages = [];

    const stageNum = this.adventure.stages.length + 1;
    const newStage = {
      id: generateId('stage'),
      label: `${stageNum}. New Location`,
      type: 'roleplay',
      icon: '🗺️',
      hotkey: stageNum <= 9 ? String(stageNum) : '',
      crossfadeSec: 4.0,
      hotspot: { x: coords.x || 50, y: coords.y || 50, r: 6 },
      description: 'Atmospheric description for this scene...',
      layers: {
        music: {
          name: 'Music Layer',
          volume: 0.7,
          tracks: initialTrack?.layer === 'music' ? [initialTrack] : [
            {
              title: 'Cozy Tavern Strings',
              file: 'audio/music/tavern_strings.mp3',
              startSec: 0,
              endSec: null
            }
          ]
        },
        ambience: {
          name: 'Ambience Layer',
          volume: 0.55,
          tracks: initialTrack?.layer === 'ambience' ? [initialTrack] : [
            {
              title: 'Crackling Hearthfire Ambience',
              file: 'audio/ambience/hearthfire_ambience.mp3',
              startSec: 0,
              endSec: null
            }
          ]
        },
        effects: {
          name: 'Effects Layer',
          volume: 0.85,
          triggers: initialTrack?.layer === 'effects' ? [initialTrack] : [
            {
              id: generateId('sfx'),
              label: 'Sword Clash',
              icon: '⚔️',
              hotkey: 'Q',
              file: 'audio/effects/sword_clash.wav'
            }
          ]
        }
      }
    };

    this.adventure.stages.push(newStage);
    this.saveAdventure();
    if (this.stageView) {
      this.stageView.render(this.adventure, newStage.id);
    }
    this.inspectorModal.open(newStage, this.adventure);
    showToast(`Added: ${newStage.label}`, 'success');
  }

  deleteStage(stageId) {
    if (!this.adventure || !this.adventure.stages) return;
    const idx = this.adventure.stages.findIndex(s => s.id === stageId);
    if (idx !== -1) {
      const removed = this.adventure.stages.splice(idx, 1)[0];
      this.saveAdventure();
      if (this.stageView) {
        this.stageView.render(this.adventure);
      }
      showToast(`Deleted ${removed.label}`, 'info');
    }
  }

  onPinMoved(stageId, xPercent, yPercent) {
    if (!this.adventure?.stages) return;
    const stage = this.adventure.stages.find(s => s.id === stageId);
    if (stage) {
      if (!stage.hotspot) stage.hotspot = { x: 50, y: 50, r: 6 };
      stage.hotspot.x = xPercent;
      stage.hotspot.y = yPercent;
      this.saveAdventure();
    }
  }

  onLiveStageUpdated(updatedStage) {
    if (!this.adventure?.stages) return;
    const idx = this.adventure.stages.findIndex(s => s.id === updatedStage.id);
    if (idx !== -1) {
      this.adventure.stages[idx] = updatedStage;
      if (this.stageView) {
        this.stageView.renderPins();
      }
    }
  }

  onStageSaved(stage) {
    this.onLiveStageUpdated(stage);
    this.saveAdventure();
    showToast(`Saved ${stage.label}!`, 'success');
  }

  async saveAdventure() {
    if (!this.adventure) return;
    try {
      await this.store.saveAdventure(this.adventure);
      if (this.onSaveCallback) {
        this.onSaveCallback(this.adventure);
      }
    } catch (e) {
      console.error('Failed to save adventure:', e);
      showToast('Error saving adventure changes.', 'error');
    }
  }

  async handleFileDropOnCanvas(x, y, file) {
    const fileName = file.name;
    const relPath = `audio/music/${fileName}`;

    const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const initialTrack = {
      layer: 'music',
      title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      file: relPath,
      startSec: 0,
      endSec: null
    };

    this.addNewStage({ x, y }, initialTrack);
  }

  handleFileDropOnPin(stage, file) {
    this.openStageInspector(stage);
    const fn = file.name.toLowerCase();
    let layer = 'music';
    if (fn.includes('amb') || fn.includes('wind') || fn.includes('rain') || fn.includes('fire')) {
      layer = 'ambience';
    } else if (fn.includes('fx') || fn.includes('sfx') || fn.includes('clash') || fn.includes('roar') || fn.includes('spell')) {
      layer = 'effects';
    }

    const relPath = `audio/${layer}/${file.name}`;
    this.inspectorModal.addTrackFromDrop(layer, file.name, relPath);
  }
}
