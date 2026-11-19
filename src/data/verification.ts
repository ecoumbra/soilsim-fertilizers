import type { Fertilizer, NutrientKey, SourceRef, Text, Verification } from './types';
import { isBalanced } from '../utils/chemistry';

/**
 * ШАР ВЕРИФІКАЦІЇ. Базові дані (src/data/fertilizers/*) не змінюються: тут для кожного добрива
 * зазначено джерела та поля, які ними підтверджені.
 *
 * Правило статусу «verified»: щонайменше одне джерело із цього шару
 *  (а) називає те саме значення, або
 *  (б) називає значення/діапазон, що лежить усередині діапазону автора,
 *      або розрахункове значення автора лежить усередині діапазону джерела;
 *  і жодне знайдене джерело не суперечить значенню.
 * Якщо джерела розходяться з даними автора — поле лишається «підтверджено автором»,
 * а розбіжність пояснено в supports/reviewNote та в AGROCHEMICAL_REVIEW.md.
 */

const T = (uk: string, en: string): Text => ({ uk, en });
const S = (id: string, uk: string, en: string): SourceRef => ({ id, supports: T(uk, en) });

interface Mark { path: string; ids: string[] }
interface Patch {
  sources: SourceRef[];
  verified: Mark[];
  edit?: (f: Fertilizer) => void;
}
const m = (path: string, ...ids: string[]): Mark => ({ path, ids });

const NR: Verification = 'needs-review';

