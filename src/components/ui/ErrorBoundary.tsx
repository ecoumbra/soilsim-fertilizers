import { Component, type ReactNode } from 'react';
import { useI18n } from '../../i18n';

interface Props { children: ReactNode; fallback: ReactNode }
interface State { failed: boolean }

/** Перехоплює помилки відображення в межах вкладки; збережені результати (localStorage) не зачіпаються. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    console.error(error);
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function ErrorFallback() {
  const { t } = useI18n();
  return (
    <div role="alert" className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm">
      <p>{t('app.error')}</p>
      <button type="button" onClick={() => window.location.reload()} className="mt-3 rounded-lg border border-border bg-card px-3 py-1.5 hover:bg-muted">
        {t('app.reload')}
      </button>
    </div>
  );
}
