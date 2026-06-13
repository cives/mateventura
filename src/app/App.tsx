import { useMemo, useState } from 'react';
import { curriculum } from '../content/curriculum';
import { funChallenges, pickFunExercises } from '../content/funChallenges';
import { correctAnswer } from '../correction/correctAnswer';
import {
  ACHIEVEMENTS,
  cheer,
  encourage,
  getAchievement,
  levelFromXp,
  newlyUnlocked,
  xpForAnswer,
} from '../domain/gamification';
import type { PlayerProfile } from '../domain/gamification';
import type { CorrectionResult, Exercise } from '../domain/types';
import { dailyChallenge, generatePracticeSet, practiceModules } from '../generators';
import { loadPlayer, savePlayer, todayKey } from '../persistence/playerStore';
import '../ui/styles/base.css';
import '../ui/styles/fun.css';

type Screen = 'welcome' | 'home' | 'play' | 'summary';
type Mode = 'practice' | 'mission' | 'daily';

interface Session {
  mode: Mode;
  title: string;
  emoji: string;
  moduleId: string;
  exercises: Exercise[];
  index: number;
  seed: number;
  correct: number;
  attempts: number;
  goal: number | null; // null = práctica infinita
}

const DAILY_GOAL = 5;

function feedbackBody(result: CorrectionResult): string {
  return typeof result.feedback === 'string' ? result.feedback : result.feedback.body;
}

function randomSeed(): number {
  return Math.floor(Math.random() * 2_000_000_000);
}

