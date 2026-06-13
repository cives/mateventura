// Sistema de juego: experiencia (XP), niveles con rango temático y logros.
// Todo son funciones puras para poder probarlas y reproducirlas.

export interface PlayerProfile {
  version: 1;
  alias: string;
  xp: number;
  totalCorrect: number;
  totalAttempts: number;
  bestStreak: number;
  solvedByModule: Record<string, number>;
  achievements: string[];
  lastDailyDoneDate: string | null;
  dailyStreak: number;
}

export function createProfile(alias = 'Exploradora'): PlayerProfile {
  return {
    version: 1,
    alias,
    xp: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    bestStreak: 0,
    solvedByModule: {},
    achievements: [],
    lastDailyDoneDate: null,
    dailyStreak: 0,
  };
}

// ---- XP ----

/** XP ganada al acertar: base por dificultad, menos penalización por pistas, más bono de racha. */
export function xpForAnswer(difficulty: number, hintsUsed: number, streak: number): number {
  const base = 10 + difficulty * 6; // 16..40
  const hintPenalty = Math.min(hintsUsed * 4, base - 6);
  const streakBonus = Math.min(streak, 8) * 3; // hasta +24
  return Math.max(6, Math.round(base - hintPenalty + streakBonus));
}

// ---- Niveles ----

export interface LevelInfo {
  level: number;
  title: string;
  emoji: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number; // 0..1
}

// XP acumulada necesaria para alcanzar cada nivel (crece suave).
function xpThreshold(level: number): number {
  // nivel 1 = 0, y a partir de ahí ~ 60*level^1.5
  return Math.round(60 * Math.pow(level - 1, 1.5));
}

const RANKS: Array<{ emoji: string; title: string }> = [
  { emoji: '🌱', title: 'Aprendiz de números' },
  { emoji: '🧭', title: 'Exploradora de fórmulas' },
  { emoji: '🗺️', title: 'Cartógrafa de problemas' },
  { emoji: '⚔️', title: 'Aventurera algebraica' },
  { emoji: '🛡️', title: 'Guardiana de la lógica' },
  { emoji: '🔮', title: 'Hechicera de ecuaciones' },
  { emoji: '🏆', title: 'Campeona del cálculo' },
  { emoji: '👑', title: 'Maestra MateVentura' },
];

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  while (xpThreshold(level + 1) <= xp) level += 1;
  const rank = RANKS[Math.min(level - 1, RANKS.length - 1)];
  const current = xpThreshold(level);
  const next = xpThreshold(level + 1);
  const span = Math.max(1, next - current);
  return {
    level,
    title: rank.title,
    emoji: rank.emoji,
    xpIntoLevel: xp - current,
    xpForNextLevel: next - current,
    progress: Math.min(1, (xp - current) / span),
  };
}

// ---- Logros ----

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  isUnlocked: (p: PlayerProfile) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', emoji: '✨', title: 'Primer acierto', description: 'Resuelve tu primer ejercicio.', isUnlocked: (p) => p.totalCorrect >= 1 },
  { id: 'streak_5', emoji: '🔥', title: 'En racha', description: 'Encadena 5 aciertos seguidos.', isUnlocked: (p) => p.bestStreak >= 5 },
  { id: 'streak_10', emoji: '🌋', title: 'Imparable', description: 'Encadena 10 aciertos seguidos.', isUnlocked: (p) => p.bestStreak >= 10 },
  { id: 'solve_25', emoji: '💪', title: 'Cantera', description: 'Resuelve 25 ejercicios en total.', isUnlocked: (p) => p.totalCorrect >= 25 },
  { id: 'solve_100', emoji: '🚀', title: 'Centenaria', description: 'Resuelve 100 ejercicios en total.', isUnlocked: (p) => p.totalCorrect >= 100 },
  { id: 'level_5', emoji: '🛡️', title: 'Nivel 5', description: 'Alcanza el nivel 5.', isUnlocked: (p) => levelFromXp(p.xp).level >= 5 },
  { id: 'daily_3', emoji: '📅', title: 'Constante', description: 'Completa el reto del día 3 días distintos.', isUnlocked: (p) => p.dailyStreak >= 3 },
  { id: 'explorer', emoji: '🌍', title: 'Todoterreno', description: 'Practica en 4 territorios diferentes.', isUnlocked: (p) => Object.values(p.solvedByModule).filter((n) => n > 0).length >= 4 },
];

/** Devuelve los IDs de logros recién desbloqueados (los que cumple pero aún no tenía). */
export function newlyUnlocked(profile: PlayerProfile): string[] {
  return ACHIEVEMENTS.filter((a) => a.isUnlocked(profile) && !profile.achievements.includes(a.id)).map((a) => a.id);
}

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// ---- Frases de ánimo (variadas, no repetitivas) ----

const CHEERS = [
  '¡Genial! 🎉', '¡Lo clavaste! 🎯', '¡Crack! 💫', '¡Brutal! 🔥', '¡Máquina! ⚙️',
  '¡Olé! 👏', '¡Perfecto! ✅', '¡Sigue así! 🚀', '¡Toma ya! 💥', '¡Eres un sol! ☀️',
];

export function cheer(seedNumber: number): string {
  return CHEERS[Math.abs(seedNumber) % CHEERS.length];
}

const ENCOURAGE = [
  'Casi, casi. Mira la pista 👀',
  'Tranqui, el error es parte del mapa 🗺️',
  'Respira y repasa el último paso 🧠',
  'Un fallo hoy es un acierto mañana 💪',
  'Vuelve a leer qué te piden exactamente 🔍',
];

export function encourage(seedNumber: number): string {
  return ENCOURAGE[Math.abs(seedNumber) % ENCOURAGE.length];
}
