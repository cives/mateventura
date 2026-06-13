import type { GeneratorDef } from '../builders';
import { fmt, numericTrap, round2 } from '../builders';

const MEASURE = 'module.measurement_precision';
const GEO = 'module.geometry_space';

// Ternas pitagóricas para que las raíces salgan exactas.
const TERNAS = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
  [20, 21, 29],
] as const;

export const geometryGenerators: GeneratorDef[] = [
  {
    family: 'area_rectangulo',
    title: 'Área de rectángulo',
    emoji: '▭',
    moduleId: MEASURE,
    nodeIds: ['node.measure.area_plane'],
    skillFamily: 'areas',
    difficulties: [1, 2],
    build(rng) {
      const base = rng.int(3, 20);
      const altura = rng.int(3, 15);
      const area = base * altura;
      return {
        statement: `▭ Un campo rectangular mide ${base} m de base y ${altura} m de altura. ¿Cuál es su área?`,
        expectedAnswer: { kind: 'number_with_unit', value: area, unit: 'm²', tolerance: 0.01, unitRequired: false },
        placeholder: 'Ej.: 60 m²',
        explanation: {
          text: `Área del rectángulo = base · altura = ${base} · ${altura} = ${area} m².`,
          steps: [`${base} · ${altura} = ${area} m²`],
          check: 'El área se mide en unidades cuadradas (m²).',
        },
        commonErrors: [numericTrap('perimetro_en_vez_area', 2 * (base + altura), 'Eso es el perímetro (lo que rodea la figura). El área es base · altura.')],
        hints: [{ level: 1, text: 'Multiplica los dos lados.' }],
      };
    },
  },
  {
    family: 'area_triangulo',
    title: 'Área de triángulo',
    emoji: '🔺',
    moduleId: MEASURE,
    nodeIds: ['node.measure.area_plane'],
    skillFamily: 'areas',
    difficulties: [2, 3],
    build(rng) {
      const base = rng.int(2, 12) * 2; // base par → área entera
      const altura = rng.int(3, 15);
      const area = (base * altura) / 2;
      return {
        statement: `🔺 Un triángulo tiene una base de ${base} cm y una altura de ${altura} cm. ¿Cuál es su área?`,
        expectedAnswer: { kind: 'number_with_unit', value: area, unit: 'cm²', tolerance: 0.01, unitRequired: false },
        placeholder: 'Ej.: 24 cm²',
        explanation: {
          text: `Área del triángulo = (base · altura) ÷ 2 = (${base} · ${altura}) ÷ 2 = ${area} cm².`,
          steps: [`${base} · ${altura} = ${base * altura}`, `${base * altura} ÷ 2 = ${area} cm²`],
          check: 'No olvides dividir entre 2: el triángulo es "medio rectángulo".',
        },
        commonErrors: [numericTrap('olvida_dividir_dos', base * altura, 'Te falta dividir entre 2. El área del triángulo es la mitad de base · altura.')],
        hints: [{ level: 1, text: 'Multiplica base por altura y divide el resultado entre 2.' }],
      };
    },
  },
  {
    family: 'area_circulo',
    title: 'Área de círculo',
    emoji: '⭕',
    moduleId: MEASURE,
    nodeIds: ['node.measure.area_plane'],
    skillFamily: 'areas',
    difficulties: [3, 4],
    build(rng) {
      const radio = rng.int(2, 10);
      const area = round2(3.14 * radio * radio);
      return {
        statement: `⭕ Calcula el área de un círculo de radio ${radio} cm. Usa π ≈ 3,14.`,
        expectedAnswer: { kind: 'number_with_unit', value: area, unit: 'cm²', tolerance: 0.5, unitRequired: false },
        placeholder: 'Ej.: 28,26 cm²',
        explanation: {
          text: `Área = π · r² = 3,14 · ${radio}² = 3,14 · ${radio * radio} = ${fmt(area)} cm².`,
          steps: [`r² = ${radio}² = ${radio * radio}`, `3,14 · ${radio * radio} = ${fmt(area)} cm²`],
          check: 'Se eleva el radio al cuadrado ANTES de multiplicar por π.',
        },
        commonErrors: [numericTrap('confunde_diametro_radio', round2(3.14 * 2 * radio), 'Has usado el perímetro (2·π·r). El área es π·r².')],
        hints: [
          { level: 1, text: 'Primero calcula el radio al cuadrado.' },
          { level: 2, text: 'Luego multiplica por 3,14.' },
        ],
      };
    },
  },
  {
    family: 'volumen_ortoedro',
    title: 'Volumen de ortoedro',
    emoji: '📦',
    moduleId: MEASURE,
    nodeIds: ['node.measure.volume'],
    skillFamily: 'volumenes',
    difficulties: [2, 3],
    build(rng) {
      const a = rng.int(2, 10);
      const b = rng.int(2, 10);
      const c = rng.int(2, 10);
      const vol = a * b * c;
      return {
        statement: `📦 Una caja tiene aristas de ${a} cm, ${b} cm y ${c} cm. ¿Cuál es su volumen?`,
        expectedAnswer: { kind: 'number_with_unit', value: vol, unit: 'cm³', tolerance: 0.01, unitRequired: false },
        placeholder: 'Ej.: 120 cm³',
        explanation: {
          text: `Volumen del ortoedro = largo · ancho · alto = ${a} · ${b} · ${c} = ${vol} cm³.`,
          steps: [`${a} · ${b} = ${a * b}`, `${a * b} · ${c} = ${vol} cm³`],
          check: 'El volumen se mide en unidades cúbicas (cm³).',
        },
        hints: [{ level: 1, text: 'Multiplica las tres dimensiones.' }],
      };
    },
  },
  {
    family: 'pitagoras',
    title: 'Teorema de Pitágoras',
    emoji: '📐',
    moduleId: GEO,
    nodeIds: ['node.geometry.pythagoras'],
    skillFamily: 'pitagoras',
    difficulties: [3, 4, 5],
    build(rng) {
      const [ca, cb, hip] = rng.pick(TERNAS);
      const pedirHipotenusa = rng.chance(0.6);
      if (pedirHipotenusa) {
        return {
          statement: `📐 Un triángulo rectángulo tiene catetos de ${ca} cm y ${cb} cm. ¿Cuánto mide la hipotenusa?`,
          expectedAnswer: { kind: 'number_with_unit', value: hip, unit: 'cm', tolerance: 0.05, unitRequired: false },
          placeholder: 'Ej.: 5 cm',
          explanation: {
            text: `h² = ${ca}² + ${cb}² = ${ca * ca} + ${cb * cb} = ${ca * ca + cb * cb}. h = √${ca * ca + cb * cb} = ${hip} cm.`,
            steps: [`${ca}² + ${cb}² = ${ca * ca + cb * cb}`, `√${ca * ca + cb * cb} = ${hip} cm`],
            check: 'La hipotenusa es el lado mayor: debe ser mayor que cada cateto.',
          },
          commonErrors: [numericTrap('olvida_raiz', ca * ca + cb * cb, 'Te has quedado en h². Falta hacer la raíz cuadrada.')],
          hints: [
            { level: 1, text: 'La hipotenusa al cuadrado es la suma de los catetos al cuadrado.' },
            { level: 2, text: 'Suma los cuadrados y luego haz la raíz cuadrada.' },
          ],
        };
      }
      return {
        statement: `📐 En un triángulo rectángulo, la hipotenusa mide ${hip} cm y un cateto mide ${ca} cm. ¿Cuánto mide el otro cateto?`,
        expectedAnswer: { kind: 'number_with_unit', value: cb, unit: 'cm', tolerance: 0.05, unitRequired: false },
        placeholder: 'Ej.: 4 cm',
        explanation: {
          text: `cateto² = h² − cateto² = ${hip}² − ${ca}² = ${hip * hip} − ${ca * ca} = ${cb * cb}. cateto = √${cb * cb} = ${cb} cm.`,
          steps: [`${hip}² − ${ca}² = ${hip * hip - ca * ca}`, `√${cb * cb} = ${cb} cm`],
          check: 'Para hallar un cateto se RESTAN los cuadrados (no se suman).',
        },
        commonErrors: [numericTrap('suma_en_vez_de_resta', Math.round(Math.sqrt(hip * hip + ca * ca) * 100) / 100, 'Aquí buscas un cateto: hay que restar los cuadrados, no sumarlos.')],
        hints: [{ level: 1, text: 'Despeja: cateto² = hipotenusa² − cateto conocido².' }],
      };
    },
  },
];
