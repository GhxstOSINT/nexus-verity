# Nexus Verity Design System

## Product direction

Nexus Verity is an evidence-operations console for sustainability assurance. It should feel calm, precise, and trustworthy: a reviewer opens a queue, selects one finding, reads the two exact passages, makes a decision, and moves on. The interface must foreground work and evidence rather than methodology, hackathon requirements, or promotional content.

The system combines the disciplined information density and neutral surfaces associated with IBM Carbon with the speed, compact controls, and keyboard-first behavior associated with Linear. These are interaction and systems references, not copied brand identities. Nexus Verity retains its own evidence-first visual language.

## Core principles

1. **One obvious next action.** Each page has a single primary task: choose a case, review evidence, find a document, or create a comparison.
2. **Evidence before interpretation.** Source text, document title, location, and original link remain visible before the model result or reviewer action.
3. **Dense, not crowded.** Worklists are compact; reading surfaces retain generous spacing and long-form typography.
4. **Status is redundant.** Every state combines text, shape, and color. Color is never the only signal.
5. **Human decisions are explicit.** Automated findings are screening signals; the reviewer must confirm, revise, or reject comparability.
6. **Progressive disclosure.** The default surface contains product work only. Supporting rationale lives in repository documentation and presentation material.

## Design tokens

### Color

- `ink` `#121722`: primary text and selected segmented controls.
- `ink-2` `#2e3543`: secondary dark text.
- `muted` `#667080`: metadata and supporting copy.
- `subtle` `#9198a1`: quiet labels and disabled content.
- `canvas` `#f3f5f7`: application background.
- `surface` `#ffffff`: controls, panels, and tables.
- `surface-2` `#eef1f4`: table headers and subtle hover states.
- `paper` `#fdfbf6`: quoted source-document sheets.
- `line` `#dfe2e6`: default hairline borders.
- `line-strong` `#c6cbd1`: input and button borders.
- `primary` `#4058d8`: primary action, focus, active navigation, and citations.
- `navy` `#111827`: the decision ledger and high-authority operational surfaces.
- `warm` `#d7ad55`: archival icons and completion progress on the dark ledger only.
- `danger` `#c23a34`: contradiction and failed-comparability signals.
- `success` `#147568`: supported and reviewed states.
- `warning` `#9a6700`: qualified or uncertain findings.

The blue accent is reserved for action and focus. Status colors do not decorate navigation or general layout.

### Typography

- UI: IBM Plex Sans with Segoe UI and Arial fallbacks.
- Evidence: IBM Plex Serif with Georgia fallback.
- Base UI: 14px / 1.45.
- Evidence excerpt: 20px / 1.58 desktop and 19px mobile.
- Page title: 32px desktop and 28px mobile, medium weight.
- Metadata: 11–12px, used only for secondary information.
- Headings use sentence case. Uppercase is limited to short table and metadata labels.

### Geometry and spacing

- Spacing follows a 4px base rhythm; common gaps are 8, 12, 16, 20, 24, and 28px.
- Controls have a minimum height of 38–40px; primary mobile targets remain comfortably tappable.
- Permanent work surfaces use 1px borders; the decision ledger earns one wide, soft elevation because it is the queue's command surface. Temporary overlays use a stronger elevation.
- Controls use 8px radii and major work surfaces use 12–14px radii. Geometry stays compact and never becomes pill-heavy.

### Alignment and numeric hierarchy

- Page shells, headers, toolbars, and tables share explicit container edges; controls align to the same horizontal rhythm.
- Quantitative summaries, confidence values, progress counts, dates, statuses, and evidence facts are centered within their columns and use tabular numerals.
- Numbers receive the strongest weight inside analytical components; their labels are smaller, quieter, and consistently spaced.
- Company names, document titles, explanations, and quoted evidence remain left-aligned because they are read as language rather than compared as quantities.
- Switching cases resets finding filters so the rail count, visible evidence, and selected scope cannot drift out of agreement.

## Information architecture

### Review queue

The queue is the home page. A dark decision ledger names the highest-signal open case, exposes active cases, total findings, pending work, and portfolio completion, and provides one direct continuation action. Scope tabs, search, and one status filter precede a worklist with company, state, strongest signal, progress, owner, and due date. The public Microsoft example is identified by its case metadata and source note; synthetic examples remain clearly labelled.