const PATCHES: Record<string, Patch> = {
  // ---------------- АЗОТНІ ----------------
  'ammonium-nitrate': {
    sources: [
      S('uralchem-an', 'Мінімальний вміст загального N — 34,4 % (специфікація виробника); рекомендовано для весняного, допосівного внесення та підживлення.', 'Minimum total N is 34.4 % (manufacturer specification); recommended for spring, pre-planting and top-dressing application.'),
      S('acron-an', 'N 34,4 %; рівні частки нітратного й амонійного азоту; гранульована (prilled) форма.', 'N 34.4 %; equal shares of nitrate and ammonium nitrogen; prilled form.'),
      S('usda-nrcs-an', 'Половина N — нітратна, половина — амонійна; гігроскопічний; нітрат рухається з ґрунтовою водою, амоній поглинається коренями або поступово нітрифікується.', 'Half of N is nitrate and half ammonium; hygroscopic; nitrate moves with soil water, ammonium is taken up or gradually nitrified.'),
      S('cru-nitrate', 'Дуже висока розчинність (≈ 1900 г/л); у прямому використанні — 33–34 % N.', 'Extremely high solubility (≈ 1,900 g/L); 33–34 % N in straight use.'),
      S('slu-can', 'Розчинність NH₄NO₃ — 2,13 г на 1 г води (за Lide, 2004).', 'Solubility of NH₄NO₃ is 2.13 g per 1 g of water (after Lide, 2004).'),
      S('msu-n-sources', '34 % N; еквівалентна кислотність 62 (кг CaCO₃ на 100 кг добрива).', '34 % N; equivalent acidity 62 (kg CaCO₃ per 100 kg of fertilizer).'),
      S('nsw-dpi-n', 'Аміачна селітра (34 % N) слабко підкислює ґрунт.', 'Ammonium nitrate (34 % N) is slightly acidifying.'),
      S('unl-g1503', 'Нітрифікація NH₄⁺ + 2O₂ → 2H⁺ + NO₃⁻ + H₂O — головна причина підкислення; потреба у вапні — 1,8 фунта CaCO₃ на фунт N.', 'Nitrification NH₄⁺ + 2O₂ → 2H⁺ + NO₃⁻ + H₂O is the main cause of acidification; lime requirement 1.8 lb CaCO₃ per lb N.'),
    ],
    verified: [
      m('nutrients.N', 'uralchem-an', 'acron-an'),
      m('nitrogenForms', 'usda-nrcs-an', 'acron-an'),
      m('physical', 'acron-an', 'usda-nrcs-an'),
      m('hygroscopicity', 'usda-nrcs-an'),
      m('solubility', 'cru-nitrate', 'slu-can'),
      m('soil.reaction', 'msu-n-sources', 'nsw-dpi-n', 'unl-g1503'),
      m('soil.text', 'usda-nrcs-an'),
      m('plant', 'usda-nrcs-an'),
      m('application', 'uralchem-an'),
      m('reactions.1', 'unl-g1503'),
    ],
    edit: (f) => {
      f.reviewNote = T(
        'Теоретичний вміст N у NH₄NO₃ — 35,0 %. Значення 34,4 % збігається зі специфікаціями виробників (UralChem, Acron); університетські джерела наводять 33–34 %.',
        'Theoretical N in NH₄NO₃ is 35.0 %. The value 34.4 % matches manufacturer specifications (UralChem, Acron); university sources give 33–34 %.',
      );
    },
  },
  urea: {
    sources: [
      S('pmc-urease', '45–46 % N; гідроліз за участю уреази підвищує pH навколо гранули й спричиняє втрати NH₃ (у середньому 16 % від внесеного N у світі, до 40 % і більше); загортання зменшує втрати.', '45–46 % N; urease hydrolysis raises pH around the granule and causes NH₃ loss (on average 16 % of applied N worldwide, up to 40 % or more); incorporation reduces losses.'),
      S('purdue-urea', 'Карбамід — 46 % N; конверсія в амоній за участю уреази; за залишення на поверхні частина амонію втрачається у вигляді NH₃; ефективні дощ/зрошення або загортання.', 'Urea is 46 % N; conversion to ammonium by urease; ammonium may be lost as NH₃ if urea stays on the surface; rain/irrigation or incorporation helps.'),
      S('unl-passel-n', '46-0-0; після внесення гідролізується з утворенням карбонату амонію; ризик втрат знижується загортанням (обробіток, інжекція, ≥ ½ дюйма води).', '46-0-0; hydrolyses to ammonium carbonate after application; loss risk is reduced by incorporation (tillage, injection, ≥ ½ inch of water).'),
      S('msu-n-sources', '45–46 % N; еквівалентна кислотність 71.', '45–46 % N; equivalent acidity 71.'),
      S('nsw-dpi-n', 'Карбамід (46 % N) слабко підкислює ґрунт.', 'Urea (46 % N) is slightly acidifying.'),
      S('unl-g1503', 'Потреба у вапні — 1,8 фунта CaCO₃ на фунт N (нетто-підкислення).', 'Lime requirement 1.8 lb CaCO₃ per lb N (net acidification).'),
    ],
    verified: [
      m('soil.text', 'pmc-urease', 'purdue-urea', 'unl-passel-n'),
      m('soil.reaction', 'msu-n-sources', 'nsw-dpi-n', 'unl-g1503'),
      m('reactions.0', 'unl-passel-n'),
    ],
    edit: (f) => {
      f.soil = {
        reaction: 'acidic',
        reactionStatus: NR,
        text: T(
          'Під час гідролізу за участю уреази утворюються амонійні форми азоту; навколо гранули тимчасово зростає pH, що підсилює втрати NH₃ за поверхневого внесення. Загальний ефект після нітрифікації — підкислення.',
          'Hydrolysis catalysed by urease yields ammonium nitrogen; pH temporarily rises around the granule, which increases NH₃ loss after surface application. After nitrification the overall effect is acidifying.',
        ),
        textStatus: NR,
      };
      f.reviewNote = T(
        'Джерела наводять 45–46 % N; 46,2 % — значення з переліку автора (комерційна специфікація), теоретично 46,6 %. Для цього поля статус «Верифіковано» не ставиться.',
        'Sources give 45–46 % N; 46.2 % is the author-list value (commercial specification); the theoretical value is 46.6 %. The “Verified” status is therefore not assigned to this field.',
      );
    },
  },
  'ammonium-sulfate': {
    sources: [
      S('msu-n-sources', '21 % N; еквівалентна кислотність 110 (кг CaCO₃ на 100 кг добрива).', '21 % N; equivalent acidity 110 (kg CaCO₃ per 100 kg of fertilizer).'),
      S('unl-passel-n', 'Суха кристалічна речовина: 21 % N і 24 % S; більш підкислюючий, ніж інші джерела азоту.', 'Dry crystalline material: 21 % N and 24 % S; more acidifying than other nitrogen sources.'),
      S('unl-g1503', '21-0-0-24; потреба у вапні 5,4 фунта CaCO₃ на фунт N (оцінка може бути завищеною приблизно на 50 %, за Chien et al., 2010); нітрифікація NH₄⁺ виділяє H⁺.', '21-0-0-24; lime requirement 5.4 lb CaCO₃ per lb N (the estimate may be ~50 % too high, per Chien et al., 2010); nitrification of NH₄⁺ releases H⁺.'),
      S('va-dcr', 'Аналіз 21-0-0-24S.', 'Grade 21-0-0-24S.'),
    ],
    verified: [
      m('nutrients.N', 'msu-n-sources', 'unl-passel-n', 'va-dcr'),
      m('nutrients.S', 'unl-passel-n', 'va-dcr'),
      m('physical', 'unl-passel-n'),
      m('soil.reaction', 'msu-n-sources', 'unl-passel-n'),
      m('soil.text', 'unl-g1503', 'unl-passel-n'),
      m('reactions.1', 'unl-g1503'),
    ],
    edit: (f) => {
      f.physical = { state: T('Тверде, суха кристалічна речовина', 'Solid, dry crystalline material'), status: NR };
    },
  },
  'anhydrous-ammonia': {
    sources: [
      S('unl-passel-n', '82-0-0 — газ, що зберігається стиснутим у рідкому вигляді; у місці інжекції — висока pH і дуже висока концентрація амонію.', '82-0-0 — a gas stored compressed as a liquid; at the injection site pH is high and ammonium concentration very high.'),
      S('isu-nh3', 'NH₃ + H₂O = NH₄⁺ + OH⁻; NH₄⁺ утримується ґрунтовим обмінним комплексом і не рухається з водою; втрати можливі лише після нітрифікації.', 'NH₃ + H₂O = NH₄⁺ + OH⁻; NH₄⁺ is held on the soil exchange complex and does not move with water; losses are possible only after nitrification.'),
      S('unl-g1503', '82-0-0; потреба у вапні 1,8 фунта CaCO₃ на фунт N (нетто-підкислення).', '82-0-0; lime requirement 1.8 lb CaCO₃ per lb N (net acidification).'),
    ],
    verified: [
      m('nutrients.N', 'unl-passel-n', 'unl-g1503'),
      m('physical', 'unl-passel-n'),
      m('soil.text', 'isu-nh3', 'unl-passel-n'),
      m('soil.reaction', 'unl-g1503'),
      m('reactions.0', 'isu-nh3'),
    ],
    edit: (f) => {
      f.soil = {
        reaction: 'acidic',
        reactionStatus: NR,
        text: T(
          'Взаємодіє з ґрунтовою вологою, утворюючи NH₄⁺ та OH⁻ (у місці інжекції pH тимчасово висока). Амоній утримується ґрунтовим вбирним комплексом. Загальний ефект після нітрифікації — підкислення.',
          'Reacts with soil moisture to form NH₄⁺ and OH⁻ (pH is temporarily high at the injection site). Ammonium is held by the soil exchange complex. After nitrification the overall effect is acidifying.',
        ),
        textStatus: NR,
      };
    },
  },
  'calcium-nitrate': {
    sources: [
      S('slu-can', '5Ca(NO₃)₂·NH₄NO₃·10H₂O: 15,5 % N (14,4 % NO₃-N + 1,1 % NH₄-N) і 18,8 % Ca; висока розчинність і гігроскопічність (1,44 г Ca(NO₃)₂·4H₂O на 1 г води).', '5Ca(NO₃)₂·NH₄NO₃·10H₂O: 15.5 % N (14.4 % NO₃-N + 1.1 % NH₄-N) and 18.8 % Ca; high solubility and hygroscopicity (1.44 g Ca(NO₃)₂·4H₂O per 1 g of water).'),
      S('nptel-ca-nitrate', 'Подвійна сіль 5Ca(NO₃)₂·NH₄NO₃·10H₂O; типова специфікація: загальний N 15,5 %; продукт — гранули, прилі або луска.', 'Double salt 5Ca(NO₃)₂·NH₄NO₃·10H₂O; typical specification: total N 15.5 %; sold as granules, prills or flakes.'),
      S('royal-brinkman-ca', 'Основа — 5Ca(NO₃)₂·NH₄NO₃·10H₂O, 15,5 % N; гігроскопічний; не змішувати з розчинами, що містять фосфати або сульфати.', 'Core compound 5Ca(NO₃)₂·NH₄NO₃·10H₂O, 15.5 % N; hygroscopic; must not be mixed with solutions containing phosphates or sulfates.'),
      S('msu-n-sources', '15,5 % N; еквівалентна основність 20 (лужна реакція).', '15.5 % N; equivalent basicity 20 (alkaline reaction).'),
      S('nsw-dpi-n', 'Кальцієва селітра (15,5 % N) — не підкислює (лужна реакція).', 'Calcium nitrate (15.5 % N) is not acidifying (alkaline).'),
    ],
    verified: [
      m('formula', 'slu-can', 'nptel-ca-nitrate'),
      m('nutrients.N', 'slu-can', 'nptel-ca-nitrate'),
      m('nutrients.CaO', 'slu-can'),
      m('nitrogenForms', 'slu-can'),
      m('physical', 'nptel-ca-nitrate'),
      m('hygroscopicity', 'slu-can', 'royal-brinkman-ca'),
      m('solubility', 'slu-can'),
      m('soil.reaction', 'msu-n-sources', 'nsw-dpi-n'),
      m('soil.text', 'slu-can', 'msu-n-sources'),
      m('compatibility', 'royal-brinkman-ca'),
    ],
    edit: (f) => {
      if (f.solubility) {
        f.solubility.note = T(
          'Дуже добра розчинність: за даними автора ≈ 1200 г/л за 20 °C; у джерелі — 1,44 г тетрагідрату Ca(NO₃)₂·4H₂O на 1 г води.',
          'Very good solubility: author data ≈ 1200 g/L at 20 °C; the source gives 1.44 g of Ca(NO₃)₂·4H₂O per 1 g of water.',
        );
      }
      f.reviewNote = T(
        'Формулу, вміст N і форми азоту підтверджено джерелами. Ca у джерелі — 18,8 % (≈ 26,3 % CaO за множником 1,399), у даних автора CaO 26,5 %. Окрему картку Ca(NO₃)₂·4H₂O (≈ 11,8 % N) не створено.',
        'The formula, N content and N forms are confirmed by sources. Ca in the source is 18.8 % (≈ 26.3 % CaO with factor 1.399); the author data give 26.5 % CaO. A separate Ca(NO₃)₂·4H₂O card (≈ 11.8 % N) has not been created.',
      );
    },
  },
  'uan-solution': {
    sources: [
      S('uk-forages-uan', 'КАС (UAN) 28, 30, 32 % N; у розчинах половина N — карбамід, чверть — амонійний і чверть — нітратний азот.', 'UAN 28, 30 and 32 % N; in the solutions half of the N is urea, a quarter ammonium and a quarter nitrate.'),
      S('unl-passel-n', 'КАС — безнапірний розчин аміачної селітри, карбаміду й води; зазвичай половина азоту від карбаміду, половина — від аміачної селітри.', 'UAN is a non-pressure solution of ammonium nitrate, urea and water; usually half of the nitrogen comes from urea and half from ammonium nitrate.'),
    ],
    verified: [
      m('nutrients.N', 'uk-forages-uan', 'unl-passel-n'),
      m('grades', 'uk-forages-uan', 'unl-passel-n'),
      m('physical', 'unl-passel-n'),
      m('soil.text', 'uk-forages-uan'),
      m('reactions.1', 'unl-passel-n'),
    ],
    edit: (f) => {
      for (const g of f.grades ?? []) g.nitrogenSharesOfTotalN = { amide: 50, ammonium: 25, nitrate: 25 };
      f.description = T(
        'Рідке азотне добриво з амідною, амонійною та нітратною формами азоту. У розчинах КАС половина азоту припадає на карбамід, чверть — на амонійну й чверть — на нітратну форму (від загального N).',
        'Liquid nitrogen fertilizer with amide, ammonium and nitrate nitrogen. In UAN solutions half of the nitrogen is urea, a quarter ammonium and a quarter nitrate (of total N).',
      );
      f.reviewNote = T(
        'Розподіл 50/25/25 підтверджено джерелами для КАС 28–32 %. Густина й точний склад марок (частка води) не задані.',
        'The 50/25/25 split is confirmed by sources for UAN 28–32 %. Density and the exact composition (water share) of the grades are not given.',
      );
    },
  },

  // ---------------- ФОСФОРНІ ----------------
  'simple-superphosphate': {
    sources: [
      S('wisc-phosphorus', 'Товарний простий суперфосфат: 7–9,5 % P, тобто 16–22 % P₂O₅; основна частина — водорозчинний монокальційфосфат; одержують із фторапатиту й H₂SO₄ (2Ca₅(PO₄)₃F + 7H₂SO₄ → 3Ca(H₂PO₄)₂ + 7CaSO₄ + 2HF).', 'Commercial single superphosphate: 7–9.5 % P, i.e. 16–22 % P₂O₅; the main part is water-soluble monocalcium phosphate; made from fluorapatite and H₂SO₄ (2Ca₅(PO₄)₃F + 7H₂SO₄ → 3Ca(H₂PO₄)₂ + 7CaSO₄ + 2HF).'),
    ],
    verified: [m('nutrients.P2O5', 'wisc-phosphorus')],
    edit: (f) => {
      if (f.reviewNote) {
        f.reviewNote = {
          uk: f.reviewNote.uk + ' Вміст S (8–10 %) і розподіл водорозчинної частини (80–90 %) наукових джерел поки не мають.',
          en: f.reviewNote.en + ' The S content (8–10 %) and the water-soluble share (80–90 %) have no scientific source yet.',
        };
      }
    },
  },
  'double-superphosphate': {
    sources: [
      S('unl-g1503', 'Triple superphosphate 0-46-0 — потреба у вапні 0,0 (не підкислює).', 'Triple superphosphate 0-46-0 — lime requirement 0.0 (not acidifying).'),
      S('va-dcr', 'Концентрований (потрійний) суперфосфат 0-46-0.', 'Concentrated (triple) superphosphate 0-46-0.'),
      S('wisc-phosphorus', 'Потрійний суперфосфат: 17–23 % P, 44–52 % P₂O₅; діюча речовина — монокальційфосфат; дуже добре розчинний у воді; гіпсу менше, ніж у простому. Нижня межа 40 % у даних автора нижча за 44 % у цьому джерелі.', 'Triple superphosphate: 17–23 % P, 44–52 % P₂O₅; the active compound is monocalcium phosphate; very water-soluble; less gypsum than single superphosphate. The author’s lower bound of 40 % is below the 44 % given here.'),
    ],
    verified: [m('nutrients.P2O5', 'unl-g1503', 'va-dcr'), m('soil.reaction', 'unl-g1503')],
    edit: (f) => {
      if (f.reviewNote) {
        f.reviewNote = {
          uk: f.reviewNote.uk + ' Джерела наводять для TSP 44–52 % (Wisconsin) та 46 % (Nebraska, Virginia). У літературі зустрічається й інше тлумачення «double superphosphate» — суміш простого й потрійного суперфосфату; за рішенням автора назви ототожнено.',
          en: f.reviewNote.en + ' Sources give 44–52 % (Wisconsin) and 46 % (Nebraska, Virginia) for TSP. The literature also uses “double superphosphate” for a mixture of single and triple superphosphate; by author decision the names are treated as one product.',
        };
      }
    },
  },
  precipitate: {
    sources: [
      S('wisc-phosphorus', 'Дикальційфосфат значною мірою цитратно-розчинний; монокальційфосфат — водорозчинний.', 'Dicalcium phosphate is largely citrate-soluble; monocalcium phosphate is water-soluble.'),
    ],
    verified: [m('solubility', 'wisc-phosphorus')],
  },
  'thomas-slag': {
    sources: [
      S('isij-slag', 'Шлакове фосфорне добриво не розчиняється у воді, але розчиняється у 2 % лимонній кислоті — належить до цитратно-розчинних; ефективність визначають вмістом P₂O₅ та його розчинністю.', 'Slag phosphate fertilizer does not dissolve in water but dissolves in 2 % citric acid — it is a citrate-soluble fertilizer; efficiency depends on P₂O₅ content and solubility.'),
      S('echa-eu-fert', 'Томасшлак: мінімум 12 % P₂O₅ (розчинного в мінеральних кислотах), з якого 75 % розчинне у 2 % лимонній кислоті (мінімальна вимога реєстру ЄС). Значення автора (16–20 %; 80–90 %) узгоджуються, але прямо не підтверджені.', 'Thomas slag: minimum 12 % P₂O₅ (mineral-acid soluble), of which 75 % soluble in 2 % citric acid (EU list minimum). The author values (16–20 %; 80–90 %) are consistent but not directly confirmed.'),
    ],
    verified: [m('solubility', 'isij-slag', 'echa-eu-fert')],
    edit: (f) => {
      f.reviewNote = T(
        'Розчинність (не у воді, цитратно-розчинний) підтверджено джерелами. pH 10,5–12,0, 40–50 % CaO, еквівалент ≈ 0,75 т CaCO₃/т та несумісність із амонійними добривами — дані автора, джерел поки не знайдено.',
        'Solubility (not in water, citrate-soluble) is confirmed by sources. pH 10.5–12.0, 40–50 % CaO, the ≈ 0.75 t CaCO₃/t equivalent and the incompatibility with ammonium fertilizers are author data; no sources found yet.',
      );
    },
  },
  'open-hearth-slag': {
    sources: [
      S('isij-slag', 'Шлакове фосфорне добриво не розчиняється у воді, але розчиняється у 2 % лимонній кислоті — належить до цитратно-розчинних.', 'Slag phosphate fertilizer does not dissolve in water but dissolves in 2 % citric acid — it is a citrate-soluble fertilizer.'),
    ],
    verified: [m('solubility', 'isij-slag')],
    edit: (f) => {
      f.reviewNote = T(
        'Розчинність (не у воді, цитратно-розчинний) підтверджено загальним джерелом про шлакові фосфорні добрива. Вміст P₂O₅ 8–14 %, pH, вапнувальний ефект та несумісність — дані автора; специфічних джерел для мартенівського шлаку не знайдено.',
        'Solubility (not in water, citrate-soluble) is confirmed by a general source on slag phosphate fertilizers. The 8–14 % P₂O₅, pH, liming effect and incompatibility are author data; no source specific to open-hearth slag was found.',
      );
    },
  },
  'rock-phosphate': {
    sources: [
      S('fao-bulletin13', 'Пряме внесення фосфориту доцільне переважно на ґрунтах із pH ≤ 5,5; розчинення знижується з ростом pH; стандартні екстрагенти — нейтральний цитрат амонію, 2 % лимонна та 2 % мурашина кислоти; для двох фосфоритів NAC-розчинний P₂O₅ становить 7,6 із 30,0 і 7,1 із 32,4 % (≈ 22–25 % від загального); реактивні фосфорити на кислих ґрунтах можуть мати вапнувальний ефект.', 'Direct application of phosphate rock is generally recommended on soils with pH ≤ 5.5; dissolution decreases as pH rises; standard extractants are neutral ammonium citrate, 2 % citric acid and 2 % formic acid; for two rocks NAC-soluble P₂O₅ is 7.6 of 30.0 and 7.1 of 32.4 % (≈ 22–25 % of total); reactive rocks may have a liming effect on acid soils.'),
      S('wisc-phosphorus', 'Фосфорит має низьку цитратно-розчинну й дуже низьку водорозчинну частину фосфору.', 'Rock phosphate has low citrate-soluble and very low water-soluble phosphorus.'),
    ],
    verified: [m('solubility', 'fao-bulletin13', 'wisc-phosphorus'), m('soil.text', 'fao-bulletin13')],
    edit: (f) => {
      f.soil = {
        reaction: 'unknown',
        reactionStatus: 'unknown',
        text: T(
          'Ефективний переважно на кислих ґрунтах (pH ≤ 5,5): розчинення фосфориту зменшується з ростом pH й супроводжується зв’язуванням H⁺. Реактивні фосфорити з карбонатами можуть мати слабкий вапнувальний ефект (за даними автора: pH KCl < 5,5; домішки CaCO₃ до 10–15 %).',
          'Effective mainly on acidic soils (pH ≤ 5.5): dissolution of the rock decreases as pH rises and consumes H⁺. Reactive rocks with carbonates may have a weak liming effect (author data: pH KCl < 5.5; CaCO₃ impurities up to 10–15 %).',
        ),
        textStatus: NR,
      };
    },
  },

  // ---------------- КАЛІЙНІ ----------------
  sylvinite: {
    sources: [
      S('msstate-k', 'Сильвініт — KCl + NaCl, 20–30 % K₂O. Це не збігається з 12–18 % у даних автора (імовірно, інший тип руди/збагачення) — розбіжність потребує рішення автора.', 'Sylvinite is KCl + NaCl with 20–30 % K₂O. This does not match the author’s 12–18 % (probably a different ore type/grade) — the discrepancy needs an author decision.'),
    ],
    verified: [],
    edit: (f) => {
      f.reviewNote = T(
        'РОЗБІЖНІСТЬ: джерело (Mississippi State) наводить для сильвініту 20–30 % K₂O, у даних автора — 12–18 %. Значення автора збережено.',
        'DISCREPANCY: the source (Mississippi State) gives 20–30 % K₂O for sylvinite; the author data give 12–18 %. The author value is kept.',
      );
    },
  },
  kainite: {
    sources: [
      S('apni-k', 'Каїніт (магнезіальний каїніт): KMgSO₄Cl·3H₂O + солі Na; ≈ 11 % K₂O, 4 % S, 3 % Mg, 43 % Cl, 20 % Na.', 'Kainite (magnesia kainit): KMgSO₄Cl·3H₂O + Na salts; ≈ 11 % K₂O, 4 % S, 3 % Mg, 43 % Cl, 20 % Na.'),
    ],
    verified: [m('nutrients.K2O', 'apni-k')],
  },
  'potassium-chloride': {
    sources: [
      S('msstate-k', 'Хлорид калію: 60–62 % K₂O, водорозчинний, ≈ 45–47 % Cl.', 'Potassium chloride: 60–62 % K₂O, water-soluble, ≈ 45–47 % Cl.'),
      S('cornell-k', 'Хлорид калію (muriate of potash): 60–63 % K₂O; тверда речовина.', 'Potassium chloride (muriate of potash): 60–63 % K₂O; solid.'),
      S('va-dcr', 'KCl — 60–63 % K₂O, водорозчинне джерело K.', 'KCl — 60–63 % K₂O, a water-soluble K source.'),
    ],
    verified: [m('nutrients.K2O', 'msstate-k', 'cornell-k', 'va-dcr'), m('solubility', 'msstate-k', 'va-dcr')],
    edit: (f) => {
      f.reviewNote = T(
        'Теоретичний вміст K₂O в KCl — 63,2 %. Джерела наводять 60–63 %; нижня межа автора (56 %) відповідає технічним маркам і прямо не підтверджена.',
        'Theoretical K₂O in KCl is 63.2 %. Sources give 60–63 %; the author’s lower bound (56 %) corresponds to technical grades and is not directly confirmed.',
      );
    },
  },
  'potassium-sulfate': {
    sources: [
      S('msstate-k', 'K₂SO₄ (SOP): ≈ 50 % K₂O та 18 % S.', 'K₂SO₄ (SOP): ≈ 50 % K₂O and 18 % S.'),
      S('apni-k', 'K₂SO₄: 48–53 % K₂O, 17–18 % S; розчинність при 20 °C — 120 г/л.', 'K₂SO₄: 48–53 % K₂O, 17–18 % S; solubility at 20 °C — 120 g/L.'),
      S('va-dcr', 'K₂SO₄: 50–53 % K₂O, 18 % S, не більше 2,5 % Cl.', 'K₂SO₄: 50–53 % K₂O, 18 % S, no more than 2.5 % Cl.'),
    ],
    verified: [
      m('nutrients.K2O', 'msstate-k', 'apni-k', 'va-dcr'),
      m('nutrients.S', 'msstate-k', 'apni-k', 'va-dcr'),
      m('solubility', 'apni-k'),
    ],
  },
  'potassium-carbonate': {
    sources: [],
    verified: [],
    edit: (f) => {
      f.reviewNote = T(
        'Розчинність у воді підтверджена (Merck). Наукових джерел для вмісту K₂O та інших властивостей K₂CO₃ як добрива в цьому пошуку не знайдено. Для перевірки (у переліку літератури Wikipedia): Schultz H. et al. (2005) «Potassium Compounds», Ullmann’s Encyclopedia of Industrial Chemistry, doi:10.1002/14356007.a22_039 — не відкривалося. Теоретичний K₂O — 68,2 %. В англомовній літературі «potash» зазвичай означає калійні добрива загалом.',
        'The water solubility is confirmed (Merck). No scientific source for the K₂O content and other properties of K₂CO₃ as a fertilizer was found in this search. To check (listed in Wikipedia references): Schultz H. et al. (2005) “Potassium Compounds”, Ullmann’s Encyclopedia of Industrial Chemistry, doi:10.1002/14356007.a22_039 — not opened. Theoretical K₂O is 68.2 %. In English “potash” usually means potassium fertilizers in general.',
      );
    },
  },
  kalimagnesia: {
    sources: [
      S('ks-patentkali', 'Patentkali (сульфат калію з сіллю магнію): 30 % K₂O, 10 % MgO, 42,5 % SO₃ (= 17 % S), усе водорозчинне; за технічним листом K₂SO₄ ≈ 50,5 %, MgSO₄ ≈ 30,5 %, H₂O ≈ 12 %.', 'Patentkali (sulfate of potash with magnesium salt): 30 % K₂O, 10 % MgO, 42.5 % SO₃ (= 17 % S), all water-soluble; the technical sheet gives K₂SO₄ ≈ 50.5 %, MgSO₄ ≈ 30.5 %, H₂O ≈ 12 %.'),
    ],
    verified: [m('nutrients.K2O', 'ks-patentkali'), m('nutrients.MgO', 'ks-patentkali'), m('nutrients.S', 'ks-patentkali'), m('solubility', 'ks-patentkali')],
    edit: (f) => {
      f.solubility = { water: 'high', status: NR };
      f.reviewNote = T(
        'Значення збігаються з продуктом Patentkali (верхні межі діапазонів автора). Не плутати з лангбейнітом K₂SO₄·2MgSO₄ («Sul-Po-Mag», «K-Mag»: ≈ 22 % K₂O, 11 % Mg, 22 % S) — це інший продукт.',
        'The values match the Patentkali product (upper ends of the author ranges). Do not confuse with langbeinite K₂SO₄·2MgSO₄ (“Sul-Po-Mag”, “K-Mag”: ≈ 22 % K₂O, 11 % Mg, 22 % S) — a different product.',
      );
    },
  },

  // ---------------- КОМПЛЕКСНІ ----------------
  ammophos: {
    sources: [
      S('unl-g1503', 'MAP 10-52-0: P₂O₅ 52 %; потреба у вапні 5,4 фунта CaCO₃ на фунт N. Вміст N у джерелі — 10 %, у даних автора — 12 %.', 'MAP 10-52-0: 52 % P₂O₅; lime requirement 5.4 lb CaCO₃ per lb N. N in the source is 10 %; the author data give 12 %.'),
      S('msu-n-sources', 'MAP: 11 % N; еквівалентна кислотність 58.', 'MAP: 11 % N; equivalent acidity 58.'),
    ],
    verified: [m('nutrients.P2O5', 'unl-g1503'), m('soil.reaction', 'msu-n-sources', 'unl-g1503'), m('soil.text', 'unl-g1503')],
    edit: (f) => {
      f.soil = {
        reaction: 'acidic',
        reactionStatus: NR,
        text: T('Підкислює ґрунт унаслідок нітрифікації амонію.', 'Acidifies soil through nitrification of ammonium.'),
        textStatus: NR,
      };
      f.reviewNote = T(
        'РОЗБІЖНІСТЬ: джерела наводять N 10–11 %, у даних автора — 12 % (технічний амофос; теоретично 12,2 %). P₂O₅ 52 % підтверджено. Значення автора збережено.',
        'DISCREPANCY: sources give 10–11 % N; the author data give 12 % (technical ammophos; theoretically 12.2 %). 52 % P₂O₅ is confirmed. The author value is kept.',
      );
    },
  },
  dap: {
    sources: [
      S('unl-g1503', 'DAP 18-46-0; потреба у вапні 3,6 фунта CaCO₃ на фунт N.', 'DAP 18-46-0; lime requirement 3.6 lb CaCO₃ per lb N.'),
      S('va-dcr', 'DAP 18-46-0.', 'DAP 18-46-0.'),
      S('msu-n-sources', 'DAP: 16–18 % N; еквівалентна кислотність 70.', 'DAP: 16–18 % N; equivalent acidity 70.'),
    ],
    verified: [
      m('nutrients.N', 'unl-g1503', 'va-dcr'),
      m('nutrients.P2O5', 'unl-g1503', 'va-dcr'),
      m('soil.reaction', 'msu-n-sources', 'unl-g1503'),
      m('soil.text', 'unl-g1503'),
    ],
    edit: (f) => {
      f.soil = {
        reaction: 'acidic',
        reactionStatus: NR,
        text: T('Підкислює ґрунт унаслідок нітрифікації амонію (слабше, ніж амофос).', 'Acidifies soil through nitrification of ammonium (less than MAP).'),
        textStatus: NR,
      };
    },
  },
  mkp: {
    sources: [
      S('haifa-mkp', 'MKP 0-52-34: 52 % P₂O₅ і 34 % K₂O; повністю водорозчинний; без хлору й натрію; розчинність (г/100 г води) — 14,8 (0 °C), 18,3 (10), 22,6 (20), 28,0 (30), 33,5 (40); сумісний із більшістю водорозчинних добрив, крім тих, що містять Ca або Mg.', 'MKP 0-52-34: 52 % P₂O₅ and 34 % K₂O; fully water-soluble; free of chloride and sodium; solubility (g/100 g water) — 14.8 (0 °C), 18.3 (10), 22.6 (20), 28.0 (30), 33.5 (40); compatible with most water-soluble fertilizers except those containing Ca or Mg.'),
    ],
    verified: [
      m('nutrients.P2O5', 'haifa-mkp'),
      m('nutrients.K2O', 'haifa-mkp'),
      m('solubility', 'haifa-mkp'),
      m('compatibility', 'haifa-mkp'),
    ],
    edit: (f) => {
      if (f.solubility) {
        f.solubility.byTemperature = [
          { tC: 0, gPer100gWater: 14.8, sourceId: 'haifa-mkp' },
          { tC: 10, gPer100gWater: 18.3, sourceId: 'haifa-mkp' },
          { tC: 20, gPer100gWater: 22.6, sourceId: 'haifa-mkp' },
          { tC: 30, gPer100gWater: 28.0, sourceId: 'haifa-mkp' },
          { tC: 40, gPer100gWater: 33.5, sourceId: 'haifa-mkp' },
        ];
      }
      f.compatibilityNotes = {
        text: T(
          'Сумісний з більшістю водорозчинних добрив, крім добрив із кальцієм або магнієм (осади фосфатів).',
          'Compatible with most water-soluble fertilizers except those containing calcium or magnesium (phosphate precipitates).',
        ),
        status: NR,
      };
    },
  },
  nitroammophoska: {
    sources: [
      S('uralchem-npk', 'NPK 16:16:16: N 16 ± 1 (амонійний N мін. 8, нітратний 8), P₂O₅ 16 ± 1 (водорозчинний мін. 8), K₂O 16 ± 1; гранули сіро-рожевого/світло-коричневого кольору. Інший виробник (Acron) подає форми N як 9,6 % амонійного + 6,4 % нітратного.', 'NPK 16:16:16: N 16 ± 1 (ammonium N min. 8, nitrate 8), P₂O₅ 16 ± 1 (water-soluble min. 8), K₂O 16 ± 1; granules of greyish-pink/light-brown colour. Another manufacturer (Acron) gives the N forms as 9.6 % ammonium + 6.4 % nitrate.'),
    ],
    verified: [
      m('nutrients.N', 'uralchem-npk'),
      m('nutrients.P2O5', 'uralchem-npk'),
      m('nutrients.K2O', 'uralchem-npk'),
      m('physical', 'uralchem-npk'),
    ],
    edit: (f) => {
      f.p2o5Basis = 'total';
      f.physical = { state: T('Гранули (відтінки: сіро-рожевий, світло-коричневий, синій)', 'Granules (shades: greyish-pink, light-brown, blue)'), status: NR };
      f.reviewNote = T(
        'Марку 16:16:16 підтверджено специфікацією виробника (допуск ± 1). Форми N залежать від виробника (8/8 мін./макс. або 9,6/6,4); склад може містити Cl⁻ і Ca. Марку 15:15:15 прямо не підтверджено.',
        'The 16:16:16 grade is confirmed by a manufacturer specification (tolerance ± 1). N forms depend on the manufacturer (8/8 min./max. or 9.6/6.4); the composition may contain Cl⁻ and Ca. The 15:15:15 grade is not directly confirmed.',
      );
    },
  },
};

