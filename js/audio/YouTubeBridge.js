/**
 * DnD-Soundscape: YouTube IFrame Audio Bridge
 * Enables direct zero-prep streaming of YouTube videos/playlists with volume and fading control.
 */

export class YouTubeBridge {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.currentVideoId = null;
    this.volume = 80;
    this.containerId = 'yt-hidden-player';
    this.initAPI();
  }

  static extractVideoId(urlOrId) {
    if (!urlOrId) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;

    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([^"&?\/\s]{11})/,
      /youtube\.com\/embed\/([^"&?\/\s]{11})/
    ];

    for (const pat of patterns) {
      const match = urlOrId.match(pat);
      if (match && match[1]) return match[1];
    }
    return null;
  }

  static extractPlaylistId(url) {
    if (!url) return null;
    const match = url.match(/[?&]list=([^#&?]+)/);
    return match ? match[1] : null;
  }

  initAPI() {
    if (window.YT && window.YT.Player) {
      this.createPlayer();
      return;
    }

    if (!document.getElementById('yt-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(tag, firstScript);

      window.onYouTubeIframeAPIReady = () => {
        this.createPlayer();
      };
    }
  }

  createPlayer() {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.style.position = 'fixed';
      container.style.bottom = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0.001';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }

    try {
      this.player = new window.YT.Player(this.containerId, {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: () => {
            this.isReady = true;
          },
          onStateChange: (event) => {
            // Auto loop when video ends
            if (event.data === window.YT.PlayerState.ENDED) {
              this.player.playVideo();
            }
          }
        }
      });
    } catch (e) {
      console.warn('YouTube Player initialization deferred:', e);
    }
  }

  loadAndPlay(urlOrId, volume = 0.8, startSec = 0, endSec = null) {
    const playlistId = YouTubeBridge.extractPlaylistId(urlOrId);
    const videoId = YouTubeBridge.extractVideoId(urlOrId);
    if (!videoId && !playlistId) return false;

    this.currentVideoId = videoId || playlistId;
    this.volume = Math.round(volume * 100);

    const startPlay = () => {
      if (!this.player || (!this.player.loadVideoById && !this.player.loadPlaylist)) {
        setTimeout(startPlay, 200);
        return;
      }
      this.player.setVolume(this.volume);
      if (playlistId && this.player.loadPlaylist) {
        this.player.loadPlaylist({ list: playlistId, listType: 'playlist' });
      } else if (videoId) {
        const loadParams = { videoId };
        if (startSec) loadParams.startSeconds = Number(startSec);
        if (endSec) loadParams.endSeconds = Number(endSec);
        this.player.loadVideoById(loadParams);
      }
      this.player.playVideo();
    };

    if (this.isReady) {
      startPlay();
    } else {
      setTimeout(startPlay, 300);
    }
    return true;
  }

  setVolume(volNormalized) {
    this.volume = Math.round(volNormalized * 100);
    if (this.player && this.player.setVolume) {
      this.player.setVolume(this.volume);
    }
  }

  stop() {
    if (this.player && this.player.stopVideo) {
      try {
        this.player.stopVideo();
      } catch (e) {}
    }
    this.currentVideoId = null;
  }

  pause() {
    if (this.player && this.player.pauseVideo) {
      try {
        this.player.pauseVideo();
      } catch (e) {}
    }
  }
}
