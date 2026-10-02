/**
 * DnD-Soundscape: Main Application Orchestrator & State Controller
 * Version: 1.0.0
 * Author: Krarilotus
 */

import { AudioEngine } from './audio/AudioEngine.js';
import { AdventureStore } from './storage/AdventureStore.js';
import { HubView } from './ui/HubView.js';
import { StageView } from './ui/StageView.js';
import { MixerHUD } from './ui/MixerHUD.js';
import { SoundboardModal } from './ui/SoundboardModal.js';
import { AdventureStudio } from './ui/AdventureStudio.js';
import { CreateAdventureModal } from './ui/CreateAdventureModal.js';
import { MobileConnectModal } from './ui/MobileConnectModal.js';
import { SettingsModal } from './ui/SettingsModal.js';
import { CreditsModal } from './ui/CreditsModal.js';
import { showToast } from './utils/helpers.js';

class DnDSoundscapeApp {
  constructor() {
    this.audio = new AudioEngine();
    this.store = new AdventureStore();

    this.currentView = 'stage'; // 'hub' | 'stage'
    this.currentAdventure = null;
    this.activeStage = null;
    this.isEditMode = false;

    // UI Modules
    this.hubView = null;
    this.stageView = null;
    this.mixerHUD = null;
    this.soundboardModal = null;
    this.studio = null;
    this.createModal = null;
    this.mobileModal = null;
    this.settingsModal = null;
    this.creditsModal = null;

    // DOM References
    this.mainViewContainer = null;
    this.bottomBarContainer = null;
    this.adventureSelectNav = null;
    this.startOverlay = null;

    this.init();
  }

  async init() {
    this.mainViewContainer = document.getElementById('main-view');
    this.bottomBarContainer = document.getElementById('bottom-bar-container');
    this.adventureSelectNav = document.getElementById('nav-adventure-select');
    this.startOverlay = document.getElementById('start-overlay');

    // Initialize UI sub-modules
    this.soundboardModal = new SoundboardModal(this.audio);
    this.soundboardModal.init();

    this.mobileModal = new MobileConnectModal();
    this.mobileModal.init();

    this.settingsModal = new SettingsModal(this.audio, (theme) => {
      showToast(`Switched theme to ${theme}`, 'info');
    });
    this.settingsModal.init();

    this.createModal = new CreateAdventureModal(this.store, async (newAdv) => {
      const updatedList = await this.store.loadAdventureList();
      this.updateNavDropdown(updatedList);
      this.loadAndLaunchAdventure(newAdv.id);
    });
    this.createModal.init();

    this.stageView = new StageView(
      this.mainViewContainer,
      (stage) => this.selectStage(stage),
      (stageId, x, y) => this.studio.onPinMoved(stageId, x, y),
      (stage) => this.studio.openStageInspector(stage),
      () => this.studio.addNewStage(),
      (x, y, file) => this.studio.handleFileDropOnCanvas(x, y, file),
      (stage, file) => this.studio.handleFileDropOnPin(stage, file),
      () => this.studio.exitStudioMode()
    );

    this.studio = new AdventureStudio(
      this.store,
      (updatedAdv) => this.onAdventureSaved(updatedAdv),
      this.stageView
    );
    this.studio.init();
    this.stageView.adventure = this.currentAdventure;

    this.mixerHUD = new MixerHUD(this.bottomBarContainer, this.audio, {
      onOpenSettings: () => this.settingsModal.open(),
      onOpenStudio: () => {
        if (this.currentView !== 'stage') this.showStageView();
        this.studio.toggleStudioMode(this.currentAdventure);
      },
      onOpenSoundboard: () => this.soundboardModal.open()
    });
    this.mixerHUD.render();

    this.hubView = new HubView(
      this.mainViewContainer,
      (advId) => this.loadAndLaunchAdventure(advId),
      (advId) => this.openStudioForAdventure(advId),
      () => this.createModal.open(),
      (advId) => this.exportAdventure(advId),
      (advId) => this.deleteAdventure(advId)
    );

    this.bindTopNavEvents();
    this.bindKeyboardShortcuts();

    // Load Adventures list
    const list = await this.store.loadAdventureList();
    this.updateNavDropdown(list);

    // Load default adventure (Phandelver)
    const defaultId = list.length > 0 ? list[0].id : 'phandelver';
    await this.loadAndLaunchAdventure(defaultId, false);

    // Audio Unlock button
    document.getElementById('btn-start-audio')?.addEventListener('click', () => {
      this.unlockAudio();
    });

    window.addEventListener('import-adventure-file', async (e) => {
      try {
        const adv = await this.store.importAdventureJson(e.detail);
        showToast(`Imported ${adv.title}!`, 'success');
        const updatedList = await this.store.loadAdventureList();
        this.updateNavDropdown(updatedList);
        this.loadAndLaunchAdventure(adv.id);
      } catch (err) {
        showToast(`Import failed: ${err.message}`, 'error');
      }
    });
  }

