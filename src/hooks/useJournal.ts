import { useCallback, useState } from 'react';
import { storage } from '../utils/storage';
import type { Attempt } from '../utils/journal';

const KEY = 'practicum.journal';

/** Журнал результатів у localStorage (без реєстрації). */
export function useJournal() {
  const [attempts, setAttempts] = useState<Attempt[]>(() => storage.get<Attempt[]>(KEY) ?? []);

  const add = useCallback((a: Attempt) => {
    setAttempts((prev) => {
      const next = [...prev, a];
      storage.set(KEY, next);
      return next;
    });
  }, []);

  const replaceAll = useCallback((list: Attempt[]) => {
    storage.set(KEY, list);
    setAttempts(list);
  }, []);

  const clear = useCallback(() => {
    storage.remove(KEY);
    setAttempts([]);
  }, []);

  return { attempts, add, replaceAll, clear };
}
