export interface ChemToken { t: 'n' | 'sub' | 'sup'; s: string }

/**
 * Розбирає рядок формули на токени: цифри після літер/«)» → індекси,
 * «^+», «^2-» → заряди (верхній індекс).
 */
export function parseChem(input: string): ChemToken[] {
  const out: ChemToken[] = [];
  const push = (t: ChemToken['t'], s: string) => {
    const last = out[out.length - 1];
    if (last && last.t === t) last.s += s;
    else out.push({ t, s });
  };
  let i = 0;
  let allowSub = false;
  while (i < input.length) {
    const ch = input[i];
    if (ch === '^') {
      let j = i + 1;
      let s = '';
      while (j < input.length && /[0-9+\-−]/.test(input[j])) { s += input[j]; j++; }
      push('sup', s.replace(/-/g, '−'));
      i = j;
      allowSub = false;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      push(allowSub ? 'sub' : 'n', ch);
      i++;
      continue;
    }
    push('n', ch);
    allowSub = /[A-Za-z)]/.test(ch);
    i++;
  }
  return out;
}

/** "->" → "→", "<->" → "⇌" (для ChemEquation). */
export function prepareEquation(eq: string): string {
  return eq.replace('<->', '⇌').replace('->', '→');
}
