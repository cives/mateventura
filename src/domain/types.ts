export type Course = '2ESO';
export type Subject = 'Matemáticas';
export type CurriculumSense = 'A' | 'B' | 'C' | 'D' | 'F';
export type ModuleStatus = 'available' | 'partial' | 'coming_soon' | 'extension';
export type MissionState = 'locked' | 'available' | 'in_progress' | 'passed' | 'reinforce' | 'consolidated' | 'challenge_open';
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type ExerciseType =
  | 'numeric_answer'
  | 'number_with_unit'
  | 'fraction_percent_equivalence'
  | 'multiple_choice'
  | 'linear_equation_solution'
  | 'guided_steps'
  | 'short_justification';

export interface CurriculumTagSet {
  sense: CurriculumSense;
  knowledgeCodes: string[];
  competencies: string[];
  criteria: string[];
}

export interface Module {
  id: string;
  title: string;
  territoryName: string;
  description: string;
  curriculumSense: CurriculumSense;
  knowledgeCodes: string[];
  competencies: string[];
  criteria: string[];
  missionIds: string[];
  status: ModuleStatus;
  recommendedFirstMissionId?: string;
}

export interface MissionSuccessRule {
  minNodeMastery: number;
  minCorrectAnswers: number;
  requiresRepairedError: boolean;
}

export interface RewardDefinition {
  id: string;
  title: string;
  kind: 'strategy_card' | 'badge' | 'tool' | 'map_unlock';
  description: string;
}

export interface RepairPolicy {
  triggerErrorCodes: string[];
  repairNodeIds: string[];
  message: string;
}

export interface ExerciseSelectionRule {
  nodeId: string;
  minItems: number;
  maxItems: number;
  difficulties: Difficulty[];
}

export interface Mission {
  id: string;
  moduleId: string;
  title: string;
  narrativeTitle?: string;
  learningGoal: string;
  estimatedMinutes: number;
  prerequisites: string[];
  nodeIds: string[];
  theoryCardIds: string[];
  exerciseIds?: string[];
  exercisePool?: ExerciseSelectionRule[];
  successRule?: MissionSuccessRule;
  rewards?: RewardDefinition[];
  repairPolicy?: RepairPolicy;
  curriculum: CurriculumTagSet;
  stateForNewLearner?: MissionState;
}

export interface SkillNode {
  id: string;
  moduleId: string;
  missionIds: string[];
  title: string;
  description: string;
  skillFamily: string;
  difficultyRange: [Difficulty, Difficulty];
  prerequisites: string[];
  commonErrorCodes: string[];
  curriculum: CurriculumTagSet;
}

export type Node = SkillNode;
export type LearningNode = SkillNode;

export interface WorkedExampleObject {
  statement: string;
  steps: string[];
  answer: string;
}
export type WorkedExample = string | WorkedExampleObject;

export interface TheoryCard {
  id: string;
  nodeIds: string[];
  title: string;
  body: string;
  workedExample: WorkedExample;
  commonMistake?: string;
  strategyCardIds?: string[];
}

export interface ExerciseSource {
  kind: 'pdf' | 'prototype' | 'created_for_mvp' | 'official_adaptation';
  document?: string;
  page?: number;
  exerciseNumber?: string;
  extractionStatus?: 'transcribed' | 'ocr_needed' | 'adapted' | 'created';
}

export interface AnswerInputDefinition {
  kind: 'text' | 'number' | 'choice' | 'guided_steps';
  placeholder?: string;
  choices?: Array<{ id: string; text: string }>;
  options?: Array<{ id: string; label: string }>;
}

export type ExpectedAnswer =
  | { kind: 'number'; value: number; tolerance: number }
  | { kind: 'number_with_unit'; value: number; unit: string; tolerance: number; unitRequired: boolean }
  | { kind: 'percent_equivalence'; valueAsDecimal: number; tolerance: number }
  | { kind: 'choice'; choiceId: string }
  | { kind: 'multiple_choice'; optionId: string }
  | { kind: 'linear_equation_solution'; variable: string; value: number }
  | { kind: 'guided_steps'; finalValue: number | string; requiredStepIds: string[] };

export interface CorrectionSpec {
  corrector: 'numeric' | 'numeric_with_unit' | 'percent_equivalence' | 'choice' | 'multiple_choice' | 'linear_equation_solution' | 'guided_steps';
  acceptedDecimalSeparators?: Array<',' | '.'>;
  acceptEquivalentUnits?: boolean;
  acceptBareNumber?: boolean;
  validateBySubstitution?: boolean;
}

export interface Hint {
  level: 1 | 2 | 3 | number;
  text: string;
}

export interface ExplanationSpec {
  text: string;
  steps?: string[];
  check?: string;
}

export interface CommonErrorSpec {
  code: string;
  trigger?: { kind: 'numeric_value'; value: number; tolerance: number } | { kind: 'choice'; choiceId: string };
  diagnosis?: string;
  feedback: string;
  repairExerciseId?: string;
  detectable?: boolean;
  when?: string;
  ifNumericValueEquals?: number;
}

export interface Exercise {
  id: string;
  version: number;
  source?: ExerciseSource;
  course: Course;
  subject: Subject;
  moduleId: string;
  missionIds: string[];
  nodeIds: string[];
  family: string;
  difficulty: Difficulty;
  statement: string;
  answerInput: AnswerInputDefinition;
  expectedAnswer: ExpectedAnswer;
  correction: CorrectionSpec;
  hints: Hint[];
  explanation: ExplanationSpec;
  commonErrors: CommonErrorSpec[];
  curriculum: CurriculumTagSet;
  pedagogicalNotes?: string;
}

export type NextAction = 'continue' | 'retry' | 'show_example' | 'repair' | 'review_theory';
export interface Feedback {
  isCorrect: boolean;
  diagnostic: string;
  explanation: string;
  nextAction: 'continue' | 'retry' | 'repair' | 'edit';
  errorCode?: string;
}

export interface CorrectionResult {
  isCorrect: boolean;
  status?: 'correct' | 'almost' | 'incorrect' | 'incomplete' | 'unrecognized_format';
  normalizedAnswer?: unknown;
  expectedAnswer?: unknown;
  errorCode?: string;
  nextAction: NextAction;
  feedback: string | { title: string; body: string; tone: 'neutral' | 'encouraging' | 'firm' };
  diagnostic?: string;
  explanation?: string;
}

export interface AnswerAttempt {
  exerciseId: string;
  missionId: string;
  nodeIds: string[];
  answer: string;
  isCorrect: boolean;
  usedHints: number;
  errorCode?: string;
  createdAt: string;
}

export interface NodeProgress {
  attempts: number;
  correct: number;
  openErrors: number;
  repairedErrors: number;
  mastery?: number;
}

export interface UsefulError {
  id: string;
  code: string;
  exerciseId: string;
  missionId?: string;
  nodeIds: string[];
  status: 'open' | 'repaired' | 'in_repair' | 'repairing' | 'recurrent';
  createdAt: string;
  repairedAt?: string;
}

export interface ProgressRecord {
  contentVersion: string;
  modules: Record<string, unknown>;
  missions: Record<string, unknown>;
  nodes: Record<string, NodeProgress>;
  usefulErrors: UsefulError[];
  sessions: unknown[];
}

export interface ContentSeed {
  contentVersion: string;
  modules: Module[];
  missions: Mission[];
  skillNodes: SkillNode[];
  theoryCards: TheoryCard[];
  exercises: Exercise[];
}