export function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [player, setPlayer] = useState<PlayerProfile>(() => loadPlayer());
  const [draftAlias, setDraftAlias] = useState(player.alias);
  const [session, setSession] = useState<Session | null>(null);

  // Estado de la jugada actual
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gainedXp, setGainedXp] = useState(0);
  const [toasts, setToasts] = useState<string[]>([]);

  const level = useMemo(() => levelFromXp(player.xp), [player.xp]);
  const exercise = session?.exercises[session.index] ?? null;
  const modulesById = useMemo(() => new Map(curriculum.modules.map((m) => [m.id, m] as const)), []);
  const practiceCards = useMemo(() => practiceModules(), []);

  const dailyDoneToday = player.lastDailyDoneDate === todayKey();

  // --------- persistencia + logros ----------
  function commitPlayer(next: PlayerProfile) {
    const unlocked = newlyUnlocked(next);
    const withAch = unlocked.length > 0 ? { ...next, achievements: [...next.achievements, ...unlocked] } : next;
    savePlayer(withAch);
    setPlayer(withAch);
    if (unlocked.length > 0) setToasts((t) => [...t, ...unlocked]);
  }

  // --------- arranque de sesiones ----------
  function startPractice(moduleId: string) {
    const seed = randomSeed();
    const batch = generatePracticeSet(moduleId, 12, seed);
    if (batch.length === 0) return;
    const mod = modulesById.get(moduleId);
    setSession({
      mode: 'practice',
      title: mod?.territoryName ?? 'Práctica',
      emoji: practiceCards.find((p) => p.moduleId === moduleId)?.emojis[0] ?? '🎲',
      moduleId,
      exercises: batch,
      index: 0,
      seed,
      correct: 0,
      attempts: 0,
      goal: null,
    });
    enterPlay();
  }

  function startMission(missionId: string) {
    const mission = curriculum.missions.find((m) => m.id === missionId);
    if (!mission) return;
    const exercises = (mission.exerciseIds ?? [])
      .map((id) => curriculum.exercises.find((e) => e.id === id))
      .filter((e): e is Exercise => Boolean(e));
    if (exercises.length === 0) return;
    setSession({
      mode: 'mission',
      title: mission.title,
      emoji: '🧭',
      moduleId: mission.moduleId,
      exercises,
      index: 0,
      seed: 0,
      correct: 0,
      attempts: 0,
      goal: exercises.length,
    });
    enterPlay();
  }

  function startFunChallenges() {
    const count = Math.min(5, funChallenges.length);
    const exercises = pickFunExercises(count, randomSeed());
    if (exercises.length === 0) return;
    setSession({
      mode: 'mission',
      title: 'Retos divertidos',
      emoji: '🎈',
      moduleId: 'fun',
      exercises,
      index: 0,
      seed: 0,
      correct: 0,
      attempts: 0,
      goal: exercises.length,
    });
    enterPlay();
  }

  function startDaily() {
    const exercises = dailyChallenge(DAILY_GOAL);
    setSession({
      mode: 'daily',
      title: 'Reto del día',
      emoji: '🌟',
      moduleId: 'daily',
      exercises,
      index: 0,
      seed: 0,
      correct: 0,
      attempts: 0,
      goal: DAILY_GOAL,
    });
    enterPlay();
  }

  function enterPlay() {
    setAnswer('');
    setResult(null);
    setHintsShown(0);
    setStreak(0);
    setGainedXp(0);
    setScreen('play');
  }

  // --------- jugar ----------
  function check() {
    if (!session || !exercise) return;
    const res = correctAnswer(exercise, answer);
    setResult(res);

    const nextAttempts = player.totalAttempts + 1;
    if (res.isCorrect) {
      const newStreak = streak + 1;
      const xp = xpForAnswer(exercise.difficulty, hintsShown, newStreak);
      setStreak(newStreak);
      setGainedXp(xp);
      const solvedByModule = { ...player.solvedByModule };
      if (modulesById.has(session.moduleId)) solvedByModule[session.moduleId] = (solvedByModule[session.moduleId] ?? 0) + 1;
      commitPlayer({
        ...player,
        xp: player.xp + xp,
        totalCorrect: player.totalCorrect + 1,
        totalAttempts: nextAttempts,
        bestStreak: Math.max(player.bestStreak, newStreak),
        solvedByModule,
      });
      setSession({ ...session, correct: session.correct + 1, attempts: session.attempts + 1 });
    } else {
      setStreak(0);
      setGainedXp(0);
      commitPlayer({ ...player, totalAttempts: nextAttempts });
      setSession({ ...session, attempts: session.attempts + 1 });
    }
  }

  function next() {
    if (!session) return;
    const atEnd = session.index >= session.exercises.length - 1;

    // ¿Sesión con meta cumplida?
    if (session.goal !== null && session.correct >= session.goal && (result?.isCorrect ?? false)) {
      if (session.mode === 'daily' && !dailyDoneToday) {
        commitPlayer({
          ...player,
          lastDailyDoneDate: todayKey(),
          dailyStreak: player.dailyStreak + 1,
        });
      }
      setScreen('summary');
      return;
    }

    let nextExercises = session.exercises;
    let nextIndex = session.index + 1;
    if (atEnd) {
      if (session.mode === 'practice') {
        // práctica infinita: generamos otra tanda
        const more = generatePracticeSet(session.moduleId, 12, session.seed + (session.index + 1) * 101);
        nextExercises = [...session.exercises, ...more];
      } else {
        setScreen('summary');
        return;
      }
    }
    setSession({ ...session, exercises: nextExercises, index: nextIndex });
    setAnswer('');
    setResult(null);
    setHintsShown(0);
  }

  function retry() {
    setResult(null);
    setAnswer('');
  }

  function revealAndAdvance() {
    if (!session) return;
    const atEnd = session.index >= session.exercises.length - 1;
    if (atEnd && session.mode !== 'practice') {
      setScreen('summary');
      return;
    }
    let nextExercises = session.exercises;
    if (atEnd && session.mode === 'practice') {
      nextExercises = [
        ...session.exercises,
        ...generatePracticeSet(session.moduleId, 12, session.seed + (session.index + 1) * 101),
      ];
    }
    setSession({ ...session, exercises: nextExercises, index: session.index + 1 });
    setAnswer('');
    setResult(null);
    setHintsShown(0);
  }

  function dismissToast(id: string) {
    setToasts((t) => t.filter((x) => x !== id));
  }

  // ===================== PANTALLAS =====================

  if (screen === 'welcome') {
    return (
      <main className="shell">
        <Toasts ids={toasts} onClose={dismissToast} />
        <section className="hero hero-fun">
          <p className="eyebrow">Tu aventura de Matemáticas · 2.º ESO</p>
          <h1>MateVentura</h1>
          <p className="hero-sub">
            Resuelve retos, gana experiencia, sube de nivel y desbloquea logros mientras dominas las
            mates de 2.º ESO. Ejercicios nuevos cada vez: nunca se acaban. 🚀
          </p>
          <label htmlFor="alias">¿Cómo te llamas, aventurera?</label>
          <div className="answer-row">
            <input id="alias" value={draftAlias} onChange={(e) => setDraftAlias(e.target.value)} placeholder="Ángeles" />
            <button
              onClick={() => {
                const alias = draftAlias.trim() || 'Exploradora';
                commitPlayer({ ...player, alias });
                setScreen('home');
              }}
            >
              ¡Empezar! ✨
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'home') {
    const unlockedCount = player.achievements.length;
    return (
      <main className="shell">
        <Toasts ids={toasts} onClose={dismissToast} />
        <PlayerBar player={player} />

        {/* Reto del día */}
        <section className={`panel daily-card ${dailyDoneToday ? 'done' : ''}`}>
          <div>
            <p className="eyebrow">Reto del día 🌟</p>
            <h2 className="daily-title">{dailyDoneToday ? '¡Reto de hoy completado!' : '5 ejercicios variados, nuevos cada día'}</h2>
            <p className="muted">Racha de días: {player.dailyStreak} 🔥</p>
          </div>
          <button className="big-button" onClick={startDaily}>
            {dailyDoneToday ? 'Repetir reto 🔁' : 'Jugar el reto ▶️'}
          </button>
        </section>

        {/* Retos divertidos (banco que crece con el autocompletado) */}
        {funChallenges.length > 0 ? (
          <section className="panel fun-strip">
            <div>
              <p className="eyebrow">Retos divertidos 🎈</p>
              <h2 className="daily-title">Mates de la vida real</h2>
              <p className="muted small">
                {funChallenges.length} retos sobre móvil, gaming, Feria, conciertos… y subiendo. 🎯
              </p>
            </div>
            <button className="big-button" onClick={startFunChallenges}>
              Sorpréndeme ✨
            </button>
          </section>
        ) : null}

        {/* Territorios de práctica infinita */}
        <section className="panel">
          <h2>Territorios de práctica ∞</h2>
          <p className="muted">Elige una zona del mapa y practica sin límite. Cada ejercicio es distinto.</p>
          <div className="module-grid">
            {practiceCards.map((card) => {
              const mod = modulesById.get(card.moduleId);
              return (
                <article className="module-card fun-card" key={card.moduleId}>
                  <div className="emoji-row">{card.emojis.join(' ')}</div>
                  <h3>{mod?.territoryName ?? card.moduleId}</h3>
                  <p className="muted small">{mod?.description}</p>
                  <p className="tiny">Resueltos aquí: {player.solvedByModule[card.moduleId] ?? 0}</p>
                  <button className="primary-button" onClick={() => startPractice(card.moduleId)}>
                    Practicar ∞
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {/* Misiones guiadas */}
        <section className="panel">
          <h2>Misiones guiadas 🧭</h2>
          <p className="muted">Retos con teoría y una historia detrás.</p>
          <div className="module-grid">
            {curriculum.missions
              .filter((m) => (m.exerciseIds ?? []).length > 0)
              .map((m) => (
                <article className="module-card fun-card" key={m.id}>
                  <h3>{m.title}</h3>
                  <p className="muted small">{m.learningGoal}</p>
                  <p className="tiny">{(m.exerciseIds ?? []).length} ejercicios · ~{m.estimatedMinutes} min</p>
                  <button className="primary-button" onClick={() => startMission(m.id)}>
                    Empezar misión
                  </button>
                </article>
              ))}
          </div>
        </section>

        {/* Logros */}
        <section className="panel">
          <h2>Logros 🏅 <span className="muted small">({unlockedCount}/{ACHIEVEMENTS.length})</span></h2>
          <div className="ach-grid">
            {ACHIEVEMENTS.map((a) => {
              const got = player.achievements.includes(a.id);
              return (
                <div className={`ach ${got ? 'got' : 'locked'}`} key={a.id} title={a.description}>
                  <span className="ach-emoji">{got ? a.emoji : '🔒'}</span>
                  <span className="ach-title">{a.title}</span>
                  <span className="ach-desc">{a.description}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'play' && session && exercise) {
    const progressText =
      session.goal !== null ? `${session.correct}/${session.goal} ✓` : `${session.correct} resueltos`;
    return (
      <main className="shell">
        <Toasts ids={toasts} onClose={dismissToast} />
        <header className="panel topbar play-top">
          <button className="link-button" onClick={() => setScreen('home')}>
            ← Mapa
          </button>
          <p>
            {session.emoji} <strong>{session.title}</strong>
          </p>
          <p className="streak">{streak > 0 ? `Racha ${streak} ${'🔥'.repeat(Math.min(streak, 5))}` : 'Sin racha'} · {progressText}</p>
        </header>

        <section className="panel">
          <p className="eyebrow">
            Ejercicio · dificultad {'★'.repeat(exercise.difficulty)}{'☆'.repeat(5 - exercise.difficulty)}
          </p>
          <h2 className="statement">{exercise.statement}</h2>

          {!result || !result.isCorrect ? (
            <>
              <div className="answer-row">
                <input
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && answer.trim()) check();
                  }}
                  placeholder={exercise.answerInput.placeholder}
                />
                <button disabled={!answer.trim()} onClick={check}>
                  Comprobar
                </button>
                {hintsShown < exercise.hints.length ? (
                  <button className="ghost-button" onClick={() => setHintsShown((h) => h + 1)}>
                    💡 Pista
                  </button>
                ) : null}
              </div>
              {hintsShown > 0 ? (
                <ul className="hints">
                  {exercise.hints.slice(0, hintsShown).map((h, i) => (
                    <li key={i}>{h.text}</li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}

          {result ? (
            <aside className={`feedback ${result.isCorrect ? 'ok' : 'needs-work'}`}>
              {result.isCorrect ? (
                <>
                  <h3>{cheer(player.totalCorrect)} +{gainedXp} XP</h3>
                  <p>{exercise.explanation.text}</p>
                  {exercise.explanation.check ? <p className="muted small">🔎 {exercise.explanation.check}</p> : null}
                  <button className="big-button" onClick={next}>
                    {session.goal !== null && session.correct >= session.goal ? 'Ver resumen 🏁' : 'Siguiente →'}
                  </button>
                </>
              ) : (
                <>
                  <h3>{encourage(session.attempts)}</h3>
                  <p>{feedbackBody(result)}</p>
                  {exercise.hints.length > 0 ? <p className="muted small">💡 {exercise.hints[0].text}</p> : null}
                  <div className="answer-row">
                    <button className="big-button" onClick={retry}>
                      Reintentar 🔄
                    </button>
                    <button className="ghost-button" onClick={revealAndAdvance}>
                      Ver solución y pasar →
                    </button>
                  </div>
                </>
              )}
            </aside>
          ) : null}
        </section>
      </main>
    );
  }

  // summary
  if (screen === 'summary' && session) {
    return (
      <main className="shell">
        <Toasts ids={toasts} onClose={dismissToast} />
        <section className="hero hero-fun celebrate">
          <p className="eyebrow">{session.emoji} {session.title}</p>
          <h1>¡Bien hecho, {player.alias}! 🎉</h1>
          <p className="hero-sub">
            Resueltos: <strong>{session.correct}</strong> · Intentos: {session.attempts} · Nivel {level.level} {level.emoji}
          </p>
          <div className="answer-row">
            {session.mode === 'practice' ? (
              <button className="big-button" onClick={() => startPractice(session.moduleId)}>
                Otra tanda ∞
              </button>
            ) : null}
            <button className="big-button" onClick={() => setScreen('home')}>
              Volver al mapa 🗺️
            </button>
          </div>
        </section>
      </main>
    );
  }

  return null;
}

// ===================== COMPONENTES =====================

function PlayerBar({ player }: { player: PlayerProfile }) {
  const level = levelFromXp(player.xp);
  return (
    <section className="panel player-bar">
      <div className="level-badge">
        <span className="level-emoji">{level.emoji}</span>
        <span className="level-num">Nv {level.level}</span>
      </div>
      <div className="level-info">
        <p className="level-title">
          {player.alias} · <span className="muted">{level.title}</span>
        </p>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${Math.round(level.progress * 100)}%` }} />
        </div>
        <p className="tiny">
          {level.xpIntoLevel}/{level.xpForNextLevel} XP para el siguiente nivel · {player.totalCorrect} resueltos en total
        </p>
      </div>
    </section>
  );
}

function Toasts({ ids, onClose }: { ids: string[]; onClose: (id: string) => void }) {
  if (ids.length === 0) return null;
  return (
    <div className="toast-stack">
      {ids.map((id) => {
        const a = getAchievement(id);
        if (!a) return null;
        return (
          <button className="toast" key={id} onClick={() => onClose(id)}>
            <span className="toast-emoji">{a.emoji}</span>
            <span>
              <strong>¡Logro desbloqueado!</strong>
              <br />
              {a.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
