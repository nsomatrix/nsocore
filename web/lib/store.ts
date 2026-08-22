import fs from 'fs';
import path from 'path';
import os from 'os';

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
  lastUpdated: string;
}

// In-memory global store to preserve state across warm Vercel Lambdas
const globalStore = globalThis as unknown as { _matrixPlayersStore?: PlayerProfile[] };
if (!globalStore._matrixPlayersStore) {
  globalStore._matrixPlayersStore = [];
}

function getDataFilePath(): string {
  // On Vercel / serverless environment, process.cwd() is read-only. Use os.tmpdir()
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join(os.tmpdir(), 'players.json');
  }
  return path.join(process.cwd(), 'data', 'players.json');
}

export function getAllPlayers(): PlayerProfile[] {
  const filePath = getDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalStore._matrixPlayersStore = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[STORE] Error reading player file, using in-memory store:', e);
  }
  return globalStore._matrixPlayersStore || [];
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

export function saveOrUpdatePlayer(playerData: Partial<PlayerProfile> & { name: string }): PlayerProfile {
  const players = getAllPlayers();
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
