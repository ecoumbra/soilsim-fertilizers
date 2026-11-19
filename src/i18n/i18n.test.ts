import { describe, expect, it } from 'vitest';
import { uk } from './uk';
import { en } from './en';
import { translate } from './index';
import { GLOSSARY } from '../data/glossary';

describe('i18n', () => {
  it('набори ключів uk і en збігаються', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(uk).sort());
  });
  it('усі переклади непорожні', () => {
    for (const [k, v] of Object.entries(en)) expect(v.length > 0).toBe(true);
    for (const [k, v] of Object.entries(uk)) expect(v.length > 0).toBe(true);
  });
  it('підставляє змінні', () => {
    expect(translate('uk', 'atlas.found', { n: 5 })).toBe('Знайдено: 5');
    expect(translate('en', 'atlas.found', { n: 5 })).toBe('Found: 5');
  });
  it('повертає ключ, якщо перекладу немає', () => {
    expect(translate('uk', 'no.such.key')).toBe('no.such.key');
  });
  it('глосарій має обидві мови', () => {
    for (const g of GLOSSARY) {
      expect(g.term.uk.length > 0 && g.term.en.length > 0).toBe(true);
      expect(g.definition.uk.length > 0 && g.definition.en.length > 0).toBe(true);
    }
  });
});
