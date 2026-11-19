import { describe, expect, it } from 'vitest';
import { parseChem, prepareEquation } from './chem-format';

const render = (s: string) =>
  parseChem(s).map((t) => (t.t === 'sub' ? `_${t.s}` : t.t === 'sup' ? `^${t.s}` : t.s)).join('');

describe('parseChem', () => {
  it('індекси після літер і дужок', () => {
    expect(render('(NH4)2SO4')).toBe('(NH_4)_2SO_4');
  });
  it('коефіцієнти не стають індексами', () => {
    expect(render('Ca(H2PO4)2·H2O + 2CaSO4·2H2O')).toBe('Ca(H_2PO_4)_2·H_2O + 2CaSO_4·2H_2O');
  });
  it('заряди', () => {
    expect(render('SO4^2- + NH4^+')).toBe('SO_4^2− + NH_4^+');
  });
  it('стрілки', () => {
    expect(prepareEquation('A -> B')).toBe('A → B');
    expect(prepareEquation('A <-> B')).toBe('A ⇌ B');
  });
});
