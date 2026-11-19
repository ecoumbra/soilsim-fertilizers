import { describe, expect, it } from 'vitest';
import { DIAG_SCENARIOS } from '../data/practicum/diagnosis';
import { AUDIT_SCENARIOS } from '../data/practicum/audit';
import { HYPOTHESES, LEVELS } from '../data/practicum/types';
import { MATERIALS } from '../data/materials';
import { SOURCES } from '../data/sources';
import { DIAG_MAX, scoreAudit, scoreDiagnosis } from './practicum';
import { DETECTIVE_CASES, DETECTIVE_EQUATIONS, POOL, indistinguishable, minTests, replay, runTest, scoreDetective, signature, TEST_ORDER, waterOutcome } from './detective';
import type { TestId } from './detective';
import { FERTILIZERS } from '../data/fertilizers';
import { isBalanced } from './chemistry';

const F = (id: string) => FERTILIZERS.find((f) => f.id === id)!;
const matIds = new Set(MATERIALS.map((m) => m.id));
const hypIds = new Set(HYPOTHESES.map((h) => h.id));

describe('сценарії діагностики', () => {
  it('9 сценаріїв: по 3 на рівень', () => {
    expect(DIAG_SCENARIOS).toHaveLength(9);
    for (const l of LEVELS) expect(DIAG_SCENARIOS.filter((s) => s.level === l)).toHaveLength(3);
  });
  it('цілісність даних', () => {
    const ids = DIAG_SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of DIAG_SCENARIOS) {
      expect(hypIds.has(s.primary)).toBe(true);
      for (const a of s.acceptable) expect(hypIds.has(a)).toBe(true);
      expect(s.hints).toHaveLength(2);
      expect(Object.values(s.fert).includes(3)).toBe(true);
      for (const id of Object.keys(s.fert)) expect(matIds.has(id)).toBe(true);
      expect(s.rationale.some((r) => r.correct) && s.rationale.some((r) => !r.correct)).toBe(true);
      for (const src of s.sourceIds) expect(src in SOURCES).toBe(true);
      expect(s.title.uk.length > 0 && s.title.en.length > 0 && s.explanation.uk.length > 0 && s.explanation.en.length > 0).toBe(true);
      expect(s.field.symptoms.length).toBeGreaterThan(0);
    }
  });
  it('є неоднозначні сценарії з кількома прийнятними гіпотезами', () => {
    expect(DIAG_SCENARIOS.some((s) => s.ambiguous && s.acceptable.length > 0)).toBe(true);
  });
});

describe('оцінювання діагностики', () => {
  const s = DIAG_SCENARIOS[0];
  const allRight = s.rationale.filter((r) => r.correct).map((r) => r.id);
  it('максимум = 8', () => {
    const best = scoreDiagnosis(s, { hypothesis: s.primary, fert: 'ammonium-nitrate', rationale: allRight, hintsUsed: 0 });
    expect(best.total).toBe(DIAG_MAX);
    expect(best.mistakes).toEqual([]);
  });
  it('підказки зменшують бал, а хибні твердження — теж', () => {
    const hint = scoreDiagnosis(s, { hypothesis: s.primary, fert: 'urea', rationale: allRight, hintsUsed: 2 });
    expect(hint.total).toBe(6);
    const wrongStatement = scoreDiagnosis(s, { hypothesis: s.primary, fert: 'urea', rationale: [...allRight.slice(0, 2), 'r3'], hintsUsed: 0 });
    expect(wrongStatement.rationalePts).toBe(1);
    expect(wrongStatement.mistakes.includes('rationale-wrong')).toBe(true);
  });
  it('хибна гіпотеза й добриво дають 0 за ці кроки; бал не від’ємний', () => {
    const r = scoreDiagnosis(s, { hypothesis: 'k-def', fert: 'potassium-chloride', rationale: ['r3', 'r4'], hintsUsed: 2 });
    expect(r.hypothesisPts).toBe(0);
    expect(r.fertPts).toBe(0);
    expect(r.total).toBe(0);
    expect(r.mistakes).toContain('hypothesis');
    expect(r.mistakes).toContain('fertilizer');
  });
  it('прийнятна гіпотеза дає 2 бали', () => {
    const a = DIAG_SCENARIOS.find((x) => x.id === 'p-def-acid')!;
    expect(scoreDiagnosis(a, { hypothesis: 'acidity', fert: '', rationale: [], hintsUsed: 0 }).hypothesisPts).toBe(2);
  });
});

