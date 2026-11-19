import type { ReactNode } from 'react';

export function PillNav({ items, active, onSelect, label }: { items: { id: string; label: string }[]; active: string; onSelect: (id: string) => void; label: string }) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          aria-current={active === it.id ? 'page' : undefined}
          onClick={() => onSelect(it.id)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            active === it.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted'
          }`}
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}

export function NumField({ id, label, value, onChange, unit, error, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; unit?: string; error?: string; hint?: string }) {
  return (
    <div className="text-sm">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-2">
        <input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`w-full rounded-lg border bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-ring ${error ? 'border-destructive' : 'border-input'}`}
        />
        {unit && <span className="shrink-0 text-muted-foreground">{unit}</span>}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({ id, label, value, onChange, children }: { id: string; label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <div className="text-sm">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-ring"
      >
        {children}
      </select>
    </div>
  );
}

export function Panel({ title, children, right }: { title?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-soft">
      {(title || right) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
