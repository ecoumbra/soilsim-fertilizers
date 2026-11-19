import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang, Text } from '../data/types';
import { storage } from '../utils/storage';
import { uk } from './uk';
import { en } from './en';

const DICTS: Record<Lang, Record<string, string>> = { uk, en };

export type Vars = Record<string, string | number>;

/** Чиста функція перекладу (використовується й у тестах). */
export function translate(lang: Lang, key: string, vars?: Vars): string {
  let s = DICTS[lang][key] ?? DICTS.uk[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Vars) => string;
  loc: (text: Text) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function initialLang(): Lang {
  const saved = storage.get<Lang>('lang');
  return saved === 'uk' || saved === 'en' ? saved : 'uk';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    storage.set('lang', lang);
    document.documentElement.lang = lang;
    document.title = translate(lang, 'app.title');
  }, [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      loc: (text) => text[lang],
    }),
    [lang],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
