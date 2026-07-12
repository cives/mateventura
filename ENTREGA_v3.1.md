# Entrega MateVentura v3.1 — sistema vivo que se autocompleta

Fecha: 2026-06-11. Construido sobre la base técnica de v3 (no se tiró nada: se
reaprovechó currículo, esquema de ejercicios, corrector y motor de progreso).

## Qué es nuevo

### 1. Motor de generadores infinitos (`src/generators/`)
Ejercicios paramétricos que se crean al instante, offline y gratis. Nunca se
acaban. Cubren:

- **Números:** jerarquía de operaciones, enteros con signo, fracciones, decimales, potencias.
- **Proporcionalidad:** descuentos, IVA, precio final, recuperar el inicial, qué % representa, regla de tres.
- **Geometría/medida:** áreas (rectángulo, triángulo, círculo), volumen, Pitágoras.
- **Álgebra:** ecuaciones de uno y dos pasos, con paréntesis, valor numérico.
- **Estadística:** media, mediana, moda y rango.

Cada generador usa un RNG con semilla (reproducible) y trae explicación paso a
paso, pistas progresivas y **trampas de errores típicos** que el corrector
detecta para dar feedback útil. Un salvaguarda sistémico evita que una trampa
coincida nunca con la respuesta correcta.

### 2. Capa de diversión (`src/domain/gamification.ts` + UI nueva)
XP, niveles con rangos temáticos, rachas con llamas, 8 logros con avisos
emergentes, reto del día (estable por jornada) y celebraciones. Todo se guarda
en el navegador, sin cuentas.

### 3. Retos divertidos (`src/content/funChallenges.json`)
Banco de problemas de la vida real (móvil, gaming, Feria, conciertos, fútbol…).
**Es el objetivo del autocompletado:** la rutina IA lo va ampliando.

### 4. Autocompletado regular
- La **práctica** ya es infinita por los generadores.
- Una **rutina Claude programada** añade retos divertidos nuevos cada semana.
  Playbook: [`scripts/RUTINA_AUTOCOMPLETADO.md`](scripts/RUTINA_AUTOCOMPLETADO.md).
- Red de seguridad: el test `funChallenges.test.ts` **reproduce cada respuesta
  con el motor**; si la IA escribe un resultado mal, los tests fallan y la rutina
  no publica. `npm run verify` es la puerta de calidad.

## Calidad

- **31 tests en verde** (typecheck + esquemas + corrección + generadores + retos + UI).
- Cada familia de generador se prueba en todas sus dificultades × 60 semillas.
- Verificado en vivo: bienvenida → hub → práctica → acierto con XP → logro.

## Cómo se publica online (una vez)

1. Sube los cambios a `main` (el repo incluye su propio workflow `.github/workflows/deploy.yml`).
2. En GitHub → **Settings → Pages → Source: GitHub Actions**.
3. Listo. URL: `https://cives.github.io/mateventura/`. A partir de ahí se
   actualiza sola en cada push a `main`.

Alternativa sin nada de infraestructura: `MateVentura_PORTABLE.html` (un único
archivo que se abre con doble clic, también con todo el contenido).

## Cómo programar la rutina

Pídele a Claude Code:

> «Programa una rutina semanal (lunes 08:00) que ejecute
> `scripts/RUTINA_AUTOCOMPLETADO.md`.»

## Comandos útiles

```bash
npm run dev             # desarrollo
npm run verify          # typecheck + validación + tests (puerta de calidad)
npm run build:portable  # genera el HTML portable
```
