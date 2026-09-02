# State of Space

Одностраничный сайт, переносится из Figma в код и публикуется на GitHub Pages.
Заготовка склонирована из `~/frontend-developer` (эталонного шаблона для
Figma-to-code вёрстки) — см. правила и договорённости там, если понадобится
общий контекст стека.

## Стек

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (подключён через `@tailwindcss/vite`, без `tailwind.config.js` —
  токены задаются в `src/index.css` через `@theme`)
- oxlint для линта (`npm run lint`), Prettier для форматирования (`npm run format`)

## Figma MCP

Подключение — `.mcp.json`, сервер `figma` на `http://127.0.0.1:3845/mcp` (Figma
Desktop Dev Mode MCP Server). Если Figma Desktop и Claude Code на разных
машинах — поднять реверс-туннель с машины с Figma (командой пользователь
управляет сам, на своей локальной машине):

```
autossh -M 0 -N -R 3845:127.0.0.1:3845 -p 2222 root@72.56.97.73 \
  -o "ServerAliveInterval 30" \
  -o "ServerAliveCountMax 3" \
  -o "ExitOnForwardFailure yes"
```

Перед работой с макетом: в Figma Desktop должен быть открыт файл и выделен
нужный фрейм/слой — MCP-инструменты (`get_code`, `get_image`, `get_variable_defs`,
`get_metadata`) читают именно текущее выделение.

## Договорённости по вёрстке

- Один компонент — один файл в `src/components/`, страница собирается в
  `src/pages/`.
- Цвета, отступы, типографику брать из переменных/токенов Figma
  (`get_variable_defs`), переносить их в `@theme` в `src/index.css`, а не
  прибивать значения руками в разметке.
- Изображения и иконки выгружать через `get_image`/экспорт из Figma, не через
  скриншоты вручную; складывать в `src/assets/`.
- Вёрстка — mobile-first, адаптив проверять на брейкпоинтах макета, если в
  Figma заданы несколько состояний/размеров фрейма.
- Семантичная разметка и доступность (alt, aria, правильные теги) — по
  умолчанию, не только когда попросили.
- Анимации задаются в макете через `anim`-токены в скобках в имени слоя
  (`Hero-title (anim: fade-up; delay: 100)`) — читать их и переносить в код, а
  не придумывать движение с нуля. Формат — `ANIMATION-TOKENS.md`, реализация —
  `src/lib/anim.tsx` + раздел «Анимации» в скилле `figma-to-code`.

## Структура

```
state-of-space/
  src/
    components/   переиспользуемые UI-компоненты
    pages/        сборка компонентов в страницу
    lib/          хелперы, хуки, утилиты
    assets/       изображения/иконки, выгруженные из Figma
  .claude/skills/figma-to-code/  скилл для переноса макета в код
  .mcp.json       подключение к Figma MCP
```

## GitHub Pages

Проектная страница (`https://<user>.github.io/state-of-space/`), поэтому в
`vite.config.ts` задан `base: '/state-of-space/'`. Деплой — GitHub Actions
(`.github/workflows/deploy.yml`): сборка `npm run build` и публикация `dist/`
через `actions/deploy-pages` при пуше в `main`. В настройках репозитория
Settings → Pages → Source нужно выставить «GitHub Actions» (один раз, вручную
или через `gh api`).

## Безопасность

- Токены и ключи (Figma PAT и т.п.) в репозиторий не класть, только в
  переменные окружения вне git.
- Перед необратимым действием (удаление файлов, force-push, публикация) —
  спросить подтверждение.
