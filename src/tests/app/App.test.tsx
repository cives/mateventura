import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../app/App';
import { curriculum } from '../../content/curriculum';

const PERCENTAGES = 'mission.percentages.market_discounts';

function missionTitle(missionId: string): string {
  const m = curriculum.missions.find((c) => c.id === missionId);
  if (!m) throw new Error(`Misión no encontrada: ${missionId}`);
  return m.title;
}

function firstExercise(missionId: string) {
  const m = curriculum.missions.find((c) => c.id === missionId)!;
  const ex = curriculum.exercises.find((e) => e.id === m.exerciseIds?.[0])!;
  return ex;
}

function enterHome() {
  fireEvent.click(screen.getByRole('button', { name: /Empezar/ }));
}

function openMission(missionId: string) {
  const card = screen.getByRole('heading', { name: missionTitle(missionId) }).closest('article');
  if (!card) throw new Error('No se encontró la tarjeta de misión');
  fireEvent.click(within(card).getByRole('button', { name: /Empezar misión/ }));
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('de la bienvenida pasa al hub mostrando nivel y alias', () => {
    render(<App />);
    enterHome();
    expect(screen.getByText(/Nv 1/)).toBeTruthy();
    expect(screen.getByText(/Territorios de práctica/)).toBeTruthy();
    expect(screen.getByText(/Reto del día/)).toBeTruthy();
  });

  it('abre una misión guiada y muestra su primer ejercicio', () => {
    render(<App />);
    enterHome();
    openMission(PERCENTAGES);
    expect(screen.getByRole('heading', { name: firstExercise(PERCENTAGES).statement })).toBeTruthy();
  });

  it('al acertar otorga XP y muestra la explicación', () => {
    render(<App />);
    enterHome();
    openMission(PERCENTAGES);
    const ex = firstExercise(PERCENTAGES);
    const correct = ex.expectedAnswer.kind === 'number_with_unit' ? String(ex.expectedAnswer.value) : '';
    fireEvent.change(screen.getByRole('textbox'), { target: { value: correct } });
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(screen.getByText(/XP/)).toBeTruthy();
    expect(screen.getByText(ex.explanation.text)).toBeTruthy();
  });

  it('al fallar muestra ánimo, una pista y permite reintentar', () => {
    render(<App />);
    enterHome();
    openMission(PERCENTAGES);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '99999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(screen.getByRole('button', { name: /Reintentar/ })).toBeTruthy();
    expect(screen.getAllByText(/💡/).length).toBeGreaterThan(0);
  });

  it('la práctica infinita arranca con un ejercicio jugable', () => {
    render(<App />);
    enterHome();
    const practiceHeading = screen.getByRole('heading', { name: /Territorios de práctica/ });
    const section = practiceHeading.closest('section')!;
    const firstPracticeButton = within(section).getAllByRole('button', { name: /Practicar/ })[0];
    fireEvent.click(firstPracticeButton);
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Comprobar' })).toBeTruthy();
  });
});
