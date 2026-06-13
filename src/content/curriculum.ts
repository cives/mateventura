import { contentSeed } from './seed';

export const curriculum = {
  course: '2ESO',
  region: 'Andalucía',
  modules: contentSeed.modules,
  nodes: contentSeed.skillNodes,
  missions: contentSeed.missions,
  theoryCards: contentSeed.theoryCards,
  exercises: contentSeed.exercises,
  contentVersion: contentSeed.contentVersion,
} as const;

export function getRecommendedMission() {
  return curriculum.missions.find((mission) => mission.id === 'mission.algebra.linear_equations_brief') ?? curriculum.missions[0];
}
