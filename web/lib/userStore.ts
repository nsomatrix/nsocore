import { PlayerProfile } from './store';

const STORAGE_KEY_PREFIX = 'mtx_saved_targets_';
const COOLDOWN_KEY_PREFIX = 'mtx_refresh_cooldowns_';
export const REFRESH_COOLDOWN_MS = 60 * 1000; // 1 minute (60,000 ms)

export function getSavedTargets(userId: string): PlayerProfile[] {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[UserStore] Error loading saved targets:', e);
    return [];
  }
}

export function saveTarget(userId: string, player: PlayerProfile): PlayerProfile[] {
  if (typeof window === 'undefined' || !userId) return [];
  const current = getSavedTargets(userId);
  const exists = current.some((p) => p.name.toLowerCase() === player.name.toLowerCase());
  let updated: PlayerProfile[];
  if (exists) {
    updated = current.map((p) => (p.name.toLowerCase() === player.name.toLowerCase() ? player : p));
  } else {
    updated = [player, ...current];
  }
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('[UserStore] Error saving target:', e);
  }
  return updated;
}

export function removeTarget(userId: string, playerName: string): PlayerProfile[] {
  if (typeof window === 'undefined' || !userId) return [];
  const current = getSavedTargets(userId);
  const updated = current.filter((p) => p.name.toLowerCase() !== playerName.toLowerCase());
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('[UserStore] Error removing target:', e);
  }
  return updated;
}

export function isTargetSaved(userId: string, playerName: string): boolean {
  if (typeof window === 'undefined' || !userId || !playerName) return false;
  const current = getSavedTargets(userId);
  return current.some((p) => p.name.toLowerCase() === playerName.toLowerCase());
}

export function getRemainingCooldownSeconds(userId: string, playerName: string): number {
  if (typeof window === 'undefined' || !userId || !playerName) return 0;
  try {
    const raw = localStorage.getItem(`${COOLDOWN_KEY_PREFIX}${userId}`);
    if (!raw) return 0;
    const cooldowns: Record<string, number> = JSON.parse(raw);
    const expireTime = cooldowns[playerName.toLowerCase()];
    if (!expireTime) return 0;
    const diffMs = expireTime - Date.now();
    return diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
  } catch (e) {
    return 0;
  }
}

export function setRefreshCooldown(userId: string, playerName: string): void {
  if (typeof window === 'undefined' || !userId || !playerName) return;
  try {
    const raw = localStorage.getItem(`${COOLDOWN_KEY_PREFIX}${userId}`);
    const cooldowns: Record<string, number> = raw ? JSON.parse(raw) : {};
    cooldowns[playerName.toLowerCase()] = Date.now() + REFRESH_COOLDOWN_MS;
    localStorage.setItem(`${COOLDOWN_KEY_PREFIX}${userId}`, JSON.stringify(cooldowns));
  } catch (e) {
    console.warn('[UserStore] Error setting cooldown:', e);
  }
}
