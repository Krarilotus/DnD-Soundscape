/**
 * DnD-Soundscape: Credits & Source Attribution Modal
 * Provides an obvious, comprehensive registry of all audio sources,
 * artists, licenses, and links across the active adventure.
 */

import { showToast } from '../utils/helpers.js';

export class CreditsModal {
  constructor(adventureStore) {
    this.store = adventureStore;
    this.modalEl = null;
    this.isOpen = false;
    this.filterQuery = '';
  }

  init() {
    let el = document.getElementById('credits-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'credits-modal';
      el.className = 'modal-backdrop hidden';
      document.body.appendChild(el);
    }
    this.modalEl = el;
  }

  open() {
    if (!this.modalEl) this.init();
    this.isOpen = true;
    this.filterQuery = '';
    this.render();
    this.modalEl.classList.remove('hidden');
  }

  close() {
    this.isOpen = false;
    if (this.modalEl) this.modalEl.classList.add('hidden');
  }

  render() {
    if (!this.modalEl) return;
    const adv = this.store.getActiveAdventure();
    const stages = adv?.stages || [];

    const query = this.filterQuery.toLowerCase().trim();

    this.modalEl.innerHTML = `
      <div class="modal-window credits-modal-window" style="max-width: 780px; max-height: 85vh; display: flex; flex-direction: column;">
        <header class="modal-header" style="flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">📜</span>
            <div>
              <h2 style="font-size: 18px; margin: 0; font-weight: 700;">Audio Credits & Attributions</h2>
              <p style="margin: 2px 0 0; font-size: 12.5px; color: var(--text-muted);">${adv?.title || 'Adventure'} · Complete Audio Registry</p>
            </div>
          </div>
          <button type="button" id="btn-credits-close" class="btn-icon" aria-label="Close">✕</button>
        </header>

        <div style="padding: 12px 20px; background: rgba(0,0,0,0.25); border-bottom: 1px solid var(--border-color); display: flex; gap: 12px; align-items: center; flex-shrink: 0;">
          <input type="text" id="credits-search" class="form-input" style="flex: 1; padding: 6px 12px; font-size: 13px;" placeholder="Search tracks, artists, or sources..." value="${this.filterQuery}">
          <button type="button" id="btn-copy-credits-md" class="btn-secondary" style="font-size: 12.5px; padding: 6px 12px; white-space: nowrap;" title="Copy formatted markdown list for YouTube or Stream description">
            📋 Copy Markdown
          </button>
        </div>

        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 16px;">
          <div class="credits-stages-list" style="display: flex; flex-direction: column; gap: 16px;">
            ${stages.map((stage) => {
              const music = stage.layers?.music?.tracks?.[0] || {};
              const amb = stage.layers?.ambience?.tracks?.[0] || {};
              const triggers = stage.layers?.effects?.triggers || [];

              const matchesStage = !query || 
                stage.label.toLowerCase().includes(query) ||
                (music.title && music.title.toLowerCase().includes(query)) ||
                (music.credit && music.credit.toLowerCase().includes(query)) ||
                (amb.title && amb.title.toLowerCase().includes(query)) ||
                (amb.credit && amb.credit.toLowerCase().includes(query)) ||
                triggers.some(t => (t.label && t.label.toLowerCase().includes(query)) || (t.credit && t.credit.toLowerCase().includes(query)));

              if (!matchesStage) return '';

              return `
                <div class="credits-stage-card" style="background: rgba(255,255,255,0.025); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <span style="font-size: 18px;">${stage.icon || '📍'}</span>
                    <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #fff;">${stage.label}</h3>
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <!-- Music -->
                    <div style="display: flex; align-items: baseline; gap: 10px; font-size: 13px;">
                      <span style="font-weight: 600; color: #a0aec0; width: 85px; flex-shrink: 0;">🎵 Music:</span>
                      <div style="flex: 1;">
                        <span style="color: #edf2f7; font-weight: 500;">${music.title || 'None'}</span>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                          <span style="font-size: 11.5px; color: #cbd5e0;">👤 ${music.credit || 'Standard Tabletop Audio'}</span>
                          ${music.sourceUrl ? `
                            <a href="${music.sourceUrl}" target="_blank" rel="noopener" style="font-size: 11.5px; color: var(--accent-gold); text-decoration: underline;">
                              🔗 Source Link ↗
                            </a>
                          ` : '<span style="font-size: 11px; color: #718096;">Local Soundscape Audio</span>'}
                        </div>
                      </div>
                    </div>

                    <!-- Ambience -->
                    <div style="display: flex; align-items: baseline; gap: 10px; font-size: 13px;">
                      <span style="font-weight: 600; color: #a0aec0; width: 85px; flex-shrink: 0;">🌲 Ambience:</span>
                      <div style="flex: 1;">
                        <span style="color: #edf2f7; font-weight: 500;">${amb.title || 'None'}</span>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                          <span style="font-size: 11.5px; color: #cbd5e0;">👤 ${amb.credit || 'Standard Tabletop Ambience'}</span>
                          ${amb.sourceUrl ? `
                            <a href="${amb.sourceUrl}" target="_blank" rel="noopener" style="font-size: 11.5px; color: var(--accent-gold); text-decoration: underline;">
                              🔗 Source Link ↗
                            </a>
                          ` : '<span style="font-size: 11px; color: #718096;">Local Soundscape Audio</span>'}
                        </div>
                      </div>
                    </div>

                    <!-- SFX Triggers -->
                    ${triggers.length > 0 ? `
                      <div style="display: flex; align-items: baseline; gap: 10px; font-size: 13px; margin-top: 4px;">
                        <span style="font-weight: 600; color: #a0aec0; width: 85px; flex-shrink: 0;">⚡ SFX:</span>
                        <div style="flex: 1; display: flex; flex-wrap: wrap; gap: 8px;">
                          ${triggers.map(t => `
                            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 4px 8px; font-size: 11.5px; display: inline-flex; align-items: center; gap: 5px;">
                              <span>${t.icon || '⚡'}</span>
                              <span style="color: #fff; font-weight: 500;">${t.label}</span>
                              <span style="color: #a0aec0;">(${t.credit || 'SFX'})</span>
                              ${t.sourceUrl ? `<a href="${t.sourceUrl}" target="_blank" rel="noopener" style="color: var(--accent-gold); margin-left: 2px;">↗</a>` : ''}
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <footer class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
          <span style="font-size: 12px; color: var(--text-muted);">
            All audio assets curated and attributed to original creators.
          </span>
          <button type="button" id="btn-credits-done" class="btn-primary">Done</button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelector('#btn-credits-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-credits-done')?.addEventListener('click', () => this.close());

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    const searchInput = this.modalEl.querySelector('#credits-search');
    searchInput?.addEventListener('input', (e) => {
      this.filterQuery = e.target.value;
      this.render();
      const el = this.modalEl.querySelector('#credits-search');
      if (el) {
        el.focus();
        el.setSelectionRange(this.filterQuery.length, this.filterQuery.length);
      }
    });

    this.modalEl.querySelector('#btn-copy-credits-md')?.addEventListener('click', () => {
      this.copyMarkdownCredits();
    });
  }

  copyMarkdownCredits() {
    const adv = this.store.getActiveAdventure();
    const stages = adv?.stages || [];
    let md = `# Audio Credits & Attributions - ${adv?.title || 'Adventure'}\n\n`;

    stages.forEach((stage) => {
      md += `### ${stage.label}\n`;
      const music = stage.layers?.music?.tracks?.[0];
      if (music) {
        md += `- **Music**: ${music.title} — *${music.credit || 'Standard Audio'}* ${music.sourceUrl ? `([Source](${music.sourceUrl}))` : ''}\n`;
      }
      const amb = stage.layers?.ambience?.tracks?.[0];
      if (amb) {
        md += `- **Ambience**: ${amb.title} — *${amb.credit || 'Standard Ambience'}* ${amb.sourceUrl ? `([Source](${amb.sourceUrl}))` : ''}\n`;
      }
      const triggers = stage.layers?.effects?.triggers || [];
      if (triggers.length > 0) {
        md += `- **Sound Effects**:\n`;
        triggers.forEach(t => {
          md += `  - ${t.icon || '⚡'} **${t.label}**: *${t.credit || 'RPG Soundcraft'}* ${t.sourceUrl ? `([Source](${t.sourceUrl}))` : ''}\n`;
        });
      }
      md += '\n';
    });

    navigator.clipboard.writeText(md).then(() => {
      showToast('Credits copied to clipboard as Markdown!', 'success');
    }).catch(() => {
      showToast('Could not copy to clipboard', 'warning');
    });
  }
}
