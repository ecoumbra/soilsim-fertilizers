import { useCallback, useEffect, useState } from 'react';

function read(): string[] {
  return window.location.hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((p) => {
      try {
        return decodeURIComponent(p);
      } catch {
        return p;
      }
    });
}

/** Маршрутизація через hash: #tab/sub/id (працює на GitHub Pages без налаштувань сервера). */
export function useHashRoute() {
  const [parts, setParts] = useState<string[]>(read);

  useEffect(() => {
    const onChange = () => setParts(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((...segments: string[]) => {
    window.location.hash = segments.map(encodeURIComponent).join('/');
  }, []);

  return { parts, navigate };
}
