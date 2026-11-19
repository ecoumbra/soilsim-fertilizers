import type { Group, Text } from './types';

const T = (uk: string, en: string): Text => ({ uk, en });

export type Solubility = 'soluble' | 'poor' | 'insoluble' | 'unknown';
export type PhysicalForm = 'solid' | 'liquid' | 'gas';

/** Матеріал для «Змішувального столу»: добриво або вапнувальний матеріал. */
export interface Material {
  id: string;
  kind: 'fertilizer' | 'amendment';
  name: Text;
  formula: string | null;
  tags: string[];
  solubility: Solubility;
  physical: PhysicalForm;
  group?: Group;
}

/**
 * Вапнувальні матеріали — реагенти лабораторії, НЕ добрива (не входять до каталогу й підрахунку добрив).
 * Слово «вапно» без уточнення не використовується.
 */
export const AMENDMENTS: Material[] = [
  {
    id: 'limestone', kind: 'amendment', formula: 'CaCO3',
    name: T('Вапняк меляний (CaCO₃)', 'Ground limestone (CaCO₃)'),
    tags: ['liming', 'mild-alkaline', 'calcium', 'carbonate'], solubility: 'insoluble', physical: 'solid',
  },
  {
    id: 'quicklime', kind: 'amendment', formula: 'CaO',
    name: T('Негашене вапно (CaO)', 'Quicklime (CaO)'),
    tags: ['liming', 'alkaline', 'calcium', 'strong-base'], solubility: 'poor', physical: 'solid',
  },
  {
    id: 'slaked-lime', kind: 'amendment', formula: 'Ca(OH)2',
    name: T('Гашене вапно (Ca(OH)₂)', 'Slaked lime (Ca(OH)₂)'),
    tags: ['liming', 'alkaline', 'calcium', 'strong-base'], solubility: 'poor', physical: 'solid',
  },
  {
    id: 'dolomite', kind: 'amendment', formula: 'CaMg(CO3)2',
    name: T('Доломіт (CaMg(CO₃)₂)', 'Dolomite (CaMg(CO₃)₂)'),
    tags: ['liming', 'mild-alkaline', 'calcium', 'magnesium', 'carbonate'], solubility: 'insoluble', physical: 'solid',
  },
];
