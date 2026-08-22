import fs from 'fs';
import path from 'path';

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

let inMemoryPlayers: PlayerProfile[] = [];

// Determine writable file path: use /tmp/players.json on Vercel / serverless
const DATA_FILE = process.env.VERCEL ? '/tmp/players.json' : path.join(process.cwd(), 'data', 'players.json');

export function getAllPlayers(): PlayerProfile[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[NSO-STORE] Read error, using in-memory store:', e);
  }
  return inMemoryPlayers;
}

export function saveAllPlayers(players: PlayerProfile[]) {
  inMemoryPlayers = players;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2), 'utf8');
  } catch (e) {
    console.warn('[NSO-STORE] File write warning (serverless environment):', e);
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
