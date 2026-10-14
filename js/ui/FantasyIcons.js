/**
 * DnD-Soundscape: Bespoke Vector Fantasy Iconography System
 * Replaces generic browser OS emojis with stylized, themeable SVG fantasy icons.
 * All icons support CSS currentColor, dynamic glow filters, and scalable sizing.
 */

export const FANTASY_ICONS = {
  // Combat & Weapons
  sword: `<svg class="fantasy-icon icon-sword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5"/>
    <path d="M13 19l2 2 4-4-2-2"/>
    <path d="M19 13l2-2-4-4-2 2"/>
    <path d="M21 21l-3-3"/>
    <path d="M17 17l1.5 1.5"/>
  </svg>`,

  swords_crossed: `<svg class="fantasy-icon icon-swords-crossed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 4l16 16"/>
    <path d="M20 4L4 20"/>
    <path d="M2 2l4 4"/>
    <path d="M22 2l-4 4"/>
    <path d="M2 22l4-4"/>
    <path d="M22 22l-4-4"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>`,

  shield: `<svg class="fantasy-icon icon-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M12 6v12"/>
    <path d="M8 10h8"/>
  </svg>`,

  // Magic & Energy
  lightning: `<svg class="fantasy-icon icon-lightning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fill-opacity="0.25"/>
  </svg>`,

  spark: `<svg class="fantasy-icon icon-spark" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
  </svg>`,

  rune: `<svg class="fantasy-icon icon-rune" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2"/>
    <path d="M12 6v12"/>
    <path d="M8 9l8 6"/>
    <path d="M16 9l-8 6"/>
  </svg>`,

  flame: `<svg class="fantasy-icon icon-flame" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8.5 14.5A4.5 4.5 0 0 0 13 19a4.5 4.5 0 0 0 4.5-4.5c0-3-2.5-5-2.5-7.5 0 0-2 1.5-2 3.5 0 1-1 2-2 2s-1.5-.5-1.5-1.5c0-2 2-4 2-6C8.5 7 6 10.5 6 13.5a4.5 4.5 0 0 0 2.5 4" fill="currentColor" fill-opacity="0.2"/>
  </svg>`,

  potion: `<svg class="fantasy-icon icon-potion" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 3h6"/>
    <path d="M10 3v3l-4 6a6 6 0 1 0 12 0l-4-6V3"/>
    <path d="M8 14h8" stroke-dasharray="2 2"/>
    <circle cx="12" cy="16" r="1" fill="currentColor"/>
  </svg>`,

  // Tabletop & Roleplay
  d20: `<svg class="fantasy-icon icon-d20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 21 7.5 21 16.5 12 22 3 16.5 3 7.5 12 2"/>
    <polygon points="12 2 12 22 3 16.5 12 2" fill="currentColor" fill-opacity="0.15"/>
    <polyline points="3 7.5 12 12 21 7.5"/>
    <polyline points="3 16.5 12 12 21 16.5"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  </svg>`,

  tankard: `<svg class="fantasy-icon icon-tankard" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 8h10v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8z" fill="currentColor" fill-opacity="0.2"/>
    <path d="M15 10h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3"/>
    <path d="M4 6c1 0 1.5-.7 2.5-.7s1.5.7 2.5.7 1.5-.7 2.5-.7 1.5.7 2.5.7 1.5-.7 2.5-.7 1.5.7 2.5.7"/>
    <line x1="5" y1="12" x2="15" y2="12"/>
    <line x1="5" y1="16" x2="15" y2="16"/>
  </svg>`,

  scroll: `<svg class="fantasy-icon icon-scroll" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 2h8a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h1"/>
    <path d="M16 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3"/>
    <line x1="8" y1="8" x2="12" y2="8"/>
    <line x1="8" y1="12" x2="12" y2="12"/>
    <line x1="8" y1="16" x2="11" y2="16"/>
  </svg>`,

  pin: `<svg class="fantasy-icon icon-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="currentColor" fill-opacity="0.15"/>
    <circle cx="12" cy="10" r="3" fill="currentColor"/>
  </svg>`,

  tree: `<svg class="fantasy-icon icon-tree" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 5 12 9 12 4 18 20 18 15 12 19 12 12 2" fill="currentColor" fill-opacity="0.2"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
  </svg>`,

  key: `<svg class="fantasy-icon icon-key" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="7.5" cy="15.5" r="4.5"/>
    <path d="M10.7 12.3L19 4"/>
    <path d="M16 4l4 4"/>
    <path d="M14 8l2 2"/>
  </svg>`,

  chest: `<svg class="fantasy-icon icon-chest" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 10h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z" fill="currentColor" fill-opacity="0.2"/>
    <path d="M3 10V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/>
    <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
    <line x1="12" y1="16.5" x2="12" y2="19"/>
  </svg>`,

  door: `<svg class="fantasy-icon icon-door" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/>
    <path d="M4 21h16"/>
    <line x1="8" y1="3" x2="8" y2="21"/>
    <circle cx="11" cy="12" r="1" fill="currentColor"/>
  </svg>`,

  // Audio & Controls
  sliders: `<svg class="fantasy-icon icon-sliders" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/>
    <line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/>
    <line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/>
    <line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>`,

  speech: `<svg class="fantasy-icon icon-speech" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <circle cx="9" cy="10" r="1" fill="currentColor"/>
    <circle cx="12" cy="10" r="1" fill="currentColor"/>
    <circle cx="15" cy="10" r="1" fill="currentColor"/>
  </svg>`,

  reload: `<svg class="fantasy-icon icon-reload" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21.5 2v6h-6"/>
    <path d="M2.5 22v-6h6"/>
    <path d="M20 11.5a9 9 0 0 0-14.8-4.5L2.5 16"/>
    <path d="M4 12.5a9 9 0 0 0 14.8 4.5L21.5 8"/>
  </svg>`,

  play: `<svg class="fantasy-icon icon-play" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 4 20 12 6 20 6 4"/>
  </svg>`,

  stop: `<svg class="fantasy-icon icon-stop" viewBox="0 0 24 24" fill="currentColor">
    <rect x="5" y="5" width="14" height="14" rx="2"/>
  </svg>`,

  pause: `<svg class="fantasy-icon icon-pause" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1"/>
    <rect x="14" y="4" width="4" height="16" rx="1"/>
  </svg>`,

  gear: `<svg class="fantasy-icon icon-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`,

  close: `<svg class="fantasy-icon icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,

  plus: `<svg class="fantasy-icon icon-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`,

  volume_high: `<svg class="fantasy-icon icon-volume-high" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.2"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>`,

  volume_mute: `<svg class="fantasy-icon icon-volume-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/>
    <line x1="17" y1="9" x2="23" y2="15"/>
  </svg>`,

  feather: `<svg class="fantasy-icon icon-feather" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
    <line x1="16" y1="8" x2="2" y2="22"/>
    <line x1="17.5" y1="15" x2="9" y2="15"/>
  </svg>`,

  book: `<svg class="fantasy-icon icon-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>`,

  palette: `<svg class="fantasy-icon icon-palette" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.8-.7 1.8-1.5 0-.4-.2-.8-.4-1.1-.3-.4-.4-.8-.4-1.4 0-1.1.9-2 2-2h2.3c3.7 0 6.7-3 6.7-6.7C22 5.3 17.5 2 12 2z"/>
  </svg>`
};

