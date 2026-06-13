export type AppRoute = 'welcome' | 'map' | 'mission' | 'exercise' | 'errors' | 'settings';

export interface AppState {
  route: AppRoute;
  activeMissionId: string;
  activeExerciseIndex: number;
  learnerAlias: string;
}

export const initialAppState: AppState = {
  route: 'welcome',
  activeMissionId: 'mission.percentages.market_discounts',
  activeExerciseIndex: 0,
  learnerAlias: 'Explorador local',
};
