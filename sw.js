/**
 * DnD-Soundscape: Service Worker for Offline PWA Support
 * Version: 1.0.0
 */

const CACHE_NAME = 'dnd-soundscape-v1.0.0';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/hub.css',
  './css/stage.css',
  './css/mixer.css',
  './css/editor.css',
  './css/components.css',
  './js/app.js',
  './js/utils/helpers.js',
  './js/audio/AudioEngine.js',
  './js/audio/LayerBus.js',
  './js/audio/GaplessLoopEngine.js',
  './js/audio/Crossfader.js',
  './js/audio/SoundFXPad.js',
  './js/audio/ProceduralSynth.js',
  './js/audio/StreamingConnectors.js',
  './js/audio/YouTubeBridge.js',
  './js/audio/SpotifyBridge.js',
  './js/storage/AdventureStore.js',
  './js/storage/AudioScanner.js',
  './js/ui/HubView.js',
  './js/ui/StageView.js',
  './js/ui/MixerHUD.js',
  './js/ui/SoundboardModal.js',
  './js/ui/AdventureStudio.js',
  './js/ui/CreateAdventureModal.js',
  './js/ui/MobileConnectModal.js',
  './js/ui/SettingsModal.js',
  './img/icons/icon.svg',
  './adventures/index.json',
  './adventures/phandelver/adventure.json',
  './adventures/phandelver/img/panorama.jpg',
  './adventures/phandelver/img/cover.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch((err) => {
        console.warn('Some assets failed to precache during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET and API POST requests
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // Stale-while-revalidate for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResp) => {
      const fetchPromise = fetch(event.request).then((networkResp) => {
        if (networkResp && networkResp.status === 200) {
          const respClone = networkResp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
        }
        return networkResp;
      }).catch(() => cachedResp);

      return cachedResp || fetchPromise;
    })
  );
});
