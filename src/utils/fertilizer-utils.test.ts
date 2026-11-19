import { describe, expect, it } from 'vitest';
import { FERTILIZERS } from '../data/fertilizers';
import { filterFertilizers, normalizeFormula, sortFertilizers, theoreticalFor } from './fertilizer-utils';

const all = { query: '', group: 'all', nutrient: 'all' } as const;

describe('fertilizer utils', () => {
  it('нормалізує формули', () => {
    expect(normalizeFormula('NH₄NO₃')).toBe('nh4no3');
    expect(normalizeFormula('(NH4)2SO4')).toBe('nh42so4');
  });
  it('шукає за формулою з індексами й без', () => {
    const a = filterFertilizers(FERTILIZERS, { ...all, query: 'NH₄NO₃' }).map((x) => x.id);
    const b = filterFertilizers(FERTILIZERS, { ...all, query: 'nh4no3' }).map((x) => x.id);
    expect(a).toEqual(b);
    expect(a).toContain('ammonium-nitrate');
  });
  it('шукає за назвою українською та англійською', () => {
    expect(filterFertilizers(FERTILIZERS, { ...all, query: 'селітра' }).length).toBeGreaterThanOrEqual(2);
    expect(filterFertilizers(FERTILIZERS, { ...all, query: 'urea' }).map((x) => x.id)).toContain('urea');
  });
  it('фільтрує за групою та елементом', () => {
    expect(filterFertilizers(FERTILIZERS, { ...all, group: 'potassium' })).toHaveLength(7);
    const withMg = filterFertilizers(FERTILIZERS, { ...all, nutrient: 'MgO' }).map((x) => x.id);
    expect(withMg).toEqual(['kalimagnesia']);
  });
  it('сортує за вмістом', () => {
    const s = sortFertilizers(FERTILIZERS, 'content', 'uk');
    expect(s[0].id).toBe('anhydrous-ammonia');
  });
  it('теоретичні значення', () => {
    const an = FERTILIZERS.find((x) => x.id === 'ammonium-nitrate')!;
    expect(theoreticalFor(an)?.content.N).toBeCloseTo(35.0, 1);
    const kas = FERTILIZERS.find((x) => x.id === 'uan-solution')!;
    expect(theoreticalFor(kas)).toBeNull();
  });
});
