import { createProfile, type PlayerProfile } from '../domain/gamification';

export const PLAYER_KEY = 'mateventura.player.v1';

export function loadPlayer(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PLAYER_KEY);
    if (!raw) return createProfile();
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    if (parsed.version !== 1) return createProfile(parsed.alias);
    return { ...createProfile(parsed.alias), ...parsed, version: 1 } as PlayerProfile;
  } catch {
    return createProfile();
  }
}

export function savePlayer(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(profile));
  } catch {
    // almacenamiento no disponible: el juego sigue funcionando en memoria
  }
}

export function resetPlayer(alias?: string): PlayerProfile {
  const fresh = createProfile(alias);
  savePlayer(fresh);
  return fresh;
}

/** Fecha local en formato AAAA-MM-DD para controlar el reto diario. */
export function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
