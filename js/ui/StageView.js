/**
 * DnD-Soundscape: Stage View (16:9 Responsive Canvas & Interactive Pin Markers)
 * Clean, minimal Studio Mode with round icon action buttons and seamless drag-and-drop.
 */

export class StageView {
  constructor(containerEl, onStageClick, onPinMoved, onStageEdit, onAddStage, onFileDropOnCanvas, onFileDropOnPin, onExitStudio = null) {
    this.container = containerEl;
    this.onStageClick = onStageClick;
    this.onPinMoved = onPinMoved;
    this.onStageEdit = onStageEdit;
    this.onAddStage = onAddStage;
    this.onFileDropOnCanvas = onFileDropOnCanvas;
    this.onFileDropOnPin = onFileDropOnPin;
    this.onExitStudio = onExitStudio;

    this.adventure = null;
    this.activeStageId = null;
    this.isEditMode = false;
    this.draggedPin = null;

    this.viewportEl = null;
    this.canvasEl = null;
    this.hotspotsEl = null;
  }

  render(adventure, activeStageId = null) {
    this.adventure = adventure;
    this.activeStageId = activeStageId;

    let previewUrl = adventure.previewImage || 'adventures/phandelver/img/panorama.jpg';
    if (!previewUrl.startsWith('http') && !previewUrl.startsWith('/') && !previewUrl.startsWith('adventures/')) {
      previewUrl = `adventures/${adventure.id}/${previewUrl}`;
    }

    this.container.innerHTML = `
      <div id="stage-viewport" class="stage-view">
        ${this.isEditMode ? `
          <div class="studio-floating-actions" role="toolbar" aria-label="Studio Controls">
            <button id="btn-studio-add-stage" class="studio-round-btn studio-add-btn" title="Add Stage (+)" aria-label="Add Stage">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <button id="btn-studio-exit" class="studio-round-btn studio-exit-btn" title="Exit Studio (Esc)" aria-label="Exit Studio">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="studio-drag-hint">
            <span>🎵 Drag &amp; drop audio onto map</span>
          </div>
        ` : ''}

                <!-- Transient Location Name Toast (Appears on stage change, then vanishes) -->
        <div id="stage-transient-toast" class="stage-transient-toast hidden" aria-live="polite">
          <span id="stage-toast-icon" class="stage-toast-icon">📍</span>
          <span id="stage-toast-name" class="stage-toast-name">Location</span>
        </div>

        <div id="stage-canvas" class="stage-canvas-container">
          <img id="stage-img" src="${previewUrl}" class="stage-panorama-img" alt="${adventure.title}" draggable="false">
          <div id="stage-hotspots" class="stage-hotspots-layer"></div>
        </div>
      </div>
    `;

    this.viewportEl = document.getElementById('stage-viewport');
    this.canvasEl = document.getElementById('stage-canvas');
    this.hotspotsEl = document.getElementById('stage-hotspots');

    this.updateLayout();
    this.renderPins();
    this.bindEvents();
    this.bindDropEvents();
  }

  updateLayout() {
    if (!this.viewportEl || !this.canvasEl) return;
    const vw = this.viewportEl.clientWidth;
    const vh = this.viewportEl.clientHeight;
    if (vw === 0 || vh === 0) return;

    const targetAspect = 16 / 9;
    const currentAspect = vw / vh;

    let width, height;
    if (currentAspect > targetAspect) {
      width = vw;
      height = vw / targetAspect;
    } else {
      height = vh;
      width = vh * targetAspect;
    }

    this.canvasEl.style.width = `${Math.round(width)}px`;
    this.canvasEl.style.height = `${Math.round(height)}px`;
    this.canvasEl.style.left = `${Math.round((vw - width) / 2)}px`;
    this.canvasEl.style.top = `${Math.round((vh - height) / 2)}px`;
  }

