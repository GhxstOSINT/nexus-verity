# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated by the user through the request to build the complete product. A client-first React/TypeScript application will be packaged with the Sites-supported Vinext toolchain so document content can remain in the browser while the application can still be deployed privately.

## Users

Primary users are ESG assurance analysts, compliance reviewers, investment-research analysts, and sustainability teams who must compare claims across long, differently structured corporate and regulatory documents under time pressure. Their core job is to find, verify, classify, and document potentially contradictory disclosures without losing the source context.

Secondary users are hackathon judges evaluating whether the prototype solves FRONTIER Problem Statement 07 with a credible technical approach, usable evidence trail, measurable performance, and a realistic build scope.

## Product Purpose

Nexus Verity compares sustainability claims with regulatory filings and other public evidence, finds materially comparable passages, highlights potential contradictions, explains why they differ, and keeps both source excerpts attached for human review. Success means reviewers can identify and resolve high-value disclosure conflicts faster, with no unsupported accusation and no evidence-free model output.

## Positioning

The product is an evidence-linked contradiction workbench rather than a generic ESG chatbot: every finding must pass a comparability gate for metric, scope, period, unit, boundary, and certainty before it can be labelled a potential contradiction, and every decision remains tied to exact source text.

## Operating Context

Users begin with two or more English-language sustainability reports, regulatory filings, policy documents, or public disclosures. They inspect extracted environmental claims, review matched evidence side by side, accept or revise the machine label, add notes, filter by severity or contradiction type, and export a review-ready evidence register. The hackathon prototype prioritizes emissions, energy, water, waste, and target-status claims.

## Capabilities and Constraints

- Ingest text-based PDF or plain-text documents locally in the browser; scanned-document OCR is identified as a post-MVP extension.
- Extract numeric and qualitative ESG claims with metric, value, unit, period, scope, target year, certainty, and source location.
- Retrieve candidate evidence using metric vocabulary, numeric overlap, year overlap, and semantic cues.
- Gate comparability before contradiction scoring.
- Detect numeric, trend, target-status, scope/boundary, period, unit/denominator, policy/event, methodology/restatement, and qualification/certainty conflicts.
- Label findings as potential contradiction, supported, uncertain, non-comparable, or no relevant evidence.
- Support a synthetic demonstration corpus, manual text input, reviewer decisions, saved local state, evidence export, research references, and source guidance.
- Never assert fraud, deception, or greenwashing. Results are screening signals for human verification, not legal conclusions.
- The browser MVP does not upload user documents to a remote model or server.
- Assumption: a private Sites deployment is acceptable because the user asked for the complete product and to be shown the tested result.

## Brand Commitments

The product name is Nexus Verity. Its voice is precise, calm, auditable, and explicit about uncertainty. The product must distinguish synthetic demonstrations from real-source facts.

## Evidence on Hand

- BIOS FRONTIER 07 problem wording, rules, judging constraints, and deliverable requirements documented in `outputs/BIOS_FRONTIER_07_ESG_Contradiction_Detector_Master_Guide.pdf`.
- Official BIOS five-slide screening template in `work/bios-master-guide/BIOS_V2_CORE_FRONTIER_Screening_Template.pptx`.
- Official regulatory and reporting references: SEBI BRSR Core, GRI Standards, IFRS S1/S2, GHG Protocol, and SEC EDGAR.
- No real company is presented as deceptive; demonstration company names and findings must be explicitly synthetic.

## Product Principles

1. Evidence before inference: no finding without visible source text and provenance.
2. Comparability before contradiction: scope, period, unit, and methodology mismatches are first-class states.
3. Human decision authority: the system prioritizes and explains; the reviewer decides.
4. Privacy by default: keep prototype document processing in the browser.
5. Honest evaluation: seeded labels, measurable tests, and explicit limitations are part of the product.

## Accessibility & Inclusion

Target WCAG 2.2 AA for contrast, keyboard operation, focus visibility, responsive layout, reduced-motion support, and non-color-only status communication.
