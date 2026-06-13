import { contentSeed } from './seed';

export { curriculum, getRecommendedMission } from './curriculum';
export { CONTENT_VERSION, contentSeed } from './seed';

export const modules = contentSeed.modules;
export const missions = contentSeed.missions;
export const skillNodes = contentSeed.skillNodes;
export const nodes = contentSeed.skillNodes;
export const theoryCards = contentSeed.theoryCards;
export const exercises = contentSeed.exercises;
export const percentageExercises = contentSeed.exercises;

export type * from '../domain/types';
