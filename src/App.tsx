import { Suspense, lazy, useRef, useState, type KeyboardEvent } from 'react';
import { BookOpen, Calculator, ClipboardCheck, FlaskConical, Info, Languages, Moon, Sun, X } from 'lucide-react';
import { I18nProvider, useI18n } from './i18n';
import { useHashRoute } from './hooks/useHashRoute';
import { useTheme } from './hooks/useTheme';
import { ErrorBoundary, ErrorFallback } from './components/ui/ErrorBoundary';
import TheoryTab from './modules/theory/TheoryTab';

// важкі вкладки завантажуються за потреби
const LabTab = lazy(() => import('./modules/laboratory/LabTab'));
const CalculatorTab = lazy(() => import('./modules/calculator/CalculatorTab'));
const PracticumTab = lazy(() => import('./modules/practicum/PracticumTab'));

const TABS = [
  { id: 'theory', icon: BookOpen, key: 'tab.theory' },
  { id: 'lab', icon: FlaskConical, key: 'tab.lab' },
  { id: 'calc', icon: Calculator, key: 'tab.calc' },
  { id: 'practicum', icon: ClipboardCheck, key: 'tab.practicum' },
] as const;
type TabId = (typeof TABS)[number]['id'];

function Shell() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const { parts, navigate } = useHashRoute();
  const [aboutOpen, setAboutOpen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mainRef = useRef<HTMLElement | null>(null);

  const tab: TabId = (TABS.map((x) => x.id) as readonly string[]).includes(parts[0]) ? (parts[0] as TabId) : 'theory';

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    navigate(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  const heroBtn =
    'inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-sm font-medium hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault(); // hash використовується для маршрутизації вкладок
          mainRef.current?.focus();
        }}
        className="sr-only z-50 rounded-lg bg-card px-3 py-2 text-sm shadow-soft focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        {t('app.skip')}
      </a>

      <header className="bg-hero on-hero shadow-soft no-print">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('app.title')}</h1>
              <p className="mt-1 text-lg opacity-95">{t('app.subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={heroBtn} onClick={() => setLang(lang === 'uk' ? 'en' : 'uk')} aria-label={t('header.langSwitchLabel')}>
                <Languages size={16} /> {t('header.langSwitch')}
              </button>
              <button type="button" className={heroBtn} onClick={toggle}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark')}
              </button>
              <button type="button" className={heroBtn} onClick={() => setAboutOpen((v) => !v)} aria-expanded={aboutOpen}>
                <Info size={16} /> {t('header.about')}
              </button>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm opacity-90">{t('app.description')}</p>
        </div>
      </header>

      {aboutOpen && (
        <section className="fade-in border-b border-border bg-card no-print">
          <div className="mx-auto flex max-w-6xl items-start justify-between gap-4 px-4 py-4 text-sm sm:px-6">
            <div className="space-y-2">
              <h2 className="text-base font-semibold">{t('about.title')}</h2>
              <p>{t('about.body')}</p>
              <p className="text-muted-foreground">{t('about.credit')}</p>
              <p className="text-muted-foreground">{t('about.privacy')}</p>
            </div>
            <button type="button" onClick={() => setAboutOpen(false)} aria-label={t('about.close')} className="rounded-lg border border-border p-1.5 hover:bg-muted">
              <X size={16} />
            </button>
          </div>
        </section>
      )}

      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur no-print">
        <div role="tablist" aria-label={t('app.title')} className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
          {TABS.map((x, i) => {
            const Icon = x.icon;
            const active = tab === x.id;
            return (
              <button
                key={x.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${x.id}`}
                aria-selected={active}
                aria-controls={`panel-${x.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => navigate(x.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={16} /> {t(x.key)}
              </button>
            );
          })}
        </div>
      </div>

      <main
        id={`panel-${tab}`}
        ref={mainRef}
        tabIndex={-1}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="mx-auto max-w-6xl px-4 py-6 outline-none sm:px-6"
      >
        <ErrorBoundary key={tab} fallback={<ErrorFallback />}>
          <Suspense fallback={<p role="status" className="py-8 text-center text-muted-foreground">{t('app.loading')}</p>}>
            {tab === 'theory' && <TheoryTab />}
            {tab === 'lab' && <LabTab />}
            {tab === 'calc' && <CalculatorTab />}
            {tab === 'practicum' && <PracticumTab />}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  );
}