  renderPins() {
    if (!this.hotspotsEl || !this.adventure) return;
    this.hotspotsEl.innerHTML = '';

    (this.adventure.stages || []).forEach(stage => {
      const pin = document.createElement('div');
      pin.className = `stage-pin ${stage.id === this.activeStageId ? 'active' : ''} ${this.isEditMode ? 'editing' : ''}`;
      pin.setAttribute('data-id', stage.id);
      pin.setAttribute('data-type', stage.type || 'roleplay');
      if (this.isEditMode) {
        pin.setAttribute('title', `${stage.label} (Click to configure)`);
      }
      
      const x = stage.hotspot?.x !== undefined ? stage.hotspot.x : 50;
      const y = stage.hotspot?.y !== undefined ? stage.hotspot.y : 50;
      pin.style.left = `${x}%`;
      pin.style.top = `${y}%`;

      const musicTitle = stage.layers?.music?.name || stage.layers?.music?.tracks?.[0]?.title || 'None';
      const ambTitle = stage.layers?.ambience?.name || stage.layers?.ambience?.tracks?.[0]?.title || 'None';

      pin.innerHTML = `
        <div class="stage-pin-pulse"></div>
        <div class="stage-pin-badge">
          <span class="stage-pin-icon">${stage.icon || '🗺️'}</span>
          ${stage.hotkey ? `<span class="stage-pin-hotkey">${stage.hotkey}</span>` : ''}
          ${this.isEditMode ? `<span class="stage-pin-edit-tag">✏️</span>` : ''}
        </div>
        ${!this.isEditMode ? `
        <div class="stage-pin-tooltip">
          <div class="tooltip-stage-title">${stage.label}</div>
          <div class="tooltip-stage-desc">${stage.description || ''}</div>
          <div class="tooltip-layers-summary">
            <span>🎵 ${musicTitle}</span>
            <span>•</span>
            <span>🌲 ${ambTitle}</span>
          </div>
        </div>
        ` : ''}
      `;

      let hasMoved = false;

      pin.addEventListener('click', (e) => {
        if (hasMoved) return;
        if (this.isEditMode) {
          if (this.onStageEdit) this.onStageEdit(stage);
        } else {
          if (this.onStageClick) this.onStageClick(stage);
        }
      });

      if (this.isEditMode) {
        this.makeDraggable(pin, stage, (moved) => { hasMoved = moved; });
      }

      // Drag and drop onto pin
      pin.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        pin.classList.add('drop-target');
      });
      pin.addEventListener('dragleave', (e) => {
        e.stopPropagation();
        pin.classList.remove('drop-target');
      });
      pin.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        pin.classList.remove('drop-target');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          if (this.onFileDropOnPin) {
            this.onFileDropOnPin(stage, e.dataTransfer.files[0]);
          }
        }
      });

      this.hotspotsEl.appendChild(pin);
    });

    if (this.isEditMode) {
      document.getElementById('btn-studio-add-stage')?.addEventListener('click', () => {
        if (this.onAddStage) this.onAddStage();
      });
      document.getElementById('btn-studio-exit')?.addEventListener('click', () => {
        if (this.onExitStudio) this.onExitStudio();
        else this.setEditMode(false);
      });
    }
  }

  makeDraggable(pinEl, stage, onMovedCallback) {
    let isDragging = false;
    let didMove = false;
    let startX = 0;
    let startY = 0;

    const startDrag = (clientX, clientY, e) => {
      isDragging = true;
      didMove = false;
      startX = clientX;
      startY = clientY;
      e.stopPropagation();
    };

    const moveDrag = (clientX, clientY) => {
      if (!isDragging) return;
      if (Math.abs(clientX - startX) > 4 || Math.abs(clientY - startY) > 4) {
        didMove = true;
      }
      const rect = this.canvasEl.getBoundingClientRect();
      const xPx = clientX - rect.left;
      const yPx = clientY - rect.top;

      let xPercent = Math.max(2, Math.min(98, (xPx / rect.width) * 100));
      let yPercent = Math.max(2, Math.min(98, (yPx / rect.height) * 100));

      xPercent = Math.round(xPercent * 10) / 10;
      yPercent = Math.round(yPercent * 10) / 10;

      pinEl.style.left = `${xPercent}%`;
      pinEl.style.top = `${yPercent}%`;

      if (stage.hotspot) {
        stage.hotspot.x = xPercent;
        stage.hotspot.y = yPercent;
      }

      if (this.onPinMoved) {
        this.onPinMoved(stage.id, xPercent, yPercent);
      }
    };

    const stopDrag = () => {
      isDragging = false;
      if (onMovedCallback) onMovedCallback(didMove);
      setTimeout(() => { if (onMovedCallback) onMovedCallback(false); }, 50);
    };

    // Mouse Events (Desktop: Windows, macOS, Linux)
    pinEl.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY, e));
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', stopDrag);

    // Touch Events (Mobile: iOS Safari, Android Chrome)
    pinEl.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY, e);
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches && e.touches[0]) {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchend', stopDrag);
    window.addEventListener('touchcancel', stopDrag);
  }

  bindDropEvents() {
    if (!this.canvasEl) return;
    this.canvasEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.canvasEl.classList.add('canvas-drag-over');
    });
    this.canvasEl.addEventListener('dragleave', (e) => {
      if (e.target === this.canvasEl) {
        this.canvasEl.classList.remove('canvas-drag-over');
      }
    });
    this.canvasEl.addEventListener('drop', (e) => {
      e.preventDefault();
      this.canvasEl.classList.remove('canvas-drag-over');
      if (e.target.closest('.stage-pin')) return;
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const rect = this.canvasEl.getBoundingClientRect();
        const xPx = e.clientX - rect.left;
        const yPx = e.clientY - rect.top;
        const xPercent = Math.round(Math.max(5, Math.min(95, (xPx / rect.width) * 100)) * 10) / 10;
        const yPercent = Math.round(Math.max(5, Math.min(95, (yPx / rect.height) * 100)) * 10) / 10;
        if (this.onFileDropOnCanvas) {
          this.onFileDropOnCanvas(xPercent, yPercent, e.dataTransfer.files[0]);
        }
      }
    });
  }

  setActiveStage(stageId) {
    this.activeStageId = stageId;
    if (!this.hotspotsEl) return;
    this.hotspotsEl.querySelectorAll('.stage-pin').forEach(pin => {
      if (pin.getAttribute('data-id') === stageId) {
        pin.classList.add('active');
      } else {
        pin.classList.remove('active');
      }
    });
  }

  setEditMode(enabled) {
    this.isEditMode = enabled;
    this.render(this.adventure, this.activeStageId);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.updateLayout();
    });
  }
}
