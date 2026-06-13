import { contentSeed } from '../content/seed';
import { exerciseSchema } from './exercise.schema';

export function validateContent(): string[] {
  const errors: string[] = [];
  const seenExercises = new Set<string>();
  const moduleIds = new Set(contentSeed.modules.map((module) => module.id));
  const missionIds = new Set(contentSeed.missions.map((mission) => mission.id));
  const nodeIds = new Set(contentSeed.skillNodes.map((node) => node.id));
  const theoryCardIds = new Set(contentSeed.theoryCards.map((card) => card.id));
  const exerciseIds = new Set(contentSeed.exercises.map((exercise) => exercise.id));

  if (contentSeed.modules.length !== 6) errors.push(`contentSeed: se esperaban 6 módulos y hay ${contentSeed.modules.length}`);
  if (contentSeed.missions.length < 1) errors.push('contentSeed: falta al menos una misión');

  const percentagesMission = contentSeed.missions.find((mission) => mission.id === 'mission.percentages.market_discounts');
  if (!percentagesMission) {
    errors.push('contentSeed: falta la misión mission.percentages.market_discounts');
  } else {
    const count = percentagesMission.exerciseIds?.length ?? 0;
    if (count < 12 || count > 20) {
      errors.push(`mission.percentages.market_discounts: se esperaban entre 12 y 20 ejercicios y hay ${count}`);
    }
  }

  const algebraMission = contentSeed.missions.find((mission) => mission.id === 'mission.algebra.linear_equations_brief');
  if (!algebraMission) {
    errors.push('contentSeed: falta la misión mission.algebra.linear_equations_brief');
  } else {
    const count = algebraMission.exerciseIds?.length ?? 0;
    if (count < 6 || count > 8) {
      errors.push(`mission.algebra.linear_equations_brief: se esperaban entre 6 y 8 ejercicios y hay ${count}`);
    }
  }

  const totalMissionExercises = contentSeed.missions.reduce((acc, mission) => acc + (mission.exerciseIds?.length ?? 0), 0);
  if (contentSeed.exercises.length !== totalMissionExercises) {
    errors.push(`contentSeed: se esperaban ${totalMissionExercises} ejercicios y hay ${contentSeed.exercises.length}`);
  }

  for (const module of contentSeed.modules) {
    for (const missionId of module.missionIds) {
      if (!missionIds.has(missionId)) errors.push(`${module.id}: referencia a misión inexistente ${missionId}`);
    }
    if (module.recommendedFirstMissionId && !missionIds.has(module.recommendedFirstMissionId)) {
      errors.push(`${module.id}: recommendedFirstMissionId inexistente ${module.recommendedFirstMissionId}`);
    }
  }

  for (const mission of contentSeed.missions) {
    if (!moduleIds.has(mission.moduleId)) errors.push(`${mission.id}: moduleId inexistente ${mission.moduleId}`);
    for (const nodeId of mission.nodeIds) {
      if (!nodeIds.has(nodeId)) errors.push(`${mission.id}: nodeId inexistente ${nodeId}`);
    }
    for (const theoryCardId of mission.theoryCardIds) {
      if (!theoryCardIds.has(theoryCardId)) errors.push(`${mission.id}: theoryCardId inexistente ${theoryCardId}`);
    }
    for (const exerciseId of mission.exerciseIds ?? []) {
      if (!exerciseIds.has(exerciseId)) errors.push(`${mission.id}: exerciseId inexistente ${exerciseId}`);
    }
  }

  for (const node of contentSeed.skillNodes) {
    if (!moduleIds.has(node.moduleId)) errors.push(`${node.id}: moduleId inexistente ${node.moduleId}`);
    for (const missionId of node.missionIds) {
      if (!missionIds.has(missionId)) errors.push(`${node.id}: missionId inexistente ${missionId}`);
    }
    for (const prerequisite of node.prerequisites) {
      if (!nodeIds.has(prerequisite)) errors.push(`${node.id}: prerequisite inexistente ${prerequisite}`);
    }
  }

  for (const card of contentSeed.theoryCards) {
    for (const nodeId of card.nodeIds) {
      if (!nodeIds.has(nodeId)) errors.push(`${card.id}: nodeId inexistente ${nodeId}`);
    }
  }

  for (const exercise of contentSeed.exercises) {
    const result = exerciseSchema.safeParse(exercise);
    if (!result.success) errors.push(`${exercise.id}: ${result.error.message}`);
    if (seenExercises.has(exercise.id)) errors.push(`${exercise.id}: identificador duplicado`);
    seenExercises.add(exercise.id);
    if (!moduleIds.has(exercise.moduleId)) errors.push(`${exercise.id}: moduleId inexistente ${exercise.moduleId}`);
    for (const missionId of exercise.missionIds) {
      if (!missionIds.has(missionId)) errors.push(`${exercise.id}: missionId inexistente ${missionId}`);
    }
    for (const nodeId of exercise.nodeIds) {
      if (!nodeIds.has(nodeId)) errors.push(`${exercise.id}: nodeId inexistente ${nodeId}`);
    }
    for (const commonError of exercise.commonErrors) {
      if (commonError.repairExerciseId && !exerciseIds.has(commonError.repairExerciseId)) {
        errors.push(`${exercise.id}: repairExerciseId inexistente ${commonError.repairExerciseId}`);
      }
    }
    if (exercise.hints.length === 0) errors.push(`${exercise.id}: falta al menos una pista`);
    if (!exercise.explanation.text) errors.push(`${exercise.id}: falta explicación`);
  }

  return errors;
}
