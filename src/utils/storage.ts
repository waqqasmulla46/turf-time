import type { TurfSession } from '../types/turf';

const STORAGE_PREFIX = 'turf_session_';
const ACTIVE_CODE_KEY = 'turf_active_code';
const CODES_INDEX_KEY = 'turf_all_codes_index';

/**
 * Normalizes code: removes whitespace and converts to uppercase
 */
export function normalizeCode(code: string): string {
  return code ? code.trim().toUpperCase() : '';
}

/**
 * Retrieves a session strictly by its 6-character code from localStorage.
 * Guarantees complete restoration of creatorName, totalMoney, qrCodeImage,
 * and the exact player list with individual hasPaid payment statuses.
 */
export function getSession(code: string): TurfSession | null {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  
  const raw = localStorage.getItem(`${STORAGE_PREFIX}${normalized}`);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as TurfSession;
    // Defensive normalization to guarantee complete object structure
    if (session && session.code) {
      return {
        code: session.code,
        creatorName: session.creatorName || 'Captain',
        totalMoney: typeof session.totalMoney === 'number' ? session.totalMoney : 0,
        qrCodeImage: session.qrCodeImage || null,
        players: Array.isArray(session.players) ? session.players.map(p => ({
          id: p.id,
          name: p.name || 'Player',
          hasPaid: Boolean(p.hasPaid)
        })) : []
      };
    }
    return null;
  } catch (e) {
    console.error('Failed to parse session from localStorage for code:', normalized, e);
    return null;
  }
}

/**
 * Saves or updates a session under its code key in localStorage.
 * Also keeps an index of all saved codes.
 */
export function saveSession(session: TurfSession): void {
  if (!session || !session.code) return;
  const normalized = normalizeCode(session.code);

  const cleanSession: TurfSession = {
    code: normalized,
    creatorName: session.creatorName,
    totalMoney: session.totalMoney,
    qrCodeImage: session.qrCodeImage,
    players: session.players.map(p => ({
      id: p.id,
      name: p.name,
      hasPaid: Boolean(p.hasPaid)
    }))
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${normalized}`, JSON.stringify(cleanSession));
    addCodeToIndex(normalized);
  } catch (err: unknown) {
    console.error('LocalStorage write error:', err);
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      alert('Storage quota exceeded! Please remove some large images or old sessions.');
    }
  }
}

/**
 * Maintains an index of all saved codes in localStorage
 */
function addCodeToIndex(code: string): void {
  try {
    const raw = localStorage.getItem(CODES_INDEX_KEY);
    const codes: string[] = raw ? JSON.parse(raw) : [];
    if (!codes.includes(code)) {
      codes.push(code);
      localStorage.setItem(CODES_INDEX_KEY, JSON.stringify(codes));
    }
  } catch (e) {
    console.warn('Failed to update codes index:', e);
  }
}

/**
 * Returns all saved session codes from the device
 */
export function getAllSavedCodes(): string[] {
  try {
    const raw = localStorage.getItem(CODES_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getActiveSessionCode(): string | null {
  const code = localStorage.getItem(ACTIVE_CODE_KEY);
  return code ? normalizeCode(code) : null;
}

export function setActiveSessionCode(code: string | null): void {
  if (code) {
    localStorage.setItem(ACTIVE_CODE_KEY, normalizeCode(code));
  } else {
    localStorage.removeItem(ACTIVE_CODE_KEY);
  }
}

/**
 * Validates if a code is strictly 6 characters.
 * Allows capital letters (A-Z), numbers (0-9), and special characters.
 */
export function isValidCode(code: string): boolean {
  if (!code || code.length !== 6) return false;
  const regex = /^[A-Z0-9!@#$%^&*()_+\-=\[\]{}|;':",.<>?/`~]{6}$/;
  return regex.test(code);
}

/**
 * Sanitizes input to max 6 characters and converts to uppercase.
 */
export function sanitizeCodeInput(value: string): string {
  return value.toUpperCase().slice(0, 6);
}

/**
 * Formats a number as Indian Rupee currency (e.g. ₹200 or ₹250.50)
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  const isInt = Number.isInteger(amount);
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: isInt ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Crucial math logic:
 * Per Person = Total Money / players.length
 * Handles empty states gracefully: if 0 players, returns 0.
 */
export function calculatePerPerson(totalMoney: number, playerCount: number): number {
  if (!playerCount || playerCount <= 0) return 0;
  if (!totalMoney || totalMoney <= 0) return 0;
  return totalMoney / playerCount;
}

/**
 * Compresses and scales down any user-uploaded image (from camera or gallery)
 * to a lightweight Data URL (~30KB-50KB) so that high-resolution phone photos
 * never exceed browser localStorage quotas.
 */
export function compressImageToBase64(file: File, maxDim = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG with 0.85 quality for compact storage
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedBase64);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
