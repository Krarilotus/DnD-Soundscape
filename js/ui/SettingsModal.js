/**
 * DnD-Soundscape: Global Settings & Theme Catalog Modal Component
 * Features an interactive visual Theme Catalog with palette swatches,
 * font specimens, custom assets, and tabletop audio engine controls.
 */

import { ThemeCatalog } from './ThemeCatalog.js';
import { FantasyIcons } from './FantasyIcons.js';
import { showToast } from '../utils/helpers.js';

export class SettingsModal {
  constructor(audioEngine, onThemeChange, onOpenSoundboard = null) {
    this.onOpenSoundboard = onOpenSoundboard;
    this.audio = audioEngine;
    this.onThemeChange = onThemeChange;
    this.modalEl = null;
    this.isOpen = false;
    this.activeTab = 'themes'; // 'themes' | 'audio'
  }

  init() {
    let el = document.getElementById('settings-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'settings-modal';
      el.className = 'modal-backdrop hidden';
      document.body.appendChild(el);
    }
    this.modalEl = el;
    this.render();
  }

  render() {
    if (!this.modalEl) return;

    const currentTheme = ThemeCatalog.getCurrentTheme();

    this.modalEl.innerHTML = `
      <div class="modal-window theme-card" style="max-width: 820px; max-height: 90vh; display: flex; flex-direction: column;">
        <!-- Modal Header -->
        <header class="modal-header" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid var(--theme-border-base);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: var(--theme-primary); filter: drop-shadow(0 0 10px var(--theme-glow));">
              ${FantasyIcons.get('palette', { size: 24 })}
            </span>
            <h2 style="margin: 0; font-size: 20px;">Theme Catalog & Settings</h2>
          </div>
          <button id="btn-settings-close" class="btn-icon" aria-label="Close" title="Close Settings (Esc)">
            ${FantasyIcons.get('close', { size: 18 })}
          </button>
        </header>

        <!-- Subnav Tabs -->
        <div style="display: flex; gap: 8px; padding: 12px 24px 0 24px; border-bottom: 1px solid var(--theme-border-base); background: rgba(0,0,0,0.2);">
          <button type="button" id="tab-btn-themes" class="btn-secondary ${this.activeTab === 'themes' ? 'active' : ''}" style="
            border-bottom: none;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            padding: 8px 18px;
            font-size: 13.5px;
            font-weight: 600;
            color: ${this.activeTab === 'themes' ? 'var(--theme-primary-light)' : 'var(--theme-text-muted)'};
            border-color: ${this.activeTab === 'themes' ? 'var(--theme-border-highlight)' : 'transparent'};
            background: ${this.activeTab === 'themes' ? 'var(--theme-bg-card)' : 'transparent'};
          ">
            ${FantasyIcons.get('palette', { size: 16 })}
            <span>Theme Catalog (${ThemeCatalog.getAll().length} Themes)</span>
          </button>

          <button type="button" id="tab-btn-audio" class="btn-secondary ${this.activeTab === 'audio' ? 'active' : ''}" style="
            border-bottom: none;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            padding: 8px 18px;
            font-size: 13.5px;
            font-weight: 600;
            color: ${this.activeTab === 'audio' ? 'var(--theme-primary-light)' : 'var(--theme-text-muted)'};
            border-color: ${this.activeTab === 'audio' ? 'var(--theme-border-highlight)' : 'transparent'};
            background: ${this.activeTab === 'audio' ? 'var(--theme-bg-card)' : 'transparent'};
          ">
            ${FantasyIcons.get('sliders', { size: 16 })}
            <span>Audio & Tabletop Controls</span>
          </button>
        </div>

        <!-- Modal Body Content -->
        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 22px 24px; flex-direction: column; gap: 20px;">
          ${this.activeTab === 'themes' ? this.renderThemesTab(currentTheme) : this.renderAudioTab()}
        </div>

        <!-- Modal Footer -->
        <footer class="modal-footer" style="padding: 14px 24px; border-top: 1px solid var(--theme-border-base); display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; color: var(--theme-text-muted); display: flex; align-items: center; gap: 8px;">
            ${FantasyIcons.get('spark', { size: 14 })}
            <span>Active: <strong style="color: var(--theme-primary);">${ThemeCatalog.getTheme(currentTheme).name}</strong></span>
          </div>
          <button id="btn-settings-done" class="btn-primary">Done</button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  renderThemesTab(currentTheme) {
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 16px; margin: 0 0 4px 0; color: var(--theme-text-title);">Select Bespoke Tabletop Theme</h3>
            <p style="font-size: 13px; color: var(--theme-text-muted); margin: 0;">
              Transform colors, materials, custom icons, typography, and card accents without reloading.
            </p>
          </div>
        </div>

        <!-- Themed Divider -->
        <div class="theme-divider">
          <span class="theme-divider-icon">
            ${FantasyIcons.get('spark', { size: 14 })}
          </span>
        </div>

        <!-- Render Rich Interactive Theme Cards Grid -->
        ${ThemeCatalog.renderCatalogGrid(currentTheme)}
      </div>
    `;
  }