/**
 * Mapping from standard emoji characters to our bespoke fantasy vector icons.
 */
const EMOJI_TO_FANTASY_MAP = {
  // Combat
  '⚔️': 'sword',
  '⚔': 'sword',
  '🗡️': 'sword',
  '🗡': 'sword',
  '🛡️': 'shield',
  '🛡': 'shield',
  '🏹': 'sword',
  '🥊': 'sword',
  // Magic & Energy
  '⚡': 'lightning',
  '✨': 'spark',
  '🔮': 'rune',
  '🔥': 'flame',
  '🧪': 'potion',
  // Places & Objects
  '🍺': 'tankard',
  '🍻': 'tankard',
  '🌲': 'tree',
  '🌳': 'tree',
  '📍': 'pin',
  '📜': 'scroll',
  '🎲': 'd20',
  '🗝️': 'key',
  '🗝': 'key',
  '🔑': 'key',
  '🗄': 'chest',
  '🗄️': 'chest',
  '📦': 'chest',
  '🚪': 'door',
  '🪙': 'd20',
  '🎭': 'd20',
  // Audio & UI
  '🎚️': 'sliders',
  '🎚': 'sliders',
  '💬': 'speech',
  '🔁': 'reload',
  '▶': 'play',
  '▶️': 'play',
  '⏹': 'stop',
  '⏹️': 'stop',
  '⏸': 'pause',
  '⏸️': 'pause',
  '⚙️': 'gear',
  '⚙': 'gear',
  '✕': 'close',
  '✖': 'close',
  '➕': 'plus',
  '🔊': 'volume_high',
  '🔇': 'volume_mute',
  '📖': 'book',
  '🎨': 'palette'
};

export class FantasyIcons {
  /**
   * Render an SVG vector icon given an icon name or emoji key.
   * @param {string} key - e.g. 'sword', 'tankard', '⚡', '🍺', '📍'
   * @param {object} opts - { size, className, style }
   * @returns {string} SVG HTML markup
   */
  static render(key, opts = {}) {
    if (!key) return FantasyIcons.get('spark', opts);

    const clean = String(key).trim();
    // Check direct icon key
    if (FANTASY_ICONS[clean]) {
      return FantasyIcons.get(clean, opts);
    }
    // Check emoji map
    const mapped = EMOJI_TO_FANTASY_MAP[clean];
    if (mapped && FANTASY_ICONS[mapped]) {
      return FantasyIcons.get(mapped, opts);
    }
    // Check lower-case
    const lower = clean.toLowerCase();
    if (FANTASY_ICONS[lower]) {
      return FantasyIcons.get(lower, opts);
    }

    // Fallback: If it's a short text symbol, wrap it neatly
    const size = opts.size || 18;
    const cls = opts.className || '';
    return `<span class="fantasy-icon-text ${cls}" style="font-size: ${size}px; line-height: 1;">${clean}</span>`;
  }

  /**
   * Get SVG markup for a known icon name with optional sizing and classes.
   */
  static get(name, opts = {}) {
    const raw = FANTASY_ICONS[name] || FANTASY_ICONS.spark;
    const size = opts.size || 18;
    const extraClass = opts.className ? ` ${opts.className}` : '';
    const extraStyle = opts.style ? ` style="${opts.style}"` : '';

    // Inject width, height and extra class into SVG element
    return raw.replace(
      '<svg class="fantasy-icon',
      `<svg style="width: ${size}px; height: ${size}px; display: inline-block; vertical-align: middle;${opts.style ? ' ' + opts.style : ''}" class="fantasy-icon${extraClass}`
    );
  }

  /**
   * Replace all known emoji characters in an HTML string with matching vector fantasy SVGs.
   */
  static replaceEmojis(html) {
    if (!html || typeof html !== 'string') return html;
    let res = html;
    for (const [emoji, iconKey] of Object.entries(EMOJI_TO_FANTASY_MAP)) {
      if (res.includes(emoji)) {
        res = res.split(emoji).join(FantasyIcons.get(iconKey, { size: 16 }));
      }
    }
    return res;
  }
}
