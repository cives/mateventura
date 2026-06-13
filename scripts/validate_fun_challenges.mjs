#!/usr/bin/env node
// Validación rápida de formato del banco de retos divertidos.
// La corrección MATEMÁTICA real la comprueba la suite de tests (vitest),
// que reproduce cada respuesta con el motor de corrección. Este script solo
// detecta errores de formato/estructura para dar feedback inmediato a la rutina.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const file = resolve(here, '..', 'src', 'content', 'funChallenges.json');

const errors = [];
let data;
try {
  data = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`❌ JSON ilegible: ${e.message}`);
  process.exit(1);
}

if (typeof data.version !== 'string') errors.push('falta "version" (string)');
if (!Array.isArray(data.challenges)) {
  console.error('❌ "challenges" debe ser un array');
  process.exit(1);
}

const seen = new Set();
const VALID_MODULES = new Set([
  'module.numbers_calculation_estimation',
  'module.proportionality_finance',
  'module.measurement_precision',
  'module.geometry_space',
  'module.algebra_equations_functions',
  'module.strategy_error_identity',
]);

for (const [i, c] of data.challenges.entries()) {
  const at = `challenges[${i}]${c?.id ? ` (${c.id})` : ''}`;
  if (!/^fun\.\d{4,}$/.test(c?.id ?? '')) errors.push(`${at}: id debe tener forma fun.NNNN`);
  if (seen.has(c?.id)) errors.push(`${at}: id duplicado`);
  seen.add(c?.id);
  for (const field of ['emoji', 'tag', 'title', 'statement', 'explanation', 'hint', 'createdAt']) {
    if (typeof c?.[field] !== 'string' || c[field].length === 0) errors.push(`${at}: campo "${field}" vacío o no string`);
  }
  if (![1, 2, 3, 4, 5].includes(c?.difficulty)) errors.push(`${at}: difficulty debe ser 1..5`);
  if (!VALID_MODULES.has(c?.moduleId)) errors.push(`${at}: moduleId no válido (${c?.moduleId})`);
  if (typeof c?.statement === 'string' && c.statement.length < 10) errors.push(`${at}: enunciado demasiado corto`);
  const a = c?.answer;
  if (!a || typeof a.value !== 'number' || !Number.isFinite(a.value)) errors.push(`${at}: answer.value debe ser número`);
  if (a && typeof a.tolerance !== 'number') errors.push(`${at}: answer.tolerance debe ser número`);
  if (a && a.unit !== undefined && typeof a.unit !== 'string') errors.push(`${at}: answer.unit debe ser string`);
}

if (errors.length > 0) {
  console.error(`❌ ${errors.length} problema(s) de formato:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

console.log(`✅ ${data.challenges.length} retos divertidos con formato válido (versión ${data.version}).`);
console.log('   Recuerda: ejecuta "npm run test" para verificar que las respuestas son matemáticamente correctas.');
