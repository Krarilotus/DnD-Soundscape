/**
 * DnD-Soundscape: Spotify Streaming Connector Bridge
 * Connects Spotify tracks, playlists, and albums directly via Spotify Embed Controller & Web Playback.
 */

export class SpotifyBridge {
  constructor() {
    this.currentUri = null;
    this.containerId = 'spotify-embed-container';
    this.iframeEl = null;
    this.embedController = null;
  }

  static parseSpotifyUri(urlOrUri) {
    if (!urlOrUri) return null;
    if (urlOrUri.startsWith('spotify:')) return urlOrUri;

    const match = urlOrUri.match(/open\.spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (match) {
      return `spotify:${match[1]}:${match[2]}`;
    }
    return null;
  }

  static getEmbedUrl(urlOrUri) {
    const uri = SpotifyBridge.parseSpotifyUri(urlOrUri);
    if (!uri) return null;
    const parts = uri.split(':');
    if (parts.length === 3) {
      const type = parts[1];
      const id = parts[2];
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    }
    return null;
  }

  loadAndPlay(urlOrUri) {
    const embedUrl = SpotifyBridge.getEmbedUrl(urlOrUri);
    if (!embedUrl) return false;

    this.currentUri = urlOrUri;
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'spotify-widget-container';
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div class="spotify-floating-player">
        <div class="spotify-player-header">
          <span>🎧 Spotify Connected Track</span>
          <button class="btn-icon" onclick="document.getElementById('${this.containerId}').classList.toggle('minimized')" style="padding: 2px 6px; font-size: 11px;">_</button>
        </div>
        <iframe src="${embedUrl}" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
      </div>
    `;

    return true;
  }

  stop() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }
    this.currentUri = null;
  }
}
