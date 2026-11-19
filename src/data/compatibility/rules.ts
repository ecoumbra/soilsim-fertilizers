import type { Text, Verification } from '../types';

export type CompatStatus = 'compatible' | 'conditional' | 'incompatible' | 'insufficient';
export type CompatMode = 'dry' | 'solution';
/** Ефекти, які дозволено візуалізувати: лише якщо випливають із механізму правила. */
export type Effect = 'gas-nh3' | 'precipitate' | 'caking' | 'moisture' | 'turbidity';

export interface Matcher { ids?: string[]; tags?: string[] }

export interface CompatRule {
  id: string;
  mode: CompatMode | 'both';
  a: Matcher;
  b: Matcher;
  /** вища пріоритетність — конкретніше правило */
  priority: number;
  status: Exclude<CompatStatus, 'insufficient'>;
  mechanism: Text;
  conditions?: Text;
  equations?: string[];
  effects: Effect[];
  control?: { q: Text; a: Text };
  /** verified — є джерело, що прямо підтверджує; computed — механізм і баланс рівняння, без прямого джерела пари; needs-review */
  verification: Verification;
  sourceIds: string[];
}

const T = (uk: string, en: string): Text => ({ uk, en });

const SOLP = ['ammophos', 'dap', 'mkp', 'simple-superphosphate', 'double-superphosphate', 'nitroammophoska'];
const LIME_ALL = ['limestone', 'dolomite'];

