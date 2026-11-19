import type { Fertilizer } from '../types';
import { AUTHOR, NR, T, rng } from './helpers';

export const phosphorus: Fertilizer[] = [
  {
    id: 'simple-superphosphate',
    name: T('Суперфосфат простий', 'Single superphosphate (SSP)'),
    group: 'phosphorus',
    subgroup: 'water-soluble',
    formula: 'Ca(H2PO4)2·H2O + 2CaSO4',
    formulaNote: T(
      'Умовна формула (рішення автора, R5): монокальційфосфат + сульфат кальцію (ангідрит); у виробництві сульфат кальцію може бути й у формі дигідрату (гіпсу). Розрахунок за комерційними середніми: 18 % P₂O₅, 9 % S, ≈ 18–20 % Ca.',
      'Conventional formula (author decision, R5): monocalcium phosphate + calcium sulfate (anhydrite); in production calcium sulfate may also occur as the dihydrate (gypsum). Calculation uses commercial averages: 18 % P₂O₅, 9 % S, ≈ 18–20 % Ca.',
    ),
    theoreticalFormula: 'Ca(H2PO4)2·H2O + 2CaSO4·4H2O',
    isMixtureOrRawMaterial: false,
    nutrients: { P2O5: rng(16, 20), S: rng(8, 10) },
    p2o5Basis: 'available',
    companions: ['Ca'],
    ions: { cations: ['Ca^2+'], anions: ['H2PO4^-', 'SO4^2-'] },
    tags: ['phosphate', 'water-soluble', 'acidic-phosphate', 'sulfate'],
    physical: {
      state: T(
        'Тверде, порошкоподібне або гранульоване; гранульований має кращі фізичні властивості та вищий коефіцієнт використання фосфору',
        'Solid, powdered or granulated; the granulated form has better physical properties and a higher phosphorus use efficiency',
      ),
      status: AUTHOR,
    },
    solubility: {
      water: 'high',
      note: T(
        'Засвоюваний P₂O₅ (16–20 %): водорозчинний — 80–90 %, решта — цитратно-розчинний. Гіпс CaSO₄·2H₂O малорозчинний (≈ 2,1 г/л).',
        'Available P₂O₅ (16–20 %): 80–90 % water-soluble, the rest citrate-soluble. Gypsum CaSO₄·2H₂O is sparingly soluble (≈ 2.1 g/L).',
      ),
      status: AUTHOR,
    },
    soil: {
      reaction: 'neutral',
      reactionStatus: AUTHOR,
      text: T(
        'Фізіологічно нейтральне добриво: не потребує вапнування; вільна кислотність (до 5 %) нейтралізується ґрунтом локально. Містить кальцій і сірку.',
        'Physiologically neutral fertilizer: no liming required; free acidity (up to 5 %) is neutralised locally by the soil. Contains calcium and sulfur.',
      ),
      textStatus: AUTHOR,
    },
    application: { methods: [], status: 'unknown' },
    reactions: [
      {
        equation: 'Ca(H2PO4)2·H2O -> Ca^2+ + 2H2PO4^- + H2O',
        explanation: T('Дисоціація монокальційфосфату у воді.', 'Dissociation of monocalcium phosphate in water.'),
        status: AUTHOR,
      },
      {
        equation: 'CaSO4·2H2O <-> Ca^2+ + SO4^2- + 2H2O',
        explanation: T('Гіпс малорозчинний, поступово дисоціює.', 'Gypsum is sparingly soluble and dissociates gradually.'),
        status: AUTHOR,
      },
    ],
    description: T(
      'Водорозчинне фосфорне добриво, що містить також кальцій і сірку.',
      'Water-soluble phosphorus fertilizer that also contains calcium and sulfur.',
    ),
    illustration: 'granules',
    sources: [],
    reviewFlags: ['R5', 'R20'],
    reviewNote: T(
      'Вирішено автором: умовну формулу залишено; розрахунок за комерційними середніми. За формулою з дигідратом гіпсу (M = 596,39 г/моль) теоретично 23,8 % P₂O₅ і 10,8 % S; за ангідритом — ≈ 27,1 % і ≈ 12,2 %.',
      'Resolved by the author: the conventional formula is kept; calculation uses commercial averages. With gypsum dihydrate (M = 596.39 g/mol) the theory gives 23.8 % P₂O₅ and 10.8 % S; with anhydrite ≈ 27.1 % and ≈ 12.2 %.',
    ),
  },
  {
    id: 'double-superphosphate',
    name: T('Суперфосфат подвійний', 'Triple superphosphate (TSP)'),
    synonyms: { uk: ['подвійний суперфосфат'], en: ['double superphosphate', 'TSP'] },
    group: 'phosphorus',
    subgroup: 'water-soluble',
    formula: 'Ca(H2PO4)2·H2O',
    isMixtureOrRawMaterial: false,
    nutrients: { P2O5: rng(40, 48) },
    p2o5Basis: 'available',
    companions: ['Ca'],
    ions: { cations: ['Ca^2+'], anions: ['H2PO4^-'] },
    tags: ['phosphate', 'water-soluble', 'acidic-phosphate'],
    physical: { state: T('Гранульоване (рідше — порошок)', 'Granulated (less often powder)'), status: AUTHOR },
    solubility: {
      water: 'high',
      note: T(
        'Засвоюваний P₂O₅ (40–48 %, розрахункове 44 %): водорозчинна фракція — 85–95 %, залишок — цитратно-розчинний CaHPO₄ та фосфати Fe/Al.',
        'Available P₂O₅ (40–48 %, calculation value 44 %): the water-soluble fraction is 85–95 %, the rest is citrate-soluble CaHPO₄ and Fe/Al phosphates.',
      ),
      status: AUTHOR,
    },
    soil: {
      reaction: 'neutral',
      reactionStatus: AUTHOR,
      text: T(
        'Фізіологічна реакція нейтральна: не підкислює ґрунт на всьому полі, хоча власна реакція гранули кисла через вільну фосфорну кислоту (до 2,5–5 %). У зволоженій гранулі локально утворюється кисла зона (pH ≈ 1,5–2,5) за рахунок H₃PO₄.',
        'Physiological reaction is neutral: it does not acidify the soil across the field, although the granule itself is acidic because of free phosphoric acid (up to 2.5–5 %). In a moistened granule a locally acidic zone (pH ≈ 1.5–2.5) forms due to H₃PO₄.',
      ),
      textStatus: AUTHOR,
    },
    application: { methods: [], status: 'unknown' },
    reactions: [
      {
        equation: 'Ca(H2PO4)2·H2O -> Ca^2+ + 2H2PO4^- + H2O',
        explanation: T('Повна дисоціація монокальційфосфату у воді.', 'Complete dissociation of monocalcium phosphate in water.'),
        status: AUTHOR,
      },
    ],
    description: T(
      'Водорозчинне концентроване фосфорне добриво. В англомовній літературі — Triple superphosphate (TSP).',
      'Concentrated water-soluble phosphorus fertilizer. In Ukrainian/post-Soviet usage called “double superphosphate”.',
    ),
    illustration: 'granules',
    sources: [],
    reviewFlags: ['R6', 'R20', 'R21'],
    reviewNote: T(
      'Вирішено автором: EN-назва — Triple superphosphate (TSP), це той самий продукт. Теоретично ≈ 56,3 % P₂O₅ для Ca(H₂PO₄)₂·H₂O; 40–48 % — комерційний продукт. У рішенні автора зустрічається і 42–48 %, і 40–48 %: залишено 40–48 % за початковим переліком — підтвердіть.',
      'Resolved by the author: the EN name is Triple superphosphate (TSP) — the same product. Theory gives ≈ 56.3 % P₂O₅ for Ca(H₂PO₄)₂·H₂O; 40–48 % is a commercial product. The author text gives both 42–48 % and 40–48 %: 40–48 % from the original list is kept — please confirm.',
    ),
  },
  {
    id: 'precipitate',
    name: T('Преципітат', 'Precipitate (dicalcium phosphate dihydrate)'),
    group: 'phosphorus',
    subgroup: 'citrate-soluble',
    formula: 'CaHPO4·2H2O',
    isMixtureOrRawMaterial: false,
    nutrients: { P2O5: rng(25, 38) },
    p2o5Basis: 'citrate-soluble',
    companions: ['Ca'],
    ions: { cations: ['Ca^2+'], anions: ['HPO4^2-'] },
    tags: ['phosphate', 'citrate-soluble'],
    physical: {
      state: T('Тонкозернистий білий або світло-сірий порошок; не злежується', 'Fine-grained white or light-grey powder; does not cake'),
      status: AUTHOR,
    },
    hygroscopicity: { level: 'low', status: AUTHOR },
    solubility: {
      water: 'insoluble',
      citrate: 'high',
      note: T(
        'Цитратно-розчинний: розчиняється в лужному розчині цитрату амонію (реактив Петермана); водорозчинна форма — 0 %.',
        'Citrate-soluble: dissolves in an alkaline ammonium citrate solution (Petermann reagent); the water-soluble form is 0 %.',
      ),
      status: AUTHOR,
    },
    soil: {
      reaction: 'neutral',
      reactionStatus: AUTHOR,
      text: T('Фізіологічно та хімічно нейтральний (слаболужний).', 'Physiologically and chemically neutral (slightly alkaline).'),
      textStatus: AUTHOR,
    },
    application: { methods: ['basic'], status: AUTHOR },
    reactions: [
      {
        equation: 'CaHPO4 + H^+ -> Ca^2+ + H2PO4^-',
        explanation: T(
          'Перехід у водорозчинний дигідрофосфат під дією кислотності ґрунтового розчину або кореневих виділень.',
          'Conversion into water-soluble dihydrogen phosphate under the acidity of the soil solution or root exudates.',
        ),
        status: AUTHOR,
      },
    ],
    description: T(
      'Не розчиняється у воді, розчиняється у цитратних екстрагентах. Вноситься як основне добриво.',
      'Does not dissolve in water; dissolves in citrate extractants. Applied as a basic fertilizer.',
    ),
    illustration: 'powder',
    sources: [],
    reviewFlags: ['R7', 'R20'],
    reviewNote: T(
      'Вирішено автором: комерційний діапазон 25–38 % (розрахункове 31,5 %) залишено. Відмінність від теоретичних ≈ 41,2 % зумовлена домішками кальцію, заліза, алюмінію та гігроскопічною вологою.',
      'Resolved by the author: the commercial range 25–38 % (calculation value 31.5 %) is kept. The difference from the theoretical ≈ 41.2 % is due to calcium, iron and aluminium impurities and hygroscopic moisture.',
    ),
  },
  {
    id: 'thomas-slag',
    name: T('Томасшлак', 'Thomas slag'),
    group: 'phosphorus',
    subgroup: 'citrate-soluble',
    formula: null,
    formulaNote: T(
      'Умовно: кальцієві фосфатні та силікатні фази. Не індивідуальна хімічна сполука.',
      'Conventionally: calcium phosphate and silicate phases. Not an individual chemical compound.',
    ),
    isMixtureOrRawMaterial: true,
    nutrients: { P2O5: rng(16, 20), CaO: rng(40, 50) },
    p2o5Basis: 'citrate-soluble',
    companions: ['Si'],
    ions: { cations: ['Ca^2+'], anions: ['PO4^3-', 'SiO3^2-'] },
    tags: ['phosphate', 'citrate-soluble', 'by-product', 'alkaline', 'liming'],
    physical: { state: T('Металургійний побічний продукт (тонкоздрібнений порошок)', 'Metallurgical by-product (finely ground powder)'), status: AUTHOR },
    solubility: {
      water: 'insoluble',
      citrate: 'high',
      note: T(
        'Фосфор переважно в цитратно-розчинній (лимонокислорозчинній) формі — 80–90 % від загального P₂O₅; водорозчинна форма — 0 %.',
        'Phosphorus is mainly in the citrate-soluble (citric-acid-soluble) form — 80–90 % of total P₂O₅; the water-soluble form is 0 %.',
      ),
      status: AUTHOR,
    },
    soil: {
      reaction: 'alkaline',
      reactionStatus: AUTHOR,
      text: T(
        'Власна реакція сильнолужна (pH ≈ 10,5–12,0). Виражений вапнувальний ефект: містить 40–50 % CaO, що відповідає ≈ 0,75 т CaCO₃ на 1 т добрива.',
        'Strongly alkaline on its own (pH ≈ 10.5–12.0). Pronounced liming effect: contains 40–50 % CaO, equivalent to ≈ 0.75 t CaCO₃ per 1 t of fertilizer.',
      ),
      textStatus: AUTHOR,
    },
    application: { methods: ['basic'], status: AUTHOR },
    compatibilityNotes: {
      text: T(
        'Несумісний з амонійними добривами та карбамідом: втрати азоту у вигляді NH₃. Вносити лише як основне добриво (під оранку/культивацію).',
        'Incompatible with ammonium fertilizers and urea: nitrogen is lost as NH₃. Apply only as a basic fertilizer (before ploughing/cultivation).',
      ),
      status: AUTHOR,
    },
    reactions: [],
    description: T(
      'Металургійний побічний продукт; кальцієві фосфатні та силікатні фази. Цитратно-розчинне фосфорне добриво з вапнувальним ефектом.',
      'Metallurgical by-product; calcium phosphate and silicate phases. A citrate-soluble phosphorus fertilizer with a liming effect.',
    ),
    illustration: 'powder',
    sources: [],
    reviewFlags: ['R8', 'R20'],
    reviewNote: T(
      'R8 вирішено автором: томасшлак і мартенівський фосфатшлак розділено. R20 для шлаків вирішено: база — цитратно-розчинна форма (80–90 % від загального P₂O₅). Числові значення (pH, CaO, еквівалент CaCO₃) надано автором; джерела не додано.',
      'R8 resolved by the author: Thomas slag and open-hearth phosphate slag are split. R20 resolved for slags: the basis is the citrate-soluble form (80–90 % of total P₂O₅). The numeric values (pH, CaO, CaCO₃ equivalent) are author-provided; no sources added.',
    ),
  },
  {
    id: 'open-hearth-slag',
    name: T('Мартенівський фосфатшлак', 'Open-hearth phosphate slag'),
    group: 'phosphorus',
    subgroup: 'citrate-soluble',
    formula: null,
    formulaNote: T(
      'Умовно: кальцієві фосфатні та силікатні фази. Не індивідуальна хімічна сполука.',
      'Conventionally: calcium phosphate and silicate phases. Not an individual chemical compound.',
    ),
    isMixtureOrRawMaterial: true,
    nutrients: { P2O5: rng(8, 14) },
    p2o5Basis: 'citrate-soluble',
    companions: ['Ca', 'Si'],
    ions: { cations: ['Ca^2+'], anions: ['PO4^3-', 'SiO3^2-'] },
    tags: ['phosphate', 'citrate-soluble', 'by-product', 'alkaline', 'liming'],
    physical: { state: T('Металургійний побічний продукт (тонкоздрібнений порошок)', 'Metallurgical by-product (finely ground powder)'), status: AUTHOR },
    solubility: {
      water: 'insoluble',
      citrate: 'high',
      note: T(
        'Фосфор переважно в цитратно-розчинній формі (80–90 % від загального P₂O₅); водорозчинна форма — 0 %.',
        'Phosphorus is mainly in the citrate-soluble form (80–90 % of total P₂O₅); the water-soluble form is 0 %.',
      ),
      status: AUTHOR,
    },
    soil: {
      reaction: 'alkaline',
      reactionStatus: AUTHOR,
      text: T(
        'Власна реакція сильнолужна (pH ≈ 10,5–12,0), виражений вапнувальний ефект. Окремі кількісні значення вмісту CaO й еквівалента CaCO₃ для цього шлаку не задані.',
        'Strongly alkaline on its own (pH ≈ 10.5–12.0) with a pronounced liming effect. Separate CaO content and CaCO₃ equivalent for this slag are not specified.',
      ),
      textStatus: AUTHOR,
    },
    application: { methods: ['basic'], status: AUTHOR },
    compatibilityNotes: {
      text: T(
        'Несумісний з амонійними добривами та карбамідом: втрати азоту у вигляді NH₃. Вносити лише як основне добриво (під оранку/культивацію).',
        'Incompatible with ammonium fertilizers and urea: nitrogen is lost as NH₃. Apply only as a basic fertilizer (before ploughing/cultivation).',
      ),
      status: AUTHOR,
    },
    reactions: [],
    description: T(
      'Металургійний побічний продукт з меншим вмістом фосфору, ніж у томасшлаку. Цитратно-розчинне фосфорне добриво з вапнувальним ефектом.',
      'Metallurgical by-product with a lower phosphorus content than Thomas slag. A citrate-soluble phosphorus fertilizer with a liming effect.',
    ),
    illustration: 'powder',
    sources: [],
    reviewFlags: ['R8', 'R20'],
    reviewNote: T(
      'Автор надав pH, вапнувальний ефект і несумісність спільно для обох шлаків; кількісні значення CaO та еквівалента CaCO₃ задано лише для томасшлаку. Чи однакові вони для мартенівського шлаку — потребує підтвердження.',
      'The author gave pH, liming effect and incompatibility jointly for both slags; the CaO content and CaCO₃ equivalent are given for Thomas slag only. Whether they apply to the open-hearth slag needs confirmation.',
    ),
  },
  {
    id: 'rock-phosphate',
    name: T('Фосфоритне борошно', 'Ground phosphate rock'),
    group: 'phosphorus',
    subgroup: 'poorly-soluble',
    formula: 'Ca3(PO4)2',
    formulaNote: T(
      'Розрахункове спрощення (рішення автора, R9). Реальна сировина — фторапатит Ca₅(PO₄)₃F (подвоєна формула Ca₁₀(PO₄)₆F₂ = 3Ca₃(PO₄)₂·CaF₂) з домішками.',
      'A calculation simplification (author decision, R9). The real raw material is fluorapatite Ca₅(PO₄)₃F (doubled formula Ca₁₀(PO₄)₆F₂ = 3Ca₃(PO₄)₂·CaF₂) with impurities.',
    ),
    isMixtureOrRawMaterial: true,
    nutrients: { P2O5: rng(19, 25) },
    p2o5Basis: 'total',
    companions: ['Ca'],
    ions: { cations: ['Ca^2+'], anions: ['PO4^3-'] },
    tags: ['phosphate', 'poorly-soluble'],
    physical: {
      state: T(
        'Тонкомелений борошнистий порошок темно-сірого/бурого кольору; стандарт тонини помелу — не менше 80–90 % часток < 0,15–0,18 мм',
        'Finely ground floury powder of dark-grey/brown colour; fineness standard — at least 80–90 % of particles < 0.15–0.18 mm',
      ),
      status: AUTHOR,
    },
    solubility: {
      water: 'insoluble',
      citrate: 'low',
      note: T(
        'Розчиняється лише в сильних мінеральних кислотах; водорозчинний P₂O₅ — 0 %; цитратно-розчинний — незначний (лише у реактивних осадових фосфоритах — 15–30 % від загального).',
        'Dissolves only in strong mineral acids; water-soluble P₂O₅ is 0 %; citrate-soluble is insignificant (only in reactive sedimentary phosphorites — 15–30 % of total).',
      ),
      status: AUTHOR,
    },
    soil: {
      reaction: 'unknown',
      reactionStatus: 'unknown',
      text: T(
        'Ефективність виявляється лише на кислих ґрунтах (pH KCl < 5,5): розчинення супроводжується зв’язуванням H⁺. Слабкий вапнувальний (підлужувальний) ефект — за рахунок домішок CaCO₃ (до 10–15 %) та зв’язування H⁺ при розчиненні.',
        'Effective only on acidic soils (pH KCl < 5.5): dissolution consumes H⁺. Weak liming (alkalising) effect — due to CaCO₃ impurities (up to 10–15 %) and H⁺ binding during dissolution.',
      ),
      textStatus: AUTHOR,
    },
    application: { methods: [], status: 'unknown' },
    reactions: [
      {
        equation: 'Ca3(PO4)2 + 4H^+ -> 3Ca^2+ + 2H2PO4^-',
        explanation: T(
          'Розчинення в кислому середовищі — пояснює ефективність виключно на кислих ґрунтах.',
          'Dissolution in an acidic medium — explains effectiveness on acidic soils only.',
        ),
        status: AUTHOR,
      },
    ],
    description: T(
      'Важкорозчинне фосфорне добриво. Ефективність залежить від кислотності ґрунту, реактивності сировини та тонкості помелу.',
      'Poorly soluble phosphorus fertilizer. Efficiency depends on soil acidity, reactivity of the raw material and fineness of grinding.',
    ),
    illustration: 'powder',
    sources: [],
    reviewFlags: ['R9', 'R20'],
    reviewNote: T(
      'Вирішено автором: Ca₃(PO₄)₂ залишено як спрощення; для розрахунків — 22 % P₂O₅ (діапазон 19–25 %). Теоретично для Ca₃(PO₄)₂ ≈ 45,8 % P₂O₅.',
      'Resolved by the author: Ca₃(PO₄)₂ is kept as a simplification; the calculation value is 22 % P₂O₅ (range 19–25 %). Theory for Ca₃(PO₄)₂ gives ≈ 45.8 % P₂O₅.',
    ),
  },
];
