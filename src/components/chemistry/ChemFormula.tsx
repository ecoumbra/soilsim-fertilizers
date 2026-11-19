import { parseChem, prepareEquation } from '../../utils/chem-format';

/** Формула з індексами й зарядами: <ChemFormula formula="Ca(H2PO4)2·H2O" />, "NH4^+", "SO4^2-". */
export function ChemFormula({ formula, className }: { formula: string; className?: string }) {
  return (
    <span className={className}>
      {parseChem(formula).map((tk, i) =>
        tk.t === 'sub' ? <sub key={i}>{tk.s}</sub> : tk.t === 'sup' ? <sup key={i}>{tk.s}</sup> : <span key={i}>{tk.s}</span>,
      )}
    </span>
  );
}

/** Хімічне рівняння: "->" стрілка, "<->" рівновага. */
export function ChemEquation({ equation }: { equation: string }) {
  return (
    <div className="formula text-sm">
      <ChemFormula formula={prepareEquation(equation)} />
    </div>
  );
}
