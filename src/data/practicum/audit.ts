import type { AuditScenario } from './types';
import type { Text } from '../types';

const T = (uk: string, en: string): Text => ({ uk, en });

/** Усі сценарії: кожна помилка має правильний механізм (correct) і правильну альтернативу (correct) серед хибних. */
export const AUDIT_SCENARIOS: AuditScenario[] = [
  {
    id: 'rp-ph75', level: 'beginner', title: T('Фосфоритне борошно на ґрунті з pH 7,5', 'Ground phosphate rock on a soil with pH 7.5'),
    fragments: [
      { id: 'f1', text: T('На полі з pH(KCl) 7,5 агроном вирішив усунути дефіцит фосфору.', 'On a field with pH(KCl) 7.5 the agronomist decided to remedy phosphorus deficiency.') },
      { id: 'f2', text: T('Він обрав фосфоритне борошно як основне добриво.', 'He chose ground phosphate rock as the basic fertilizer.'), errorId: 'e1' },
      { id: 'f3', text: T('Добриво внесли під оранку.', 'The fertilizer was applied before ploughing.') },
      { id: 'f4', text: T('Наступного року ефект на врожайність був слабким.', 'The following year the effect on yield was weak.') },
    ],
    errors: [{
      id: 'e1',
      mechanism: {
        options: [
          T('Фосфорит розчиняється переважно в кислому середовищі; за pH вище ≈ 5,5 розчинення різко слабшає.', 'Phosphate rock dissolves mainly in an acid medium; above pH ≈ 5.5 dissolution weakens sharply.'),
          T('Фосфоритне борошно має кислу реакцію й підкислює ґрунт.', 'Ground phosphate rock has an acid reaction and acidifies the soil.'),
          T('Фосфорит містить нітратний азот, який вимився з профілю.', 'Phosphate rock contains nitrate nitrogen that leached from the profile.'),
        ], correct: 0,
      },
      alternative: {
        options: [
          T('Водорозчинне фосфорне добриво (суперфосфат або амофос).', 'A water-soluble phosphorus fertilizer (superphosphate or ammophos).'),
          T('Внести те саме борошно, але глибше.', 'Apply the same rock phosphate, but deeper.'),
          T('Замінити його хлоридом калію.', 'Replace it with potassium chloride.'),
        ], correct: 0,
      },
    }],
    explanation: T('За FAO пряме внесення фосфориту доцільне переважно на ґрунтах із pH ≤ 5,5; на нейтральних і лужних ґрунтах фосфат переходить у малорозчинні кальцієві форми. Потрібне водорозчинне P-добриво.', 'Per FAO, direct application of phosphate rock is appropriate mainly on soils with pH ≤ 5.5; on neutral and alkaline soils phosphate turns into poorly soluble calcium forms. A water-soluble P fertilizer is needed.'),
    sourceIds: ['fao-bulletin13', 'umn-p', 'mu-g9180'],
  },
  {
    id: 'urea-surface', level: 'beginner', title: T('Карбамід по поверхні', 'Urea on the surface'),
    fragments: [
      { id: 'f1', text: T('Навесні на теплому вологому ґрунті вирішили підживити посів азотом.', 'In spring, on a warm moist soil, it was decided to top-dress the crop with nitrogen.') },
      { id: 'f2', text: T('Карбамід розсіяли по поверхні без загортання.', 'Urea was spread on the surface without incorporation.'), errorId: 'e1' },
      { id: 'f3', text: T('Дощів протягом двох тижнів не було.', 'There was no rain for two weeks.') },
      { id: 'f4', text: T('Через тиждень відчувався запах аміаку, а жовтіння не зникло.', 'A week later an ammonia smell was noticed and the yellowing did not disappear.') },
    ],
    errors: [{
      id: 'e1',
      mechanism: {
        options: [
          T('Уреаза гідролізує карбамід до амонійних форм; на поверхні частина переходить у NH₃ й втрачається.', 'Urease hydrolyses urea to ammonium forms; on the surface part turns into NH₃ and is lost.'),
          T('Карбамід на поверхні вимивається у вигляді нітратів.', 'Surface urea leaches as nitrates.'),
          T('Карбамід реагує з вологою з утворенням хлору.', 'Urea reacts with moisture to form chlorine.'),
        ], correct: 0,
      },
      alternative: {
        options: [
          T('Заробити в ґрунт або внести перед дощем чи поливом.', 'Incorporate into the soil or apply before rain or irrigation.'),
          T('Змішати карбамід із гашеним вапном.', 'Mix the urea with slaked lime.'),
          T('Збільшити поверхневе внесення.', 'Increase the surface application.'),
        ], correct: 0,
      },
    }],
    explanation: T('Під дією уреази карбамід гідролізується, навколо гранули pH підвищується, і за поверхневого внесення значна частина азоту втрачається як NH₃. Загортання або дощ знижують втрати.', 'Under urease, urea hydrolyses, pH rises around the granule, and with surface application a considerable part of nitrogen is lost as NH₃. Incorporation or rain reduces losses.'),
    sourceIds: ['pmc-urease', 'purdue-urea', 'unl-passel-n'],
  },
  {
    id: 'as-acid', level: 'beginner', title: T('Більше сульфату амонію на закисленому полі', 'More ammonium sulfate on an acidified field'),
    fragments: [
      { id: 'f1', text: T('Вісім років поспіль основним азотним добривом був сульфат амонію.', 'For eight years ammonium sulfate was the main nitrogen fertilizer.') },
      { id: 'f2', text: T('pH ґрунту знизився з 6,3 до 4,7.', 'Soil pH fell from 6.3 to 4.7.') },
      { id: 'f3', text: T('Щоб підняти врожайність, агроном збільшує внесення сульфату амонію.', 'To raise yield the agronomist increases ammonium sulfate application.'), errorId: 'e1' },
    ],
    errors: [{
      id: 'e1',
      mechanism: {
        options: [
          T('Нітрифікація NH₄⁺ виділяє H⁺: більше сульфату амонію — ще більше підкислення.', 'Nitrification of NH₄⁺ releases H⁺: more ammonium sulfate means more acidification.'),
          T('Сульфат амонію має лужну реакцію.', 'Ammonium sulfate has an alkaline reaction.'),
          T('Сульфат амонію знижує рухомість алюмінію.', 'Ammonium sulfate lowers the mobility of aluminium.'),
        ], correct: 0,
      },
      alternative: {
        options: [
          T('Вапнувальний матеріал (вапняк, доломіт) і перегляд форми азотного добрива.', 'A liming material (limestone, dolomite) and a review of the nitrogen fertilizer form.'),
          T('Змішувати сульфат амонію з негашеним вапном в одному агрегаті.', 'Mix ammonium sulfate with quicklime in one machine.'),
          T('Замінити його аміачною селітрою, яка зовсім не підкислює.', 'Replace it with ammonium nitrate, which does not acidify at all.'),
        ], correct: 0,
      },
    }],
    explanation: T('Нітрифікація амонію виділяє H⁺, а сульфат амонію підкислює сильніше за інші джерела азоту. Аміачна селітра теж підкислює (слабше); змішувати амонійні добрива з негашеним вапном не можна (втрати NH₃).', 'Nitrification of ammonium releases H⁺, and ammonium sulfate acidifies more than other nitrogen sources. Ammonium nitrate also acidifies (less); ammonium fertilizers must not be mixed with quicklime (NH₃ loss).'),
    sourceIds: ['unl-g1503', 'unl-passel-n', 'msu-n-sources', 'nsw-dpi-n'],
  },
  {
    id: 'an-slaked', level: 'intermediate', title: T('Селітра з гашеним вапном на складі', 'Ammonium nitrate with slaked lime in storage'),
    fragments: [
      { id: 'f1', text: T('Аміачну селітру й гашене вапно завезли на склад господарства.', 'Ammonium nitrate and slaked lime were delivered to the farm store.') },
      { id: 'f2', text: T('Щоб заощадити прохід техніки, їх змішали за добу до внесення.', 'To save a machine pass they were mixed the day before application.'), errorId: 'e1' },
      { id: 'f3', text: T('Суміш лежала в закритому приміщенні.', 'The mixture lay in a closed room.') },
      { id: 'f4', text: T('Під час внесення відчувався різкий запах.', 'A sharp smell was noticed during application.') },
    ],
    errors: [{
      id: 'e1',
      mechanism: {
        options: [
          T('Ca(OH)₂ витісняє NH₃ із солі амонію: 2NH₄NO₃ + Ca(OH)₂ → Ca(NO₃)₂ + 2NH₃↑ + 2H₂O — азот втрачається.', 'Ca(OH)₂ displaces NH₃ from the ammonium salt: 2NH₄NO₃ + Ca(OH)₂ → Ca(NO₃)₂ + 2NH₃↑ + 2H₂O — nitrogen is lost.'),
          T('Гашене вапно окиснює аміачну селітру до оксидів азоту.', 'Slaked lime oxidises ammonium nitrate to nitrogen oxides.'),
          T('Аміачна селітра виділяє хлор у лужному середовищі.', 'Ammonium nitrate releases chlorine in an alkaline medium.'),
        ], correct: 0,
      },
      alternative: {
        options: [
          T('Вносити окремо: розділити вапнування й азотне добриво в часі чи проходах.', 'Apply separately: separate liming and nitrogen fertilizer in time or passes.'),
          T('Замінити гашене вапно негашеним.', 'Replace slaked lime with quicklime.'),
          T('Додати ще вапна, щоб зв’язати запах.', 'Add more lime to bind the smell.'),
        ], correct: 0,
      },
    }],
    explanation: T('Лужні матеріали перетворюють NH₄⁺ на летючий NH₃. Тому амонійні добрива не змішують із гашеним і негашеним вапном та шлаками; вапняк у цьому разі — слабка основа, змішування можливе лише за певних умов.', 'Alkaline materials convert NH₄⁺ to volatile NH₃. Therefore ammonium fertilizers are not mixed with slaked or quicklime and slags; limestone is a weak base, and mixing is possible only under certain conditions.'),
    sourceIds: ['eagri-lec15'],
  },
  {
    id: 'ca-sulfate-tank', level: 'intermediate', title: T('Кальцієва селітра й сульфат у маточному розчині', 'Calcium nitrate and sulfate in a stock solution'),
    fragments: [
      { id: 'f1', text: T('Для фертигації приготували один концентрований маточний розчин.', 'One concentrated stock solution was prepared for fertigation.') },
      { id: 'f2', text: T('У нього додали кальцієву селітру та сульфат калію.', 'Calcium nitrate and potassium sulfate were added to it.'), errorId: 'e1' },
      { id: 'f3', text: T('Через годину розчин помутнів, випав білий осад і забилися фільтри.', 'After an hour the solution turned cloudy, a white precipitate formed and filters clogged.') },
    ],
    errors: [{
      id: 'e1',
      mechanism: {
        options: [
          T('Ca²⁺ + SO₄²⁻ → CaSO₄·2H₂O↓: гіпс малорозчинний і випадає в осад.', 'Ca²⁺ + SO₄²⁻ → CaSO₄·2H₂O↓: gypsum is sparingly soluble and precipitates.'),
          T('Кальцієва селітра розкладається з виділенням NH₃.', 'Calcium nitrate decomposes releasing NH₃.'),
          T('Сульфат калію утворює з нітратом нерозчинний KNO₃.', 'Potassium sulfate forms insoluble KNO₃ with nitrate.'),
        ], correct: 0,
      },
      alternative: {
        options: [
          T('Окремі маточні розчини: кальцієва селітра окремо від сульфатів і фосфатів.', 'Separate stock solutions: calcium nitrate apart from sulfates and phosphates.'),
          T('Підкислити розчин, щоб розчинити гіпс.', 'Acidify the solution to dissolve gypsum.'),
          T('Нагріти розчин для кращого розчинення.', 'Heat the solution for better dissolution.'),
        ], correct: 0,
      },
    }],
    explanation: T('Кальцієва селітра не сумісна в концентрованих розчинах із сульфатами й фосфатами: утворюються малорозчинні гіпс і кальцієві фосфати. Тому застосовують окремі баки (A і B).', 'Calcium nitrate is not compatible in concentrated solutions with sulfates and phosphates: sparingly soluble gypsum and calcium phosphates form. Therefore separate tanks (A and B) are used.'),
    sourceIds: ['royal-brinkman-ca', 'haifa-mkp'],
  },
  {
    id: 'urea-an-store', level: 'intermediate', title: T('Карбамід і селітра в одній купі', 'Urea and ammonium nitrate in one heap'),
    fragments: [
      { id: 'f1', text: T('Влітку закупили гранульовані карбамід і аміачну селітру.', 'In summer granulated urea and ammonium nitrate were purchased.') },
      { id: 'f2', text: T('Для економії місця їх висипали в одну купу й перемішали.', 'To save space they were poured into one heap and mixed.'), errorId: 'e1' },
      { id: 'f3', text: T('Через три тижні, коли вологість повітря зросла, суміш перетворилася на липку масу.', 'Three weeks later, when air humidity rose, the mixture turned into a sticky mass.') },
    ],
    errors: [{
      id: 'e1',
      mechanism: {
        options: [
          T('Суміш має знижену критичну відносну вологість: вона поглинає вологу з повітря й перетворюється на кашу.', 'The mixture has a lowered critical relative humidity: it absorbs moisture from the air and turns to slush.'),
          T('Карбамід і селітра утворюють нерозчинний осад.', 'Urea and ammonium nitrate form an insoluble precipitate.'),
          T('Селітра окиснює карбамід із виділенням хлору.', 'Ammonium nitrate oxidises urea releasing chlorine.'),
        ], correct: 0,
      },
      alternative: {
        options: [
          T('Зберігати окремо; за потреби використати їхній водний розчин (КАС).', 'Store separately; if needed use their aqueous solution (UAN).'),
          T('Додати гашене вапно як осушувач.', 'Add slaked lime as a desiccant.'),
          T('Додати суперфосфат для зв’язування вологи.', 'Add superphosphate to bind moisture.'),
        ], correct: 0,
      },
    }],
    explanation: T('Сухі карбамід і аміачна селітра в суміші несумісні через зниження критичної відносної вологості (злежування, «каша»); у водному розчині вони сумісні — це КАС.', 'Dry urea and ammonium nitrate in a blend are incompatible because of the lowered critical relative humidity (caking, slush); in aqueous solution they are compatible — this is UAN.'),
    sourceIds: ['incitec-blends', 'unl-passel-n', 'uk-forages-uan'],
  },
  {
    id: 'urea-ssp', level: 'intermediate', title: T('Карбамід із суперфосфатом у мішках', 'Urea with superphosphate in bags'),
    fragments: [
      { id: 'f1', text: T('Перед сівбою господарство отримало карбамід і простий суперфосфат.', 'Before sowing the farm received urea and single superphosphate.') },
      { id: 'f2', text: T('Їх змішали за тиждень до внесення й залишили в мішках.', 'They were mixed a week before application and left in bags.'), errorId: 'e1' },
      { id: 'f3', text: T('Суміш злежалася, мішки відсиріли.', 'The mixture caked and the bags became damp.') },
    ],
    errors: [{
      id: 'e1',
      mechanism: {
        options: [
          T('Кислі фосфати та вільна кислота суперфосфату взаємодіють із карбамідом (липкі сполуки, вивільнення води) — злежування.', 'Acidic phosphates and free acid of superphosphate interact with urea (sticky compounds, release of water) — caking.'),
          T('Суперфосфат лужний і розкладає карбамід до нітратів.', 'Superphosphate is alkaline and decomposes urea into nitrates.'),
          T('Карбамід осаджує фосфат у вигляді Ca₃(PO₄)₂.', 'Urea precipitates phosphate as Ca₃(PO₄)₂.'),
        ], correct: 0,
      },
      alternative: {
        options: [
          T('Не змішувати заздалегідь: вносити добрива окремо.', 'Do not pre-mix: apply the fertilizers separately.'),
          T('Додати вапняк, щоб нейтралізувати суперфосфат.', 'Add limestone to neutralise the superphosphate.'),
          T('Змішати з аміачною селітрою для зв’язування вологи.', 'Mix with ammonium nitrate to bind moisture.'),
        ], correct: 0,
      },
    }],
    explanation: T('Карбамід із простим суперфосфатом змішувати не рекомендують (злежування). Вапняк також не підходить: він нейтралізує кислі фосфати, переводячи водорозчинний P₂O₅ у малорозчинні форми.', 'Mixing urea with single superphosphate is not recommended (caking). Limestone is not suitable either: it neutralises the acid phosphates, converting water-soluble P₂O₅ into poorly soluble forms.'),
    sourceIds: ['eagri-lec15', 'ravensdown-urea', 'yara-physical'],
  },
  {
    id: 'kcl-sensitive', level: 'intermediate', title: T('KCl для культури, чутливої до хлору', 'KCl for a chloride-sensitive crop'),
    fragments: [
      { id: 'f1', text: T('Технологічна карта позначає культуру як чутливу до хлору.', 'The technology card marks the crop as chloride-sensitive.') },
      { id: 'f2', text: T('Для калійного живлення обрали хлорид калію як найпоширеніше добриво.', 'Potassium chloride was chosen for potassium nutrition as the most common fertilizer.'), errorId: 'e1' },
      { id: 'f3', text: T('Через тиждень на краях листків з’явилися опіки.', 'A week later scorching appeared on leaf margins.') },
    ],
    errors: [{
      id: 'e1',
      mechanism: {
        options: [
          T('KCl вносить значну кількість Cl⁻, шкідливу для чутливих культур.', 'KCl supplies a considerable amount of Cl⁻, harmful to sensitive crops.'),
          T('KCl підлужує ґрунт.', 'KCl alkalises the soil.'),
          T('KCl містить нітратний азот.', 'KCl contains nitrate nitrogen.'),
        ], correct: 0,
      },
      alternative: {
        options: [
          T('Безхлорне джерело K: сульфат калію або калімагнезія.', 'A chloride-free K source: potassium sulfate or kali-magnesia.'),
          T('Калійна сіль 40 % — у ній менше хлору.', 'Potassium salt 40 % — it has less chlorine.'),
          T('Сильвініт — природний продукт без хлору.', 'Sylvinite — a natural product without chlorine.'),
        ], correct: 0,
      },
    }],
    explanation: T('Хлорид калію, калійна сіль і сильвініт містять хлор (калійна сіль і сильвініт — ще й натрій). Для чутливих культур обирають безхлорні форми: сульфат калію, калімагнезія.', 'Potassium chloride, potassium salt and sylvinite contain chlorine (potassium salt and sylvinite also sodium). For sensitive crops chloride-free forms are chosen: potassium sulfate, kali-magnesia.'),
    sourceIds: ['ipni-kcl', 'va-dcr', 'ks-patentkali', 'ksu-chloride'],
  },
  {
    id: 'slag-as', level: 'advanced', title: T('Томасшлак і сульфат амонію разом', 'Thomas slag and ammonium sulfate together'),
    fragments: [
      { id: 'f1', text: T('Томасшлак вирішили внести як основне фосфорне добриво під оранку.', 'Thomas slag was chosen as the basic phosphorus fertilizer before ploughing.') },
      { id: 'f2', text: T('У той самий день по полю розсіяли суміш томасшлаку із сульфатом амонію для економії проходів.', 'The same day a mixture of Thomas slag and ammonium sulfate was spread over the field to save passes.'), errorId: 'e1' },
      { id: 'f3', text: T('Азотна складова виявилася нижчою за очікувану.', 'The nitrogen component turned out lower than expected.') },
    ],
    errors: [{
      id: 'e1',
      mechanism: {
        options: [
          T('Фосфатшлак сильнолужний: OH⁻ перетворює NH₄⁺ на NH₃, азот втрачається.', 'Phosphate slag is strongly alkaline: OH⁻ converts NH₄⁺ to NH₃ and nitrogen is lost.'),
          T('Томасшлак зв’язує сульфат у нерозчинний барит.', 'Thomas slag binds sulfate into insoluble barite.'),
          T('Сульфат амонію розчиняє шлак до фосфорної кислоти.', 'Ammonium sulfate dissolves the slag to phosphoric acid.'),
        ], correct: 0,
      },
      alternative: {
        options: [
          T('Вносити окремо; врахувати вапнувальний ефект шлаку.', 'Apply separately; take the liming effect of the slag into account.'),
          T('Замінити сульфат амонію карбамідом — він із лужним шлаком цілком сумісний.', 'Replace ammonium sulfate with urea — it is fully compatible with alkaline slag.'),
          T('Замінити шлак фосфоритним борошном на тому ж полі з pH 7,8.', 'Replace the slag with ground phosphate rock on the same field with pH 7.8.'),
        ], correct: 0,
      },
    }],
    explanation: T('Фосфатшлаки несумісні з амонійними добривами та карбамідом (втрати NH₃; в лужному середовищі амідний азот теж гідролізується). Вносять їх як основне добриво окремо.', 'Phosphate slags are incompatible with ammonium fertilizers and urea (NH₃ loss; in an alkaline medium amide nitrogen also hydrolyses). They are applied separately as a basic fertilizer.'),
    sourceIds: ['eagri-lec15'],
  },
  {
    id: 'rp-lime', level: 'advanced', title: T('Фосфорит після вапнування до pH 7', 'Phosphate rock after liming to pH 7'),
    fragments: [
      { id: 'f1', text: T('На ґрунті з pH 5,2 вирішили покращити фосфорне живлення фосфоритним борошном.', 'On a soil with pH 5.2 it was decided to improve phosphorus nutrition with ground phosphate rock.') },
      { id: 'f2', text: T('Перед внесенням ґрунт повністю прововапнували до pH 7,0.', 'Before application the soil was fully limed to pH 7.0.'), errorId: 'e1' },
      { id: 'f3', text: T('Ефект фосфориту виявився слабким.', 'The effect of the phosphate rock turned out weak.') },
    ],
    errors: [{
      id: 'e1',
      mechanism: {
        options: [
          T('Фосфорит розчиняється за рахунок кислотності; підвищення pH до 7 різко знижує розчинення.', 'Phosphate rock dissolves through acidity; raising pH to 7 sharply reduces dissolution.'),
          T('Вапно перетворює фосфорит на нерозчинний сульфат.', 'Lime converts phosphate rock into an insoluble sulfate.'),
          T('Вапно підкислює ґрунт, тому фосфор зв’язується.', 'Lime acidifies the soil, so phosphorus is bound.'),
        ], correct: 0,
      },
      alternative: {
        options: [
          T('Не поєднувати: або фосфорит на кислому ґрунті, або вапнування з водорозчинним P-добривом.', 'Do not combine: either phosphate rock on acid soil, or liming together with a water-soluble P fertilizer.'),
          T('Збільшити вапнування до pH 8.', 'Increase liming to pH 8.'),
          T('Додати сульфат амонію разом із вапном.', 'Add ammonium sulfate together with lime.'),
        ], correct: 0,
      },
    }],
    explanation: T('Фосфорит ефективний на кислих ґрунтах (pH ≤ 5,5), а вапнування до нейтральної реакції гасить його розчинення. Поєднувати треба обережно: або кислий ґрунт + фосфорит, або вапнування + водорозчинний фосфат.', 'Phosphate rock is effective on acid soils (pH ≤ 5.5), and liming to a neutral reaction suppresses its dissolution. The combination must be treated carefully: either acid soil + phosphate rock, or liming + water-soluble phosphate.'),
    sourceIds: ['fao-bulletin13', 'unl-passel-p'],
  },
  {
    id: 'nitrate-autumn', level: 'advanced', title: T('Осіння нітратна селітра на піску', 'Autumn nitrate on sand'),
    fragments: [
      { id: 'f1', text: T('У жовтні на піщаному ґрунті під озиму культуру внесли кальцієву селітру як основне азотне добриво на весь сезон.', 'In October on a sandy soil, calcium nitrate was applied for the winter crop as the basic nitrogen fertilizer for the whole season.'), errorId: 'e1' },
      { id: 'f2', text: T('Зима була дощовою.', 'The winter was rainy.') },
      { id: 'f3', text: T('Навесні рослини блідо-зелені, нижні листки жовтіють.', 'In spring the plants are pale green and lower leaves are yellowing.') },
    ],
    errors: [{
      id: 'e1',
      mechanism: {
        options: [
          T('NO₃⁻ — аніон: ґрунтовий вбирний комплекс його не затримує, на піску він вимивається.', 'NO₃⁻ is an anion: the soil exchange complex does not hold it and on sand it leaches.'),
          T('Кальцієва селітра підкислює ґрунт і блокує азот.', 'Calcium nitrate acidifies the soil and blocks nitrogen.'),
          T('Ca²⁺ витісняє NO₃⁻ з ґрунтового розчину.', 'Ca²⁺ displaces NO₃⁻ from the soil solution.'),
        ], correct: 0,
      },
      alternative: {
        options: [
          T('Не вносити весь азот восени нітратною формою: розподілити внесення за сезоном або використати амонійну форму.', 'Do not apply all nitrogen in autumn in nitrate form: distribute it through the season or use an ammonium form.'),
          T('Збільшити осінню кількість того самого добрива.', 'Increase the autumn amount of the same fertilizer.'),
          T('Додати хлорид калію, щоб зв’язати нітрат.', 'Add potassium chloride to bind nitrate.'),
        ], correct: 0,
      },
    }],
    explanation: T('Нітратна форма азоту рухлива й вимивається з легких ґрунтів дощами. Амонійна форма утримується ґрунтовим вбирним комплексом (поки не нітрифікує). Порівняйте з лабораторією «Ґрунтова колонка».', 'The nitrate form of nitrogen is mobile and leaches from light soils with rain. The ammonium form is held by the soil exchange complex (until nitrified). Compare with the “Soil column” laboratory.'),
    sourceIds: ['va-dcr-p', 'usda-nrcs-an', 'isu-nh3', 'pioneer-k'],
  },
];
