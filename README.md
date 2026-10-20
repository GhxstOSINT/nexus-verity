# Nexus Verity

Evidence-linked ESG contradiction analysis and assurance review workspace.

Nexus Verity compares sustainability claims with regulatory filings and other public evidence, verifies whether passages are materially comparable, highlights potential conflicts, and preserves the exact source text for human review. It never labels an organization deceptive or fraudulent.

![Nexus Verity portfolio](tests/screenshots/desktop.png)

## Features

- Portfolio queue with priorities, owners, due dates, progress, and local activity history
- Four clearly labelled synthetic demonstration cases
- Side-by-side source excerpts with stable provenance records
- Comparability gates for metric, period, scope, unit, boundary, and certainty
- Contradiction, support, uncertainty, non-comparable, and missing-evidence states
- Human decisions, rationales, timestamps, filters, and local persistence
- Searchable document library and structured JSON exports
- Local TXT and text-based PDF ingestion; documents are not uploaded by the application
- Research library, reporting standards, regulators, and open-source evidence references
- Keyboard navigation, global search, reduced-motion and high-contrast preferences
- Responsive evidence workflow with no horizontal overflow at 390 px

## Run locally

Requires Node.js 18 or newer.

```bash
npm start
```

Then open [http://127.0.0.1:4174](http://127.0.0.1:4174).

No dependency installation or build step is required.

## Test

```bash
npm test
```

The deterministic engine suite contains five tests. The browser suite requires the optional Playwright development dependency and uses Microsoft Edge on Windows. Install development dependencies, keep the local server active, and run:

```bash
npm install
npm run test:browser
```

Release verification completed on 20 October 2026:

- Engine: 5/5 passed
- Browser workflow: 18/18 passed
- Combined: 23/23 passed

## Repository structure

```text
index.html                 Application shell
styles.css                Responsive design system
app.js                    Product state and interactions
engine.js                 Deterministic claim comparison engine
scripts/serve.mjs         Zero-dependency local server
tests/                    Engine and browser checks
docs/PRODUCT.md           Product contract and safety boundaries
docs/DESIGN.md            Design system and interaction direction
```

## Safety and privacy

- All included company names, documents, and findings are synthetic.
- A “potential contradiction” is a screening signal, not a legal or misconduct conclusion.
- Imported documents remain in the browser session for this prototype.
- Scanned PDFs require OCR outside the current release.
- Published accuracy claims require a blinded, human-labelled real-report corpus.

## Research basis

The methodology draws on recent peer-reviewed ESG and claim-verification research, including CLARIESG, A3CG, ML-Promise, ESG-CID, ClimateCheck, UnifEE, and FEVER. Product controls are documented in the in-app Knowledge section.

## License

MIT. See [LICENSE](LICENSE).
