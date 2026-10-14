/**
 * DnD-Soundscape: Utility & Helper Functions
 */

import { FantasyIcons } from '../ui/FantasyIcons.js';

export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function showToast(message, type = 'info', durationMs = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} theme-card`;
  
  const iconMap = {
    success: FantasyIcons.get('spark', { size: 16 }),
    error: FantasyIcons.get('close', { size: 16 }),
    info: FantasyIcons.get('d20', { size: 16 })
  };

  toast.innerHTML = `<span style="color: var(--theme-primary);">${iconMap[type] || FantasyIcons.get('spark', { size: 16 })}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, durationMs);
}

export function generateId(prefix = 'stage') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function equalPowerFade(t) {
  // t is 0.0 to 1.0
  // Returns [gainOut, gainIn]
  return [
    Math.cos(t * 0.5 * Math.PI),
    Math.sin(t * 0.5 * Math.PI)
  ];
}
