import type { CommonErrorSpec, CorrectionResult, Exercise } from '../domain/types';
import { hasUnit, normalizeDecimalText, readFirstNumber, readPercentEquivalent } from './normalization';

const DEFAULT_TOLERANCE = 0.000001;

export function correctAnswer(exercise: Exercise, rawAnswer: unknown): CorrectionResult {
  if (exercise.expectedAnswer.kind === 'number_with_unit') {
    return correctNumericWithUnit(exercise, rawAnswer);
  }

  if (exercise.expectedAnswer.kind === 'percent_equivalence') {
    return correctPercentEquivalence(exercise, rawAnswer);
  }

  if (exercise.expectedAnswer.kind === 'linear_equation_solution') {
    return correctLinearEquation(exercise, rawAnswer);
  }

  if (exercise.expectedAnswer.kind === 'number') {
    return correctPlainNumber(exercise, rawAnswer);
  }

  if (exercise.expectedAnswer.kind === 'multiple_choice') {
    const isCorrect = String(rawAnswer) === exercise.expectedAnswer.optionId;
    return {
      isCorrect,
      status: isCorrect ? 'correct' : 'incorrect',
      expectedAnswer: exercise.expectedAnswer.optionId,
      nextAction: isCorrect ? 'continue' : 'retry',
      feedback: isCorrect
        ? { title: 'Correcto', body: 'La opción elegida encaja con el objetivo del ejercicio.', tone: 'encouraging' }
        : { title: 'Revisa la elección', body: 'Vuelve al enunciado y localiza qué se pregunta exactamente.', tone: 'firm' },
    };
  }

  return {
    isCorrect: false,
    status: 'unrecognized_format',
    nextAction: 'retry',
    feedback: { title: 'Formato no reconocido', body: 'No hay corrector disponible para este tipo de respuesta.', tone: 'firm' },
  };
}

function correctNumericWithUnit(exercise: Exercise, rawAnswer: unknown): CorrectionResult {
  const expected = exercise.expectedAnswer;
  if (expected.kind !== 'number_with_unit') throw new Error('Tipo de respuesta incompatible');

  const value = readFirstNumber(rawAnswer);
  if (value === null) {
    return {
      isCorrect: false,
      status: 'unrecognized_format',
      nextAction: 'retry',
      feedback: { title: 'No puedo leer la respuesta', body: 'Escribe un número; puedes usar coma o punto decimal.', tone: 'firm' },
    };
  }

  if (expected.unitRequired && !hasUnit(rawAnswer, expected.unit)) {
    return {
      isCorrect: false,
      status: 'incomplete',
      normalizedAnswer: value,
      expectedAnswer: expected.value,
      nextAction: 'retry',
      feedback: { title: 'Falta la unidad', body: `El cálculo está incompleto: añade ${expected.unit}.`, tone: 'firm' },
    };
  }

  const detectedError = findNumericCommonError(exercise, value);

  if (detectedError) {
    return {
      isCorrect: false,
      status: 'incorrect',
      normalizedAnswer: value,
      expectedAnswer: expected.value,
      errorCode: mapLegacyErrorCode(detectedError.code),
      nextAction: 'repair',
      feedback: { title: 'Error útil detectado', body: detectedError.feedback, tone: 'firm' },
    };
  }

  const fallbackDiscountError = exercise.family.includes('porcentaje') && Math.abs(value - 30) <= DEFAULT_TOLERANCE;
  if (fallbackDiscountError) {
    return {
      isCorrect: false,
      status: 'incorrect',
      normalizedAnswer: value,
      expectedAnswer: expected.value,
      errorCode: 'parte_vs_final',
      nextAction: 'repair',
      feedback: {
        title: 'Has calculado otra magnitud',
        body: 'Parece que has dado el precio final, pero el enunciado pedía la cantidad descontada.',
        tone: 'firm',
      },
    };
  }

  const distance = Math.abs(value - expected.value);
  const isCorrect = distance <= expected.tolerance;

  return {
    isCorrect,
    status: isCorrect ? 'correct' : 'incorrect',
    normalizedAnswer: value,
    expectedAnswer: expected.value,
    nextAction: isCorrect ? 'continue' : 'retry',
    feedback: isCorrect
      ? { title: 'Correcto', body: 'La respuesta coincide con el resultado esperado.', tone: 'encouraging' }
      : { title: 'Todavía no', body: 'Revisa qué cantidad pide el enunciado y vuelve a intentarlo.', tone: 'firm' },
  };
}

