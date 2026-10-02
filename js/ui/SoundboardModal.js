/**
 * DnD-Soundscape: Soundboard SFX Trigger Modal Component
 * Renders stage-specific sound effects with keyboard hotkeys and full attribution.
 */

export class SoundboardModal {
  constructor(audioEngine) {
    this.audio = audioEngine;
    this.modalEl = null;
    this.triggers = [];
    this.isOpen = false;
  }

  init() {
    let el = document.getElementById('soundboard-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'soundboard-modal';
      el.className = 'modal-backdrop hidden';
      document.body.appendChild(el);
    }
    this.modalEl = el;
    this.render();
  }

  setTriggers(stageTriggers = []) {
    if (stageTriggers && stageTriggers.length > 0) {
      this.triggers = stageTriggers;
    } else {
      this.triggers = [
        { id: 'cheer', label: 'Tankard Cheer', icon: '🍻', hotkey: 'Q', file: 'audio/effects/tankard_clink.wav', credit: 'Herbert Nicolas' },
        { id: 'coins', label: 'Coin Purse', icon: '🪙', hotkey: 'W', file: 'audio/effects/coin_purse.wav', credit: 'Sound Around' },
        { id: 'door', label: 'Tavern Door', icon: '🚪', hotkey: 'E', file: 'audio/effects/tavern_door.wav', credit: 'Free Audio Zone' }
      ];
    }
    this.render();
  }

  render() {
    if (!this.modalEl) return;

    this.modalEl.innerHTML = `
      <div class="modal-window" style="max-width: 680px;">
        <header class="modal-header">
          <h2>
            <span>⚡</span>
            <span>Instant SFX Soundboard</span>
          </h2>
          <button id="btn-close-soundboard" class="btn-icon" aria-label="Close">✕</button>
        </header>

        <div class="modal-body" style="flex-direction: column;">
          <p style="color: var(--text-muted); font-size: 13.5px; margin-bottom: 16px;">
            Stage-specific sound effects tailored to this encounter. Press hotkeys <kbd>Q</kbd>, <kbd>W</kbd>, <kbd>E</kbd> or click to trigger.
          </p>
          <div class="sfx-grid">
            ${this.triggers.map(t => `
              <button class="sfx-pad-btn" data-id="${t.id}" title="${t.label} (Credit: ${t.credit || 'Tabletop SFX'} ${t.sourceUrl ? `— ${t.sourceUrl}` : ''})">
                ${t.hotkey ? `<kbd class="sfx-pad-hotkey">${t.hotkey}</kbd>` : ''}
                <span class="sfx-pad-icon">${t.icon || '⚡'}</span>
                <span class="sfx-pad-label">${t.label}</span>
                <span style="font-size: 10px; color: var(--gold-light); opacity: 0.85; margin-top: 2px;">
                  👤 ${t.credit || 'SFX'}
                </span>
              </button>
            `).join('')}
          </div>
        </div>

        <footer class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11.5px; color: var(--text-muted);">
            Attributed & tailored per stage.
          </span>
          <button id="btn-soundboard-done" class="btn-primary">Done</button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelector('#btn-close-soundboard')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-soundboard-done')?.addEventListener('click', () => this.close());
    
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    this.modalEl.querySelectorAll('.sfx-pad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.triggerEffect(id, btn);
      });
    });
  }

  triggerEffect(id, btnEl = null) {
    if (!btnEl && this.modalEl) {
      btnEl = this.modalEl.querySelector(`.sfx-pad-btn[data-id="${id}"]`);
    }

    if (btnEl) {
      btnEl.classList.add('active');
      setTimeout(() => btnEl.classList.remove('active'), 250);
    }

    const trig = this.triggers.find(t => t.id === id);
    if (trig && trig.file) {
      let fileUrl = trig.file;
      if (!fileUrl.startsWith('http') && !fileUrl.startsWith('/')) {
        fileUrl = `adventures/phandelver/${fileUrl}`;
      }
      this.audio.playOneShot(fileUrl, 0.85);
    }
  }

  open() {
    if (!this.modalEl) this.init();
    this.isOpen = true;
    this.render();
    this.modalEl.classList.remove('hidden');
  }

  close() {
    this.isOpen = false;
    if (this.modalEl) this.modalEl.classList.add('hidden');
  }
}
