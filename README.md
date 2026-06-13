# MateVentura 🚀

App de Matemáticas para 2.º ESO — generadores infinitos, gamificación y retos divertidos.

**Web:** https://cives.github.io/mateventura/

---

## Para Ángeles

Una aventura para practicar Matemáticas de 2.º de ESO **jugando**: ganas
experiencia, subes de nivel, encadenas rachas y desbloqueas logros. Y nunca se
queda sin ejercicios: **cada partida es distinta**.

### Qué hay dentro

- **Reto del día 🌟** — 5 ejercicios variados, nuevos cada día.
- **Retos divertidos 🎈** — problemas de la vida real: móvil, gaming, conciertos, Feria, fútbol, compras…
- **Territorios de práctica ∞** — elige una zona y practica sin límite. Cada ejercicio se genera al momento.
- **Misiones guiadas 🧭** — retos con teoría y una pequeña historia.
- **Logros 🏅, niveles y rachas** — para que apetezca volver.

### Trucos

- Si te atascas, pulsa **💡 Pista**: te ayuda sin darte la solución.
- Puedes escribir los decimales con coma (3,5) o con punto (3.5).
- Fallar **no resta**: el error te da una explicación para aprender. ¡Reintenta!

Tu progreso se guarda solo en tu navegador. Sin cuentas, sin contraseñas, sin anuncios.

---

## Para desarrolladores

### Stack

React 18 + Vite + TypeScript (strict) + Vitest.

### Comandos

```bash
npm install
npm run dev          # servidor de desarrollo en localhost:5173
npm run verify       # typecheck + validación + tests (puerta de calidad)
npm run build        # compila para producción
```

### Autocompletado

Los retos divertidos (`src/content/funChallenges.json`) se amplían semanalmente
mediante una rutina IA. El playbook está en `scripts/RUTINA_AUTOCOMPLETADO.md`.
