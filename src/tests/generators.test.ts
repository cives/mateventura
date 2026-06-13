import { describe, expect, it } from 'vitest';
import { exerciseSchema } from '../schemas/exercise.schema';
import { correctAnswer } from '../correction/correctAnswer';
import {
  allGenerators,
  dailyChallenge,
  generateOne,
  generatePracticeSet,
  practiceModules,
} from '../generators';
import { createRng } from '../generators/rng';

// Convierte la respuesta canónica de un ejercicio en lo que escribiría la alumna.
function canonicalAnswer(expected: ReturnType<typeof generateOne> extends infer T ? T extends null ? never : NonNullable<T>['expectedAnswer'] : never): string {
  switch (expected.kind) {
    case 'number':
      return String(expected.value).replace('.', ',');
    case 'number_with_unit':
      return `${String(expected.value).replace('.', ',')} ${expected.unit}`;
    case 'percent_equivalence':
      return String(expected.valueAsDecimal);
    case 'linear_equation_solution':
      return `x = ${expected.value}`;
    case 'multiple_choice':
      return expected.optionId;
    default:
      return '';
  }
}

describe('motor de generadores', () => {
  it('registra generadores con familias únicas y sin la subcadena prohibida', () => {
    const families = allGenerators.map((g) => g.family);
    expect(new Set(families).size).toBe(families.length);
    for (const f of families) {
      expect(f.includes('porcentaje')).toBe(false); // colisiona con un corrector heredado
    }
  });

  it('cada familia, en cada dificultad y con muchas semillas, produce ejercicios válidos y autoconsistentes', () => {
    for (const def of allGenerators) {
      for (const difficulty of def.difficulties) {
        for (let s = 1; s <= 60; s += 1) {
          const seed = s * 7919 + def.family.length;
          const exercise = generateOne(def.family, seed, difficulty);
          expect(exercise, `${def.family}@${difficulty}#${seed}`).not.toBeNull();
          if (!exercise) continue;

          // 1. Cumple el esquema de contenido.
          const parsed = exerciseSchema.safeParse(exercise);
          expect(parsed.success, `${exercise.id}: ${parsed.success ? '' : JSON.stringify(parsed.error.issues)}`).toBe(true);

          // 2. El corrector acepta la respuesta canónica como correcta.
          const ok = correctAnswer(exercise, canonicalAnswer(exercise.expectedAnswer));
          expect(ok.isCorrect, `${exercise.id} debería aceptar su propia respuesta (${canonicalAnswer(exercise.expectedAnswer)})`).toBe(true);

          // 3. Las trampas declaradas se detectan como error útil (no como acierto).
          for (const ce of exercise.commonErrors) {
            if (ce.trigger?.kind === 'numeric_value') {
              const trap = correctAnswer(exercise, String(ce.trigger.value).replace('.', ','));
              expect(trap.isCorrect, `${exercise.id}: la trampa ${ce.code} no debería contar como acierto`).toBe(false);
            }
          }
        }
      }
    }
  });

  it('genera tandas de práctica reproducibles por módulo', () => {
    for (const mod of practiceModules()) {
      const a = generatePracticeSet(mod.moduleId, 8, 12345);
      const b = generatePracticeSet(mod.moduleId, 8, 12345);
      expect(a.length).toBe(8);
      expect(a.map((e) => e.id)).toEqual(b.map((e) => e.id)); // misma semilla → mismo set
      for (const e of a) expect(e.moduleId).toBe(mod.moduleId);
    }
  });

  it('el reto del día es estable dentro de la misma jornada y cambia de un día a otro', () => {
    const dia1 = new Date(2026, 5, 11);
    const dia1bis = new Date(2026, 5, 11, 22, 0, 0);
    const dia2 = new Date(2026, 5, 12);
    expect(dailyChallenge(5, dia1).map((e) => e.id)).toEqual(dailyChallenge(5, dia1bis).map((e) => e.id));
    expect(dailyChallenge(5, dia1).map((e) => e.id)).not.toEqual(dailyChallenge(5, dia2).map((e) => e.id));
  });

  it('el RNG con la misma semilla produce la misma secuencia', () => {
    const r1 = createRng(42);
    const r2 = createRng(42);
    const seq1 = Array.from({ length: 10 }, () => r1.int(0, 1000));
    const seq2 = Array.from({ length: 10 }, () => r2.int(0, 1000));
    expect(seq1).toEqual(seq2);
  });
});
