import fs from 'fs';
import path from 'path';
import os from 'os';
import { PlayerProfile, ChatMessage } from './store';

export interface UserSavedData {
  savedCards: PlayerProfile[];
  pmMessages: ChatMessage[];
}

const MAX_PM_MESSAGES = 100;

// Global in-memory map keyed by userId/email
const globalUserStore = globalThis as unknown as {
  _matrixUserMap?: Record<string, UserSavedData>;
};

if (!globalUserStore._matrixUserMap) {
  globalUserStore._matrixUserMap = {};
}

function getUserDataFilePath(userId: string): string {
  const safeId = userId.toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join(os.tmpdir(), `user_${safeId}.json`);
  }
  return path.join(process.cwd(), 'data', 'users', `user_${safeId}.json`);
}

export function getUserData(userId: string): UserSavedData {
  const safeId = userId.toLowerCase();
  if (globalUserStore._matrixUserMap?.[safeId]) {
    return globalUserStore._matrixUserMap[safeId];
  }

  const filePath = getUserDataFilePath(userId);
  let loaded: UserSavedData = { savedCards: [], pmMessages: [] };

  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        loaded = {
          savedCards: Array.isArray(parsed.savedCards) ? parsed.savedCards : [],
          pmMessages: Array.isArray(parsed.pmMessages) ? parsed.pmMessages : [],
        };
      }
    }
  } catch (e) {
    console.warn(`[USER_STORE] Error reading data for ${userId}, initializing empty store:`, e);
  }

  if (globalUserStore._matrixUserMap) {
    globalUserStore._matrixUserMap[safeId] = loaded;
  }
  return loaded;
}

export function saveUserData(userId: string, data: UserSavedData) {
  const safeId = userId.toLowerCase();
  if (globalUserStore._matrixUserMap) {
    globalUserStore._matrixUserMap[safeId] = data;
  }

  const filePath = getUserDataFilePath(userId);
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn(`[USER_STORE] Error writing file for ${userId}:`, e);
  }
}

// Player Cards Methods
export function getSavedCards(userId: string): PlayerProfile[] {
  return getUserData(userId).savedCards;
}

export function toggleSaveCard(userId: string, player: PlayerProfile): { savedCards: PlayerProfile[]; isSaved: boolean } {
  const data = getUserData(userId);
  const existsIndex = data.savedCards.findIndex((p) => p.name.toLowerCase() === player.name.toLowerCase());
  let isSaved = false;

  if (existsIndex >= 0) {
    // Remove if already saved
    data.savedCards.splice(existsIndex, 1);
    isSaved = false;
  } else {
    // Add to saved cards
    data.savedCards.unshift(player);
    isSaved = true;
  }

  saveUserData(userId, data);
  return { savedCards: data.savedCards, isSaved };
}

export function removeSavedCard(userId: string, playerName: string): PlayerProfile[] {
  const data = getUserData(userId);
  data.savedCards = data.savedCards.filter((p) => p.name.toLowerCase() !== playerName.toLowerCase());
  saveUserData(userId, data);
  return data.savedCards;
}

// PM Chat Messages Methods (FIFO 100 Cap)
export function getUserPmMessages(userId: string): ChatMessage[] {
  return getUserData(userId).pmMessages;
}

export function appendUserPmMessage(
  userId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): ChatMessage[] {
  const data = getUserData(userId);

  const fullMsg: ChatMessage = {
    id: message.id || `pm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    channel: 'PRIVATE',
    sender: message.sender,
    recipient: message.recipient,
    message: message.message,
    timestamp: message.timestamp || new Date().toISOString(),
  };

  // Add to top of array (newest first)
  data.pmMessages.unshift(fullMsg);

  // Strict 100-message FIFO cap: keep only the 100 most recent messages
  if (data.pmMessages.length > MAX_PM_MESSAGES) {
    data.pmMessages = data.pmMessages.slice(0, MAX_PM_MESSAGES);
  }

  saveUserData(userId, data);
  return data.pmMessages;
}

export function clearUserPmMessages(userId: string): ChatMessage[] {
  const data = getUserData(userId);
  data.pmMessages = [];
  saveUserData(userId, data);
  return [];
}
