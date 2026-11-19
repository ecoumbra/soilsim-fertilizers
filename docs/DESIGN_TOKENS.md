# Design Tokens — SoilSim: Добрива

Джерело: `reference/soilsim-ph/styles.css` (SoilSim-pH). Перенесено в `src/styles/index.css`.

## Що перенесено без змін
- Усі CSS-змінні `:root` (oklch): background, foreground, card, popover, primary, secondary, muted, accent, destructive, success, warning, earth, olive, border, input, ring, `--gradient-hero`, `--shadow-soft`, chart-1…5, sidebar-*.
- `--radius: 0.75rem` і шкала радіусів у `@theme inline`.
- Шрифти: IBM Plex Sans (sans), Lora (serif), IBM Plex Mono (mono).
- Компонентні класи: `.bg-hero`, `.shadow-soft`, `.formula`, `.term`, `.fade-in`, `.stir`, `@media print .no-print`.
- Темна тема через клас `.dark` та `@custom-variant dark`.

## Що змінено / додано (і чому)
| Зміна | Причина |
|---|---|
| Прибрано `@import "tailwindcss" source(none)` та `@source` | Tailwind v4 + `@tailwindcss/vite` знаходить джерела автоматично; файл лежить в `src/styles/`, а не поруч із `src/` |
| У `.dark` додано `--success`, `--warning`, `--earth`, `--olive`, `--gradient-hero`, `--shadow-soft`, `*-foreground` | У темній темі SoilSim-pH ці змінні відсутні; без них градієнт шапки, бейджі статусів і тіні не працюють у темній темі. Значення підібрано автором/агентом; шапку темної теми переведено на синю гаму за рішенням автора |
| `.on-hero` (світлий текст на градієнті) | У темній темі `--primary-foreground` темний → нечитабельно на шапці |
| `html { font-family }`, `h1–h3 { Lora }` | В оригіналі шрифти оголошені, але до елементів не застосовані |
| `prefers-reduced-motion` | Доступність |
| Темна тема: `--gradient-hero` змінено на синій (темно-синій → синій → блакитно-бірюзовий); `--olive` → бірюзовий, `--earth` → теплий пісочний | Рішення автора: зелений із темно-синім погано поєднуються; світла тема без змін |

## Зауваження
- Темна тема SoilSim-pH — стандартна холодна (синювата) палітра shadcn, що візуально відрізняється від «землистої» світлої. Збережено для єдності з оригіналом.
- Шрифти підключаються пакетами `@fontsource/*` (self-host, без CDN).
