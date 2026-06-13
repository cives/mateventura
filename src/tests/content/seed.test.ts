import { describe, expect, it } from 'vitest';
import * as publicContent from '../../content';
import { curriculum, getRecommendedMission } from '../../content/curriculum';
import { contentSeed } from '../../content/seed';
import { validateContent } from '../../schemas/contentValidation';

describe('contenido inicial', () => {
  it('usa contentSeed como fuente única del currículo local 0', () => {
    expect(curriculum.contentVersion).toBe(contentSeed.contentVersion);
    expect(curriculum.modules).toBe(contentSeed.modules);
    expect(curriculum.nodes).toBe(contentSeed.skillNodes);
    expect(curriculum.missions).toBe(contentSeed.missions);
    expect(curriculum.theoryCards).toBe(contentSeed.theoryCards);
    expect(curriculum.exercises).toBe(contentSeed.exercises);
  });

  it('expone seis módulos y recomienda la práctica breve de ecuaciones (8 ejercicios)', () => {
    const mission = getRecommendedMission();

    expect(curriculum.modules).toHaveLength(6);
    expect(mission.id).toBe('mission.algebra.linear_equations_brief');
    expect(mission.exerciseIds).toHaveLength(8);

    const equationExercises = curriculum.exercises.filter((exercise) =>
      exercise.missionIds.includes('mission.algebra.linear_equations_brief'),
    );
    expect(equationExercises).toHaveLength(8);
    expect(curriculum.exercises.length).toBeGreaterThanOrEqual(20);
  });

  it('mantiene el punto público de contenido alineado con contentSeed', () => {
    expect(publicContent.contentSeed).toBe(contentSeed);
    expect(publicContent.modules).toBe(contentSeed.modules);
    expect(publicContent.missions).toBe(contentSeed.missions);
    expect(publicContent.skillNodes).toBe(contentSeed.skillNodes);
    expect(publicContent.nodes).toBe(contentSeed.skillNodes);
    expect(publicContent.theoryCards).toBe(contentSeed.theoryCards);
    expect(publicContent.exercises).toBe(contentSeed.exercises);
    expect(publicContent.percentageExercises).toBe(contentSeed.exercises);
    expect(publicContent.modules).toHaveLength(6);
    expect(publicContent.missions[0].exerciseIds).toHaveLength(12);
    expect(publicContent.percentageExercises).toHaveLength(contentSeed.exercises.length);
  });

  it('mantiene referencias de reparación consistentes tras ampliar el banco de ejercicios', () => {
    const exercisesById = new Map(contentSeed.exercises.map((exercise) => [exercise.id, exercise]));

    const errorsWithRepairTarget = contentSeed.exercises.flatMap((exercise) =>
      exercise.commonErrors
        .filter((error) => Boolean(error.repairExerciseId))
        .map((error) => ({
          sourceExerciseId: exercise.id,
          sourceMissionIds: exercise.missionIds,
          repairExerciseId: error.repairExerciseId as string,
        })),
    );

    expect(errorsWithRepairTarget.length).toBeGreaterThan(0);

    for (const { sourceExerciseId, sourceMissionIds, repairExerciseId } of errorsWithRepairTarget) {
      const repairExercise = exercisesById.get(repairExerciseId);

      expect(repairExercise, `Falta repairExerciseId=${repairExerciseId} usado desde ${sourceExerciseId}`).toBeDefined();
      expect(repairExercise?.missionIds.some((missionId) => sourceMissionIds.includes(missionId))).toBe(true);
    }
  });

  it('incluye nuevos casos de error típico en los ejercicios añadidos (007-012)', () => {
    const recentExerciseIds = new Set([
      'exercise.mv-2eso-a5-percentages-007',
      'exercise.mv-2eso-a5-percentages-008',
      'exercise.mv-2eso-a5-percentages-009',
      'exercise.mv-2eso-a5-percentages-010',
      'exercise.mv-2eso-a5-percentages-011',
      'exercise.mv-2eso-a5-percentages-012',
    ]);
    const recentExercises = contentSeed.exercises.filter((exercise) => recentExerciseIds.has(exercise.id));

    expect(recentExercises).toHaveLength(6);
    expect(recentExercises.every((exercise) => exercise.commonErrors.length > 0)).toBe(true);
    expect(recentExercises.every((exercise) => exercise.commonErrors.every((error) => error.trigger?.kind === 'numeric_value'))).toBe(true);
  });

  it('valida el semillero completo y sus referencias internas', () => {
    expect(validateContent()).toEqual([]);
    expect(contentSeed.exercises.every((exercise) => exercise.statement.length > 0)).toBe(true);
  });
});
