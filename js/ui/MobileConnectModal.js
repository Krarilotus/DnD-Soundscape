/**
 * DnD-Soundscape: Mobile Connect & PWA Install Guide Modal
 * Displays local network URL and dynamic QR Code for instant phone connection and installation.
 */

export class MobileConnectModal {
  constructor() {
    this.modalEl = null;
    this.isOpen = false;
  }

  init() {
    let el = document.getElementById('mobile-connect-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'mobile-connect-modal';
      el.className = 'modal-backdrop hidden';
      document.body.appendChild(el);
    }
    this.modalEl = el;
    this.render();
  }

  render() {
    if (!this.modalEl) return;

    const currentOrigin = window.location.origin;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentOrigin)}&bgcolor=14-16-25&color=212-175-55`;

    this.modalEl.innerHTML = `
      <div class="modal-window" style="max-width: 620px;">
        <header class="modal-header">
          <h2>
            <span>📱</span>
            <span>Mobile Remote & Phone App Setup</span>
          </h2>
          <button id="btn-mobile-modal-close" class="btn-icon" aria-label="Close">✕</button>
        </header>

        <div class="modal-body" style="flex-direction: column; gap: 20px; align-items: center; text-align: center;">
          <p style="color: var(--text-muted); font-size: 14px; max-width: 480px;">
            Run your prepared soundboard directly from your <strong>iPhone</strong> or <strong>Android</strong> phone during your D&D session.
          </p>

          <div style="display: flex; gap: 24px; align-items: center; background: rgba(0,0,0,0.4); padding: 18px 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-gold);">
            <div id="qr-container" style="width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; background: #0e1019; border-radius: 8px; border: 1px solid var(--border-subtle); overflow: hidden;">
              <img id="qr-img" src="${qrUrl}" alt="Scan QR Code" style="width: 140px; height: 140px; display: block;" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'padding:12px;font-size:11px;color:var(--gold-light);text-align:center;\\'>📲 Open Link<br>on Phone</div>';">
            </div>
            <div style="text-align: left; max-width: 280px;">
              <span class="ip-badge" style="font-size: 12px; color: var(--gold-light); font-weight: 700; text-transform: uppercase;">1. Scan or Open URL</span>
              <div class="qr-url" style="background: rgba(0,0,0,0.6); padding: 6px 10px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #fff; margin: 6px 0; word-break: break-all;">
                ${currentOrigin}
              </div>
              <span style="font-size: 12px; color: var(--text-muted);">
                ${isLocalhost ? '💡 For phones on your Wi-Fi, open your PC\'s Wi-Fi IP (e.g. <code>http://192.168.x.x:8777</code>).' : 'Ensure phone and PC are on the same Wi-Fi network.'}
              </span>
            </div>
          </div>

          <div style="text-align: left; width: 100%; background: rgba(255,255,255,0.03); padding: 16px 20px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <span style="font-weight: 700; font-size: 13px; color: var(--gold-light);">📲 HOW TO INSTALL AS AN APP ON YOUR PHONE:</span>
            <ul style="margin: 8px 0 0 18px; font-size: 13px; color: var(--text-main); line-height: 1.6;">
              <li><strong>iPhone (Safari):</strong> Tap the <em>Share button (⎋)</em> → select <strong>"Add to Home Screen"</strong>.</li>
              <li><strong>Android (Chrome):</strong> Tap the <em>Menu (⋮)</em> → select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
              <li>Once added, it launches in full-screen standalone mode with offline caching enabled!</li>
            </ul>
          </div>
        </div>

        <footer class="modal-footer">
          <button id="btn-mobile-modal-done" class="btn-primary">Got It</button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.modalEl.querySelector('#btn-mobile-modal-close')?.addEventListener('click', () => this.close());
    this.modalEl.querySelector('#btn-mobile-modal-done')?.addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });
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
}
