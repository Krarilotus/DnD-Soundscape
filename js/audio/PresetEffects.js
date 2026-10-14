/**
 * DnD-Soundscape: Curated RPG Sound Effects Presets & Adventure SFX Aggregator
 * Provides reusable sound effects across scenes and built-in tabletop audio presets.
 */

export const RPG_SFX_CATEGORIES = [
  { id: 'all', label: 'All Sounds' },
  { id: 'combat', label: '⚔️ Combat' },
  { id: 'magic', label: '⚡ Magic & Arcane' },
  { id: 'monster', label: '🐉 Beasts & Foes' },
  { id: 'tavern', label: '🍺 Tavern & Social' },
  { id: 'dungeon', label: '🏰 Dungeon & World' }
];

export const RPG_SFX_PRESETS = [
  // Combat
  {
    id: 'sword_clash',
    category: 'combat',
    shortName: 'Clash',
    label: 'Sword Clash',
    icon: '⚔️',
    file: 'audio_presets/effects/sword_clash.wav',
    credit: 'RPG Combat SFX',
    sourceUrl: 'https://freesound.org'
  },
  {
    id: 'shield_block',
    category: 'combat',
    shortName: 'Shield',
    label: 'Shield Block',
    icon: '🛡️',
    file: 'audio_presets/effects/shield_block.wav',
    credit: 'Kenney RPG Audio / Synthesis',
    sourceUrl: 'https://kenney.nl/assets/rpg-audio'
  },
  {
    id: 'scimitar_clash',
    category: 'combat',
    shortName: 'Parry',
    label: 'Scimitar Deflect',
    icon: '🗡️',
    file: 'audio_presets/effects/scimitar_clash.wav',
    credit: 'Joseph',
    sourceUrl: 'https://www.youtube.com/watch?v=qtNDctR2iMM'
  },
  {
    id: 'arrow_thunk',
    category: 'combat',
    shortName: 'Arrow',
    label: 'Arrow Impact',
    icon: '🏹',
    file: 'audio_presets/effects/arrow_thunk.wav',
    credit: 'Mario Sanchez',
    sourceUrl: 'https://www.youtube.com/watch?v=LhILCoFuy3Y'
  },
  {
    id: 'stealth_dagger',
    category: 'combat',
    shortName: 'Stealth',
    label: 'Stealth Blade',
    icon: '🗡️',
    file: 'audio_presets/effects/stealth_dagger.wav',
    credit: 'SOUND Effects Public Domain',
    sourceUrl: 'https://www.youtube.com/watch?v=His6s9eZEFQ'
  },
  {
    id: 'combat_drums',
    category: 'combat',
    shortName: 'Drums',
    label: 'War Drums Surge',
    icon: '🥁',
    file: 'audio_presets/effects/combat_drums.wav',
    credit: 'Fantasy Tabletop Audio',
    sourceUrl: 'https://freesound.org'
  },

  // Magic & Spells
  {
    id: 'spell_surge',
    category: 'magic',
    shortName: 'Surge',
    label: 'Arcane Spell Surge',
    icon: '⚡',
    file: 'audio_presets/effects/spell_surge.wav',
    credit: 'Arcane Sound FX',
    sourceUrl: 'https://freesound.org'
  },
  {
    id: 'fireball',
    category: 'magic',
    shortName: 'Fireball',
    label: 'Fireball Blast',
    icon: '🔥',
    file: 'audio_presets/effects/fireball.wav',
    credit: 'Kenney RPG Audio / Synthesis',
    sourceUrl: 'https://kenney.nl/assets/rpg-audio'
  },
  {
    id: 'forge_magic_burst',
    category: 'magic',
    shortName: 'Burst',
    label: 'Forge Magic Burst',
    icon: '🔮',
    file: 'audio_presets/effects/forge_magic_burst.wav',
    credit: 'Rayne Beckman',
    sourceUrl: 'https://www.youtube.com/watch?v=RZtMFFudEw8'
  },
  {
    id: 'thunderclap',
    category: 'magic',
    shortName: 'Thunder',
    label: 'Lightning Thunderclap',
    icon: '⛈️',
    file: 'audio_presets/effects/thunderclap.wav',
    credit: 'Freesound Nature',
    sourceUrl: 'https://freesound.org'
  },
  {
    id: 'poison_breath',
    category: 'magic',
    shortName: 'Poison',
    label: 'Poison Gas Breath',
    icon: '☠️',
    file: 'audio_presets/effects/poison_breath.wav',
    credit: 'Free SFX',
    sourceUrl: 'https://www.youtube.com/watch?v=gYexx2vGc_k'
  },
  {
    id: 'potion_drink',
    category: 'magic',
    shortName: 'Potion',
    label: 'Potion Drink',
    icon: '🧪',
    file: 'audio_presets/effects/potion_drink.wav',
    credit: 'Kenney RPG Audio / Physical Modeling',
    sourceUrl: 'https://kenney.nl/assets/rpg-audio'
  },

  // Monsters & Creatures
  {
    id: 'goblin_shriek',
    category: 'monster',
    shortName: 'Goblin',
    label: 'Ambush Shriek',
    icon: '👺',
    file: 'audio_presets/effects/goblin_shriek.wav',
    credit: 'Hexagon',
    sourceUrl: 'https://www.youtube.com/watch?v=2L0F0jlu_N8'
  },
  {
    id: 'dragon_roar',
    category: 'monster',
    shortName: 'Dragon',
    label: 'Dragon Roar',
    icon: '🐉',
    file: 'audio_presets/effects/dragon_roar.wav',
    credit: 'Free Video Sound Effects HD',
    sourceUrl: 'https://www.youtube.com/watch?v=3WJHzXGo1M8'
  },
  {
    id: 'wolf_snarl',
    category: 'monster',
    shortName: 'Wolf',
    label: 'Wolf / Beast Snarl',
    icon: '🐺',
    file: 'audio_presets/effects/wolf_snarl.wav',
    credit: 'Sound Effects Library',
    sourceUrl: 'https://www.youtube.com/watch?v=5Bb2DQ2H_5I'
  },
  {
    id: 'monster_roar',
    category: 'monster',
    shortName: 'Roar',
    label: 'Monster Roar',
    icon: '👹',
    file: 'audio_presets/effects/monster_roar.wav',
    credit: 'Freesound Fantasy',
    sourceUrl: 'https://freesound.org'
  },
  {
    id: 'nothic_whisper',
    category: 'monster',
    shortName: 'Whisper',
    label: 'Nothic Whispers',
    icon: '👁️',
    file: 'audio_presets/effects/nothic_whisper.wav',
    credit: 'Vatislavovych',
    sourceUrl: 'https://www.youtube.com/watch?v=DQS8Jsy7VSc'
  },
  {
    id: 'spider_web',
    category: 'monster',
    shortName: 'Web',
    label: 'Spider Squelch',
    icon: '🕸️',
    file: 'audio_presets/effects/spider_web.wav',
    credit: 'Awesome Sounds',
    sourceUrl: 'https://www.youtube.com/watch?v=Me6hNbTOgp0'
  },
  {
    id: 'twig_blight',
    category: 'monster',
    shortName: 'Snap',
    label: 'Blight Twig Snap',
    icon: '🌿',
    file: 'audio_presets/effects/twig_blight.wav',
    credit: 'MJL AV',
    sourceUrl: 'https://www.youtube.com/watch?v=AVxJQSM8jxs'
  },

  // Tavern & Social
  {
    id: 'tankard_clink',
    category: 'tavern',
    shortName: 'Cheer',
    label: 'Tankard Cheers',
    icon: '🍻',
    file: 'audio_presets/effects/tankard_clink.wav',
    credit: 'Herbert Nicolas',
    sourceUrl: 'https://www.youtube.com/watch?v=Waljosxqz0Y'
  },
  {
    id: 'coin_purse',
    category: 'tavern',
    shortName: 'Coins',
    label: 'Gold Coin Purse',
    icon: '🪙',
    file: 'audio_presets/effects/coin_purse.wav',
    credit: 'Sound Around',
    sourceUrl: 'https://www.youtube.com/watch?v=gsO7_fTbm3g'
  },
  {
    id: 'tavern_door',
    category: 'tavern',
    shortName: 'Door',
    label: 'Tavern Wooden Door',
    icon: '🚪',
    file: 'audio_presets/effects/tavern_door.wav',
    credit: 'Free Audio Zone',
    sourceUrl: 'https://www.youtube.com/watch?v=D3ZuJ-I78yI'
  },
  {
    id: 'dice_roll',
    category: 'tavern',
    shortName: 'Dice',
    label: 'Dice Roll on Wood',
    icon: '🎲',
    file: 'audio_presets/effects/dice_roll.wav',
    credit: 'SOUND Effects Public Domain',
    sourceUrl: 'https://www.youtube.com/watch?v=UiP_6cUxRGU'
  },

  // Dungeon & Environment
  {
    id: 'wooden_chest',
    category: 'dungeon',
    shortName: 'Chest',
    label: 'Wooden Chest Open',
    icon: '🗄️',
    file: 'audio_presets/effects/wooden_chest.wav',
    credit: 'Kenney RPG Audio / Physical Modeling',
    sourceUrl: 'https://kenney.nl/assets/rpg-audio'
  },
  {
    id: 'lockpick',
    category: 'dungeon',
    shortName: 'Lock',
    label: 'Lockpick Click',
    icon: '🗝️',
    file: 'audio_presets/effects/lockpick.wav',
    credit: 'Kenney RPG Audio / Physical Modeling',
    sourceUrl: 'https://kenney.nl/assets/rpg-audio'
  },
  {
    id: 'iron_gate',
    category: 'dungeon',
    shortName: 'Gate',
    label: 'Dungeon Gate Slam',
    icon: '🚪',
    file: 'audio_presets/effects/iron_gate.wav',
    credit: 'Sound Effects Library',
    sourceUrl: 'https://www.youtube.com/watch?v=MynlPzFRoxo'
  },
  {
    id: 'flood_surge',
    category: 'dungeon',
    shortName: 'Flood',
    label: 'Cavern Stream Flood',
    icon: '🌊',
    file: 'audio_presets/effects/flood_surge.wav',
    credit: 'SOUND Effects Public Domain',
    sourceUrl: 'https://www.youtube.com/watch?v=2vrwbNWrmMs'
  },
  {
    id: 'wave_boom',
    category: 'dungeon',
    shortName: 'Boom',
    label: 'Subterranean Boom',
    icon: '💥',
    file: 'audio_presets/effects/wave_boom.wav',
    credit: 'as production',
    sourceUrl: 'https://www.youtube.com/watch?v=Yzq8c2Xv5IY'
  },
  {
    id: 'cave_drips',
    category: 'dungeon',
    shortName: 'Drips',
    label: 'Cave Water Drips',
    icon: '💧',
    file: 'audio_presets/effects/cave_drips.wav',
    credit: 'Cavern Acoustic Drops',
    sourceUrl: 'https://freesound.org'
  },
  {
    id: 'temple_bell',
    category: 'dungeon',
    shortName: 'Bell',
    label: 'Temple Bell Chime',
    icon: '🔔',
    file: 'audio_presets/effects/temple_bell.wav',
    credit: 'Freesound / Modal Acoustics',
    sourceUrl: 'https://freesound.org'
  }
];

