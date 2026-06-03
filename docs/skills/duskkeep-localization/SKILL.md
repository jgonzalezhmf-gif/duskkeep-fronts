---
name: duskkeep-localization
description: "Use this skill whenever adding or changing user-facing text, options/settings UI, language selection, translation dictionaries, locale formatting, or multilingual content in Duskkeep Fronts. It enforces translation keys, safe fallbacks, no translated domain IDs, and visual-first game UI across supported languages."
---

# Duskkeep Fronts Localization

Use this skill for any Duskkeep Fronts task that introduces or changes player-facing text.

## Current System

Use the lightweight local i18n system:
- Locales: `lib/i18n/locales.ts`.
- Dictionaries: `lib/i18n/dictionaries.ts`.
- Hook: `lib/i18n/useI18n.ts`.
- HTML sync: `components/game/options/I18nHtmlSync.tsx`.
- Language preference: `useGameStore((s) => s.language)`.
- Options UI: `components/game/options/GameOptionsButton.tsx`.

Supported MVP locales:
- `en`
- `es`

Do not expose additional locales in options or dictionaries until they are actively maintained to the same quality bar as English and Spanish.

## Rules

Do:
- Add new UI strings to dictionaries before using them.
- Use `const { t } = useI18n()` in client components.
- Use stable dot keys like `nav.market`, `options.language`, `combat.resolve`.
- Keep English as fallback.
- Keep UI layout tolerant of longer translated text.
- Prefer icons, states and visual hierarchy over long explanatory text.

Do not:
- Translate internal IDs: hero ids, card ids, offer ids, route ids, event ids or combat enums.
- Concatenate translated sentence fragments.
- Put large paragraphs permanently on screen if visual UI can carry the meaning.
- Add speculative locale files or remote translation fetches.
- Change gameplay, economy, rewards or combat rules while localizing.

## Data Text

For data-driven content in `data/*` or `features/frontline/data`:
- Keep canonical ids stable.
- Prefer adding translation keys or localized display maps instead of rewriting ids.
- Migrate visible names/descriptions progressively by screen.
- Do not block gameplay if a string is not migrated yet; fallback to the existing English text.

## Options

When changing options/settings:
- Persist preferences in `lib/store.ts` unless they are purely temporary.
- Keep options accessible from shared chrome/HUD where appropriate.
- Avoid putting options inside Combat unless explicitly requested.
- Keep audio controls compatible with existing `MuteButton` and `RouteAudioDirector`.

## Validation

For localization changes:
- Run `npm.cmd run check`.
- Run `npm.cmd run build` when routes/store/components changed.
- Use browser validation when a visible screen or options modal changed.
- Check language switching at least between English and Spanish.
- Check no hydration mismatch appears from persisted language.

## Output

Report:
- Locales affected.
- New/changed translation namespaces.
- Screens/components migrated.
- Fallback behavior.
- Validation performed.
