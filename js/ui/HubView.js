/**
 * DnD-Soundscape: Hub View (Adventure Browser & Selector)
 */

import { FantasyIcons } from './FantasyIcons.js';

export class HubView {
  constructor(containerEl, onSelectAdventure, onOpenStudio, onNewAdventure, onExportAdventure, onDeleteAdventure) {
    this.container = containerEl;
    this.onSelectAdventure = onSelectAdventure;
    this.onOpenStudio = onOpenStudio;
    this.onNewAdventure = onNewAdventure;
    this.onExportAdventure = onExportAdventure;
    this.onDeleteAdventure = onDeleteAdventure;
    this.adventures = [];
    this.searchQuery = '';
  }

  render(adventures) {
    this.adventures = adventures;
    const filtered = this.adventures.filter(adv => {
      const q = this.searchQuery.toLowerCase();
      return (adv.title || '').toLowerCase().includes(q) ||
             (adv.subtitle || '').toLowerCase().includes(q) ||
             (adv.description || '').toLowerCase().includes(q) ||
             (adv.tags || []).some(t => t.toLowerCase().includes(q));
    });

    this.container.innerHTML = `
      <div class="hub-view">
        <header class="hub-header">
          <div class="hub-title-group">
            <h1>Adventure Soundscapes</h1>
            <p>Select an adventure soundboard or design your own multi-layer RPG audio experience.</p>
          </div>
          <div class="hub-actions">
            <button id="btn-hub-new" class="btn-primary">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>New Adventure</span>
            </button>
            <label class="btn-secondary" style="cursor: pointer;">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Import JSON</span>
              <input type="file" id="input-import-json" accept=".json" style="display: none;">
            </label>
          </div>
        </header>

        <div class="hub-filter-bar">
          <div class="hub-search-box">
            <svg class="icon hub-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="hub-search-input" class="hub-search-input" placeholder="Search adventures, tags, regions..." value="${this.searchQuery}">
          </div>
          <div class="adventure-count-label" style="color: var(--text-muted); font-size: 13px;">
            Showing <strong>${filtered.length}</strong> adventure(s)
          </div>
        </div>

        <div class="adventure-grid">
          ${filtered.map(adv => this.renderCard(adv)).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderCard(adv) {
    const coverUrl = adv.coverImage || adv.previewImage || 'adventures/phandelver/img/cover.jpg';
    const tags = adv.tags || ['D&D 5e'];
    const isProtected = adv.id === 'phandelver';

    return `
      <div class="adventure-card" data-id="${adv.id}">
        <div class="adventure-card-media">
          <img src="${coverUrl}" alt="${adv.title}" class="adventure-card-img" onerror="this.src='adventures/phandelver/img/cover.jpg'">
          <div class="adventure-card-gradient"></div>
          <div class="adventure-card-badges">
            ${tags.map(t => `<span class="badge">${t}</span>`).join('')}
          </div>
          <div class="adventure-stage-pill">
            <span>${FantasyIcons.get('pin', { size: 13 })}</span>
            <span>${adv.stageCount || 1} Stages</span>
          </div>
        </div>
        <div class="adventure-card-content">
          <h2 class="adventure-card-title">${adv.title}</h2>
          <div class="adventure-card-subtitle">${adv.subtitle || ''}</div>
          <p class="adventure-card-desc">${adv.description || 'No description provided.'}</p>
          <div class="adventure-card-footer">
            <span class="adventure-card-meta">By ${adv.author || 'DM'}</span>
            <div style="display: flex; gap: 6px;">
              <button class="btn-icon btn-card-export" data-id="${adv.id}" title="Export JSON">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button class="btn-icon btn-card-edit" data-id="${adv.id}" title="Edit in Studio">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
              ${!isProtected ? `
                <button class="btn-icon btn-card-delete" data-id="${adv.id}" title="Delete Adventure" style="color: #ff7675;">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              ` : ''}
              <button class="btn-primary btn-card-launch" data-id="${adv.id}">
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Launch</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const searchInput = document.getElementById('hub-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render(this.adventures);
      });
    }

    const btnNew = document.getElementById('btn-hub-new');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        if (this.onNewAdventure) this.onNewAdventure();
      });
    }

    const importInput = document.getElementById('input-import-json');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          window.dispatchEvent(new CustomEvent('import-adventure-file', { detail: e.target.files[0] }));
        }
      });
    }

    this.container.querySelectorAll('.btn-card-launch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (this.onSelectAdventure) this.onSelectAdventure(id);
      });
    });

    this.container.querySelectorAll('.btn-card-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (this.onOpenStudio) this.onOpenStudio(id);
      });
    });

    this.container.querySelectorAll('.btn-card-export').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (this.onExportAdventure) this.onExportAdventure(id);
      });
    });

    this.container.querySelectorAll('.btn-card-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (this.onDeleteAdventure) this.onDeleteAdventure(id);
      });
    });

    this.container.querySelectorAll('.adventure-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        if (this.onSelectAdventure) this.onSelectAdventure(id);
      });
    });
  }
}
