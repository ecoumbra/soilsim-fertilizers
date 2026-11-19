import type { Text } from './types';

export interface GlossaryEntry { id: string; term: Text; definition: Text }

const T = (uk: string, en: string): Text => ({ uk, en });

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: 'cec',
    term: T('Ґрунтовий вбирний комплекс (ҐВК)', 'Soil exchange complex (CEC)'),
    definition: T(
      'Сукупність органічних і мінеральних частинок ґрунту, здатних поглинати й обмінювати катіони (меншою мірою — аніони) із ґрунтовим розчином.',
      'The set of organic and mineral soil particles able to adsorb and exchange cations (and, to a lesser extent, anions) with the soil solution.',
    ),
  },
  {
    id: 'active-ingredient',
    term: T('Діюча речовина', 'Active ingredient (nutrient content)'),
    definition: T(
      'Поживний елемент або його оксид, у масових відсотках якого виражають вміст у добриві (N, P₂O₅, K₂O тощо).',
      'The nutrient or its oxide in terms of which the content of a fertilizer is expressed as a mass percentage (N, P₂O₅, K₂O, etc.).',
    ),
  },
  {
    id: 'oxide-equivalent',
    term: T('Оксидний еквівалент', 'Oxide equivalent'),
    definition: T(
      'Спосіб вираження вмісту елемента через масу відповідного оксиду (P → P₂O₅, K → K₂O). Відсоток P не дорівнює відсотку P₂O₅.',
      'A way to express an element content as the mass of the corresponding oxide (P → P₂O₅, K → K₂O). % P is not equal to % P₂O₅.',
    ),
  },
  {
    id: 'physiological-reaction',
    term: T('Фізіологічна реакція добрива', 'Physiological reaction of a fertilizer'),
    definition: T(
      'Зміна реакції середовища (підкислення чи підлужнення) внаслідок вибіркового поглинання рослинами катіона чи аніона добрива та пов’язаних із цим процесів.',
      'A change in medium reaction (acidification or alkalinisation) caused by selective uptake of the fertilizer cation or anion by plants and related processes.',
    ),
  },
  {
    id: 'hygroscopicity',
    term: T('Гігроскопічність', 'Hygroscopicity'),
    definition: T(
      'Здатність речовини поглинати вологу з повітря. Висока гігроскопічність спричиняє злежування добрив.',
      'The ability of a substance to absorb moisture from air. High hygroscopicity causes caking of fertilizers.',
    ),
  },
  {
    id: 'citrate-solubility',
    term: T('Цитратна розчинність', 'Citrate solubility'),
    definition: T(
      'Здатність фосфатів розчинятися в цитратних екстрагентах (розчини цитрату амонію, лимонної кислоти) — використовується для класифікації фосфорних добрив, що не розчиняються у воді.',
      'The ability of phosphates to dissolve in citrate extractants (ammonium citrate or citric acid solutions) — used to classify phosphorus fertilizers that are insoluble in water.',
    ),
  },
  {
    id: 'phosphate-retrogradation',
    term: T('Ретроградація фосфору', 'Phosphorus retrogradation'),
    definition: T(
      'Перехід водорозчинних фосфатів у ґрунті в малорозчинні сполуки (із залізом, алюмінієм, кальцієм), унаслідок чого зменшується їхня рухомість.',
      'Conversion of water-soluble phosphates in soil into poorly soluble compounds (with iron, aluminium, calcium), which reduces their mobility.',
    ),
  },
  {
    id: 'nitrification',
    term: T('Нітрифікація', 'Nitrification'),
    definition: T(
      'Біологічне окиснення NH₄⁺ до NO₃⁻ ґрунтовими мікроорганізмами; супроводжується виділенням H⁺.',
      'Biological oxidation of NH₄⁺ to NO₃⁻ by soil microorganisms; releases H⁺.',
    ),
  },
  {
    id: 'urea-hydrolysis',
    term: T('Гідроліз сечовини', 'Urea hydrolysis'),
    definition: T(
      'Розклад карбаміду за участю ферменту уреази з утворенням амонійних форм азоту; за поверхневого внесення можливі втрати NH₃.',
      'Decomposition of urea catalysed by the enzyme urease, yielding ammonium forms of nitrogen; surface application may cause NH₃ losses.',
    ),
  },
  {
    id: 'ballast-ions',
    term: T('Баластні (супутні) іони', 'Ballast (accompanying) ions'),
    definition: T(
      'Іони добрива, що не є цільовими поживними елементами (наприклад, Cl⁻, Na⁺, SO₄²⁻) і можуть впливати на ґрунт чи рослини.',
      'Fertilizer ions that are not the target nutrients (e.g. Cl⁻, Na⁺, SO₄²⁻) and may affect soil or plants.',
    ),
  },
  {
    id: 'amide-nitrogen',
    term: T('Амідна форма азоту', 'Amide nitrogen'),
    definition: T(
      'Азот у складі амідної групи (–NH₂), наприклад у карбаміді; перетворюється на амонійний азот після гідролізу.',
      'Nitrogen in an amide group (–NH₂), as in urea; converted into ammonium nitrogen after hydrolysis.',
    ),
  },
];