describe('сценарії аудиту', () => {
  it('не менше 10 сценаріїв; усі рівні представлені', () => {
    expect(AUDIT_SCENARIOS.length).toBeGreaterThanOrEqual(10);
    for (const l of LEVELS) expect(AUDIT_SCENARIOS.some((s) => s.level === l)).toBe(true);
  });
  it('цілісність: кожна помилка має фрагмент, механізм і альтернативу', () => {
    const ids = AUDIT_SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of AUDIT_SCENARIOS) {
      const withError = s.fragments.filter((f) => f.errorId);
      expect(withError.length).toBeGreaterThan(0);
      expect(s.fragments.some((f) => !f.errorId)).toBe(true);
      expect(withError.length).toBe(s.errors.length);
      for (const f of withError) expect(s.errors.some((e) => e.id === f.errorId)).toBe(true);
      for (const e of s.errors) {
        expect(e.mechanism.options).toHaveLength(3);
        expect(e.alternative.options).toHaveLength(3);
        expect(e.mechanism.correct >= 0 && e.mechanism.correct < 3).toBe(true);
        expect(e.alternative.correct >= 0 && e.alternative.correct < 3).toBe(true);
        for (const o of [...e.mechanism.options, ...e.alternative.options]) expect(o.uk.length > 3 && o.en.length > 3).toBe(true);
      }
      for (const f of s.fragments) expect(f.text.uk.length > 3 && f.text.en.length > 3).toBe(true);
      for (const src of s.sourceIds) expect(src in SOURCES).toBe(true);
    }
  });
});

describe('оцінювання аудиту', () => {
  const s = AUDIT_SCENARIOS.find((x) => x.id === 'rp-ph75')!;
  const e = s.errors[0];
  it('повна відповідь = максимум', () => {
    const r = scoreAudit(s, { marked: ['f2'], mechanism: { [e.id]: e.mechanism.correct }, alternative: { [e.id]: e.alternative.correct } });
    expect(r.total).toBe(3);
    expect(r.max).toBe(3);
    expect(r.mistakes).toEqual([]);
  });
  it('хибне позначення зменшує бал; пропуск помилки дає 0', () => {
    const fp = scoreAudit(s, { marked: ['f2', 'f1'], mechanism: { [e.id]: e.mechanism.correct }, alternative: { [e.id]: e.alternative.correct } });
    expect(fp.falsePositives).toBe(1);
    expect(fp.total).toBe(2);
    expect(fp.mistakes).toContain('falsePositive');
    const none = scoreAudit(s, { marked: [], mechanism: {}, alternative: {} });
    expect(none.total).toBe(0);
    expect(none.mistakes).toContain('missedError');
  });
  it('неправильний механізм не зараховується', () => {
    const r = scoreAudit(s, { marked: ['f2'], mechanism: { [e.id]: (e.mechanism.correct + 1) % 3 }, alternative: { [e.id]: e.alternative.correct } });
    expect(r.total).toBe(2);
    expect(r.mistakes).toContain('mechanism');
  });
});