  async unlockAudio() {
    await this.audio.init();
    if (this.startOverlay) {
      this.startOverlay.classList.add('fade-out');
      setTimeout(() => this.startOverlay.remove(), 500);
    }
    if (this.currentAdventure?.stages?.length > 0) {
      this.selectStage(this.currentAdventure.stages[0]);
    }
  }

  async loadAndLaunchAdventure(adventureId, autoPlay = true) {
    const adv = await this.store.loadAdventure(adventureId);
    if (!adv) {
      showToast(`Could not load adventure: ${adventureId}`, 'error');
      return;
    }

    this.currentAdventure = adv;
    this.audio.setBasePath(`adventures/${adv.id}`);
    this.audio.setMasterVolume(adv.masterVolume || 0.8);
    this.audio.duckLevel = adv.duckLevel || 0.35;

    if (this.adventureSelectNav) {
      this.adventureSelectNav.value = adv.id;
    }

    this.showStageView();

    if (autoPlay && adv.stages && adv.stages.length > 0) {
      this.selectStage(adv.stages[0]);
    }
  }

  showStageView() {
    this.currentView = 'stage';
    this.stageView.render(this.currentAdventure, this.activeStage?.id);
    document.getElementById('btn-nav-hub')?.classList.remove('active');
  }

  showHubView() {
    this.currentView = 'hub';
    this.hubView.render(this.store.adventures);
    document.getElementById('btn-nav-hub')?.classList.add('active');
  }

  async selectStage(stage) {
    if (!stage) return;
    this.activeStage = stage;
    this.stageView.setActiveStage(stage.id);
    this.mixerHUD.updateStageInfo(stage);
    
    this.soundboardModal.setTriggers(stage.layers?.effects?.triggers || []);
    await this.audio.transitionToStage(stage);
  }

  selectStageByHotkey(key) {
    if (!this.currentAdventure?.stages) return;
    const stage = this.currentAdventure.stages.find(s => s.hotkey === key);
    if (stage) {
      this.selectStage(stage);
    }
  }

  async exportAdventure(advId) {
    const adv = await this.store.loadAdventure(advId);
    if (adv) {
      this.store.exportAdventureJson(adv);
      showToast(`Exported ${adv.title}!`, 'success');
    }
  }

  async deleteAdventure(advId) {
    if (confirm(`Are you sure you want to delete this adventure?`)) {
      await this.store.deleteAdventure(advId);
      showToast('Adventure deleted.', 'info');
      const updatedList = await this.store.loadAdventureList();
      this.updateNavDropdown(updatedList);
      this.showHubView();
    }
  }

  openStudioForAdventure(advId) {
    this.store.loadAdventure(advId).then(adv => {
      if (adv) this.studio.open(adv);
    });
  }

  toggleMapEditMode() {
    this.isEditMode = !this.isEditMode;
    this.stageView.setEditMode(this.isEditMode);
    showToast(this.isEditMode ? 'Edit Mode: Drag pins on map' : 'Saved pin positions!', 'info');
  }

  onPinMoved(stageId, x, y) {
    const stage = this.currentAdventure?.stages?.find(s => s.id === stageId);
    if (stage) {
      if (!stage.hotspot) stage.hotspot = { x, y, r: 6 };
      stage.hotspot.x = x;
      stage.hotspot.y = y;
      this.store.saveAdventure(this.currentAdventure);
    }
  }