export const HOTKEY_SEQUENCE = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];

/**
 * Returns the next available keyboard hotkey (Q, W, E, R, etc.) not currently in use.
 */
export function getNextAvailableHotkey(triggers = []) {
  const used = new Set(triggers.map(t => (t.hotkey || '').toUpperCase()));
  for (const key of HOTKEY_SEQUENCE) {
    if (!used.has(key)) return key;
  }
  return '';
}

/**
 * Aggregates all unique sound effects across all stages of an adventure,
 * allowing DMs to reuse and relink effects from other scenes.
 */
export function getAdventureEffects(adventure, currentStageId = null) {
  if (!adventure || !adventure.stages) return [];
  const map = new Map();

  for (const st of adventure.stages) {
    const triggers = st.layers?.effects?.triggers || [];
    for (const trig of triggers) {
      if (!trig || !trig.file) continue;
      const key = `${trig.file}|${trig.label}`;
      if (!map.has(key)) {
        map.set(key, {
          ...trig,
          shortName: trig.shortName || trig.label,
          fromStageId: st.id,
          fromStageLabel: st.label || 'Other Scene',
          fromStageIcon: st.icon || '🗺️',
          isCurrentStage: st.id === currentStageId
        });
      } else {
        const item = map.get(key);
        if (st.id === currentStageId) {
          item.isCurrentStage = true;
        } else if (!item.fromStageLabel.includes(st.label)) {
          item.fromStageLabel += `, ${st.label}`;
        }
      }
    }
  }

  return Array.from(map.values());
}
