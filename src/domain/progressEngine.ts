import type { AnswerAttempt, NodeProgress, ProgressRecord, UsefulError } from './types';

const INITIAL_NODE_PROGRESS: NodeProgress = {
  attempts: 0,
  correct: 0,
  openErrors: 0,
  repairedErrors: 0,
  mastery: 0,
};

export interface RepairSummary {
  selectedOpenError: UsefulError | null;
  repairedNow: boolean;
  openUsefulErrors: number;
  repairedUsefulErrors: number;
}

export function applyAttemptToProgress(progress: ProgressRecord, attempt: AnswerAttempt): ProgressRecord {
  const next: ProgressRecord = {
    ...progress,
    nodes: { ...progress.nodes },
    usefulErrors: [...progress.usefulErrors],
  };

  const selectedOpenError = selectOpenUsefulError(next, attempt);

  for (const nodeId of attempt.nodeIds) {
    const previous = next.nodes[nodeId] ?? INITIAL_NODE_PROGRESS;
    const impact = calculateAttemptImpact(attempt, previous);
    const repairedInNode = selectedOpenError && attempt.isCorrect && selectedOpenError.nodeIds.includes(nodeId) ? 1 : 0;

    next.nodes[nodeId] = {
      attempts: previous.attempts + 1,
      correct: previous.correct + (attempt.isCorrect ? 1 : 0),
      openErrors: Math.max(0, previous.openErrors + (attempt.isCorrect || !attempt.errorCode ? 0 : 1) - repairedInNode),
      repairedErrors: previous.repairedErrors + repairedInNode,
      mastery: roundMastery((previous.mastery ?? 0) * 0.7 + impact * 0.3),
    };
  }

  if (!attempt.isCorrect && attempt.errorCode) {
    next.usefulErrors.push(createUsefulError(attempt));
  }

  if (selectedOpenError && attempt.isCorrect) {
    next.usefulErrors = next.usefulErrors.map((error) =>
      error.id === selectedOpenError.id
        ? {
            ...error,
            status: 'repaired',
            repairedAt: attempt.createdAt,
          }
        : error,
    );
  }

  return next;
}

export function selectOpenUsefulError(progress: ProgressRecord, attempt: Pick<AnswerAttempt, 'exerciseId' | 'nodeIds'>): UsefulError | null {
  const openErrors = progress.usefulErrors.filter((error) => error.status === 'open');

  for (let index = openErrors.length - 1; index >= 0; index -= 1) {
    const candidate = openErrors[index];

    if (candidate.exerciseId === attempt.exerciseId) {
      return candidate;
    }

    if (candidate.nodeIds.some((nodeId) => attempt.nodeIds.includes(nodeId))) {
      return candidate;
    }
  }

  return null;
}

export function buildRepairSummary(progress: ProgressRecord, attempt: Pick<AnswerAttempt, 'exerciseId' | 'nodeIds' | 'isCorrect'>): RepairSummary {
  const selectedOpenError = selectOpenUsefulError(progress, attempt);
  const openUsefulErrors = progress.usefulErrors.filter((error) => error.status === 'open').length;
  const repairedUsefulErrors = progress.usefulErrors.filter((error) => error.status === 'repaired').length;

  return {
    selectedOpenError,
    repairedNow: Boolean(selectedOpenError && attempt.isCorrect),
    openUsefulErrors,
    repairedUsefulErrors,
  };
}

function calculateAttemptImpact(attempt: AnswerAttempt, previous: NodeProgress): number {
  const base = attempt.isCorrect ? 1 : 0;
  const hintsPenalty = 0.12 * attempt.usedHints;
  const repeatedPenalty = Math.min(previous.attempts * 0.05, 0.2);
  return clamp(base - hintsPenalty - repeatedPenalty, 0, 1);
}

function createUsefulError(attempt: AnswerAttempt): UsefulError {
  return {
    id: `error.${attempt.exerciseId}.${attempt.createdAt}`,
    code: attempt.errorCode ?? 'unknown',
    status: 'open',
    exerciseId: attempt.exerciseId,
    missionId: attempt.missionId,
    nodeIds: attempt.nodeIds,
    createdAt: attempt.createdAt,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundMastery(value: number): number {
  return Math.round(value * 1000) / 1000;
}
