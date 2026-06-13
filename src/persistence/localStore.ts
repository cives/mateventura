import type { ProgressRecord } from '../domain/types';

export const STORAGE_KEY = 'mateventura.localState.v1';
export const CONTENT_VERSION = 'mv-local-0';

export function createInitialProgress(): ProgressRecord {
  return {
    contentVersion: CONTENT_VERSION,
    modules: {},
    missions: {},
    nodes: {},
    usefulErrors: [],
    sessions: [],
  };
}

export function loadProgress(): ProgressRecord {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialProgress();

  try {
    const parsed = JSON.parse(raw) as Partial<ProgressRecord>;
    if (parsed.contentVersion !== CONTENT_VERSION) return createInitialProgress();
    return normalizeProgress(parsed);
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(progress: ProgressRecord): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress(): ProgressRecord {
  const initial = createInitialProgress();
  saveProgress(initial);
  return initial;
}

function normalizeProgress(progress: Partial<ProgressRecord>): ProgressRecord {
  const initial = createInitialProgress();

  return {
    contentVersion: CONTENT_VERSION,
    modules: progress.modules ?? initial.modules,
    missions: progress.missions ?? initial.missions,
    nodes: progress.nodes ?? initial.nodes,
    usefulErrors: progress.usefulErrors ?? initial.usefulErrors,
    sessions: progress.sessions ?? initial.sessions,
  };
}
