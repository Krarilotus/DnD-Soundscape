/**
 * DnD-Soundscape: Soundboard SFX Trigger Modal Component
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
    // Default standard fantasy SFX bank + current stage triggers
    const globalBank = [
      { id: 'sword', label: 'Sword Clash', icon: '⚔️', hotkey: 'Q', file: 'audio/effects/sword_clash.wav' },
      { id: 'roar', label: 'Monster Roar', icon: '🐉', hotkey: 'W', file: 'audio/effects/monster_roar.wav' },
      { id: 'spell', label: 'Magic Surge', icon: '🔮', hotkey: 'E', file: 'audio/effects/spell_surge.wav' },
      { id: 'thunder', label: 'Thunderclap', icon: '⚡', hotkey: 'R', file: 'audio/effects/thunderclap.wav' }
    ];

    const map = new Map();
    globalBank.forEach(t => map.set(t.id, t));
    stageTriggers.forEach(t => map.set(t.id, t));

    this.triggers = Array.from(map.values());
    this.render();
  }

  render() {
    if (!this.modalEl) return;

    this.modalEl.innerHTML = `
      <div class="modal-window" style="max-width: 640px;">
        <header class="modal-header">
          <h2>
            <span>⚡</span>
            <span>Instant SFX Soundboard</span>
          </h2>
          <button id="btn-close-soundboard" class="btn-icon" aria-label="Close">✕</button>
        </header>

        <div class="modal-body" style="flex-direction: column;">
          <p style="color: var(--text-muted); font-size: 13.5px; margin-bottom: 16px;">
            Trigger instantaneous sound effects for your tabletop session. Use keyboard hotkeys or click pads.
          </p>
          <div class="sfx-grid">
            ${this.triggers.map(t => `
              <button class="sfx-pad-btn" data-id="${t.id}">
                ${t.hotkey ? `<kbd class="sfx-pad-hotkey">${t.hotkey}</kbd>` : ''}
                <span class="sfx-pad-icon">${t.icon || '⚡'}</span>
                <span class="sfx-pad-label">${t.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <footer class="modal-footer">
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
      btnEl.classList.add('triggered');
      setTimeout(() => btnEl.classList.remove('triggered'), 200);
    }

    this.audio.playSFX(id);
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
