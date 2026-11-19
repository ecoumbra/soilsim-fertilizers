import { useEffect, useState } from 'react';
import { storage } from '../utils/storage';

export type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  const saved = storage.get<Theme>('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    storage.set('theme', theme);
  }, [theme]);

  return { theme, toggle: () => setTheme((p) => (p === 'dark' ? 'light' : 'dark')) };
}