### Evidence workspace

Desktop uses a three-column review station:

- Left: persistent, collapsible finding rail with state and review progress.
- Center: controls followed by two aligned source sheets.
- Right: sticky decision inspector with confidence, comparability facets, reviewer actions, note, and save state.

The source sheets use a warmer paper color and serif type to distinguish quoted evidence from application chrome. Copy excerpt and source-detail actions sit at the bottom of each sheet.

### Source library

The document library is a searchable operational register. It exposes title, source type, year, and page location and opens the same provenance dialog used by the workspace.

### New comparison

The import flow places the reported disclosure beside an expandable stack of comparison sources on desktop and uses a single sequence on mobile. It accepts pasted text and local TXT or text-based PDF files, reports page-reading progress, states the 25 MB limit, and makes local-processing privacy visible. Additional sources are added inline and can be removed without a modal.

## Interaction model

- `J` / `K`: next or previous finding.
- `1` / `2` / `3`: confirm, revise, or mark non-comparable.
- `Ctrl/Cmd + S`: save the current decision.
- The finding rail can collapse to a signal-only strip without losing position.
- Filters update the visible worklist immediately.
- Saved decisions persist in browser storage and update queue progress.
- Source details open in a modal with provenance and an original-source link when available.
- Success and error feedback appears in a non-blocking toast region.
- The export menu offers a PDF review report, CSV evidence register, and complete JSON record without adding another top-level page.
- The guided demo uses a small anchored coach panel and focuses four existing product regions; it never replaces the real interface with a presentation layer.
- View changes use a 420ms folio reveal that combines a shallow clip, bounded blur, and opacity to preserve spatial continuity. Filter updates acknowledge recalculation in 180ms, progress updates use a scale transform, and success toasts arrive in 280ms.
- Motion is removed for `prefers-reduced-motion`; no interaction waits for animation to finish.
- Icons use one authored archival line language with rounded terminals and consistent 1.55–1.8px strokes. Unicode glyphs and emoji are not used as interface icons.

## Responsive behavior

- Above 1180px: three-column review station.
- 841–1180px: finding rail plus comparison surface; the decision inspector moves below the evidence.
- 840px and below: the rail becomes an expandable findings table, evidence sheets stack, the finding toolbar stays available while reading, and decision controls follow the evidence.
- 680px and below: the header wraps into two touch-friendly rows, controls meet a 44px target floor, tables simplify to essential fields, forms become one column, and export choices become a bottom sheet.
- 430px and below: evidence facts remain a compact two-column comparison, filtering remains available, and controls reflow into a three-part action row.
- 350px and below: the export label shortens without removing functionality and typography tightens only where needed.
- Safe-area insets protect navigation, overlays, and toasts on notched devices.
- The supported reference widths are 320px compact phone, 390px phone, 768px tablet, and desktop; none may introduce horizontal overflow or hide core review actions.

## Accessibility

- Meet WCAG 2.2 AA contrast for text and interactive states.
- Preserve a visible 2px focus ring and keyboard-accessible controls.
- Use semantic buttons, forms, tables, fieldsets, dialog, and progress text.
- Provide a skip link and descriptive labels for icon-only actions.
- Never rely on hover or color alone.
- Respect `prefers-reduced-motion` and avoid essential animated transitions.
- Maintain readable evidence type and avoid truncating source passages.

## Content and safety

- Use “potential contradiction,” “supported,” “uncertain,” “non-comparable,” and “missing evidence.”
- Never present a screening result as proof of deception, fraud, or legal non-compliance.
- Explain why evidence is or is not comparable.
- Keep public and synthetic source status unambiguous.
- Use concise, task-oriented interface copy; longer methodology belongs in documentation.

## Anti-patterns

- No decorative gradients, glassmorphism, oversized hero areas, or marketing statistics.
- No dashboard card wall when a table or worklist communicates the same information better.
- No hidden provenance, ambiguous icon-only actions, or color-only findings.
- No methodology, research-paper directory, or judging rubric in the production navigation.
- No generic AI sparkle language or unqualified accuracy claims.