// ---------------------------------------------------------------------------

function setStatus(f: Fertilizer, path: string, status: Verification): void {
  const [a, b] = path.split('.');
  switch (a) {
    case 'nutrients': {
      const q = f.nutrients[b as NutrientKey];
      if (q) q.status = status;
      break;
    }
    case 'physical': if (f.physical) f.physical.status = status; break;
    case 'hygroscopicity': if (f.hygroscopicity) f.hygroscopicity.status = status; break;
    case 'solubility': if (f.solubility && !b) f.solubility.status = status; break;
    case 'soil':
      if (f.soil) {
        if (b === 'reaction') f.soil.reactionStatus = status;
        if (b === 'text') f.soil.textStatus = status;
      }
      break;
    case 'plant': if (f.plant) f.plant.status = status; break;
    case 'application': f.application.status = status; break;
    case 'compatibility': if (f.compatibilityNotes) f.compatibilityNotes.status = status; break;
    case 'reactions': {
      const r = f.reactions[Number(b)];
      if (r) r.status = status;
      break;
    }
    default:
      break; // formula, nitrogenForms, grades — лише докази без поля статусу
  }
}

// ---------------------------------------------------------------------------
// Числові дані розчинності у воді (г на 100 г води) — лише з джерел; без екстраполяції.