describe('«Лабораторний детектив»: результати обчислюються з бази', () => {
  const obs = (test: TestId, id: string, prepared = false) => runTest(test, F(id), prepared);
  it('пул — 18 проб; виключені газ, шлаки, марки з невідомим складом', () => {
    expect(POOL).toHaveLength(18);
    expect(POOL.some((f) => f.id === 'anhydrous-ammonia')).toBe(false);
  });
  it('амонійні солі, сечовина, Ca-селітра', () => {
    expect(obs('naoh-heat', 'ammonium-sulfate').result).toBe('positive');
    expect(obs('nessler', 'ammonium-sulfate').result).toBe('positive');
    expect(obs('naoh-heat', 'urea').result).toBe('slow');
    expect(obs('nessler', 'urea').result).toBe('negative');
    expect(obs('nessler', 'calcium-nitrate').result).toBe('weak');
    expect(obs('naoh-heat', 'uan-solution').result).toBe('positive');
  });
  it('хлорид, сульфат, фосфат', () => {
    expect(obs('agno3', 'potassium-chloride').result).toBe('positive');
    expect(obs('agno3', 'potassium-sulfate').result).toBe('negative');
    expect(obs('bacl2', 'potassium-sulfate').result).toBe('positive');
    expect(obs('molybdate', 'ammophos').result).toBe('positive');
    expect(obs('molybdate', 'urea').result).toBe('negative');
  });
  it('розчинність: вода, КАС — рідина, простий суперфосфат — частково', () => {
    expect(waterOutcome(F('precipitate'))).toBe('insoluble');
    expect(waterOutcome(F('uan-solution'))).toBe('miscible');
    expect(waterOutcome(F('simple-superphosphate'))).toBe('partial');
    expect(waterOutcome(F('potassium-sulfate'))).toBe('dissolves');
  });
  it('нерозчинні проби: іонні тести негативні, доки не розчинити в кислоті', () => {
    expect(obs('molybdate', 'precipitate', false).result).toBe('not-dissolved');
    expect(replay(F('precipitate'), ['molybdate', 'hcl', 'molybdate']).map((o) => o.result)).toEqual(['not-dissolved', 'dissolves-acid', 'positive']);
  });
  it('кислота: поташ шипить, фосфорит слабко, преципітат розчиняється', () => {
    expect(obs('hcl', 'potassium-carbonate').result).toBe('effervescence');
    expect(obs('hcl', 'rock-phosphate').result).toBe('weak-effervescence');
    expect(obs('hcl', 'precipitate').result).toBe('dissolves-acid');
    expect(obs('hcl', 'urea').result).toBe('no-reaction');
  });
  it('полуменева проба розрізняє KCl, сильвініт і Ca-сполуки', () => {
    expect(obs('flame', 'potassium-chloride').colors).toEqual(['violet']);
    expect(obs('flame', 'sylvinite').colors).toEqual(['yellow', 'violet']);
    expect(obs('flame', 'double-superphosphate').colors).toEqual(['brick-red']);
    expect(obs('flame', 'urea').result).toBe('negative');
  });
  it('рівняння реакцій збалансовані', () => {
    for (const e of Object.values(DETECTIVE_EQUATIONS)) expect(isBalanced(e as string)).toBe(true);
  });
});

describe('нерозрізнювані групи й завдання', () => {
  const ids = (id: string) => indistinguishable(F(id)).map((f) => f.id).sort();
  it('унікальні проби', () => {
    for (const id of ['ammonium-sulfate', 'potassium-chloride', 'urea', 'calcium-nitrate', 'double-superphosphate', 'precipitate', 'sylvinite']) {
      expect(ids(id)).toEqual([id]);
    }
  });
  it('неспецифічні пари: MAP/DAP та K₂SO₄/калімагнезія', () => {
    expect(ids('ammophos')).toEqual(['ammophos', 'dap']);
    expect(ids('potassium-sulfate')).toEqual(['kalimagnesia', 'potassium-sulfate']);
  });
  it('усі завдання розв’язні в межах бюджету тестів', () => {
    expect(DETECTIVE_CASES).toHaveLength(9);
    for (const l of LEVELS) expect(DETECTIVE_CASES.filter((c) => c.level === l)).toHaveLength(3);
    for (const c of DETECTIVE_CASES) {
      expect(POOL.some((f) => f.id === c.sampleId)).toBe(true);
      expect(minTests(F(c.sampleId))).toBeLessThanOrEqual(c.budget);
    }
  });
  it('оцінювання: точна відповідь, група, помилка, зайві тести', () => {
    const sample = F('ammophos');
    expect(scoreDetective(sample, 'ammophos', ['hcl', 'water']).total).toBeGreaterThan(0);
    const inGroup = scoreDetective(sample, 'dap', TEST_ORDER.slice(0, 5));
    expect(inGroup.inGroup).toBe(true);
    expect(inGroup.exact).toBe(false);
    expect(inGroup.total).toBeGreaterThan(0);
    expect(scoreDetective(sample, 'urea', ['water']).total).toBe(0);
    const urea = F('urea');
    const many = scoreDetective(urea, 'urea', TEST_ORDER);
    expect(many.extra).toBeGreaterThan(0);
    expect(many.total).toBeGreaterThanOrEqual(6);
    expect(many.mistakes).toContain('extraTests');
  });
  it('підпис результатів розрізняє різні проби', () => {
    const a = signature(replay(F('urea'), TEST_ORDER));
    const b = signature(replay(F('ammonium-sulfate'), TEST_ORDER));
    expect(a === b).toBe(false);
  });
});
