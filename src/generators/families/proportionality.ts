import type { GeneratorDef } from '../builders';
import { fmt, numericTrap, round2 } from '../builders';

const MODULE = 'module.proportionality_finance';

// Objetos y precios con los que se cruza alguien de 2.º ESO en Sevilla.
const ARTICULOS = [
  { nombre: 'unas zapatillas', emoji: '👟' },
  { nombre: 'un videojuego', emoji: '🎮' },
  { nombre: 'unos auriculares', emoji: '🎧' },
  { nombre: 'una sudadera', emoji: '👕' },
  { nombre: 'una entrada para el concierto', emoji: '🎤' },
  { nombre: 'una funda para el móvil', emoji: '📱' },
  { nombre: 'un libro de la saga', emoji: '📚' },
  { nombre: 'una camiseta del Betis', emoji: '⚽' },
  { nombre: 'una mochila nueva', emoji: '🎒' },
  { nombre: 'unas gafas de sol para la Feria', emoji: '🕶️' },
];

const DTOS = [5, 10, 15, 20, 25, 30, 40, 50] as const;

export const proportionalityGenerators: GeneratorDef[] = [
  {
    family: 'pct_descuento_parte',
    title: 'Cuánto te descuentan',
    emoji: '🏷️',
    moduleId: MODULE,
    nodeIds: ['node.percentages.calculate_part'],
    skillFamily: 'porcentajes',
    difficulties: [1, 2, 3],
    build(rng, difficulty) {
      const art = rng.pick(ARTICULOS);
      const precio = rng.int(2, 5 + difficulty * 2) * 20; // múltiplo de 20 → cuentas limpias
      const dto = rng.pick(DTOS);
      const descuento = round2((precio * dto) / 100);
      const final = round2(precio - descuento);
      return {
        statement: `${art.emoji} En las rebajas, ${art.nombre} cuesta ${precio} € y le aplican un ${dto} % de descuento. ¿Cuánto dinero te descuentan?`,
        expectedAnswer: { kind: 'number_with_unit', value: descuento, unit: '€', tolerance: 0.01, unitRequired: false },
        placeholder: 'Ej.: 12 €',
        explanation: {
          text: `El ${dto} % de ${precio} € es ${precio} · 0,${String(dto).padStart(2, '0')} = ${fmt(descuento)} €.`,
          steps: [`${dto} % = ${fmt(dto / 100)}`, `${precio} · ${fmt(dto / 100)} = ${fmt(descuento)} €`],
          check: 'El descuento siempre es menor que el precio inicial.',
        },
        commonErrors: [
          numericTrap('parte_vs_final', final, `Has calculado el precio final (${fmt(final)} €), pero se pedía cuánto te descuentan.`),
        ],
        hints: [
          { level: 1, text: 'Pasa el porcentaje a decimal dividiendo entre 100.' },
          { level: 2, text: `Multiplica el precio por ese decimal: ${precio} · ${fmt(dto / 100)}.` },
        ],
      };
    },
  },
  {
    family: 'pct_precio_final',
    title: 'Precio final con rebaja',
    emoji: '💸',
    moduleId: MODULE,
    nodeIds: ['node.percentages.final_price_after_change'],
    skillFamily: 'porcentajes',
    difficulties: [2, 3, 4],
    build(rng, difficulty) {
      const art = rng.pick(ARTICULOS);
      const precio = rng.int(3, 6 + difficulty) * 20;
      const dto = rng.pick(DTOS);
      const descuento = round2((precio * dto) / 100);
      const final = round2(precio - descuento);
      return {
        statement: `${art.emoji} ${capitalize(art.nombre)} cuesta ${precio} € y tiene una rebaja del ${dto} %. ¿Cuál es el precio final que pagas?`,
        expectedAnswer: { kind: 'number_with_unit', value: final, unit: '€', tolerance: 0.01, unitRequired: false },
        placeholder: 'Ej.: 48 €',
        explanation: {
          text: `Descuento: ${precio} · ${fmt(dto / 100)} = ${fmt(descuento)} €. Precio final: ${precio} − ${fmt(descuento)} = ${fmt(final)} €.`,
          steps: [`Descuento = ${fmt(descuento)} €`, `${precio} − ${fmt(descuento)} = ${fmt(final)} €`],
          check: 'Con rebaja, el precio final debe ser menor que el inicial.',
        },
        commonErrors: [
          numericTrap('parte_vs_final', descuento, `${fmt(descuento)} € es lo que te rebajan. Falta restarlo al precio inicial.`),
        ],
        hints: [
          { level: 1, text: 'Primero calcula cuánto te rebajan.' },
          { level: 2, text: 'Luego resta esa rebaja al precio inicial.' },
          { level: 3, text: `Atajo: paga el ${100 - dto} %, es decir ${precio} · ${fmt((100 - dto) / 100)}.` },
        ],
      };
    },
  },
  {
    family: 'pct_iva',
    title: 'Añadir el IVA',
    emoji: '🧾',
    moduleId: MODULE,
    nodeIds: ['node.percentages.final_price_after_change'],
    skillFamily: 'porcentajes',
    difficulties: [2, 3, 4],
    build(rng, difficulty) {
      const iva = rng.pick([10, 21] as const);
      const base = rng.int(2, 5 + difficulty) * (iva === 21 ? 100 : 50);
      const cuota = round2((base * iva) / 100);
      const total = round2(base + cuota);
      return {
        statement: `🧾 Una reparación cuesta ${base} € sin IVA. Si se añade un ${iva} % de IVA, ¿cuánto pagas en total?`,
        expectedAnswer: { kind: 'number_with_unit', value: total, unit: '€', tolerance: 0.01, unitRequired: false },
        placeholder: 'Ej.: 121 €',
        explanation: {
          text: `IVA: ${base} · ${fmt(iva / 100)} = ${fmt(cuota)} €. Total: ${base} + ${fmt(cuota)} = ${fmt(total)} €.`,
          steps: [`IVA = ${fmt(cuota)} €`, `${base} + ${fmt(cuota)} = ${fmt(total)} €`],
          check: 'Al añadir IVA, el total debe ser mayor que la base.',
        },
        commonErrors: [numericTrap('parte_vs_final', cuota, `${fmt(cuota)} € es solo el IVA. Hay que sumarlo a la base.`)],
        hints: [
          { level: 1, text: 'El IVA se suma, no se resta.' },
          { level: 2, text: `Atajo: multiplica por ${fmt(1 + iva / 100)}.` },
        ],
      };
    },
  },
  {
    family: 'pct_que_proporcion',
    title: 'Qué porcentaje representa',
    emoji: '📊',
    moduleId: MODULE,
    nodeIds: ['node.percentages.meaning', 'node.percentages.calculate_part'],
    skillFamily: 'porcentajes',
    difficulties: [2, 3],
    build(rng) {
      const total = rng.pick([20, 25, 40, 50, 80, 200] as const);
      const pct = rng.pick([10, 20, 25, 40, 50, 75] as const);
      const parte = round2((total * pct) / 100);
      return {
        statement: `📊 En una clase de ${total} estudiantes, ${parte} van de excursión a Itálica. ¿Qué porcentaje del grupo va?`,
        expectedAnswer: { kind: 'number_with_unit', value: pct, unit: '%', tolerance: 0.1, unitRequired: false },
        placeholder: 'Ej.: 25 %',
        explanation: {
          text: `Porcentaje = parte ÷ total · 100 = ${fmt(parte)} ÷ ${total} · 100 = ${pct} %.`,
          steps: [`${fmt(parte)} ÷ ${total} = ${fmt(parte / total)}`, `${fmt(parte / total)} · 100 = ${pct} %`],
          check: 'La parte es menor que el total, así que el porcentaje es menor que 100 %.',
        },
        hints: [
          { level: 1, text: 'Divide la parte entre el total.' },
          { level: 2, text: 'Multiplica ese resultado por 100 para tener el porcentaje.' },
        ],
      };
    },
  },
  {
    family: 'pct_recuperar_inicial',
    title: 'Precio antes de la rebaja',
    emoji: '🔙',
    moduleId: MODULE,
    nodeIds: ['node.percentages.calculate_total'],
    skillFamily: 'porcentajes',
    difficulties: [3, 4, 5],
    build(rng) {
      const dto = rng.pick([20, 25, 40, 50] as const);
      const inicial = rng.int(2, 8) * 20;
      const final = round2(inicial * (1 - dto / 100));
      return {
        statement: `🔙 Tras una rebaja del ${dto} %, una consola cuesta ${fmt(final)} €. ¿Cuál era su precio antes de la rebaja?`,
        expectedAnswer: { kind: 'number_with_unit', value: inicial, unit: '€', tolerance: 0.01, unitRequired: false },
        placeholder: 'Ej.: 200 €',
        explanation: {
          text: `Pagas el ${100 - dto} %, o sea ${fmt((100 - dto) / 100)} del inicial. Inicial = ${fmt(final)} ÷ ${fmt((100 - dto) / 100)} = ${inicial} €.`,
          steps: [`Factor = ${fmt((100 - dto) / 100)}`, `${fmt(final)} ÷ ${fmt((100 - dto) / 100)} = ${inicial} €`],
          check: `El inicial debe ser mayor que ${fmt(final)} €.`,
        },
        commonErrors: [
          numericTrap('wrong_reference_amount', round2(final * (1 + dto / 100)), 'Has aumentado el precio final un porcentaje, pero el descuento se aplicó sobre el inicial, no sobre el final.'),
        ],
        hints: [
          { level: 1, text: 'El precio final es el inicial multiplicado por un factor.' },
          { level: 2, text: `Ese factor es ${fmt((100 - dto) / 100)}. Para volver atrás, divide.` },
        ],
      };
    },
  },
  {
    family: 'regla_tres_directa',
    title: 'Regla de tres directa',
    emoji: '⚖️',
    moduleId: MODULE,
    nodeIds: ['node.percentages.calculate_part'],
    skillFamily: 'proporcionalidad',
    difficulties: [2, 3, 4],
    build(rng) {
      const unidades1 = rng.int(2, 6);
      const precioUnidad = rng.int(2, 9);
      const coste1 = unidades1 * precioUnidad;
      const unidades2 = unidades1 + rng.int(2, 6);
      const coste2 = unidades2 * precioUnidad;
      return {
        statement: `⚖️ Si ${unidades1} bocadillos cuestan ${coste1} €, ¿cuánto cuestan ${unidades2} bocadillos al mismo precio?`,
        expectedAnswer: { kind: 'number_with_unit', value: coste2, unit: '€', tolerance: 0.01, unitRequired: false },
        placeholder: 'Ej.: 15 €',
        explanation: {
          text: `Cada bocadillo cuesta ${coste1} ÷ ${unidades1} = ${precioUnidad} €. Entonces ${unidades2} · ${precioUnidad} = ${coste2} €.`,
          steps: [`Precio por unidad: ${coste1} ÷ ${unidades1} = ${precioUnidad} €`, `${unidades2} · ${precioUnidad} = ${coste2} €`],
          check: 'Más bocadillos → más dinero (proporcionalidad directa).',
        },
        hints: [
          { level: 1, text: 'Calcula primero cuánto cuesta una unidad.' },
          { level: 2, text: 'Multiplica el precio de una unidad por las nuevas unidades.' },
        ],
      };
    },
  },
];

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
