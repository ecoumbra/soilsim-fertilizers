import { useCallback, useEffect, useState } from 'react';
import { storage } from '../utils/storage';

/** Стан із збереженням у localStorage (через storage.ts); нові поля з initial додаються до збереженого стану. */
export function useStoredState<T extends object>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => ({ ...initial, ...(storage.get<Partial<T>>(key) ?? {}) }));
  useEffect(() => {
    storage.set(key, value);
  }, [key, value]);
  const reset = useCallback(() => setValue(initial), [initial]);
  return [value, setValue, reset] as const;
}
