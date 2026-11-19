import type { DiagScenario } from './types';
import type { Text } from '../types';

const T = (uk: string, en: string): Text => ({ uk, en });

export const DIAG_SCENARIOS: DiagScenario[] = [
  {
    id: 'n-def-wheat', level: 'beginner', ambiguous: false,
    title: T('Бліде озиме жито навесні', 'Pale winter wheat in spring'),
    field: {
      soil: T('Супіщаний ґрунт', 'Sandy loam'), pH: 6.4, crop: T('Озима пшениця, кущіння', 'Winter wheat, tillering'),
      symptoms: [
        T('Нижні (старі) листки блідо-зелені, місцями жовті', 'Lower (older) leaves pale green, partly yellow'),
        T('Рослини дрібні, стеблостій зріджений', 'Plants are small, the stand is thin'),
      ],
      tests: T('Вміст мінерального азоту — низький; P і K — середні', 'Mineral nitrogen is low; P and K are medium'),
      history: T('Азотні добрива цього року ще не вносили; попередник — соняшник', 'No nitrogen fertilizer applied this year; the previous crop was sunflower'),
    },
    primary: 'n-def', acceptable: [],
    fert: { 'ammonium-nitrate': 3, urea: 3, 'ammonium-sulfate': 3, 'uan-solution': 3, 'calcium-nitrate': 2 },
    rationale: [
      { id: 'r1', correct: true, text: T('Симптоми починаються зі старих листків: азот рухливий у рослині й перерозподіляється до молодих тканин.', 'Symptoms start on older leaves: nitrogen is mobile in the plant and is redistributed to young tissues.') },
      { id: 'r2', correct: true, text: T('Потрібне добриво з азотом; фосфорні чи калійні добрива цей дефіцит не усунуть.', 'A nitrogen-containing fertilizer is needed; phosphorus or potassium fertilizers will not fix this deficiency.') },
      { id: 'r3', correct: false, text: T('Старі листки жовтіють першими, бо азот у рослині нерухливий.', 'Older leaves yellow first because nitrogen is immobile in the plant.') },
      { id: 'r4', correct: false, text: T('Достатньо внести хлорид калію: калій замінює азот у білках.', 'Potassium chloride is enough: potassium replaces nitrogen in proteins.') },
      { id: 'r5', correct: true, text: T('Якщо обрано карбамід, його варто заробити в ґрунт або внести перед дощем, щоб зменшити втрати NH₃.', 'If urea is chosen it should be incorporated or applied before rain to reduce NH₃ loss.') },
    ],
    hints: [
      T('Де на рослині з’явилися перші симптоми — на старих чи молодих листках?', 'Where on the plant did the first symptoms appear — on older or younger leaves?'),
      T('Ґрунтовий аналіз показує, якого елемента бракує.', 'The soil test shows which nutrient is lacking.'),
    ],
    explanation: T('Бліде забарвлення нижніх листків і низький вміст мінерального азоту вказують на дефіцит азоту. Придатні азотні добрива (аміачна селітра, карбамід, сульфат амонію, КАС); кальцієва селітра — азотне джерело, але кальцій тут не потрібен. Для карбаміду важливе загортання або дощ.', 'Pale lower leaves and low mineral nitrogen point to nitrogen deficiency. Suitable are nitrogen fertilizers (ammonium nitrate, urea, ammonium sulfate, UAN); calcium nitrate is a nitrogen source but calcium is not needed here. For urea, incorporation or rain matters.'),
    sourceIds: ['uga-b1569', 'ifas-ag462', 'msu-mobility', 'pmc-urease', 'purdue-urea'],
  },
  {
    id: 'k-def-maize', level: 'beginner', ambiguous: false,
    title: T('Підсохлі краї листків кукурудзи', 'Scorched leaf margins in maize'),
    field: {
      soil: T('Легкий супіщаний ґрунт', 'Light loamy sand'), pH: 6.0, crop: T('Кукурудза, 8–10 листків', 'Maize, 8–10 leaves'),
      symptoms: [
        T('Краї нижніх листків бурі, підсохлі', 'Margins of lower leaves are brown and scorched'),
        T('Верхні листки ще зелені', 'Upper leaves are still green'),
      ],
      tests: T('Обмінний K — низький; мінеральний N і P — середні', 'Exchangeable K is low; mineral N and P are medium'),
      history: T('Калійні добрива не вносили кілька років', 'No potassium fertilizer for several years'),
    },
    primary: 'k-def', acceptable: [],
    fert: { 'potassium-chloride': 3, 'potassium-sulfate': 3, kalimagnesia: 3, 'potassium-salt-40': 3, sylvinite: 2, kainite: 2, mkp: 1, 'potassium-carbonate': 1 },
    rationale: [
      { id: 'r1', correct: true, text: T('Підсихання країв старих листків типове для дефіциту K — він рухливий у рослині.', 'Scorching of older leaf margins is typical of K deficiency — K is mobile in the plant.') },
      { id: 'r2', correct: true, text: T('Низький обмінний K у ґрунтовому аналізі підтверджує діагноз.', 'The low exchangeable K in the soil test supports the diagnosis.') },
      { id: 'r3', correct: false, text: T('Це дефіцит кальцію: він теж проявляється на краях листків, тому достатньо вапна.', 'This is calcium deficiency: it also appears on leaf edges, so lime is enough.') },
      { id: 'r4', correct: true, text: T('На легких ґрунтах із низькою обмінною ємністю калій утримується слабше, тому його запас швидко виснажується.', 'On light soils with low exchange capacity potassium is held weakly, so its reserve is depleted quickly.') },
    ],
    hints: [
      T('Краї нижніх листків підсохли, верхні зелені — який тип рухливості в елемента?', 'The margins of the lower leaves are scorched while the upper ones are green — what mobility does the nutrient have?'),
      T('N- і K-дефіцити можна сплутати: обидва проявляються на старих листках. Що каже ґрунтовий аналіз?', 'N and K deficiencies can be confused: both appear on older leaves. What does the soil test say?'),
    ],
    explanation: T('Бурі краї старих листків і низький K у ґрунті — дефіцит калію. Підходять KCl, K₂SO₄, калімагнезія, калійна сіль; сирі солі (сильвініт, каїніт) містять багато баласту (Na, Cl).', 'Brown margins on older leaves and low soil K indicate potassium deficiency. KCl, K₂SO₄, kali-magnesia and potassium salt are suitable; raw salts (sylvinite, kainite) contain much ballast (Na, Cl).'),
    sourceIds: ['uga-b1569', 'uconn-nutdef', 'pioneer-k', 'msstate-k'],
  },
  {
    id: 'p-def-acid', level: 'beginner', ambiguous: false,
    title: T('Пурпурові сходи ячменю на кислому ґрунті', 'Purple barley seedlings on acid soil'),
    field: {
      soil: T('Опідзолений суглинок', 'Podzolised loam'), pH: 4.8, crop: T('Ярий ячмінь, сходи', 'Spring barley, seedlings'),
      symptoms: [
        T('Листки й стебла із пурпуровим відтінком', 'Leaves and stems with a purple tint'),
        T('Повільний ріст у холодну весну', 'Slow growth in a cold spring'),
      ],
      tests: T('Доступний P дуже низький; рухомий Al підвищений', 'Available P is very low; mobile Al is elevated'),
      history: T('Фосфорні добрива не вносили п’ять років; вапнування не проводили', 'No phosphorus fertilizer for five years; no liming'),
    },
    primary: 'p-def', acceptable: ['acidity'],
    fert: { 'double-superphosphate': 3, 'simple-superphosphate': 3, ammophos: 3, 'rock-phosphate': 2, dap: 2, mkp: 1, limestone: 1, dolomite: 1 },
    rationale: [
      { id: 'r1', correct: true, text: T('У кислих ґрунтах фосфат зв’язується Fe і Al у малорозчинні форми: потрібне водорозчинне P-добриво й увага до кислотності.', 'In acid soils phosphate is bound by Fe and Al into poorly soluble forms: a water-soluble P fertilizer and attention to acidity are needed.') },
      { id: 'r2', correct: true, text: T('На ґрунті з pH ≤ 5,5 допустиме й фосфоритне борошно: кислотність сприяє його розчиненню.', 'On a soil with pH ≤ 5.5 ground phosphate rock is also acceptable: acidity promotes its dissolution.') },
      { id: 'r3', correct: false, text: T('Фосфоритне борошно не діє на кислих ґрунтах — його слід вносити лише на лужних.', 'Ground phosphate rock does not work on acid soils — it should be used on alkaline ones only.') },
      { id: 'r4', correct: false, text: T('Томасшлак додатково підкислить ґрунт і допоможе фосфору.', 'Thomas slag will additionally acidify the soil and help phosphorus.') },
      { id: 'r5', correct: true, text: T('Пурпурове забарвлення узгоджується з дефіцитом P, але холодна погода теж може його викликати, тому потрібен ґрунтовий аналіз.', 'Purple colouring is consistent with P deficiency, but cold weather can also cause it, so a soil test is needed.') },
    ],
    hints: [
      T('Що відбувається з фосфатом у ґрунті з pH 4,8?', 'What happens to phosphate in a soil with pH 4.8?'),
      T('Яка форма фосфорного добрива розчиняється в кислому середовищі повільно, але все ж діє?', 'Which phosphorus form dissolves slowly in an acid medium yet still works?'),
    ],
    explanation: T('Низький доступний P та пурпуровий колір — ознаки дефіциту фосфору; кислотність (pH 4,8) закріплює P з Fe/Al, тому «надмірна кислотність» — прийнятна супутня гіпотеза. Підходять водорозчинні P-добрива; фосфорит за FAO допустимий при pH ≤ 5,5. Вапнування вирішує кислотність, але не додає фосфору.', 'Low available P and purple colour indicate phosphorus deficiency; acidity (pH 4.8) fixes P with Fe/Al, so “excessive acidity” is an acceptable accompanying hypothesis. Water-soluble P fertilizers fit; per FAO phosphate rock is acceptable at pH ≤ 5.5. Liming solves acidity but does not add phosphorus.'),
    sourceIds: ['umn-p', 'unl-passel-p', 'fao-bulletin13', 'uga-b1569', 'uconn-nutdef'],
  },
  {
    id: 'as-acidification', level: 'intermediate', ambiguous: false,
    title: T('Закислений ґрунт після багаторічного сульфату амонію', 'Acidified soil after years of ammonium sulfate'),
    field: {
      soil: T('Суглинок', 'Loam'), pH: 4.6, crop: T('Кукурудза', 'Maize'),
      symptoms: [
        T('Повільний ріст, короткі потовщені корені', 'Slow growth, short thickened roots'),
        T('Жовтуваті листки, нерівномірні сходи', 'Yellowish leaves, uneven emergence'),
      ],
      tests: T('pH 4,6 (вісім років тому було 6,3); азоту достатньо', 'pH 4.6 (was 6.3 eight years ago); nitrogen is sufficient'),
      history: T('Щороку основним азотним добривом був сульфат амонію; вапнування не було', 'Ammonium sulfate was the main nitrogen fertilizer every year; no liming'),
    },
    primary: 'acidity', acceptable: [],
    fert: { limestone: 3, dolomite: 3, 'thomas-slag': 2, 'open-hearth-slag': 2, 'calcium-nitrate': 2, quicklime: 2, 'slaked-lime': 2 },
    rationale: [
      { id: 'r1', correct: true, text: T('Нітрифікація NH₄⁺ виділяє H⁺, тому багаторічне внесення сульфату амонію підкислює ґрунт.', 'Nitrification of NH₄⁺ releases H⁺, so repeated ammonium sulfate application acidifies the soil.') },
      { id: 'r2', correct: true, text: T('Потрібен вапнувальний матеріал, а не додаткове азотне добриво: азоту достатньо.', 'A liming material is needed, not extra nitrogen: nitrogen is sufficient.') },
      { id: 'r3', correct: false, text: T('Сульфат амонію має лужну реакцію, тому проблема в іншому.', 'Ammonium sulfate has an alkaline reaction, so the problem lies elsewhere.') },
      { id: 'r4', correct: true, text: T('Сульфат амонію підкислює сильніше за інші джерела азоту.', 'Ammonium sulfate acidifies more than other nitrogen sources.') },
    ],
    hints: [
      T('Згадайте, що виділяється під час нітрифікації амонію.', 'Recall what is released during nitrification of ammonium.'),
      T('Азоту достатньо — що ж треба виправити?', 'Nitrogen is sufficient — so what has to be corrected?'),
    ],
    explanation: T('Падіння pH з 6,3 до 4,6 — наслідок підкислення від нітрифікації амонію. Виправляє це вапнувальний матеріал (вапняк, доломіт); томасшлак має сильний вапнувальний ефект (дані автора), кальцієва селітра не підкислює, але вже наявну кислотність не усуває.', 'The pH drop from 6.3 to 4.6 results from acidification by ammonium nitrification. A liming material (limestone, dolomite) corrects it; Thomas slag has a strong liming effect (author data); calcium nitrate does not acidify but does not remove existing acidity.'),
    sourceIds: ['unl-g1503', 'msu-n-sources', 'nsw-dpi-n'],
  },
  {
    id: 'nitrate-leaching', level: 'intermediate', ambiguous: false,
    title: T('Блідий червень після дощової весни', 'A pale June after a rainy spring'),
    field: {
      soil: T('Піщаний ґрунт', 'Sandy soil'), pH: 6.2, crop: T('Кукурудза, червень', 'Maize, June'),
      symptoms: [
        T('Рослини світло-зелені, нижні листки жовтіють', 'Plants are light green, lower leaves yellowing'),
      ],
      tests: T('Мінеральний азот у шарі 0–30 см низький', 'Mineral nitrogen in the 0–30 cm layer is low'),
      history: T('У квітні перед сівбою внесли аміачну селітру; травень був дуже дощовим', 'Ammonium nitrate was applied in April before sowing; May was very rainy'),
    },
    primary: 'nitrate-loss', acceptable: ['n-def'],
    fert: { 'ammonium-sulfate': 3, urea: 2, 'uan-solution': 2, 'ammonium-nitrate': 1 },
    rationale: [
      { id: 'r1', correct: true, text: T('NO₃⁻ — аніон: ґрунтовий вбирний комплекс його не затримує, і він вимивається з водою.', 'NO₃⁻ is an anion: the soil exchange complex does not hold it and it leaches with water.') },
      { id: 'r2', correct: true, text: T('NH₄⁺ утримується ґрунтовим вбирним комплексом, тому амонійна форма вимивається гірше.', 'NH₄⁺ is held by the soil exchange complex, so the ammonium form leaches less.') },
      { id: 'r3', correct: false, text: T('NH₄⁺ вимивається швидше за NO₃⁻, бо він легший.', 'NH₄⁺ leaches faster than NO₃⁻ because it is lighter.') },
      { id: 'r4', correct: true, text: T('На піщаному ґрунті з низькою ємністю вбирання ризик вимивання вищий.', 'On a sandy soil with low exchange capacity the risk of leaching is higher.') },
    ],
    hints: [
      T('Половина азоту аміачної селітри — нітратна. Як веде себе нітрат у ґрунті під дощем?', 'Half of the nitrogen in ammonium nitrate is nitrate. How does nitrate behave in soil under rain?'),
      T('Перегляньте лабораторію «Ґрунтова колонка».', 'Look at the “Soil column” laboratory.'),
    ],
    explanation: T('Жовтіння нижніх листків — дефіцит азоту, але його причина — вимивання нітратів зі слабо буферного піщаного ґрунту. Амонійна форма (сульфат амонію) утримується ҐВК; карбамід і КАС частково амідні/амонійні. Кальцієва селітра (лише нітрат) — хибний вибір.', 'The yellowing of lower leaves is nitrogen deficiency, but its cause is nitrate leaching from a weakly buffered sandy soil. The ammonium form (ammonium sulfate) is held by the exchange complex; urea and UAN are partly amide/ammonium. Calcium nitrate (nitrate only) is the wrong choice.'),
    sourceIds: ['va-dcr-p', 'usda-nrcs-an', 'isu-nh3', 'pioneer-k', 'ifas-ag462'],
  },
  {
    id: 'chloride-sensitive', level: 'intermediate', ambiguous: false,
    title: T('Дефіцит калію в культурі, чутливій до хлору', 'Potassium deficiency in a chloride-sensitive crop'),
    field: {
      soil: T('Суглинок', 'Loam'), pH: 6.8, crop: T('Культура, яку технологічна карта позначає як чутливу до хлору', 'A crop that the technology card marks as chloride-sensitive'),
      symptoms: [
        T('Бурі краї старих листків', 'Brown margins on older leaves'),
      ],
      tests: T('Обмінний K — низький; Mg — середній', 'Exchangeable K is low; Mg is medium'),
      history: T('Калій не вносили; раніше використовували калійну сіль', 'No potassium applied; potassium salt was used earlier'),
    },
    primary: 'k-def', acceptable: [],
    fert: { 'potassium-sulfate': 3, kalimagnesia: 3, mkp: 2, 'potassium-chloride': 1, 'potassium-carbonate': 1 },
    rationale: [
      { id: 'r1', correct: true, text: T('K₂SO₄ — безхлорне калійне добриво.', 'K₂SO₄ is a chloride-free potassium fertilizer.') },
      { id: 'r2', correct: false, text: T('Хлорид калію не містить хлору, тому підходить.', 'Potassium chloride contains no chlorine, so it is suitable.') },
      { id: 'r3', correct: true, text: T('Супутні іони (Cl⁻, Na⁺) сирих калійних солей і KCl важливі для чутливих культур.', 'Accompanying ions (Cl⁻, Na⁺) of raw potassium salts and KCl matter for sensitive crops.') },
      { id: 'r4', correct: true, text: T('Калімагнезія безхлорна й додатково дає Mg та S.', 'Kali-magnesia is chloride-free and also supplies Mg and S.') },
    ],
    hints: [
      T('Який супутній іон у калійній солі та KCl небажаний для цієї культури?', 'Which accompanying ion in potassium salt and KCl is undesirable for this crop?'),
      T('Яка форма калійного добрива не містить хлору?', 'Which potassium fertilizer form contains no chlorine?'),
    ],
    explanation: T('Діагноз той самий — дефіцит калію, але вибір добрива залежить від супутніх іонів. Для культури, чутливої до хлору, обирають безхлорні форми: сульфат калію, калімагнезія; MKP дає ще й фосфор.', 'The diagnosis is the same — potassium deficiency — but the choice of fertilizer depends on accompanying ions. For a chloride-sensitive crop chloride-free forms are chosen: potassium sulfate, kali-magnesia; MKP also supplies phosphorus.'),
    sourceIds: ['ipni-kcl', 'va-dcr', 'ks-patentkali', 'uga-b1569'],
  },
  {
    id: 'young-yellow', level: 'advanced', ambiguous: true,
    title: T('Жовтіння молодих листків: азот чи сірка?', 'Yellowing of young leaves: nitrogen or sulfur?'),
    field: {
      soil: T('Пилуватий суглинок, мало гумусу', 'Silt loam, low organic matter'), pH: 6.5, crop: T('Ярий ріпак', 'Spring oilseed rape'),
      symptoms: [
        T('Рівномірне блідо-зелене забарвлення молодих (верхніх) листків', 'Uniform pale-green colour of young (upper) leaves'),
        T('Сповільнений ріст', 'Slowed growth'),
      ],
      tests: T('Сульфатна сірка — низька; мінеральний N — середній', 'Sulfate sulfur is low; mineral N is medium'),
      history: T('Азот вносили як аміачну селітру; сірковмісні добрива не застосовували', 'Nitrogen was applied as ammonium nitrate; no sulfur-containing fertilizers were used'),
    },
    primary: 's-def', acceptable: ['n-def'],
    fert: { 'ammonium-sulfate': 3, 'potassium-sulfate': 2, 'simple-superphosphate': 2, kalimagnesia: 2 },
    rationale: [
      { id: 'r1', correct: true, text: T('Сірка нерухлива в рослині, тому її дефіцит проявляється на молодих листках — на відміну від азоту.', 'Sulfur is immobile in the plant, so its deficiency appears on young leaves — unlike nitrogen.') },
      { id: 'r2', correct: true, text: T('Сульфат амонію постачає одночасно азот і сірку.', 'Ammonium sulfate supplies both nitrogen and sulfur.') },
      { id: 'r3', correct: false, text: T('Дефіцит сірки проявляється на нижніх листках так само, як дефіцит азоту.', 'Sulfur deficiency appears on lower leaves just like nitrogen deficiency.') },
      { id: 'r4', correct: true, text: T('Візуальні симптоми N і S схожі, тому діагноз потребує підтвердження аналізом.', 'Visual symptoms of N and S are similar, so the diagnosis needs confirmation by analysis.') },
    ],
    hints: [
      T('Де з’явилися симптоми — на старих чи молодих листках? Що це каже про рухливість елемента?', 'Where did the symptoms appear — on old or young leaves? What does this say about the nutrient’s mobility?'),
      T('Який із варіантів ґрунтового аналізу відрізняє S від N?', 'Which soil-test result distinguishes S from N?'),
    ],
    explanation: T('Бліде забарвлення молодих листків і низький сульфатний S — дефіцит сірки; азот — прийнятна, але менш імовірна гіпотеза (його дефіцит проявляється на старих листках). Це приклад неоднозначних симптомів: потрібен аналіз. Сульфат амонію закриває обидві гіпотези.', 'Pale young leaves and low sulfate S indicate sulfur deficiency; nitrogen is an acceptable but less likely hypothesis (its deficiency appears on old leaves). This is an example of ambiguous symptoms: analysis is needed. Ammonium sulfate covers both hypotheses.'),
    sourceIds: ['uga-b1569', 'msu-mobility', 'uconn-nutdef', 'unl-passel-n'],
  },
  {
    id: 'p-def-calcareous', level: 'advanced', ambiguous: false,
    title: T('Фосфор на карбонатному ґрунті: фосфорит не спрацював', 'Phosphorus on a calcareous soil: rock phosphate did not work'),
    field: {
      soil: T('Карбонатний суглинок', 'Calcareous loam'), pH: 7.9, crop: T('Ярова пшениця', 'Spring wheat'),
      symptoms: [
        T('Пурпурове забарвлення нижніх листків, затримка розвитку', 'Purple colour of lower leaves, delayed development'),
      ],
      tests: T('Доступний P низький; присутні вільні карбонати', 'Available P is low; free carbonates are present'),
      history: T('Протягом трьох років вносили фосфоритне борошно — ефекту не було', 'Ground phosphate rock was applied for three years — no effect'),
    },
    primary: 'p-def', acceptable: [],
    fert: { 'double-superphosphate': 3, 'simple-superphosphate': 3, ammophos: 3, mkp: 2, dap: 2, precipitate: 1 },
    rationale: [
      { id: 'r1', correct: true, text: T('За pH > 7 фосфат осаджується кальцієм у малорозчинні форми, тому доступність знижена.', 'At pH > 7 phosphate is precipitated by calcium into poorly soluble forms, so availability is reduced.') },
      { id: 'r2', correct: true, text: T('За FAO фосфорит ефективний переважно при pH ≤ 5,5, тому слабкий ефект очікуваний.', 'Per FAO phosphate rock is effective mainly at pH ≤ 5.5, so the weak effect is expected.') },
      { id: 'r3', correct: false, text: T('Слід вапнувати, щоб підвищити доступність фосфору.', 'Liming should be done to raise phosphorus availability.') },
      { id: 'r4', correct: false, text: T('Томасшлак підвищить доступність P на цьому ґрунті.', 'Thomas slag will raise P availability on this soil.') },
    ],
    hints: [
      T('Який іон осаджує фосфат на лужних ґрунтах?', 'Which ion precipitates phosphate on alkaline soils?'),
      T('Чому фосфорит не діяв три роки поспіль?', 'Why did phosphate rock fail three years in a row?'),
    ],
    explanation: T('Дефіцит фосфору на карбонатному ґрунті пояснюється зв’язуванням фосфату кальцієм. Фосфорит і шлаки тут непридатні (потребують кислотності, шлаки ще й лужні); обирають водорозчинні форми. Це не рекомендація норм, а вибір форми добрива.', 'Phosphorus deficiency on the calcareous soil results from binding of phosphate by calcium. Phosphate rock and slags are unsuitable here (they need acidity; slags are also alkaline); water-soluble forms are chosen. This is not a rate recommendation but a choice of fertilizer form.'),
    sourceIds: ['umn-p', 'mu-g9180', 'fao-bulletin13', 'uga-b1569'],
  },
  {
    id: 'mg-k-antagonism', level: 'advanced', ambiguous: false,
    title: T('Міжжилкове пожовтіння після багаторічного KCl', 'Interveinal yellowing after years of KCl'),
    field: {
      soil: T('Легкий супіщаний ґрунт', 'Light sandy loam'), pH: 5.3, crop: T('Картопля', 'Potato'),
      symptoms: [
        T('Пожовтіння між жилками старих листків, жилки зелені', 'Yellowing between the veins of older leaves, veins remain green'),
      ],
      tests: T('Обмінний Mg — низький; обмінний K — високий', 'Exchangeable Mg is low; exchangeable K is high'),
      history: T('Щороку вносили хлорид калію', 'Potassium chloride was applied every year'),
    },
    primary: 'mg-def', acceptable: [],
    fert: { dolomite: 3, kalimagnesia: 1, kainite: 1, limestone: 1 },
    rationale: [
      { id: 'r1', correct: true, text: T('Міжжилкове пожовтіння старих листків типове для дефіциту Mg.', 'Interveinal yellowing of older leaves is typical of Mg deficiency.') },
      { id: 'r2', correct: true, text: T('Дефіцит Mg частіше трапляється на легких ґрунтах, а надлишок калійних добрив може його спричиняти.', 'Mg deficiency is more common on light soils, and overuse of potassium fertilizers can cause it.') },
      { id: 'r3', correct: false, text: T('Слід додати ще KCl: калій замінить магній у хлорофілі.', 'More KCl should be added: potassium will replace magnesium in chlorophyll.') },
      { id: 'r4', correct: true, text: T('Доломіт одночасно постачає Mg і знижує кислотність (pH 5,3).', 'Dolomite supplies Mg and reduces acidity (pH 5.3) at the same time.') },
    ],
    hints: [
      T('K уже високий. Що буде, якщо додати ще калію?', 'K is already high. What happens if more potassium is added?'),
      T('Який матеріал дає магній і працює проти кислотності?', 'Which material gives magnesium and works against acidity?'),
    ],
    explanation: T('Дефіцит магнію на кислому легкому ґрунті з високим K. Доломіт CaMg(CO₃)₂ дає Mg і вапнує; калімагнезія та каїніт теж містять Mg, але додають ще калію, якого вже забагато.', 'Magnesium deficiency on an acid light soil with high K. Dolomite CaMg(CO₃)₂ supplies Mg and limes; kali-magnesia and kainite also contain Mg but add more potassium, which is already excessive.'),
    sourceIds: ['uga-b1569', 'msu-mobility', 'alberta-cec'],
  },
];