export const RULES: CompatRule[] = [
  // ---------- аміак із солей амонію + сильні основи ----------
  {
    id: 'an-quicklime', mode: 'both', priority: 100,
    a: { ids: ['ammonium-nitrate'] }, b: { ids: ['quicklime'] },
    status: 'incompatible', effects: ['gas-nh3', 'moisture'],
    equations: ['2NH4NO3 + CaO -> Ca(NO3)2 + 2NH3↑ + H2O'],
    mechanism: T(
      'Сильна основа CaO витісняє слабку основу NH₃ із солі амонію: утворюються летючий аміак (втрати азоту) та гігроскопічний Ca(NO₃)₂, що зволожує суміш.',
      'The strong base CaO displaces the weak base NH₃ from the ammonium salt: volatile ammonia (nitrogen loss) and hygroscopic Ca(NO₃)₂ form, which moistens the mixture.',
    ),
    conditions: T('Реакція прискорюється вологою; у сухому стані — повільніше, але змішувати не можна.', 'The reaction is accelerated by moisture; slower when dry, but the materials must not be mixed.'),
    control: {
      q: T('Чому змішування аміачної селітри з негашеним вапном призводить до втрат азоту?', 'Why does mixing ammonium nitrate with quicklime cause nitrogen losses?'),
      a: T('NH₄⁺ відщеплює протон на сильній основі (OH⁻ з CaO + H₂O) і переходить у газоподібний NH₃, який покидає суміш.', 'NH₄⁺ gives up a proton to the strong base (OH⁻ from CaO + H₂O) and becomes gaseous NH₃, which leaves the mixture.'),
    },
    verification: 'computed', sourceIds: ['eagri-lec15'],
  },
  {
    id: 'an-slaked-lime', mode: 'both', priority: 100,
    a: { ids: ['ammonium-nitrate'] }, b: { ids: ['slaked-lime'] },
    status: 'incompatible', effects: ['gas-nh3', 'moisture'],
    equations: ['2NH4NO3 + Ca(OH)2 -> Ca(NO3)2 + 2NH3↑ + 2H2O'],
    mechanism: T(
      'Основа Ca(OH)₂ витісняє NH₃ із солі амонію: втрати азоту у вигляді газу й утворення гігроскопічного Ca(NO₃)₂.',
      'The base Ca(OH)₂ displaces NH₃ from the ammonium salt: nitrogen is lost as gas and hygroscopic Ca(NO₃)₂ forms.',
    ),
    verification: 'computed', sourceIds: ['eagri-lec15'],
  },
  {
    id: 'ammonium-slag', mode: 'dry', priority: 100,
    a: { ids: ['thomas-slag', 'open-hearth-slag'] }, b: { tags: ['ammonium'] },
    status: 'incompatible', effects: ['gas-nh3'],
    equations: ['NH4^+ + OH^- -> NH3↑ + H2O'],
    mechanism: T(
      'Фосфатшлаки мають сильнолужну реакцію (дані автора); OH⁻ перетворює NH₄⁺ на NH₃ — азот втрачається у вигляді газу. Джерела не радять змішувати амонійні (аміачні) добрива з основними добривами та шлаками.',
      'Phosphate slags are strongly alkaline (author data); OH⁻ converts NH₄⁺ to NH₃ and nitrogen is lost as gas. Sources advise against mixing ammonium (ammoniacal) fertilizers with basic fertilizers and slags.',
    ),
    verification: 'verified', sourceIds: ['eagri-lec15'],
  },
  {
    id: 'ammonium-strong-alkaline', mode: 'both', priority: 70,
    a: { tags: ['ammonium'] }, b: { tags: ['alkaline'] },
    status: 'incompatible', effects: ['gas-nh3'],
    equations: ['NH4^+ + OH^- -> NH3↑ + H2O'],
    mechanism: T(
      'Лужний компонент перетворює NH₄⁺ на летючий NH₃: азот втрачається у вигляді газу.',
      'The alkaline component converts NH₄⁺ to volatile NH₃: nitrogen is lost as gas.',
    ),
    verification: 'computed', sourceIds: ['eagri-lec15'],
  },
  // ---------- вапняк / доломіт ----------
  {
    id: 'an-limestone', mode: 'dry', priority: 100,
    a: { ids: ['ammonium-nitrate'] }, b: { ids: LIME_ALL },
    status: 'conditional', effects: [],
    equations: ['2NH4NO3 + CaCO3 -> Ca(NO3)2 + 2NH3↑ + CO2↑ + H2O'],
    mechanism: T(
      'Карбонат — слабка основа; з аміачною селітрою реакція повільна й оборотна (утворений Ca(NO₃)₂ добре розчинний). За високої вологості та тривалого зберігання можливі повільні втрати NH₃ і зволоження суміші. Вапняк і доломіт застосовують як наповнювачі в кальцієво-аміачній селітрі.',
      'Carbonate is a weak base; with ammonium nitrate the reaction is slow and reversible (the Ca(NO₃)₂ formed is very soluble). At high humidity and during long storage slow NH₃ loss and moistening are possible. Limestone and dolomite are used as fillers in calcium ammonium nitrate.',
    ),
    conditions: T('Змішувати безпосередньо перед внесенням; не зберігати суміш у вологому середовищі.', 'Mix immediately before application; do not store the mixture in humid conditions.'),
    control: {
      q: T('Чому аміачна селітра з меленим вапняком — «сумісні за певних умов», а з негашеним вапном — несумісні?', 'Why are ammonium nitrate and ground limestone “conditionally compatible”, while ammonium nitrate and quicklime are incompatible?'),
      a: T('CaCO₃ — слабка основа: реакція повільна й залежить від вологості та часу, тоді як CaO/Ca(OH)₂ — сильні основи, що одразу витісняють NH₃.', 'CaCO₃ is a weak base: the reaction is slow and depends on humidity and time, whereas CaO/Ca(OH)₂ are strong bases that displace NH₃ immediately.'),
    },
    verification: 'needs-review', sourceIds: ['eagri-lec15'],
  },
  {
    id: 'as-limestone', mode: 'dry', priority: 100,
    a: { ids: ['ammonium-sulfate'] }, b: { ids: LIME_ALL },
    status: 'incompatible', effects: ['gas-nh3'],
    equations: ['(NH4)2SO4 + CaCO3 -> CaSO4 + 2NH3↑ + CO2↑ + H2O'],
    mechanism: T(
      'У присутності вологи сульфат амонію реагує з карбонатом кальцію; реакцію зміщує утворення малорозчинного CaSO₄, а NH₃ і CO₂ залишають суміш. Азот втрачається. Джерела радять не змішувати аміачні добрива з вапняком.',
      'In the presence of moisture ammonium sulfate reacts with calcium carbonate; the reaction is driven by the formation of sparingly soluble CaSO₄ while NH₃ and CO₂ leave the mixture. Nitrogen is lost. Sources advise against mixing ammoniacal fertilizers with limestone.',
    ),
    control: {
      q: T('Чому сульфат амонію не змішують із вапняковими матеріалами?', 'Why is ammonium sulfate not mixed with limestone materials?'),
      a: T('Утворення малорозчинного CaSO₄ зміщує реакцію вправо, NH₃ та CO₂ виходять із суміші — втрачається азот.', 'The formation of sparingly soluble CaSO₄ drives the reaction forward and NH₃ and CO₂ escape — nitrogen is lost.'),
    },
    verification: 'verified', sourceIds: ['eagri-lec15'],
  },
  {
    id: 'ammonium-mild-alkaline', mode: 'dry', priority: 50,
    a: { tags: ['ammonium'] }, b: { tags: ['mild-alkaline'] },
    status: 'conditional', effects: [],
    mechanism: T(
      'Слабка основа (карбонат) повільно витісняє NH₃ з амонійних солей; ризик зростає з вологістю й тривалістю контакту. Джерела радять не змішувати аміачні добрива з вапняком заздалегідь.',
      'A weak base (carbonate) slowly displaces NH₃ from ammonium salts; the risk grows with humidity and contact time. Sources advise not to pre-mix ammoniacal fertilizers with limestone.',
    ),
    conditions: T('Змішувати безпосередньо перед внесенням.', 'Mix immediately before application.'),
    verification: 'needs-review', sourceIds: ['eagri-lec15'],
  },
  // ---------- карбамід ----------
  {
    id: 'urea-slaked-lime', mode: 'both', priority: 100,
    a: { ids: ['urea'] }, b: { ids: ['slaked-lime'] },
    status: 'conditional', effects: [],
    equations: ['CO(NH2)2 + Ca(OH)2 -> CaCO3 + 2NH3↑'],
    mechanism: T(
      'У лужному середовищі й за наявності вологи карбамід гідролізується з виділенням NH₃; за звичайних температур у сухому стані реакція повільна.',
      'In an alkaline medium and in the presence of moisture urea hydrolyses with NH₃ release; at ordinary temperatures in the dry state the reaction is slow.',
    ),
    conditions: T('Втрати зростають з вологістю, температурою й тривалістю контакту.', 'Losses grow with humidity, temperature and contact time.'),
    control: {
      q: T('Чому карбамід не варто змішувати з вапном заздалегідь?', 'Why should urea not be pre-mixed with lime?'),
      a: T('Лужне середовище й вода прискорюють гідроліз сечовини до NH₃, який втрачається.', 'An alkaline medium and water accelerate hydrolysis of urea to NH₃, which is lost.'),
    },
    verification: 'computed', sourceIds: [],
  },
  {
    id: 'urea-quicklime', mode: 'both', priority: 100,
    a: { ids: ['urea'] }, b: { ids: ['quicklime'] },
    status: 'conditional', effects: [],
    equations: ['CO(NH2)2 + CaO + H2O -> CaCO3 + 2NH3↑'],
    mechanism: T(
      'Негашене вапно з водою дає сильнолужне середовище; карбамід гідролізується з виділенням NH₃ (повільно в сухому стані, швидше за вологи).',
      'Quicklime with water gives a strongly alkaline medium; urea hydrolyses with NH₃ release (slowly when dry, faster when moist).',
    ),
    verification: 'computed', sourceIds: [],
  },
  {
    id: 'amide-alkaline', mode: 'both', priority: 50,
    a: { tags: ['amide'] }, b: { tags: ['alkaline'] },
    status: 'conditional', effects: [],
    mechanism: T(
      'У лужному середовищі амідний азот гідролізується до NH₃; швидкість залежить від вологості та pH.',
      'In an alkaline medium amide nitrogen hydrolyses to NH₃; the rate depends on humidity and pH.',
    ),
    verification: 'needs-review', sourceIds: [],
  },
  {
    id: 'urea-limestone', mode: 'dry', priority: 100,
    a: { ids: ['urea'] }, b: { ids: LIME_ALL },
    status: 'conditional', effects: [],
    mechanism: T(
      'Карбонат — слабка основа; карбамід може бути сумісним із вапном за особливих умов (сухі матеріали, швидке внесення).',
      'Carbonate is a weak base; urea can be compatible with lime under special conditions (dry materials, prompt application).',
    ),
    conditions: T('Сухі матеріали, внесення одразу після змішування.', 'Dry materials, application immediately after mixing.'),
    verification: 'verified', sourceIds: ['ravensdown-urea'],
  },
  {
    id: 'urea-an-dry', mode: 'dry', priority: 100,
    a: { ids: ['urea'] }, b: { ids: ['ammonium-nitrate'] },
    status: 'incompatible', effects: ['moisture', 'caking'],
    mechanism: T(
      'Суміш має значно знижену критичну відносну вологість: вона поглинає вологу з повітря навіть за низької вологості й швидко перетворюється на кашу або злежується.',
      'The mixture has a strongly depressed critical relative humidity: it absorbs moisture from the air even at low humidity and quickly turns into slush or cakes.',
    ),
    control: {
      q: T('Чому суха суміш карбаміду й аміачної селітри швидко волого-злежується, хоча обидві речовини окремо зберігають?', 'Why does a dry mixture of urea and ammonium nitrate quickly become wet and caked although each can be stored separately?'),
      a: T('Суміш двох солей має нижчу критичну відносну вологість, ніж кожна окремо, тому поглинає воду з повітря.', 'A mixture of the two has a lower critical relative humidity than either alone, so it takes up water from the air.'),
    },
    verification: 'verified', sourceIds: ['incitec-blends'],
  },
  {
    id: 'urea-an-solution', mode: 'solution', priority: 100,
    a: { ids: ['urea'] }, b: { ids: ['ammonium-nitrate'] },
    status: 'compatible', effects: [],
    mechanism: T(
      'У водному розчині обидві речовини залишаються розчиненими без взаємної реакції; саме такий розчин — КАС (карбамідно-аміачна суміш).',
      'In aqueous solution both remain dissolved without reacting with each other; such a solution is UAN (urea ammonium nitrate).',
    ),
    verification: 'verified', sourceIds: ['unl-passel-n', 'uk-forages-uan'],
  },
  {
    id: 'urea-ssp', mode: 'dry', priority: 100,
    a: { ids: ['urea'] }, b: { ids: ['simple-superphosphate'] },
    status: 'incompatible', effects: ['moisture', 'caking'],
    mechanism: T(
      'Кислі фосфати та вільна кислота суперфосфату взаємодіють із карбамідом (утворюються липкі сполуки типу фосфату сечовини; можливий гідроліз сечовини вільною кислотою), виділяється волога — суміш злежується.',
      'The acidic phosphates and free acid of superphosphate interact with urea (sticky urea-phosphate-type compounds form; free acid may hydrolyse urea) and moisture is released — the mixture cakes.',
    ),
    verification: 'verified', sourceIds: ['eagri-lec15', 'ravensdown-urea', 'yara-physical'],
  },
  {
    id: 'urea-tsp', mode: 'dry', priority: 100,
    a: { ids: ['urea'] }, b: { ids: ['double-superphosphate'] },
    status: 'conditional', effects: [],
    mechanism: T(
      'Кислі фосфати можуть утворювати з карбамідом липкі сполуки й підвищувати злежування; джерела розходяться: одні забороняють змішування, інші допускають його за особливих умов.',
      'Acidic phosphates can form sticky compounds with urea and increase caking; sources differ: some prohibit mixing, others allow it under special circumstances.',
    ),
    conditions: T('Сухі матеріали, подібна грануляція, внесення одразу після змішування.', 'Dry materials, similar granulation, application immediately after mixing.'),
    verification: 'verified', sourceIds: ['ravensdown-urea', 'eagri-lec15'],
  },
  {
    id: 'urea-kcl', mode: 'dry', priority: 100,
    a: { ids: ['urea'] }, b: { ids: ['potassium-chloride'] },
    status: 'conditional', effects: [],
    mechanism: T(
      'Суміш стає більш гігроскопічною; джерела допускають змішування лише за особливих умов і радять не зберігати суміш.',
      'The mixture becomes more hygroscopic; sources allow mixing only under special circumstances and advise not to store the mixture.',
    ),
    conditions: T('Вносити одразу після змішування.', 'Apply immediately after mixing.'),
    verification: 'verified', sourceIds: ['ravensdown-urea', 'eagri-lec15'],
  },
  {
    id: 'urea-calcium-nitrate', mode: 'dry', priority: 100,
    a: { ids: ['urea'] }, b: { ids: ['calcium-nitrate'] },
    status: 'conditional', effects: [],
    mechanism: T(
      'Обидві речовини гігроскопічні; суміш швидко поглинає вологу, тому змішування можливе лише за особливих умов.',
      'Both materials are hygroscopic; the mixture quickly absorbs moisture, so mixing is possible only under special circumstances.',
    ),
    verification: 'verified', sourceIds: ['ravensdown-urea'],
  },
  {
    id: 'urea-ammonium-phosphates', mode: 'dry', priority: 100,
    a: { ids: ['urea'] }, b: { ids: ['ammophos', 'dap'] },
    status: 'conditional', effects: [],
    mechanism: T(
      'За підвищеної вологості суміш може злежуватись; вільна кислота здатна гідролізувати сечовину, а також утворюється липкий фосфат сечовини.',
      'At higher humidity the mixture may cake; free acid can hydrolyse urea and sticky urea phosphate may form.',
    ),
    conditions: T('Контролювати відносну вологість під час змішування й зберігання.', 'Control relative humidity during mixing and storage.'),
    verification: 'verified', sourceIds: ['yara-physical'],
  },
  // ---------- кислі фосфати + вапнувальні матеріали ----------
  {
    id: 'acid-phosphate-liming', mode: 'dry', priority: 60,
    a: { tags: ['acidic-phosphate'] }, b: { tags: ['liming'] },
    status: 'incompatible', effects: [],
    equations: ['Ca(H2PO4)2 + CaCO3 -> 2CaHPO4 + CO2↑ + H2O'],
    mechanism: T(
      'Кислий фосфат нейтралізується основою: водорозчинний фосфат переходить у малорозчинні форми (ретроградація/«реверсія» фосфору) — зменшується частка водорозчинного P₂O₅. Візуально суміш може не змінюватися.',
      'The acidic phosphate is neutralised by the base: water-soluble phosphate is converted into poorly soluble forms (phosphorus retrogradation/“reversion”), so the water-soluble P₂O₅ share decreases. The mixture may look unchanged.',
    ),
    verification: 'computed', sourceIds: [],
  },
  // ---------- кальцієва селітра ----------
  {
    id: 'ca-nitrate-superphosphate-dry', mode: 'dry', priority: 100,
    a: { ids: ['calcium-nitrate'] }, b: { ids: ['simple-superphosphate', 'double-superphosphate'] },
    status: 'incompatible', effects: ['moisture', 'caking'],
    mechanism: T(
      'Кальцієва селітра дуже гігроскопічна; у контакті з кислим суперфосфатом суміш поглинає вологу, розчиняє частину компонентів і злежується.',
      'Calcium nitrate is highly hygroscopic; in contact with acidic superphosphate the mixture takes up moisture, partly dissolves its components and cakes.',
    ),
    control: {
      q: T('Чому суперфосфат не змішують із кальцієвою селітрою?', 'Why is superphosphate not mixed with calcium nitrate?'),
      a: T('Дуже гігроскопічна Ca(NO₃)₂ набирає вологу й разом із кислотністю суперфосфату перетворює суміш на злежану масу.', 'Highly hygroscopic Ca(NO₃)₂ takes up water and, together with the acidity of superphosphate, turns the mixture into a caked mass.'),
    },
    verification: 'needs-review', sourceIds: [],
  },
  {
    id: 'ca-nitrate-phosphate-solution', mode: 'solution', priority: 101,
    a: { ids: ['calcium-nitrate'] }, b: { ids: SOLP },
    status: 'incompatible', effects: ['precipitate', 'turbidity'],
    equations: ['Ca^2+ + HPO4^2- + 2H2O -> CaHPO4·2H2O↓'],
    mechanism: T(
      'Йони Ca²⁺ із кальцієвої селітри осаджують фосфат-іони у вигляді малорозчинних кальцієвих фосфатів; у концентрованих розчинах випадає осад.',
      'Ca²⁺ ions from calcium nitrate precipitate phosphate ions as sparingly soluble calcium phosphates; in concentrated solutions a precipitate forms.',
    ),
    conditions: T('Залежить від pH і концентрації; у концентрованих маточних розчинах змішувати не можна.', 'Depends on pH and concentration; must not be mixed in concentrated stock solutions.'),
    verification: 'verified', sourceIds: ['royal-brinkman-ca', 'haifa-mkp'],
  },
  {
    id: 'ca-nitrate-sulfate-solution', mode: 'solution', priority: 100,
    a: { ids: ['calcium-nitrate'] }, b: { tags: ['sulfate'] },
    status: 'incompatible', effects: ['precipitate', 'turbidity'],
    equations: ['Ca^2+ + SO4^2- + 2H2O -> CaSO4·2H2O↓'],
    mechanism: T(
      'Ca²⁺ і SO₄²⁻ утворюють малорозчинний гіпс CaSO₄·2H₂O, який випадає в осад.',
      'Ca²⁺ and SO₄²⁻ form sparingly soluble gypsum CaSO₄·2H₂O, which precipitates.',
    ),
    control: {
      q: T('Чому кальцієву селітру не змішують із сульфатами в одному концентрованому розчині?', 'Why is calcium nitrate not mixed with sulfates in one concentrated solution?'),
      a: T('Утворюється малорозчинний гіпс CaSO₄·2H₂O, що випадає в осад і може забивати системи подачі.', 'Sparingly soluble gypsum CaSO₄·2H₂O forms and precipitates, which can clog delivery systems.'),
    },
    verification: 'verified', sourceIds: ['royal-brinkman-ca'],
  },
  // ---------- калійні солі ----------
  {
    id: 'kcl-k2so4-dry', mode: 'dry', priority: 100,
    a: { ids: ['potassium-chloride'] }, b: { ids: ['potassium-sulfate'] },
    status: 'compatible', effects: [],
    mechanism: T(
      'Обидві солі містять катіон K⁺ і не вступають у взаємну хімічну реакцію; обидві — поширені компоненти тукосумішей. Для рівномірного внесення потрібна подібна грануляція.',
      'Both salts contain the K⁺ cation and do not react with each other; both are common blend components. Similar granulation is needed for uniform spreading.',
    ),
    control: {
      q: T('Чому суміш KCl і K₂SO₄ вважається сумісною?', 'Why is a mixture of KCl and K₂SO₄ considered compatible?'),
      a: T('Це дві солі з однаковим катіоном K⁺: взаємних реакцій немає, осад чи газ не утворюються.', 'They are two salts with the same cation K⁺: there is no mutual reaction and no precipitate or gas forms.'),
    },
    verification: 'needs-review', sourceIds: [],
  },
  {
    id: 'kcl-k2so4-solution', mode: 'solution', priority: 100,
    a: { ids: ['potassium-chloride'] }, b: { ids: ['potassium-sulfate'] },
    status: 'conditional', effects: [],
    equations: ['K2SO4 <-> 2K^+ + SO4^2-'],
    mechanism: T(
      'Хімічної реакції немає, але спільний іон K⁺ зменшує розчинність K₂SO₄ (обмежена розчинність — ≈ 120 г/л за 20 °C), тому в концентрованих розчинах можливе випадання кристалів K₂SO₄.',
      'There is no chemical reaction, but the common ion K⁺ lowers the solubility of K₂SO₄ (limited solubility — ≈ 120 g/L at 20 °C), so crystals of K₂SO₄ may separate in concentrated solutions.',
    ),
    conditions: T('Використовувати помірні концентрації.', 'Use moderate concentrations.'),
    verification: 'needs-review', sourceIds: ['apni-k'],
  },
];
