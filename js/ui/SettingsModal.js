/**
 * DnD-Soundscape: Global Settings Modal Component
 */

export class SettingsModal {
  constructor(audioEngine, onThemeChange, onOpenSoundboard = null) {
    this.onOpenSoundboard = onOpenSoundboard;
    this.audio = audioEngine;
    this.onThemeChange = onThemeChange;
    this.modalEl = null;
    this.isOpen = false;
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

    this.modalEl.innerHTML = `
      <div class="modal-window" style="max-width: 680px;">
        <header class="modal-header">
          <h2>
            <span>⚙️</span>
            <span>Global Settings & Keyboard Shortcuts</span>
          </h2>
          <button id="btn-settings-close" class="btn-icon" aria-label="Close">✕</button>
        </header>

        <div class="modal-body" style="flex-direction: column; gap: 20px;">
          <!-- UI Theme Selection -->
          <div class="form-group">
            <label>UI Theme</label>
            <select id="select-theme" class="form-select">
              <option value="default">✨ Luminous Fantasy Obsidian & Gold (Default)</option>
              <option value="parchment">📜 Classic D&D Parchment</option>
              <option value="cyber-slate">🛡️ Modern Slate Steel</option>
            </select>
          </div>

          <!-- Audio Engine Defaults -->
          <div class="form-row-2">
            <div class="form-group">
              <label>Default Ducking Level ("Vorlesen")</label>
              <select id="select-duck-level" class="form-select">
                <option value="0.20">20% (Subtle background)</option>
                <option value="0.35" selected>35% (Balanced DM Voice)</option>
                <option value="0.50">50% (Gentle reduction)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Default Crossfade Profile</label>
              <select id="select-default-crossfade" class="form-select">
                <option value="1.5">⚡ Fast (1.5s - Action)</option>
                <option value="4.0" selected>✨ Standard (4.0s - Exploration)</option>
                <option value="8.0">🎬 Cinematic Slow (8.0s)</option>
              </select>
            </div>
          </div>

                    <!-- Instant SFX Soundboard Launcher (Moved from bottom bar) -->
          <div style="background: rgba(212, 175, 55, 0.08); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 600; color: #fff; font-size: 14px;">⚡ Instant SFX Soundboard Pad</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Trigger stage combat and roleplay sound effects (Hotkey: <kbd>B</kbd>).</div>
            </div>
            <button type="button" id="btn-settings-soundboard" class="btn-secondary" style="border-color: var(--gold-primary); color: var(--gold-light);">
              Open Pad
            </button>
          </div>

          <!-- Keyboard Shortcuts Cheatsheet -->
          <div>
            <label style="font-size: 12.5px; font-weight: 600; color: var(--gold-light); text-transform: uppercase;">
              Tabletop Keyboard Cheatsheet
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; background: rgba(0,0,0,0.3); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: 13px;">
              <div><kbd>1</kbd>–<kbd>9</kbd> <span style="color: var(--text-muted);">Switch Stages with Crossfade</span></div>
              <div><kbd>Space</kbd> <span style="color: var(--text-muted);">Toggle DM Speech Ducking</span></div>
              <div><kbd>B</kbd> <span style="color: var(--text-muted);">Open SFX Soundboard Pad</span></div>
              <div><kbd>M</kbd> <span style="color: var(--text-muted);">Toggle 3-Layer Live Mixer</span></div>
              <div><kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd> <span style="color: var(--text-muted);">Instant SFX Triggers</span></div>
              <div><kbd>Esc</kbd> <span style="color: var(--text-muted);">Fade to Silence / Close Modal</span></div>
              <div><kbd>+</kbd> / <kbd>-</kbd> <span style="color: var(--text-muted);">Adjust Master Volume</span></div>
              <div><kbd>F</kbd> <span style="color: var(--text-muted);">Toggle Fullscreen</span></div>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button id="btn-settings-done" class="btn-primary">Done</button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelector('#btn-settings-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-settings-done')?.addEventListener('click', () => this.close());
    
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

        this.modalEl.querySelector('#btn-settings-soundboard')?.addEventListener('click', () => {
      this.close();
      if (this.onOpenSoundboard) this.onOpenSoundboard();
    });

    const themeSelect = document.getElementById('select-theme');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        if (theme === 'default') {
          document.body.removeAttribute('data-theme');
        } else {
          document.body.setAttribute('data-theme', theme);
        }
        if (this.onThemeChange) this.onThemeChange(theme);
      });
    }

    const duckSelect = document.getElementById('select-duck-level');
    if (duckSelect) {
      duckSelect.addEventListener('change', (e) => {
        this.audio.duckLevel = parseFloat(e.target.value);
      });
    }
  }

  open() {
    if (!this.modalEl) this.init();
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