function correctPercentEquivalence(exercise: Exercise, rawAnswer: unknown): CorrectionResult {
  const expected = exercise.expectedAnswer;
  if (expected.kind !== 'percent_equivalence') throw new Error('Tipo de respuesta incompatible');

  const value = readPercentEquivalent(rawAnswer);
  if (value === null) {
    return {
      isCorrect: false,
      status: 'unrecognized_format',
      nextAction: 'retry',
      feedback: { title: 'No puedo leer la equivalencia', body: 'Escribe un decimal, un porcentaje o una fracción sencilla.', tone: 'firm' },
    };
  }

  const rawNumber = readFirstNumber(rawAnswer);
  const rawText = normalizeDecimalText(rawAnswer);
  const canBeUndividedPercentError = !rawText.includes('%') && !rawText.includes('/');
  const detectedError = rawNumber === null || !canBeUndividedPercentError ? undefined : findNumericCommonError(exercise, rawNumber);
  if (detectedError) {
    return {
      isCorrect: false,
      status: 'incorrect',
      normalizedAnswer: value,
      expectedAnswer: expected.valueAsDecimal,
      errorCode: detectedError.code,
      nextAction: 'repair',
      feedback: { title: 'Error útil detectado', body: detectedError.feedback, tone: 'firm' },
    };
  }

  const isCorrect = Math.abs(value - expected.valueAsDecimal) <= expected.tolerance;

  return {
    isCorrect,
    status: isCorrect ? 'correct' : 'incorrect',
    normalizedAnswer: value,
    expectedAnswer: expected.valueAsDecimal,
    nextAction: isCorrect ? 'continue' : 'retry',
    feedback: isCorrect
      ? { title: 'Correcto', body: 'La equivalencia porcentual es válida.', tone: 'encouraging' }
      : { title: 'Todavía no', body: 'Recuerda que un porcentaje se divide entre 100 para pasarlo a decimal.', tone: 'firm' },
  };
}

function correctLinearEquation(exercise: Exercise, rawAnswer: unknown): CorrectionResult {
  const expected = exercise.expectedAnswer;
  if (expected.kind !== 'linear_equation_solution') throw new Error('Tipo de respuesta incompatible');

  const value = readFirstNumber(rawAnswer);
  const isCorrect = value !== null && Math.abs(value - expected.value) <= DEFAULT_TOLERANCE;

  if (value !== null) {
    const detectedError = findNumericCommonError(exercise, value);
    if (detectedError) {
      return {
        isCorrect: false,
        status: 'incorrect',
        normalizedAnswer: value,
        expectedAnswer: expected.value,
        errorCode: detectedError.code,
        nextAction: 'repair',
        feedback: { title: 'Revisión útil', body: detectedError.feedback, tone: 'firm' },
      };
    }
  }

  return {
    isCorrect,
    status: value === null ? 'unrecognized_format' : isCorrect ? 'correct' : 'incorrect',
    normalizedAnswer: value,
    expectedAnswer: expected.value,
    nextAction: isCorrect ? 'continue' : 'retry',
    feedback: isCorrect
      ? { title: 'Correcto', body: `La solución ${expected.variable} = ${expected.value} satisface la ecuación. Sustituye antes de seguir.`, tone: 'encouraging' }
      : { title: 'Revisa la ecuación', body: 'Aísla la incógnita y comprueba sustituyendo el valor en la ecuación original.', tone: 'firm' },
  };
}

function correctPlainNumber(exercise: Exercise, rawAnswer: unknown): CorrectionResult {
  const expected = exercise.expectedAnswer;
  if (expected.kind !== 'number') throw new Error('Tipo de respuesta incompatible');

  const value = readFirstNumber(rawAnswer);
  if (value === null) {
    return {
      isCorrect: false,
      status: 'unrecognized_format',
      nextAction: 'retry',
      feedback: { title: 'No puedo leer la respuesta', body: 'Escribe un número; puedes usar coma o punto decimal.', tone: 'firm' },
    };
  }

  const detectedError = findNumericCommonError(exercise, value);
  if (detectedError) {
    return {
      isCorrect: false,
      status: 'incorrect',
      normalizedAnswer: value,
      expectedAnswer: expected.value,
      errorCode: detectedError.code,
      nextAction: 'repair',
      feedback: { title: 'Error útil detectado', body: detectedError.feedback, tone: 'firm' },
    };
  }

  const isCorrect = Math.abs(value - expected.value) <= expected.tolerance;
  return {
    isCorrect,
    status: isCorrect ? 'correct' : 'incorrect',
    normalizedAnswer: value,
    expectedAnswer: expected.value,
    nextAction: isCorrect ? 'continue' : 'retry',
    feedback: isCorrect
      ? { title: 'Correcto', body: 'El resultado coincide con el esperado.', tone: 'encouraging' }
      : { title: 'Todavía no', body: 'Revisa el cálculo paso a paso y vuelve a intentarlo.', tone: 'firm' },
  };
}

function findNumericCommonError(exercise: Exercise, value: number): CommonErrorSpec | undefined {
  return exercise.commonErrors.find((error) => {
    const hasLegacyTrigger = error.ifNumericValueEquals !== undefined;
    const hasStructuredTrigger = error.trigger?.kind === 'numeric_value';
    const isExplicitlyDetectable = error.detectable ?? (hasLegacyTrigger || hasStructuredTrigger);

    if (!isExplicitlyDetectable) return false;

    if (hasLegacyTrigger) {
      const legacyValue = error.ifNumericValueEquals;
      if (legacyValue === undefined) return false;
      return Math.abs(value - legacyValue) <= DEFAULT_TOLERANCE;
    }

    if (hasStructuredTrigger) {
      const trigger = error.trigger;
      if (!trigger || trigger.kind !== 'numeric_value') return false;
      return Math.abs(value - trigger.value) <= trigger.tolerance;
    }

    return false;
  });
}

function mapLegacyErrorCode(code: string): string {
  if (code === 'percentages.final_price_instead_of_discount') return 'parte_vs_final';
  return code;
}