  renderAudioTab() {
    return `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <!-- Audio Engine Defaults -->
        <div class="form-row-2">
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 6px;">
              ${FantasyIcons.get('speech', { size: 16 })}
              <span>Default Ducking Level ("Vorlesen")</span>
            </label>
            <select id="select-duck-level" class="form-select">
              <option value="0.20" ${this.audio.duckLevel === 0.2 ? 'selected' : ''}>20% (Subtle background)</option>
              <option value="0.35" ${this.audio.duckLevel === 0.35 ? 'selected' : ''}>35% (Balanced DM Voice)</option>
              <option value="0.50" ${this.audio.duckLevel === 0.5 ? 'selected' : ''}>50% (Gentle reduction)</option>
            </select>
          </div>
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 6px;">
              ${FantasyIcons.get('spark', { size: 16 })}
              <span>Default Crossfade Profile</span>
            </label>
            <select id="select-default-crossfade" class="form-select">
              <option value="1.5">Fast (1.5s - Action)</option>
              <option value="4.0" selected>Standard (4.0s - Exploration)</option>
              <option value="8.0">Cinematic Slow (8.0s)</option>
            </select>
          </div>
        </div>

        <!-- Instant SFX Soundboard Launcher -->
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid var(--theme-border-highlight); border-radius: var(--theme-radius-md); padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight: 600; color: #fff; font-size: 14px; display: flex; align-items: center; gap: 8px;">
              ${FantasyIcons.get('lightning', { size: 18 })}
              <span>Instant SFX Soundboard Pad</span>
            </div>
            <div style="font-size: 12px; color: var(--theme-text-muted); margin-top: 4px;">Trigger stage combat and roleplay sound effects (Hotkey: <kbd>B</kbd>).</div>
          </div>
          <button type="button" id="btn-settings-soundboard" class="btn-secondary" style="border-color: var(--theme-primary); color: var(--theme-primary-light);">
            ${FantasyIcons.get('d20', { size: 16 })}
            <span>Open Pad</span>
          </button>
        </div>

        <!-- Themed Divider -->
        <div class="theme-divider">
          <span class="theme-divider-icon">
            ${FantasyIcons.get('sword', { size: 14 })}
          </span>
        </div>

        <!-- Keyboard Shortcuts Cheatsheet -->
        <div>
          <label style="font-size: 12.5px; font-weight: 600; color: var(--theme-primary-light); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px;">
            ${FantasyIcons.get('d20', { size: 16 })}
            <span>Tabletop Keyboard Cheatsheet</span>
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; background: rgba(0,0,0,0.3); padding: 16px; border-radius: var(--theme-radius-md); border: 1px solid var(--theme-border-base); font-size: 13px;">
            <div><kbd>1</kbd>–<kbd>9</kbd> <span style="color: var(--theme-text-muted);">Switch Stages with Crossfade</span></div>
            <div><kbd>Space</kbd> <span style="color: var(--theme-text-muted);">Toggle DM Speech Ducking</span></div>
            <div><kbd>B</kbd> <span style="color: var(--theme-text-muted);">Open Scene Effect Board (Drawer)</span></div>
            <div><kbd>M</kbd> <span style="color: var(--theme-text-muted);">Toggle 3-Layer Live Mixer</span></div>
            <div><kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd> <span style="color: var(--theme-text-muted);">Trigger Scene Sound Effects</span></div>
            <div><kbd>Esc</kbd> <span style="color: var(--theme-text-muted);">Fade to Silence / Close Modal</span></div>
            <div><kbd>+</kbd> / <kbd>-</kbd> <span style="color: var(--theme-text-muted);">Adjust Master Volume</span></div>
            <div><kbd>F</kbd> <span style="color: var(--theme-text-muted);">Toggle Fullscreen</span></div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.modalEl.querySelector('#btn-settings-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-settings-done')?.addEventListener('click', () => this.close());
    
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    // Tab navigation
    this.modalEl.querySelector('#tab-btn-themes')?.addEventListener('click', () => {
      this.activeTab = 'themes';
      this.render();
    });

    this.modalEl.querySelector('#tab-btn-audio')?.addEventListener('click', () => {
      this.activeTab = 'audio';
      this.render();
    });

    this.modalEl.querySelector('#btn-settings-soundboard')?.addEventListener('click', () => {
      this.close();
      if (this.onOpenSoundboard) this.onOpenSoundboard();
    });

    // Handle "Equip Theme" clicks
    this.modalEl.querySelectorAll('.btn-equip-theme').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const themeId = e.currentTarget.getAttribute('data-theme');
        if (themeId) {
          const newTheme = ThemeCatalog.applyTheme(themeId);
          showToast(`Equipped theme: ${newTheme.name}!`, 'success');
          if (this.onThemeChange) this.onThemeChange(themeId);
          this.render();
        }
      });
    });

    const duckSelect = this.modalEl.querySelector('#select-duck-level');
    if (duckSelect) {
      duckSelect.addEventListener('change', (e) => {
        this.audio.duckLevel = parseFloat(e.target.value);
        showToast(`Ducking level set to ${Math.round(this.audio.duckLevel * 100)}%`, 'info');
      });
    }
  }

  open() {
    if (!this.modalEl) this.init();
    this.render();
    this.modalEl.classList.remove('hidden');
    this.isOpen = true;
  }

  close() {
    if (this.modalEl) this.modalEl.classList.add('hidden');
    this.isOpen = false;
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }
}
