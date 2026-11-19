import { describe, expect, it } from 'vitest';
import { FERTILIZERS } from './fertilizers';
import { SOURCES } from './sources';
import { isBalanced } from '../utils/chemistry';
import type { Fertilizer, Verification } from './types';

function statuses(f: Fertilizer): [string, Verification][] {
  const out: [string, Verification][] = [];
  for (const [k, q] of Object.entries(f.nutrients)) out.push([`nutrients.${k}`, q.status]);
  if (f.physical) out.push(['physical', f.physical.status]);
  if (f.hygroscopicity) out.push(['hygroscopicity', f.hygroscopicity.status]);
  if (f.solubility) out.push(['solubility', f.solubility.status]);
  if (f.soil) {
    out.push(['soil.reaction', f.soil.reactionStatus]);
    out.push(['soil.text', f.soil.textStatus]);
  }
  if (f.plant) out.push(['plant', f.plant.status]);
  out.push(['application', f.application.status]);
  if (f.compatibilityNotes) out.push(['compatibility', f.compatibilityNotes.status]);
  f.reactions.forEach((r, i) => out.push([`reactions.${i}`, r.status]));
  return out;
}

describe('реєстр джерел', () => {
  it('записи цілісні', () => {
    const types = ['research', 'extension', 'institutional', 'regulation', 'manufacturer', 'industry', 'lecture'];
    for (const [id, s] of Object.entries(SOURCES)) {
      expect(s.id).toBe(id);
      expect(s.url.startsWith('https://') || s.url.startsWith('http://')).toBe(true);
      expect(types.includes(s.type)).toBe(true);
      expect(/^\d{4}-\d{2}-\d{2}$/.test(s.accessed)).toBe(true);
      expect(s.title.length).toBeGreaterThan(5);
    }
  });
});

describe('шар верифікації', () => {
  it('усі джерела й докази існують у реєстрі та в переліку добрива', () => {
    for (const f of FERTILIZERS) {
      for (const ref of f.sources) {
        expect(ref.id in SOURCES).toBe(true);
        expect(ref.supports.uk.length > 0 && ref.supports.en.length > 0).toBe(true);
      }
      const ids = f.sources.map((x) => x.id);
      for (const [path, evid] of Object.entries(f.evidence ?? {})) {
        expect(evid.length).toBeGreaterThan(0);
        for (const id of evid) expect(ids.includes(id)).toBe(true);
        expect(path.length).toBeGreaterThan(0);
      }
    }
  });
  it('кожне поле зі статусом «verified» має докази', () => {
    for (const f of FERTILIZERS) {
      for (const [path, st] of statuses(f)) {
        if (st === 'verified') expect((f.evidence?.[path] ?? []).length).toBeGreaterThan(0);
      }
    }
  });
  it('усі рівняння збалансовані за атомами та зарядом', () => {
    for (const f of FERTILIZERS) for (const r of f.reactions) expect(isBalanced(r.equation)).toBe(true);
  });
  it('рівняння не мають статусу needs-review (стають «розраховано» або мають джерело)', () => {
    for (const f of FERTILIZERS) for (const r of f.reactions) expect(r.status === 'needs-review').toBe(false);
  });
  it('КАС: частки форм азоту в усіх марках дають 100 %', () => {
    const kas = FERTILIZERS.find((f) => f.id === 'uan-solution')!;
    for (const g of kas.grades ?? []) {
      const s = g.nitrogenSharesOfTotalN!;
      expect(s.amide + s.ammonium + s.nitrate).toBe(100);
    }
  });
  it('MKP: числові дані (виробник Haifa 0–40 °C + таблиця Merck 60–80 °C) зростають із температурою й мають джерело', () => {
    const mkp = FERTILIZERS.find((f) => f.id === 'mkp')!;
    const pts = mkp.solubility!.byTemperature!;
    expect(pts).toHaveLength(7);
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].tC > pts[i - 1].tC).toBe(true);
      expect(pts[i].gPer100gWater > pts[i - 1].gPer100gWater).toBe(true);
    }
    for (const p of pts) expect(p.sourceId in SOURCES).toBe(true);
  });
  it('очікувані верифіковані поля', () => {
    const get = (id: string) => FERTILIZERS.find((f) => f.id === id)!;
    expect(get('ammonium-nitrate').nutrients.N?.status).toBe('verified');
    expect(get('calcium-nitrate').soil?.reaction).toBe('alkaline');
    expect(get('calcium-nitrate').nutrients.CaO?.status).toBe('verified');
    expect(get('potassium-sulfate').nutrients.S?.status).toBe('verified');
    expect(get('kalimagnesia').nutrients.MgO?.status).toBe('verified');
    // розбіжності з джерелами НЕ маркуються як verified
    expect(get('sylvinite').nutrients.K2O?.status).toBe('author-provided');
    expect(get('urea').nutrients.N?.status).toBe('author-provided');
    expect(get('ammophos').nutrients.N?.status).toBe('author-provided');
  });
  it('підсумок верифікації (інформаційно)', () => {
    let v = 0, a = 0, c = 0, other = 0;
    for (const f of FERTILIZERS) for (const [, st] of statuses(f)) {
      if (st === 'verified') v++; else if (st === 'author-provided') a++; else if (st === 'computed') c++; else other++;
    }
    console.info(`verified=${v} author=${a} computed=${c} other(needs-review/unknown)=${other}`);
    expect(v).toBeGreaterThan(40);
  });
});
