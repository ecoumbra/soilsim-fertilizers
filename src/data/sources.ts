import type { Source } from './types';

const ACCESSED = '2026-11-13';

/** Реєстр джерел. Усі записи отримано пошуком у мережі; назви, яких не вдалося підтвердити, позначено в note. */
export const SOURCES: Record<string, Source> = {
  'msu-n-sources': {
    id: 'msu-n-sources', type: 'extension', accessed: ACCESSED,
    title: 'More on alternative sources of nitrogen (table “Soil reaction of common nitrogen fertilizer sources”, after the Western Fertilizer Handbook)',
    publisher: 'Michigan State University Extension',
    url: 'https://www.canr.msu.edu/news/more_on_alternative_sources_of_nitrogen',
  },
  'unl-g1503': {
    id: 'unl-g1503', type: 'extension', accessed: ACCESSED,
    title: 'Management Strategies to Reduce the Rate of Soil Acidification (G1503, revised June 2015)',
    publisher: 'University of Nebraska–Lincoln Extension',
    url: 'https://extensionpubs.unl.edu/publication/g1503/na/pdf/view',
  },
  'unl-passel-n': {
    id: 'unl-passel-n', type: 'extension', accessed: ACCESSED,
    title: 'Nitrogen Fertilizers (PASSEL lesson)',
    publisher: 'University of Nebraska–Lincoln (PASSEL)',
    url: 'https://passel2.unl.edu/view/lesson/d01bf6ce5f62/1',
  },
  'nsw-dpi-n': {
    id: 'nsw-dpi-n', type: 'institutional', accessed: ACCESSED,
    title: 'Don’t let nitrogen acidify your soil',
    publisher: 'NSW Department of Primary Industries (Australia)',
    url: 'https://www.dpi.nsw.gov.au/agriculture/soils/guides/soil-acidity/n-acidify',
  },
  'pmc-urease': {
    id: 'pmc-urease', type: 'research', accessed: ACCESSED,
    title: 'Review on urease inhibitors (NBPT, NPPT) and ammonia volatilization from urea-based fertilizers',
    publisher: 'PubMed Central, PMC6077139',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6077139',
    note: {
      uk: 'Точну назву й авторів не вдалося отримати (сторінка закрита капчею) — опис змісту за знайденим фрагментом.',
      en: 'The exact title and authors could not be retrieved (page blocked by a captcha) — content description is based on the retrieved excerpt.',
    },
  },
  'purdue-urea': {
    id: 'purdue-urea', type: 'extension', accessed: ACCESSED,
    title: 'Improving the efficient use of urea-containing fertilizers',
    publisher: 'Purdue University, Agronomy Extension',
    url: 'https://WWW.AG.PURDUE.EDU/AGRY/agry-extension/_docs/soil-fertility/improving-the-efficient-use-of-urea-containing-fertilizers.pdf',
  },
  'isu-nh3': {
    id: 'isu-nh3', type: 'extension', accessed: ACCESSED,
    title: 'Anhydrous Ammonia Application in Dry Soil (content author: John Sawyer)',
    publisher: 'Iowa State University Extension and Outreach',
    url: 'https://crops.extension.iastate.edu/post/anhydrous-ammonia-application-dry-soil',
  },
  'slu-can': {
    id: 'slu-can', type: 'research', accessed: ACCESSED,
    title: 'Study of hygroscopicity and dissolution of calcium ammonium nitrate and ammonium nitrate fertilizers',
    publisher: 'Swedish University of Agricultural Sciences (SLU), Epsilon archive, document 20364486',
    url: 'https://pub.epsilon.slu.se/id/document/20364486',
    note: {
      uk: 'Точну назву й видання не вдалося отримати — опис змісту за знайденим фрагментом (розділ «Material and methods», дані Lide 2004).',
      en: 'The exact title and journal could not be retrieved — content description is based on the retrieved excerpt (“Material and methods” section, data from Lide 2004).',
    },
  },
  'nptel-ca-nitrate': {
    id: 'nptel-ca-nitrate', type: 'lecture', accessed: ACCESSED,
    title: 'Lecture 11: Calcium Nitrate (fertilizer technology course)',
    publisher: 'NPTEL (India)',
    url: 'https://archive.nptel.ac.in/content/storage2/courses/103107086/module2/lecture8/lecture8.pdf',
  },
  'royal-brinkman-ca': {
    id: 'royal-brinkman-ca', type: 'manufacturer', accessed: ACCESSED,
    title: 'Calcium nitrate (DUCANIT), product page',
    publisher: 'Royal Brinkman (distributor)',
    url: 'https://royalbrinkman.com/crop-care/fertilizers/water-soluble/singular/calcium-nitrate-25kg-bag-1200kg-plt-150011353',
  },
  'uk-forages-uan': {
    id: 'uk-forages-uan', type: 'extension', accessed: ACCESSED,
    title: 'Forage News, 3 March 2021 (nitrogen sources: urea, UAN, ammonium nitrate)',
    publisher: 'University of Kentucky, Forage Extension',
    url: 'https://forages.ca.uky.edu/files/3_march_2021_final.pdf',
  },
  'uralchem-an': {
    id: 'uralchem-an', type: 'manufacturer', accessed: ACCESSED,
    title: 'Ammonium nitrate — product specification',
    publisher: 'UralChem',
    url: 'https://agro.uralchem.com/upload/iblock/24e/tyg47sb2u75ckoig3893sh1e9gtd40la.pdf',
  },
  'acron-an': {
    id: 'acron-an', type: 'manufacturer', accessed: ACCESSED,
    title: 'Ammonium nitrate, agricultural grade — product specification',
    publisher: 'Acron',
    url: 'https://market.acron.ru/upload/iblock/351/eebb2ozln0dw4sdsewcxaeeihg8fr9my.pdf',
  },
  'usda-nrcs-an': {
    id: 'usda-nrcs-an', type: 'institutional', accessed: ACCESSED,
    title: 'Ammonium Nitrate (nitrogen source fact sheet)',
    publisher: 'USDA NRCS (Arizona eFOTG)',
    url: 'https://efotg.sc.egov.usda.gov/references/Public/AZ/Ammonium_Nitrate.pdf',
  },
  'cru-nitrate': {
    id: 'cru-nitrate', type: 'industry', accessed: ACCESSED,
    title: 'High performance nitrate based fertilizers (CRU Insight, 31 July 2021)',
    publisher: 'CRU Group',
    url: 'https://bcinsight.crugroup.com/2021/07/31/high-performance-nitrate-based-fertilizers',
  },
  'wisc-phosphorus': {
    id: 'wisc-phosphorus', type: 'lecture', accessed: ACCESSED,
    title: 'Soil Science 326 — Essential Elements for Plant Growth: phosphorus fertilizers',
    publisher: 'University of Wisconsin–Madison, Soil Science',
    url: 'https://soilsfacstaff.cals.wisc.edu/facstaff/barak/soilscience326/phosphorus.htm',
  },
  'fao-bulletin13': {
    id: 'fao-bulletin13', type: 'institutional', accessed: ACCESSED,
    title: 'Use of phosphate rocks for sustainable agriculture (FAO Fertilizer and Plant Nutrition Bulletin 13, 2004)',
    publisher: 'FAO',
    url: 'https://www.fao.org/4/y5053e/y5053e0a.htm',
  },
  'isij-slag': {
    id: 'isij-slag', type: 'research', accessed: ACCESSED,
    title: 'ISIJ International 54(12): citric acid solubility of phosphorus in P-bearing steelmaking slag used as slag phosphate fertilizer',
    publisher: 'ISIJ International (J-STAGE)',
    url: 'https://www.jstage.jst.go.jp/article/isijinternational/54/12/54_2746/_html/-char/en',
    note: {
      uk: 'Назву подано за змістом знайденого фрагмента; точну назву статті не підтверджено.',
      en: 'The title is given by content of the retrieved excerpt; the exact article title is not confirmed.',
    },
  },
  'echa-eu-fert': {
    id: 'echa-eu-fert', type: 'regulation', accessed: ACCESSED,
    title: 'EU fertilisers list, Annex I A: “Basic slag — Thomas phosphates — Thomas slag”',
    publisher: 'ECHA (European Chemicals Agency)',
    url: 'https://echa.europa.eu/bg/fertilizer-list-ann-1-a-e-1/-/legislationlist/details/EU-FERTILISERS-ANX_I_A_B_C_D_E1_E2_4_G_II-100.300.974-VSK-8B0E7F',
  },
  'msstate-k': {
    id: 'msstate-k', type: 'extension', accessed: ACCESSED,
    title: 'Potassium sources (cotton production)',
    publisher: 'Mississippi State University Extension',
    url: 'https://extension.msstate.edu/agriculture/crops/cotton/potassium-sources',
  },
  'cornell-k': {
    id: 'cornell-k', type: 'lecture', accessed: ACCESSED,
    title: 'Certified Crop Adviser study resource: potassium sources (PO 28)',
    publisher: 'Cornell University (NRCCA)',
    url: 'https://nrcca.cals.cornell.edu/nutrient/CA4/CA0428.php',
  },
  'apni-k': {
    id: 'apni-k', type: 'lecture', accessed: ACCESSED,
    title: 'Potassium sources and fertilizer properties (presentation, file Mikkelsen01.pdf)',
    publisher: 'APNI (apni.net)',
    url: 'https://www.apni.net/wp-content/uploads/2020/05/Mikkelsen01.pdf',
  },
  'va-dcr': {
    id: 'va-dcr', type: 'institutional', accessed: ACCESSED,
    title: 'Commercial Fertilizer (Mid-Atlantic Nutrient Management Handbook, ch. 8; presentation)',
    publisher: 'Virginia Department of Conservation and Recreation',
    url: 'https://www.dcr.virginia.gov/soil-and-water/document/Commercial-Fertilizer.pdf',
  },
  'ks-patentkali': {
    id: 'ks-patentkali', type: 'manufacturer', accessed: ACCESSED,
    title: 'Patentkali leaflet: 30 % K₂O · 10 % MgO · 42.5 % SO₃ (= 17 % S)',
    publisher: 'K+S Minerals and Agriculture',
    url: 'https://www.kpluss.com/.downloads/agriculture-brochures/hu-patentkali-leaflet.pdf',
  },
  'haifa-mkp': {
    id: 'haifa-mkp', type: 'manufacturer', accessed: ACCESSED,
    title: 'Haifa MKP™ — Monopotassium phosphate 0-52-34, product page (solubility 0–40 °C)',
    publisher: 'Haifa Group',
    url: 'https://www.haifa-group.com/haifa-mkp™-mono-potassium-phosphate-0-52-34',
  },
  'uralchem-npk': {
    id: 'uralchem-npk', type: 'manufacturer', accessed: ACCESSED,
    title: 'Nitroammophoska NPK 16:16:16 — product specification',
    publisher: 'UralChem',
    url: 'https://agro.uralchem.com/catalog/fertilizers/nitroammofoska-npk-16-16-16/',
  },
  'incitec-blends': {
    id: 'incitec-blends', type: 'manufacturer', accessed: ACCESSED,
    title: 'Fact Sheet — Blends (fertiliser compatibility)',
    publisher: 'Incitec Pivot Fertilisers (Australia)',
    url: 'https://www.incitecpivotfertilisers.com.au:443/~/media/Files/IPF/Documents/Fact%20Sheets/38%20Blends%20Fact%20Sheet.pdf',
  },
  'ravensdown-urea': {
    id: 'ravensdown-urea', type: 'manufacturer', accessed: ACCESSED,
    title: 'Urea — product page (blending compatibility)',
    publisher: 'Ravensdown (New Zealand)',
    url: 'https://www.ravensdown.co.nz/products/fertiliser/urea',
  },
  'yara-physical': {
    id: 'yara-physical', type: 'manufacturer', accessed: ACCESSED,
    title: 'Physical Properties of Fertilizers (compatibility notes, citing EFMA guidance)',
    publisher: 'Yara Canada',
    url: 'https://yaracanada.ca/crop-nutrition/fertilizer-handling-and-safety/physical-properties-of-fertilizers',
  },
  'eagri-lec15': {
    id: 'eagri-lec15', type: 'lecture', accessed: ACCESSED,
    title: 'SSAC222, lecture 15: fertilizer mixtures (mixing and storage rules)',
    publisher: 'e-Agri course materials (eagriorg.github.io)',
    url: 'https://eagriorg.github.io/eagri50/SSAC222/lec15.pdf',
    note: {
      uk: 'Лекційний конспект; автора й установи не вдалося визначити.',
      en: 'Lecture notes; the author and institution could not be identified.',
    },
  },
  'fe-guidance': {
    id: 'fe-guidance', type: 'industry', accessed: ACCESSED,
    title: 'Guidance for compatibility of fertilizer blending materials (issue 2014)',
    publisher: 'Fertilizers Europe',
    url: 'https://www.fertilizerseurope.com/wp-content/uploads/2019/08/Guidance_for_compatibility2.pdf',
    note: {
      uk: 'Знайдено лише вступ: не всі матеріали сумісні між собою; деталі конкретних пар не переглядалися.',
      en: 'Only the introduction was retrieved: not all materials are compatible; details of specific pairs were not reviewed.',
    },
  },
  'merck-solubility': {
    id: 'merck-solubility', type: 'industry', accessed: ACCESSED,
    title: 'Solubility Table for Water at Temperature (128 inorganic compounds, g/100 g H₂O at 0, 20, 40, 60, 80, 100 °C)',
    publisher: 'MilliporeSigma (Merck KGaA)',
    url: 'https://www.sigmaaldrich.com/US/en/support/calculators-and-apps/solubility-table-compounds-water-temperature',
    note: {
      uk: 'Довідкова таблиця постачальника реактивів; значення стосуються чистих сполук. Стовпці температур прочитано як 0, 20, 40, 60, 80, 100 °C.',
      en: 'A reference table from a reagent supplier; values refer to pure compounds. Temperature columns were read as 0, 20, 40, 60, 80, 100 °C.',
    },
  },
  'incitec-urea': {
    id: 'incitec-urea', type: 'manufacturer', accessed: ACCESSED,
    title: 'Agritopic: Urea (Table 1: urea solubility, kg per 100 kg water, 10–40 °C)',
    publisher: 'Incitec Pivot Fertilisers (Australia)',
    url: 'https://incitecpivotfertilisers.com.au/siteassets/assets/documents/agritopics/18347---agritopic---urea.pdf',
  },
  'unl-passel-p': {
    id: 'unl-passel-p', type: 'extension', accessed: ACCESSED,
    title: 'The Soil Phosphorus Problem (PASSEL lesson)',
    publisher: 'University of Nebraska–Lincoln (PASSEL)',
    url: 'https://passel2.unl.edu/view/lesson/0718261a1c9d/3',
  },
  'va-dcr-p': {
    id: 'va-dcr-p', type: 'institutional', accessed: ACCESSED,
    title: 'Soil fertility: nutrient forms, mobility and phosphorus availability vs. soil pH (Mid-Atlantic Nutrient Management Handbook presentation)',
    publisher: 'Virginia Department of Conservation and Recreation',
    url: 'https://dcr.am.virginia.gov/soil-and-water/document/nmtmscbsf.pdf',
  },
  'umn-p': {
    id: 'umn-p', type: 'extension', accessed: ACCESSED,
    title: 'Understanding phosphorus in Minnesota soils',
    publisher: 'University of Minnesota Extension',
    url: 'https://extension.umn.edu/phosphorus-and-potassium/understanding-phosphorus-minnesota-soils',
  },
  'mu-g9180': {
    id: 'mu-g9180', type: 'extension', accessed: ACCESSED,
    title: 'G9180 Phosphorus in Missouri Soils (revised October 1993)',
    publisher: 'University of Missouri Extension',
    url: 'https://extension.missouri.edu/publications/g9180',
  },
  'omex-p': {
    id: 'omex-p', type: 'manufacturer', accessed: ACCESSED,
    title: 'Preventing Nitrogen and Phosphorus Leaching (H₂PO₄⁻ : HPO₄²⁻ ratios at pH 6.2, 7.2, 8.2)',
    publisher: 'OMEX Canada (company blog)',
    url: 'https://omexcanada.com/blog/preventing-nitrogen-and-phosphorus-leaching',
  },
  'ipni-kcl': {
    id: 'ipni-kcl', type: 'institutional', accessed: ACCESSED,
    title: 'Potassium chloride (Nutrient Source Specifics No. 3)',
    publisher: 'International Plant Nutrition Institute (IPNI)',
    url: 'https://www.cropnutrition.com/resource-library/potassium-chloride/',
  },
  'alberta-cec': {
    id: 'alberta-cec', type: 'institutional', accessed: ACCESSED,
    title: 'Basic Soil-Plant Interactions, chapter 2.2 (cation exchange; adsorption strength series)',
    publisher: 'Alberta Agriculture (Canada)',
    url: 'https://www1.agriculture.alberta.ca/$department/deptdocs.nsf/all/epw11920/$FILE/2-2.pdf',
  },
  'ksu-chloride': {
    id: 'ksu-chloride', type: 'extension', accessed: ACCESSED,
    title: 'Chloride in Kansas: plant, soil, and fertilizer considerations (MF2570)',
    publisher: 'Kansas State University Research and Extension',
    url: 'https://bookstore.ksre.ksu.edu/download/chloride-in-kansas-plant-soil-and-fertilizer-considerations_MF2570',
  },
  'pioneer-k': {
    id: 'pioneer-k', type: 'manufacturer', accessed: ACCESSED,
    title: 'Potassium Behavior in Soil (2017): nutrient mobility table; K leaching on low-CEC sandy soils',
    publisher: 'Pioneer / Corteva (file hosted at intelseed.ca)',
    url: 'https://www.intelseed.ca/uploads/Potassium_Behavior_in_Soil-2017.pdf',
  },
  'uga-b1569': {
    id: 'uga-b1569', type: 'extension', accessed: ACCESSED,
    title: 'Publication B1569: recognising nutrient deficiencies (N, P, K, Mg, S, Ca, Mn symptoms and remedies)',
    publisher: 'University of Georgia Extension (fieldreport.caes.uga.edu)',
    url: 'https://fieldreport.caes.uga.edu/publications/B1569/',
    note: {
      uk: 'Точну назву публікації не підтверджено — опис за змістом знайденого фрагмента.',
      en: 'The exact title of the publication is not confirmed — the description is based on the retrieved excerpt.',
    },
  },
  'ifas-ag462': {
    id: 'ifas-ag462', type: 'extension', accessed: ACCESSED,
    title: 'AG462: plant essential nutrients, their benefits and deficiency symptoms (mobility of nutrients in the plant)',
    publisher: 'University of Florida IFAS Extension',
    url: 'https://ask.ifas.ufl.edu/publication/AG462',
    note: {
      uk: 'Точну назву не підтверджено; цитується лише твердження про азот (дефіцит проявляється на старих листках, бо азот рухливий).',
      en: 'The exact title is not confirmed; only the statement on nitrogen is used (deficiency appears on older leaves because nitrogen is mobile).',
    },
  },
  'uconn-nutdef': {
    id: 'uconn-nutdef', type: 'extension', accessed: ACCESSED,
    title: 'Nutrient Deficiency (mobile vs. immobile nutrients; P purpling; K and N deficiency can be confused)',
    publisher: 'University of Connecticut, CAHNR (homegarden.cahnr.uconn.edu)',
    url: 'https://homegarden.cahnr.uconn.edu/tag/nutrient-deficiency',
  },
  'msu-mobility': {
    id: 'msu-mobility', type: 'extension', accessed: ACCESSED,
    title: 'Knowing nutrient mobility is helpful in diagnosing plant nutrient deficiencies',
    publisher: 'Michigan State University Extension',
    url: 'https://www.canr.msu.edu/news/knowing_nutrient_mobility_is_helpful_in_diagnosing_plant_nutrient_deficienc',
  },
};

export function getSource(id: string): Source | undefined {
  return SOURCES[id];
}
