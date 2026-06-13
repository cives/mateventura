import { describe, expect, it } from 'vitest';
import { applyAttemptToProgress, buildRepairSummary, selectOpenUsefulError } from '../../domain/progressEngine';
import type { AnswerAttempt, ProgressRecord } from '../../domain/types';

function createEmptyProgress(): ProgressRecord {
  return {
    contentVersion: 'mv-local-0',
    modules: {},
    missions: {},
    nodes: {},
    usefulErrors: [],
    sessions: [],
  };
}

describe('applyAttemptToProgress', () => {
  it('abre error útil tras fallo detectable', () => {
    const progress = createEmptyProgress();
    const attempt: AnswerAttempt = {
      exerciseId: 'exercise.mv-2eso-a5-percentages-001',
      missionId: 'mission.percentages.market_discounts',
      nodeIds: ['node.percentages.calculate_part'],
      answer: '30',
      isCorrect: false,
      usedHints: 1,
      errorCode: 'parte_vs_final',
      createdAt: '2026-05-31T00:00:00.000Z',
    };

    const updated = applyAttemptToProgress(progress, attempt);

    expect(updated.nodes['node.percentages.calculate_part']).toMatchObject({ attempts: 1, correct: 0, openErrors: 1 });
    expect(updated.usefulErrors).toHaveLength(1);
    expect(updated.usefulErrors[0]).toMatchObject({
      code: 'parte_vs_final',
      status: 'open',
      exerciseId: 'exercise.mv-2eso-a5-percentages-001',
      missionId: 'mission.percentages.market_discounts',
      nodeIds: ['node.percentages.calculate_part'],
    });
  });

  it('marca como reparado un error abierto tras acierto en nodo relacionado', () => {
    const progress: ProgressRecord = {
      ...createEmptyProgress(),
      nodes: {
        'node.percentages.calculate_part': { attempts: 1, correct: 0, openErrors: 1, repairedErrors: 0, mastery: 0.1 },
      },
      usefulErrors: [
        {
          id: 'error.exercise.mv-2eso-a5-percentages-001.2026-05-31T00:00:00.000Z',
          code: 'parte_vs_final',
          exerciseId: 'exercise.mv-2eso-a5-percentages-001',
          missionId: 'mission.percentages.market_discounts',
          nodeIds: ['node.percentages.calculate_part'],
          status: 'open',
          createdAt: '2026-05-31T00:00:00.000Z',
        },
      ],
    };

    const successAttempt: AnswerAttempt = {
      exerciseId: 'exercise.mv-2eso-a5-percentages-006',
      missionId: 'mission.percentages.market_discounts',
      nodeIds: ['node.percentages.calculate_part'],
      answer: '12',
      isCorrect: true,
      usedHints: 0,
      createdAt: '2026-05-31T00:10:00.000Z',
    };

    const updated = applyAttemptToProgress(progress, successAttempt);

    expect(updated.usefulErrors[0]).toMatchObject({ status: 'repaired', repairedAt: '2026-05-31T00:10:00.000Z' });
    expect(updated.nodes['node.percentages.calculate_part']).toMatchObject({ openErrors: 0, repairedErrors: 1 });
  });

  it('selecciona el último error abierto del mismo ejercicio o nodo para resumen mostrable', () => {
    const progress: ProgressRecord = {
      ...createEmptyProgress(),
      usefulErrors: [
        {
          id: 'error.old',
          code: 'parte_vs_final',
          exerciseId: 'exercise.mv-2eso-a5-percentages-001',
          missionId: 'mission.percentages.market_discounts',
          nodeIds: ['node.percentages.calculate_part'],
          status: 'open',
          createdAt: '2026-05-31T00:00:00.000Z',
        },
        {
          id: 'error.latest',
          code: 'wrong_reference_amount',
          exerciseId: 'exercise.mv-2eso-a5-percentages-004',
          missionId: 'mission.percentages.market_discounts',
          nodeIds: ['node.percentages.calculate_part'],
          status: 'open',
          createdAt: '2026-05-31T00:02:00.000Z',
        },
      ],
    };

    const selected = selectOpenUsefulError(progress, {
      exerciseId: 'exercise.mv-2eso-a5-percentages-010',
      nodeIds: ['node.percentages.calculate_part'],
    });

    expect(selected?.id).toBe('error.latest');

    const summary = buildRepairSummary(progress, {
      exerciseId: 'exercise.mv-2eso-a5-percentages-010',
      nodeIds: ['node.percentages.calculate_part'],
      isCorrect: true,
    });

    expect(summary.selectedOpenError?.id).toBe('error.latest');
    expect(summary.repairedNow).toBe(true);
    expect(summary.openUsefulErrors).toBe(2);
    expect(summary.repairedUsefulErrors).toBe(0);
  });
});
