import { describe, expect, it, beforeEach } from 'vitest';
import { CONTENT_VERSION, STORAGE_KEY, createInitialProgress, loadProgress, saveProgress, resetProgress } from '../../persistence/localStore';

describe('localStore', () => {
  beforeEach(() => localStorage.clear());

  it('guarda, recupera y reinicia progreso local versionado', () => {
    const initial = createInitialProgress();
    const changed = {
      ...initial,
      nodes: { 'node.percentages.calculate_part': { attempts: 1, correct: 1, openErrors: 0, repairedErrors: 0 } },
    };

    saveProgress(changed);
    expect(loadProgress()).toMatchObject(changed);

    resetProgress();
    expect(loadProgress()).toMatchObject(createInitialProgress());
  });

  it('normaliza campos faltantes manteniendo versión vigente', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        contentVersion: CONTENT_VERSION,
        nodes: { 'node.percentages.calculate_part': { attempts: 2, correct: 1, openErrors: 1, repairedErrors: 0 } },
      }),
    );

    const loaded = loadProgress();

    expect(loaded.contentVersion).toBe(CONTENT_VERSION);
    expect(loaded.nodes['node.percentages.calculate_part']).toMatchObject({ attempts: 2, correct: 1, openErrors: 1, repairedErrors: 0 });
    expect(loaded.usefulErrors).toEqual([]);
    expect(loaded.sessions).toEqual([]);
    expect(loaded.modules).toEqual({});
    expect(loaded.missions).toEqual({});
  });
});
