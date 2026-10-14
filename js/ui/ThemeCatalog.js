/**
 * DnD-Soundscape: Centralized Theme Catalog & Engine
 * Provides rich metadata, visual preview cards, palette swatches,
 * and seamless theme switching across the application.
 */

import { FantasyIcons } from './FantasyIcons.js';

export const THEME_CATALOG = [
  {
    id: 'tavern',
    name: 'The Hearthside Tavern',
    subtitle: 'Warm Oak, Forged Brass & Crackling Hearth',
    description: 'Cozy and rustic tabletop ambiance featuring deep oak timbers, aged leather, forged brass rivets, and the warm amber illumination of a tavern hearth.',
    icon: 'tankard',
    fontSample: 'MedievalSharp',
    tags: ['Cozy Tavern', 'Warm Amber', 'Brass Rivets', 'Rustic Oak'],
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fef08a',
      bg: '#140d08',
      card: '#261910',
      border: '#d97706'
    }
  },
  {
    id: 'dungeon',
    name: 'Obsidian Crypt & Cave',
    subtitle: 'Basalt Granite, Spiked Iron & Glowing Runes',
    description: 'Subterranean Underdark atmosphere forged from dark cracked basalt, cold slate, spiked iron strapping, and bioluminescent cyan and violet runic glyphs.',
    icon: 'rune',
    fontSample: 'Uncial Antiqua',
    tags: ['Underdark', 'Obsidian', 'Bioluminescent', 'Runic Stone'],
    colors: {
      primary: '#00e5ff',
      secondary: '#a855f7',
      accent: '#67e8f9',
      bg: '#06070a',
      card: '#101420',
      border: '#00e5ff'
    }
  },
  {
    id: 'elven',
    name: 'Lothlórien Canopy & Spire',
    subtitle: 'Sunlit Marble, Emerald Groves & Golden Filigree',
    description: 'High-fantasy architectural majesty featuring sun-dappled ivory marble, twilight jade groves, graceful botanical curves, and glowing solar gold filigree.',
    icon: 'tree',
    fontSample: 'Cinzel Decorative',
    tags: ['High Elven', 'Emerald Jade', 'Solar Gold', 'Living Vines'],
    colors: {
      primary: '#fbbf24',
      secondary: '#10b981',
      accent: '#34d399',
      bg: '#04120d',
      card: '#0c261b',
      border: '#fbbf24'
    }
  }
];

export class ThemeCatalog {
  /**
   * Get all registered theme definitions.
   */
  static getAll() {
    return THEME_CATALOG;
  }

  /**
   * Find a theme by its unique ID.
   */
  static getTheme(id) {
    return THEME_CATALOG.find(t => t.id === id) || THEME_CATALOG[0];
  }

  /**
   * Determine the currently active theme.
   */
  static getCurrentTheme() {
    const saved = localStorage.getItem('dnd_theme');
    if (saved && THEME_CATALOG.some(t => t.id === saved)) {
      return saved;
    }
    const current = document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme');
    if (current && THEME_CATALOG.some(t => t.id === current)) {
      return current;
    }
    return 'tavern';
  }

  /**
   * Apply a theme to the document and persist to storage.
   */
  static applyTheme(themeId) {
    const valid = THEME_CATALOG.some(t => t.id === themeId);
    const targetId = valid ? themeId : 'tavern';

    document.documentElement.setAttribute('data-theme', targetId);
    document.body.setAttribute('data-theme', targetId);
    localStorage.setItem('dnd_theme', targetId);

    // Update meta theme color
    const themeObj = ThemeCatalog.getTheme(targetId);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme && themeObj) {
      metaTheme.setAttribute('content', themeObj.colors.bg);
    }

    // Dispatch event for UI listeners
    window.dispatchEvent(new CustomEvent('dnd-theme-change', { detail: { themeId: targetId, theme: themeObj } }));

