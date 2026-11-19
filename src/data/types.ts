export type Lang = 'uk' | 'en';
export interface Text { uk: string; en: string }

export type Verification = 'author-provided' | 'computed' | 'verified' | 'needs-review' | 'unknown';
export type Group = 'nitrogen' | 'phosphorus' | 'potassium' | 'complex';
export type NutrientKey = 'N' | 'P2O5' | 'K2O' | 'CaO' | 'MgO' | 'S';

export const GROUPS: Group[] = ['nitrogen', 'phosphorus', 'potassium', 'complex'];
export const NUTRIENT_KEYS: NutrientKey[] = ['N', 'P2O5', 'K2O', 'CaO', 'MgO', 'S'];

export interface Quantity {
  nominal: number | null; // розрахункове значення (середина діапазону, якщо автор не вказав іншого)
  min?: number;
  max?: number;
  basis: 'commercial' | 'theoretical';
  status: Verification;
}

export type SolClass = 'very-high' | 'high' | 'moderate' | 'low' | 'insoluble';
export type Method =
  | 'basic' | 'pre-sowing' | 'topdressing' | 'foliar' | 'fertigation'
  | 'incorporation' | 'early-spring' | 'liquid-soil' | 'special-equipment';
export type IllustrationKind = 'granules' | 'crystals' | 'liquid' | 'powder' | 'gas';
export type PhysReaction = 'acidic' | 'neutral' | 'alkaline' | 'unknown';

export interface Grade {
  id: string;
  label: string;
  nutrients: Partial<Record<NutrientKey, number>>;
  /** частки форм азоту від ЗАГАЛЬНОГО N, % (лише якщо задані автором) */
  nitrogenSharesOfTotalN?: { amide: number; ammonium: number; nitrate: number };
}

export type SourceType = 'research' | 'extension' | 'institutional' | 'regulation' | 'manufacturer' | 'industry' | 'lecture';

export interface Source {
  id: string;
  type: SourceType;
  title: string;
  publisher: string;
  url: string;
  accessed: string; // ISO-дата доступу
  note?: Text;
}

/** Посилання на джерело з поясненням, що саме воно підтверджує (або чому розходиться з даними автора). */
export interface SourceRef { id: string; supports: Text }

export interface Reaction {
  equation: string; // для ChemEquation: "->" стрілка, "<->" рівновага, ^ заряд
  explanation: Text;
  status: Verification;
}

export interface Fertilizer {
  id: string;
  name: Text;
  synonyms?: { uk?: string[]; en?: string[] };
  group: Group;
  subgroup?: string;
  formula: string | null;
  formulaNote?: Text;
  /** undefined → використати formula; null → теоретичний розрахунок не застосовується */
  theoreticalFormula?: string | null;
  isMixtureOrRawMaterial: boolean;
  nutrients: Partial<Record<NutrientKey, Quantity>>;
  /** форми азоту, % від маси добрива */
  nitrogenForms?: { amide?: number; ammonium?: number; nitrate?: number };
  grades?: Grade[];
  p2o5Basis?: 'unspecified' | 'total' | 'available' | 'water-soluble' | 'citrate-soluble';
  companions?: string[]; // супутні елементи (символи), яких немає серед діючих речовин
  ions: { cations: string[]; anions: string[]; neutral?: string[] };
  tags: string[];
  physical?: { state: Text; status: Verification };
  hygroscopicity?: { level: 'low' | 'medium' | 'high'; status: Verification };
  solubility?: {
    water?: SolClass;
    citrate?: SolClass;
    note?: Text;
    /** числові дані — лише з джерела (г на 100 г води) */
    byTemperature?: { tC: number; gPer100gWater: number; sourceId: string }[];
    status: Verification;
  };
  soil?: { reaction: PhysReaction; reactionStatus: Verification; text?: Text; textStatus: Verification };
  plant?: { text: Text; status: Verification };
  application: { methods: Method[]; status: Verification };
  /** сумісність / несумісність (текст; формалізується правилами на Етапі 5) */
  compatibilityNotes?: { text: Text; status: Verification };
  reactions: Reaction[];
  description: Text;
  illustration: IllustrationKind;
  sources: SourceRef[]; // порожньо = потребує верифікації
  /** шлях поля → id джерел, що його підтверджують (обов'язково для status = 'verified') */
  evidence?: Record<string, string[]>;
  reviewFlags?: string[];
  reviewNote?: Text;
}
