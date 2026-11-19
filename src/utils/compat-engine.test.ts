import { describe, expect, it } from 'vitest';
import { evaluate, mixIssues } from './compat-engine';
import { getMaterial, MATERIALS } from '../data/materials';
import { RULES } from '../data/compatibility/rules';
import { SOURCES } from '../data/sources';
import { isBalanced } from './chemistry';

const M = (id: string) => getMaterial(id)!;
const st = (a: string, b: string, mode: 'dry' | 'solution') => evaluate(M(a), M(b), mode).status;

describe('обов’язкові приклади «Змішувального столу»', () => {
  it('аміачна селітра + негашене/гашене вапно — несумісні (NH₃↑)', () => {
    for (const lime of ['quicklime', 'slaked-lime']) {
      const r = evaluate(M('ammonium-nitrate'), M(lime), 'dry');
      expect(r.status).toBe('incompatible');
      expect(r.rule!.effects.includes('gas-nh3')).toBe(true);
    }
  });
  it('аміачна селітра + вапняк/доломіт — сумісні за певних умов', () => {
    expect(st('ammonium-nitrate', 'limestone', 'dry')).toBe('conditional');
    expect(st('ammonium-nitrate', 'dolomite', 'dry')).toBe('conditional');
  });
  it('карбамід + вапно — сумісні за певних умов (не показує газ)', () => {
    for (const lime of ['quicklime', 'slaked-lime', 'limestone']) {
      const r = evaluate(M('urea'), M(lime), 'dry');
      expect(r.status).toBe('conditional');
      expect(r.rule!.effects).toEqual([]);
    }
  });
  it('суперфосфат + кальцієва селітра: сухе — несумісні; розчини — осад фосфатів', () => {
    expect(st('simple-superphosphate', 'calcium-nitrate', 'dry')).toBe('incompatible');
    expect(st('double-superphosphate', 'calcium-nitrate', 'dry')).toBe('incompatible');
    const sol = evaluate(M('simple-superphosphate'), M('calcium-nitrate'), 'solution');
    expect(sol.status).toBe('incompatible');
    expect(sol.rule!.effects.includes('precipitate')).toBe(true);
  });
  it('сульфат амонію + вапняк — несумісні', () => {
    expect(st('ammonium-sulfate', 'limestone', 'dry')).toBe('incompatible');
    expect(st('ammonium-sulfate', 'dolomite', 'dry')).toBe('incompatible');
  });
  it('KCl + K₂SO₄: сухе — сумісні, розчин — за певних умов', () => {
    expect(st('potassium-chloride', 'potassium-sulfate', 'dry')).toBe('compatible');
    expect(st('potassium-chloride', 'potassium-sulfate', 'solution')).toBe('conditional');
  });
});

describe('режими та поведінка за відсутності правил', () => {
  it('карбамід + аміачна селітра: сухе — несумісні, розчин — сумісні', () => {
    expect(st('urea', 'ammonium-nitrate', 'dry')).toBe('incompatible');
    expect(st('urea', 'ammonium-nitrate', 'solution')).toBe('compatible');
  });
  it('невідома пара → «недостатньо даних», а не «сумісні»', () => {
    const r = evaluate(M('ammonium-sulfate'), M('potassium-chloride'), 'dry');
    expect(r.status).toBe('insufficient');
    expect(r.reason).toBe('no-rule');
  });
  it('симетричність', () => {
    expect(st('limestone', 'ammonium-sulfate', 'dry')).toBe(st('ammonium-sulfate', 'limestone', 'dry'));
  });
  it('газ і рідини не змішуються всуху', () => {
    expect(evaluate(M('anhydrous-ammonia'), M('urea'), 'dry').reason).toBe('not-applicable-physical');
    expect(evaluate(M('uan-solution'), M('urea'), 'dry').reason).toBe('not-applicable-physical');
  });
  it('нерозчинні матеріали в розчині без правила — не застосовно', () => {
    expect(evaluate(M('rock-phosphate'), M('potassium-chloride'), 'solution').reason).toBe('not-applicable-solubility');
  });
  it('шлаки + амонійні добрива — несумісні', () => {
    expect(st('thomas-slag', 'ammonium-nitrate', 'dry')).toBe('incompatible');
    expect(st('open-hearth-slag', 'dap', 'dry')).toBe('incompatible');
  });
  it('кислі фосфати + вапняк — несумісні, MAP + CaO → NH₃', () => {
    expect(st('double-superphosphate', 'limestone', 'dry')).toBe('incompatible');
    expect(evaluate(M('ammophos'), M('quicklime'), 'dry').rule!.effects.includes('gas-nh3')).toBe(true);
  });
  it('однакові матеріали не порівнюються', () => {
    expect(() => evaluate(M('urea'), M('urea'), 'dry')).toThrow();
  });
  it('попередження для набору', () => {
    const issues = mixIssues([M('urea'), M('ammonium-nitrate'), M('potassium-chloride')], 'dry');
    expect(issues.length).toBeGreaterThanOrEqual(2);
  });
});

describe('цілісність правил', () => {
  it('унікальні id, повні пояснення, існуючі джерела', () => {
    const ids = RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of RULES) {
      expect(r.mechanism.uk.length > 10 && r.mechanism.en.length > 10).toBe(true);
      for (const s of r.sourceIds) expect(s in SOURCES).toBe(true);
      if (r.verification === 'verified') expect(r.sourceIds.length).toBeGreaterThan(0);
    }
  });
  it('усі рівняння збалансовані', () => {
    for (const r of RULES) for (const e of r.equations ?? []) expect(isBalanced(e)).toBe(true);
  });
  it('газ показується лише для правил із NH₃ у рівнянні, осад — лише з ↓', () => {
    for (const r of RULES) {
      const eq = (r.equations ?? []).join(' ');
      if (r.effects.includes('gas-nh3')) expect(eq.includes('NH3↑')).toBe(true);
      if (r.effects.includes('precipitate')) expect(eq.includes('↓')).toBe(true);
    }
  });
  it('вапнувальні матеріали не входять до каталогу добрив', () => {
    expect(MATERIALS.filter((m) => m.kind === 'amendment')).toHaveLength(4);
    expect(MATERIALS.filter((m) => m.kind === 'fertilizer')).toHaveLength(23);
  });
});
