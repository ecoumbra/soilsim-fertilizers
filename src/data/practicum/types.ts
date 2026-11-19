import type { Text } from '../types';

export type PLevel = 'beginner' | 'intermediate' | 'advanced';
export const LEVELS: PLevel[] = ['beginner', 'intermediate', 'advanced'];

export type HypothesisId = 'n-def' | 'p-def' | 'k-def' | 'mg-def' | 's-def' | 'acidity' | 'nitrate-loss';
export const HYPOTHESES: { id: HypothesisId; label: Text }[] = [
  { id: 'n-def', label: { uk: 'Дефіцит азоту', en: 'Nitrogen deficiency' } },
  { id: 'p-def', label: { uk: 'Дефіцит фосфору', en: 'Phosphorus deficiency' } },
  { id: 'k-def', label: { uk: 'Дефіцит калію', en: 'Potassium deficiency' } },
  { id: 'mg-def', label: { uk: 'Дефіцит магнію', en: 'Magnesium deficiency' } },
  { id: 's-def', label: { uk: 'Дефіцит сірки', en: 'Sulfur deficiency' } },
  { id: 'acidity', label: { uk: 'Надмірна кислотність ґрунту', en: 'Excessive soil acidity' } },
  { id: 'nitrate-loss', label: { uk: 'Втрата азоту вимиванням нітратів', en: 'Nitrogen loss by nitrate leaching' } },
];

export interface Rationale { id: string; text: Text; correct: boolean }

export interface DiagScenario {
  id: string;
  level: PLevel;
  ambiguous: boolean;
  title: Text;
  field: { soil: Text; pH: number; crop: Text; symptoms: Text[]; tests: Text; history: Text };
  primary: HypothesisId;
  acceptable: HypothesisId[]; // часткові бали
  /** бали за вибір матеріалу: 3 — добрий вибір, 2 — прийнятний, 1 — часткова відповідність, 0 (за замовчуванням) — хибний */
  fert: Record<string, 1 | 2 | 3>;
  rationale: Rationale[];
  hints: [Text, Text];
  explanation: Text;
  sourceIds: string[];
}

export interface AuditFragment { id: string; text: Text; errorId?: string }
export interface AuditOption { text: Text }
export interface AuditError {
  id: string;
  mechanism: { options: Text[]; correct: number };
  alternative: { options: Text[]; correct: number };
}
export interface AuditScenario {
  id: string;
  level: PLevel;
  title: Text;
  fragments: AuditFragment[];
  errors: AuditError[];
  explanation: Text;
  sourceIds: string[];
}