  onAdventureSaved(updatedAdv) {
    this.currentAdventure = updatedAdv;
    this.showStageView();
    if (this.activeStage) {
      const refreshedStage = updatedAdv.stages.find(s => s.id === this.activeStage.id) || updatedAdv.stages[0];
      this.selectStage(refreshedStage);
    }
  }

  updateNavDropdown(adventures) {
    if (!this.adventureSelectNav) return;
    this.adventureSelectNav.innerHTML = adventures.map(a => `
      <option value="${a.id}">${a.title}</option>
    `).join('');
  }

  bindTopNavEvents() {
    document.getElementById('btn-nav-hub')?.addEventListener('click', () => {
      if (this.currentView === 'hub') this.showStageView();
      else this.showHubView();
    });

    document.getElementById('btn-brand-home')?.addEventListener('click', () => {
      this.showHubView();
    });

    document.getElementById('btn-nav-studio')?.addEventListener('click', () => {
      if (this.currentView !== 'stage') this.showStageView();
      if (this.currentAdventure) this.studio.toggleStudioMode(this.currentAdventure);
    });

    document.getElementById('btn-nav-credits')?.addEventListener('click', () => {
      this.creditsModal.open();
    });

    document.getElementById('btn-nav-mobile')?.addEventListener('click', () => {
      this.mobileModal.open();
    });

    document.getElementById('btn-nav-settings')?.addEventListener('click', () => {
      this.settingsModal.open();
    });

    this.adventureSelectNav?.addEventListener('change', (e) => {
      this.loadAndLaunchAdventure(e.target.value);
    });
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      const key = e.key.toLowerCase();

      // Number keys 1-9 for stages
      if (key >= '1' && key <= '9') {
        e.preventDefault();
        this.selectStageByHotkey(key);
      } else if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const isDucked = this.audio.toggleDucking();
        document.getElementById('btn-hud-duck')?.classList.toggle('active', isDucked);
      } else if (key === 'm') {
        e.preventDefault();
        this.mixerHUD.toggleMixerDrawer();
      } else if (key === 'b') {
        e.preventDefault();
        this.soundboardModal.toggle();
      } else if (key === 'n') {
        e.preventDefault();
        const musicEng = this.audio.getActiveMusicEngine();
        if (musicEng) musicEng.jumpToNext();
      } else if (key === 'escape') {
        e.preventDefault();
        if (this.studio.inspectorModal?.isOpen) this.studio.inspectorModal.close();
        else if (this.studio.isStudioActive) this.studio.exitStudioMode();
        else if (this.createModal?.isOpen) this.createModal.close();
        else if (this.mobileModal?.isOpen) this.mobileModal.close();
        else if (this.settingsModal.isOpen) this.settingsModal.close();
        else if (this.soundboardModal.isOpen) this.soundboardModal.close();
        else {
          this.audio.fadeToSilence(3.0);
          this.mixerHUD.updateStageInfo(null);
        }
      } else if (key === '+' || key === '=') {
        e.preventDefault();
        this.audio.setMasterVolume(Math.min(1.0, this.audio.masterVolume + 0.05));
        const slider = document.getElementById('slider-master-vol');
        if (slider) slider.value = this.audio.masterVolume;
        const lbl = document.getElementById('lbl-master-vol');
        if (lbl) lbl.textContent = `${Math.round(this.audio.masterVolume * 100)}%`;
      } else if (key === '-' || key === '_') {
        e.preventDefault();
        this.audio.setMasterVolume(Math.max(0.0, this.audio.masterVolume - 0.05));
        const slider = document.getElementById('slider-master-vol');
        if (slider) slider.value = this.audio.masterVolume;
        const lbl = document.getElementById('lbl-master-vol');
        if (lbl) lbl.textContent = `${Math.round(this.audio.masterVolume * 100)}%`;
      } else if (['q', 'w', 'e', 'r'].includes(key)) {
        const trigger = this.soundboardModal.triggers.find(t => (t.hotkey || '').toLowerCase() === key);
        if (trigger) {
          e.preventDefault();
          this.soundboardModal.triggerEffect(trigger.id);
        }
      }
    });
  }
}

// Bootstrap on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new DnDSoundscapeApp();
});