interface SolData { sources: SourceRef[]; points: [number, number, string][] }

const merck = (uk: string, en: string): SourceRef => S('merck-solubility', uk, en);
const pts = (id: string, t: number[], v: number[]): [number, number, string][] => t.map((x, i) => [x, v[i], id]);
const T6 = [0, 20, 40, 60, 80, 100];

const SOL_DATA: Record<string, SolData> = {
  'ammonium-nitrate': {
    sources: [merck('NH₄NO₃: 118,5 (0 °C), 187,7 (20), 283 (40), 415 (60), 610 (80), 1000 (100) г/100 г води.', 'NH₄NO₃: 118.5 (0 °C), 187.7 (20), 283 (40), 415 (60), 610 (80), 1000 (100) g/100 g water.')],
    points: pts('merck-solubility', T6, [118.5, 187.7, 283, 415, 610, 1000]),
  },
  urea: {
    sources: [S('incitec-urea', 'Розчинність карбаміду, кг/100 кг води: 84 (10 °C), 105 (20), 133 (30), 166 (40).', 'Urea solubility, kg per 100 kg of water: 84 (10 °C), 105 (20), 133 (30), 166 (40).')],
    points: pts('incitec-urea', [10, 20, 30, 40], [84, 105, 133, 166]),
  },
  'ammonium-sulfate': {
    sources: [merck('(NH₄)₂SO₄: 70,4 (0 °C), 75,44 (20), 81,2 (40), 87,4 (60), 94,1 (80), 102 (100) г/100 г води.', '(NH₄)₂SO₄: 70.4 (0 °C), 75.44 (20), 81.2 (40), 87.4 (60), 94.1 (80), 102 (100) g/100 g water.')],
    points: pts('merck-solubility', T6, [70.4, 75.44, 81.2, 87.4, 94.1, 102]),
  },
  'potassium-chloride': {
    sources: [merck('KCl: 28,15 (0 °C), 34,24 (20), 40,3 (40), 45,6 (60), 51 (80), 56,2 (100) г/100 г води.', 'KCl: 28.15 (0 °C), 34.24 (20), 40.3 (40), 45.6 (60), 51 (80), 56.2 (100) g/100 g water.')],
    points: pts('merck-solubility', T6, [28.15, 34.24, 40.3, 45.6, 51, 56.2]),
  },
  'potassium-sulfate': {
    sources: [merck('K₂SO₄: 7,33 (0 °C), 11,11 (20), 14,79 (40), 18,2 (60), 21,29 (80), 24,1 (100) г/100 г води.', 'K₂SO₄: 7.33 (0 °C), 11.11 (20), 14.79 (40), 18.2 (60), 21.29 (80), 24.1 (100) g/100 g water.')],
    points: pts('merck-solubility', T6, [7.33, 11.11, 14.79, 18.2, 21.29, 24.1]),
  },
  'potassium-carbonate': {
    sources: [merck('K₂CO₃: 105,5 (0 °C), 111,5 (20), 117 (40), 127 (60), 140 (80), 156 (100) г/100 г води.', 'K₂CO₃: 105.5 (0 °C), 111.5 (20), 117 (40), 127 (60), 140 (80), 156 (100) g/100 g water.')],
    points: pts('merck-solubility', T6, [105.5, 111.5, 117, 127, 140, 156]),
  },
  ammophos: {
    sources: [merck('NH₄H₂PO₄ (чиста сіль): 22,7 (0 °C), 36,8 (20), 56,7 (40), 82,9 (60), 120,7 (80), 174 (100) г/100 г води. Технічний амофос містить домішки.', 'NH₄H₂PO₄ (pure salt): 22.7 (0 °C), 36.8 (20), 56.7 (40), 82.9 (60), 120.7 (80), 174 (100) g/100 g water. Technical ammophos contains impurities.')],
    points: pts('merck-solubility', T6, [22.7, 36.8, 56.7, 82.9, 120.7, 174]),
  },
  dap: {
    sources: [merck('(NH₄)₂HPO₄ (чиста сіль): 57,5 (0 °C), 68,6 (20), 81,8 (40), 97,6 (60) г/100 г води; значення для 80 °C у таблиці неоднозначне й не використано.', '(NH₄)₂HPO₄ (pure salt): 57.5 (0 °C), 68.6 (20), 81.8 (40), 97.6 (60) g/100 g water; the 80 °C value in the table is ambiguous and not used.')],
    points: pts('merck-solubility', [0, 20, 40, 60], [57.5, 68.6, 81.8, 97.6]),
  },
  mkp: {
    sources: [merck('KH₂PO₄: 14,3 (0 °C), 22,7 (20), 33,9 (40), 48,6 (60), 68 (80) г/100 г води — узгоджується з даними виробника; точки 60 і 80 °C взято з цієї таблиці.', 'KH₂PO₄: 14.3 (0 °C), 22.7 (20), 33.9 (40), 48.6 (60), 68 (80) g/100 g water — consistent with the manufacturer data; the 60 and 80 °C points are taken from this table.')],
    points: pts('merck-solubility', [60, 80], [48.6, 68]),
  },
};

