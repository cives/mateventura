# Rutina de autocompletado — MateVentura

Esta es la instrucción que ejecuta el agente Claude programado (cron) para que
MateVentura **se rellene sola** con ejercicios y retos divertidos nuevos, sin que
Antonio tenga que hacer nada.

> Cadencia recomendada: **1 vez por semana** (p. ej. lunes 08:00). También puede
> lanzarse a mano cuando se quiera una inyección de contenido fresco.

---

## Qué NO hace falta generar

La práctica diaria es **infinita por diseño**: los generadores paramétricos
(`src/generators/`) producen ejercicios nuevos en cada partida. La rutina NO tiene
que crear ejercicios de práctica básica.

La rutina aporta lo que los generadores no pueden inventar: **retos divertidos de
la vida real**, con contexto, gracia y cercanía a una chica de 2.º ESO en Sevilla.

## Objetivo de cada ejecución

Añadir **entre 6 y 10 retos divertidos nuevos** al banco
`src/content/funChallenges.json`, dejar la batería de tests en verde, reconstruir
el HTML portable y publicar.

---

## Pasos exactos

1. **Ubícate y orienta el contexto**
   - `cd 20_PROYECTOS_REF/MateVentura`
   - Lee `src/content/funChallenges.json`: anota los `id` ya usados (para no repetir)
     y los `tag`/temas recientes (para variar).

2. **Inventa 6–10 retos nuevos** siguiendo el esquema de cada objeto:
   - `id`: siguiente correlativo con forma `fun.NNNN` (4 dígitos, sin huecos).
   - `emoji`, `tag` (tema), `title` corto y con gancho.
   - `statement`: enunciado cercano y divertido. Temas que funcionan: móvil/datos,
     gaming, BookTok/lecturas, redes y vídeos virales, conciertos y festivales,
     Feria de Sevilla y Semana Santa, Betis/Sevilla FC, comida y kiosco, viajes,
     ahorro y paga, ropa y rebajas, mascotas, manualidades, deporte.
   - `difficulty`: 1–5 (mezcla; la mayoría 2–3).
   - `moduleId`: uno de
     `module.numbers_calculation_estimation`, `module.proportionality_finance`,
     `module.measurement_precision`, `module.geometry_space`,
     `module.algebra_equations_functions`.
   - `answer`: `{ "value": <número>, "unit": "<unidad opcional>", "tolerance": 0.01 }`.
     **La respuesta DEBE ser correcta.** Resuelve el problema paso a paso antes de
     escribir el número. Usa números que den cuentas limpias.
   - `explanation`: solución breve paso a paso (con coma decimal: "3,5").
   - `hint`: una pista que oriente sin resolver.
   - `createdAt`: fecha de hoy `AAAA-MM-DD`.

   Reglas de calidad:
   - Nivel real de 2.º ESO (porcentajes, proporcionalidad, áreas/volúmenes,
     potencias sencillas, operaciones, ecuaciones de una incógnita).
   - Nada ofensivo, nada de marcas dañinas, lenguaje inclusivo y amable.
   - Variedad: no repitas tema ni tipo de cálculo dos veces seguidas.

3. **Inserta** los nuevos objetos al final del array `challenges` (cuida las comas y
   que el JSON quede bien formado). Sube `version` si quieres (p. ej. `fun-2`).

4. **Verifica (obligatorio, no negociable):**
   ```bash
   npm run verify
   ```
   Esto corre typecheck + validación de formato + **toda la batería de tests**.
   El test `funChallenges.test.ts` reproduce cada respuesta con el motor de
   corrección: **si un resultado está mal, el test falla**. Si algo falla,
   corrige el reto (normalmente el `value` o la `tolerance`) y vuelve a verificar.
   No continúes hasta tener todo en verde.

5. **Reconstruye el portable y publica:**
   ```bash
   npm run build:portable
   git add -A
   git commit -m "MateVentura: autocompletado de retos divertidos (+N)"
   git push
   ```
   El `git push` dispara el workflow `mateventura-deploy.yml` y la web online se
   actualiza sola en unos minutos.

6. **Cierra** con un resumen de una línea: cuántos retos nuevos, de qué temas, y
   el total actual del banco.

---

## Cómo programarla

Pídeselo a Claude Code con el skill de agendado, por ejemplo:

> «Programa una rutina semanal los lunes a las 8:00 que ejecute la rutina de
> autocompletado de MateVentura descrita en
> `20_PROYECTOS_REF/MateVentura/scripts/RUTINA_AUTOCOMPLETADO.md`.»

o con `/schedule`. La rutina es idempotente y segura: si los tests no pasan, no
publica nada.