    return themeObj;
  }

  /**
   * Render the visual Theme Catalog HTML grid for the settings/catalog modal.
   */
  static renderCatalogGrid(currentThemeId) {
    const current = currentThemeId || ThemeCatalog.getCurrentTheme();

    return `
      <div class="theme-catalog-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-top: 14px;">
        ${THEME_CATALOG.map(t => {
          const isActive = t.id === current;
          return `
            <div class="theme-catalog-card ${isActive ? 'active-theme' : ''}" data-theme-id="${t.id}" style="
              background: ${t.colors.card};
              border: 2px solid ${isActive ? t.colors.primary : 'rgba(255,255,255,0.1)'};
              border-radius: 12px;
              padding: 18px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
              box-shadow: ${isActive ? `0 0 24px ${t.colors.primary}44, 0 8px 24px rgba(0,0,0,0.6)` : '0 4px 16px rgba(0,0,0,0.4)'};
              transition: all 0.25s ease;
            ">
              <!-- Active Badge -->
              ${isActive ? `
                <div style="position: absolute; top: 12px; right: 12px; background: ${t.colors.primary}; color: #000; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; display: flex; align-items: center; gap: 4px; box-shadow: 0 0 10px ${t.colors.primary};">
                  ${FantasyIcons.get('spark', { size: 12 })}
                  <span>ACTIVE</span>
                </div>
              ` : ''}

              <!-- Card Header -->
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <span style="color: ${t.colors.primary}; filter: drop-shadow(0 0 8px ${t.colors.primary}66);">
                    ${FantasyIcons.get(t.icon, { size: 24 })}
                  </span>
                  <h3 style="font-size: 17px; margin: 0; color: #fff; font-family: '${t.fontSample}', serif;">
                    ${t.name}
                  </h3>
                </div>
                <div style="font-size: 12px; color: ${t.colors.primary}; margin-bottom: 8px; font-weight: 600;">
                  ${t.subtitle}
                </div>
                <p style="font-size: 12.5px; color: #cbd5e1; line-height: 1.45; margin-bottom: 14px;">
                  ${t.description}
                </p>

                <!-- Color Swatches Palette -->
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px;">
                  <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Palette:</span>
                  <span title="Primary" style="width: 18px; height: 18px; border-radius: 50%; background: ${t.colors.primary}; border: 1px solid rgba(255,255,255,0.4); display: inline-block;"></span>
                  <span title="Secondary" style="width: 18px; height: 18px; border-radius: 50%; background: ${t.colors.secondary}; border: 1px solid rgba(255,255,255,0.4); display: inline-block;"></span>
                  <span title="Accent" style="width: 18px; height: 18px; border-radius: 50%; background: ${t.colors.accent}; border: 1px solid rgba(255,255,255,0.4); display: inline-block;"></span>
                  <span title="Background" style="width: 18px; height: 18px; border-radius: 50%; background: ${t.colors.bg}; border: 1px solid rgba(255,255,255,0.4); display: inline-block;"></span>
                </div>

                <!-- Feature Tags -->
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
                  ${t.tags.map(tag => `
                    <span style="font-size: 10.5px; background: rgba(255,255,255,0.06); color: #e2e8f0; padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12);">
                      ${tag}
                    </span>
                  `).join('')}
                </div>
              </div>

              <!-- Action Button -->
              <button type="button" class="btn-equip-theme" data-theme="${t.id}" style="
                width: 100%;
                background: ${isActive ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg, ${t.colors.secondary}, ${t.colors.primary})`};
                color: ${isActive ? '#94a3b8' : '#000'};
                font-weight: 700;
                border: 1px solid ${isActive ? 'rgba(255,255,255,0.2)' : t.colors.primary};
                border-radius: 6px;
                padding: 10px;
                cursor: ${isActive ? 'default' : 'pointer'};
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 13px;
                transition: transform 0.2s ease, filter 0.2s ease;
              " ${isActive ? 'disabled' : ''}>
                ${isActive ? `${FantasyIcons.get('spark', { size: 14 })} Equipped` : `${FantasyIcons.get(t.icon, { size: 14 })} Equip Theme`}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}