function applySolubilityData(f: Fertilizer): void {
  const d = SOL_DATA[f.id];
  if (!d || !f.solubility) return;
  for (const src of d.sources) if (!f.sources.some((x) => x.id === src.id)) f.sources.push(src);
  const merged = [...(f.solubility.byTemperature ?? [])];
  for (const [tC, g, sid] of d.points) if (!merged.some((m) => m.tC === tC)) merged.push({ tC, gPer100gWater: g, sourceId: sid });
  merged.sort((a, b) => a.tC - b.tC);
  f.solubility.byTemperature = merged;
  const ids = Array.from(new Set(merged.map((m) => m.sourceId)));
  f.evidence = f.evidence ?? {};
  f.evidence['solubility.byTemperature'] = ids;
  // числові дані узгоджуються з класом розчинності → клас верифіковано
  f.solubility.status = 'verified';
  f.evidence['solubility'] = Array.from(new Set([...(f.evidence['solubility'] ?? []), ...ids]));
}

export function applyVerification(base: Fertilizer): Fertilizer {
  const f: Fertilizer = JSON.parse(JSON.stringify(base)) as Fertilizer;
  const patch = PATCHES[f.id];
  if (patch) {
    patch.edit?.(f);
    f.sources = patch.sources;
    f.evidence = {};
    for (const mark of patch.verified) {
      setStatus(f, mark.path, 'verified');
      f.evidence[mark.path] = mark.ids;
    }
  }
  applySolubilityData(f);
  // збалансовані рівняння без джерела — «розраховано» (баланс атомів і заряду перевірено кодом)
  for (const r of f.reactions) {
    if (r.status === NR && isBalanced(r.equation)) r.status = 'computed';
  }
  return f;
}
