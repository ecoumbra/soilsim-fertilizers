import { describe, expect, it } from 'vitest';
import { attemptsCount, bestByScenario, makeAttempt, mergeAttempts, parseJournal, ratio, summarize, toCsv, toJson } from './journal';
import type { Attempt } from './journal';

const mk = (module: Attempt['module'], scenarioId: string, score: number, max: number, rnd = 0.1): Attempt =>
  makeAttempt({ module, scenarioId, score, max, hints: 0, tests: 0, mistakes: [] }, new Date('2026-11-13T10:00:00Z'), () => rnd);

describe('журнал результатів', () => {
  it('створює спробу з унікальним id', () => {
    const a = mk('audit', 'rp-ph75', 2, 3, 0.1);
    const b = mk('audit', 'rp-ph75', 2, 3, 0.2);
    expect(a.ts).toBe('2026-11-13T10:00:00.000Z');
    expect(a.id === b.id).toBe(false);
    expect(ratio(a)).toBeCloseTo(0.6667, 3);
  });
  it('підсумки за модулями й найкращі результати', () => {
    const list = [mk('audit', 'a', 1, 3, 0.1), mk('audit', 'a', 3, 3, 0.2), mk('diagnosis', 'd', 4, 8, 0.3)];
    const s = summarize(list);
    expect(s.audit.attempts).toBe(2);
    expect(s.audit.scenarios).toBe(1);
    expect(s.audit.best).toBe(1);
    expect(s.audit.average).toBeCloseTo((1 / 3 + 1) / 2, 6);
    expect(s.diagnosis.best).toBe(0.5);
    expect(s.detective.attempts).toBe(0);
    expect(bestByScenario(list)['audit:a']).toBe(1);
    expect(attemptsCount(list, 'audit', 'a')).toBe(2);
  });
  it('CSV: заголовок, екранування, відсотки', () => {
    const a = makeAttempt({ module: 'audit', scenarioId: 'x', score: 2, max: 3, hints: 1, tests: 0, mistakes: ['a', 'b"c'] }, new Date('2026-01-01T00:00:00Z'), () => 0.5);
    const csv = toCsv([a]).split('\n');
    expect(csv[0]).toBe('timestamp,module,scenario,score,max,percent,hints,tests,mistakes');
    expect(csv[1].includes(',67,')).toBe(true);
    expect(csv[1].includes('"a;b""c"')).toBe(true);
  });
  it('JSON: експорт → імпорт без втрат', () => {
    const list = [mk('audit', 'a', 1, 3, 0.1), mk('detective', 'dc-as', 9, 10, 0.2)];
    const r = parseJournal(toJson(list));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.attempts).toEqual(list);
  });
  it('імпорт відхиляє некоректні файли', () => {
    expect(parseJournal('not json')).toEqual({ ok: false, error: 'json' });
    expect(parseJournal('{"app":"other","version":1,"attempts":[]}')).toEqual({ ok: false, error: 'format' });
    expect(parseJournal('{"app":"soilsim-fertilizers","version":1,"attempts":[{"id":1}]}')).toEqual({ ok: false, error: 'format' });
    expect(parseJournal('42')).toEqual({ ok: false, error: 'format' });
  });
  it('об’єднання без дублів, упорядковано за часом', () => {
    const a = mk('audit', 'a', 1, 3, 0.1);
    const b = makeAttempt({ module: 'audit', scenarioId: 'b', score: 1, max: 3, hints: 0, tests: 0, mistakes: [] }, new Date('2026-11-12T10:00:00Z'), () => 0.5);
    const merged = mergeAttempts([a], [a, b]);
    expect(merged).toHaveLength(2);
    expect(merged[0].scenarioId).toBe('b');
  });
});
