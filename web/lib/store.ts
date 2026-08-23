import fs from 'fs';
import path from 'path';
import os from 'os';

export interface EquipmentItem {
  tab: number; // 1 = Equipment 1, 2 = Equipment 2
  slotIndex: number;
  type: number; // 0=Weapon, 1=Coat, 2=Ring, 3=Necklace, 4=Headgear, 5=Gloves, 6=Pants, 7=Jade, 8=Shoes, 9=Charm
  name: string;
  upgrade: number; // e.g. 12 (+12)
  reqLevel: number;
}

export interface PlayerProfile {
  name: string;
  level: number;
  class: string;
  school: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  speed: number;
  attackMin: number;
  attackMax: number;
  antiFire: number;
  antiIce: number;
  antiWind: number;
  reducePain: number;
  accurate: number;
  dodge: number;
  critical: number;
  counterStrike: number;
  antiChakra: number;
  antiChakraBack: number;
  equipment?: EquipmentItem[];
  lastUpdated: string;
}

const AUTO_CLEAR_MS = 30 * 60 * 1000; // Auto clear after 30 minutes

// In-memory global store to preserve state across warm Vercel Lambdas
const globalStore = globalThis as unknown as {
  _matrixPlayersStore?: PlayerProfile[];
  _pendingInspectQueue?: string[];
};

if (!globalStore._matrixPlayersStore) {
  globalStore._matrixPlayersStore = [];
}
if (!globalStore._pendingInspectQueue) {
  globalStore._pendingInspectQueue = [];
}

function getDataFilePath(): string {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join(os.tmpdir(), 'players.json');
  }
  return path.join(process.cwd(), 'data', 'players.json');
}

/**
 * Automatically prunes profiles older than 30 minutes (1,800,000 ms).
 */
export function pruneExpiredPlayers(players: PlayerProfile[]): PlayerProfile[] {
  const now = Date.now();
  const valid = players.filter((p) => {
    if (!p.lastUpdated) return false;
    const time = new Date(p.lastUpdated).getTime();
    return !isNaN(time) && now - time < AUTO_CLEAR_MS;
  });

  if (valid.length !== players.length) {
    saveAllPlayers(valid);
  }
  return valid;
}

export function getAllPlayers(): PlayerProfile[] {
  const filePath = getDataFilePath();
  let loaded: PlayerProfile[] = globalStore._matrixPlayersStore || [];
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        loaded = parsed;
        globalStore._matrixPlayersStore = parsed;
      }
    }
  } catch (e) {
    console.warn('[STORE] Error reading player file, using in-memory store:', e);
  }
  return pruneExpiredPlayers(loaded);
}

export function saveAllPlayers(players: PlayerProfile[]) {
  globalStore._matrixPlayersStore = players;
  const filePath = getDataFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(players, null, 2), 'utf8');
  } catch (e) {
    console.warn('[STORE] File write warning (relying on in-memory store):', e);
  }
}

export function clearAllPlayers() {
  globalStore._pendingInspectQueue = [];
  saveAllPlayers([]);
}

// Queue functions for J2ME inspect triggers
export function pushInspectQueue(targetName: string) {
  if (!globalStore._pendingInspectQueue) {
    globalStore._pendingInspectQueue = [];
  }
  if (!globalStore._pendingInspectQueue.includes(targetName)) {
    globalStore._pendingInspectQueue.push(targetName);
  }
}

export function popInspectQueue(): string | null {
  if (!globalStore._pendingInspectQueue || globalStore._pendingInspectQueue.length === 0) {
    return null;
  }
  return globalStore._pendingInspectQueue.shift() || null;
}

export function saveOrUpdatePlayer(playerData: Partial<PlayerProfile> & { name: string }): PlayerProfile {
  let players = getAllPlayers();
  const index = players.findIndex(p => p.name.toLowerCase() === playerData.name.toLowerCase());
  
  const updatedPlayer: PlayerProfile = {
    name: playerData.name,
    level: playerData.level ?? 1,
    class: playerData.class || 'Unknown',
    school: playerData.school || 'Unknown',
    hp: playerData.hp ?? 100,
    maxHp: playerData.maxHp ?? 100,
    mp: playerData.mp ?? 50,
    maxMp: playerData.maxMp ?? 50,
    speed: playerData.speed ?? 5,
    attackMin: playerData.attackMin ?? 10,
    attackMax: playerData.attackMax ?? 20,
    antiFire: playerData.antiFire ?? 0,
    antiIce: playerData.antiIce ?? 0,
    antiWind: playerData.antiWind ?? 0,
    reducePain: playerData.reducePain ?? 0,
    accurate: playerData.accurate ?? 0,
    dodge: playerData.dodge ?? 0,
    critical: playerData.critical ?? 0,
    counterStrike: playerData.counterStrike ?? 0,
    antiChakra: playerData.antiChakra ?? 0,
    antiChakraBack: playerData.antiChakraBack ?? 0,
    equipment: playerData.equipment || (index >= 0 ? players[index].equipment : []),
    lastUpdated: new Date().toISOString()
  };

  if (index >= 0) {
    players[index] = updatedPlayer;
  } else {
    players.unshift(updatedPlayer);
  }

  saveAllPlayers(players);
  return updatedPlayer;
}

export function deletePlayerByName(name: string): boolean {
  let players = getAllPlayers();
  const initialCount = players.length;
  players = players.filter(p => p.name.toLowerCase() !== name.toLowerCase());
  if (players.length !== initialCount) {
    saveAllPlayers(players);
    return true;
  }
  return false;
}
