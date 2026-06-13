import { z } from 'zod';

export const exerciseSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  course: z.literal('2ESO'),
  subject: z.literal('Matemáticas'),
  moduleId: z.string().min(1),
  missionIds: z.array(z.string().min(1)).min(1),
  nodeIds: z.array(z.string().min(1)).min(1),
  family: z.string().min(1),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  statement: z.string().min(1),
  answerInput: z.object({ kind: z.string(), placeholder: z.string().optional() }).passthrough(),
  expectedAnswer: z.object({ kind: z.string() }).passthrough(),
  correction: z.object({ corrector: z.string() }).passthrough(),
  hints: z.array(z.object({ level: z.number(), text: z.string().min(1) })),
  explanation: z.object({ text: z.string().min(1) }),
  commonErrors: z.array(z.object({ code: z.string(), detectable: z.boolean().optional(), feedback: z.string() }).passthrough()),
  curriculum: z.object({ knowledgeCodes: z.array(z.string()), competencies: z.array(z.string()), criteria: z.array(z.string()) }).passthrough(),
});
