# Nexus Verity Design System

## Direction

Forensic document light-table. The application should feel like an assurance analyst's evidence desk: two primary-source sheets remain visually dominant, a narrow finding spine connects them, and decisions leave an auditable annotation trail. This is an operating surface, not a marketing dashboard.

## First Viewport

The first viewport opens directly into a synthetic case. A dark indigo case rail frames two warm-paper evidence panes. The sustainability claim appears on the left; the filing evidence appears on the right; a vermilion connector and labeled discrepancy sit between them. A compact command strip supports case selection, document import, filtering, research, and export without displacing the evidence.

## Palette

- `ink-950` #111827 — primary shell and high-contrast type
- `ink-700` #334155 — secondary copy
- `paper-50` #fbfaf6 — source-document surface
- `paper-100` #f3f0e7 — application ground
- `line-300` #d7d2c5 — document rules
- `signal-600` #c63f31 — contradiction and urgent attention
- `amber-500` #b7791f — uncertainty and qualification
- `teal-700` #176b65 — support and reviewed states
- `blue-700` #2857a5 — active controls and citations

Status must never be encoded by color alone.

## Typography

Use a readable editorial serif for quoted evidence and a compact humanist sans for controls, metadata, and analysis. Monospace is reserved for units, page identifiers, values, and exported record IDs. Headings stay sentence case.

## Components

- Case rail: stable navigation and case-level state.
- Evidence sheet: document excerpt, provenance, highlighted claim, and page anchor.
- Finding spine: relationship, contradiction type, confidence, and comparison facets.
- Review ledger: accept, revise, mark non-comparable, add note, and undo.
- Source register: standards, regulators, research papers, datasets, and filing repositories.
- Import bench: local PDF/text input with privacy statement and processing state.

## Motion

One signature interaction: switching findings slides the two evidence sheets into alignment while the connector redraws between their exact excerpts. All other changes are immediate or use short fades. Reduced-motion mode disables alignment movement.

## Responsive Behavior

Desktop uses the three-part light-table. Tablet retains two evidence sheets with the finding spine above. Mobile becomes an evidence sequence—claim, comparison facets, counter-evidence, reviewer decision—without hiding provenance.

## Accessibility

WCAG 2.2 AA contrast, visible keyboard focus, semantic buttons/tables, descriptive status text, skip navigation, reduced motion, and no reliance on hover. Evidence highlights remain legible in high-contrast mode.
