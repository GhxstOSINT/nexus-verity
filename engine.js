const METRICS = [
  { id: "scope12", label: "Scope 1 and 2 emissions", cues: [/scope\s*1\s*(?:and|\+|&)\s*2/i, /combined\s+scope\s*1/i], units: ["tco2e", "mtco2e"] },
  { id: "scope1", label: "Scope 1 emissions", cues: [/scope\s*1(?!\s*(?:and|\+|&))/i], units: ["tco2e", "mtco2e"] },
  { id: "scope2", label: "Scope 2 emissions", cues: [/scope\s*2/i], units: ["tco2e", "mtco2e"] },
  { id: "scope3", label: "Scope 3 emissions", cues: [/scope\s*3/i], units: ["tco2e", "mtco2e"] },
  { id: "renewable", label: "Renewable electricity", cues: [/renewable\s+(?:electricity|energy)/i], units: ["%"] },
  { id: "energy", label: "Energy consumption", cues: [/(?:total\s+)?energy\s+(?:consumption|use)/i], units: ["mwh", "gwh", "gj"] },
  { id: "water", label: "Water withdrawal", cues: [/water\s+(?:withdrawal|consumption|use)/i], units: ["m3", "million m3"] },
  { id: "waste", label: "Waste generated", cues: [/waste\s+(?:generated|produced)/i], units: ["tonnes", "t"] },
  { id: "target", label: "Environmental target", cues: [/(?:target|commit|aim|pledge|net[- ]zero)/i], units: ["%"] }
];

const SENTENCE_SPLIT = /(?<=[.!?])\s+|\n+/;
const YEAR_RE = /\b(?:FY\s*)?(20\d{2})\b/i;
const VALUE_RE = /(-?\d[\d,]*(?:\.\d+)?)\s*(million|billion|thousand)?\s*(%|tco2e|mtco2e|tonnes?|metric\s+tons?|m3|m³|mwh|gwh|gj)?/i;

export function cleanText(text = "") {
  return text.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeUnit(unit = "", scale = "") {
  let u = unit.toLowerCase().replace(/\s+/g, " ").replace("m³", "m3");
  if (/metric tons?|tonnes?/.test(u)) u = "t";
  if (scale && u === "m3") u = `${scale.toLowerCase()} m3`;
  return u;
}

function normalizedValue(raw, scale = "", unit = "") {
  let value = Number(raw.replace(/,/g, ""));
  const multiplier = { thousand: 1e3, million: 1e6, billion: 1e9 }[scale.toLowerCase()] || 1;
  value *= multiplier;
  if (unit.toLowerCase() === "mtco2e") value *= 1e6;
  if (unit.toLowerCase() === "gwh") value *= 1e3;
  return value;
}

function detectScope(sentence) {
  if (/scope\s*3/i.test(sentence)) return "scope 3";
  if (/scope\s*1\s*(?:and|\+|&)\s*2|combined\s+scope\s*1/i.test(sentence)) return "scope 1+2";
  if (/scope\s*1/i.test(sentence)) return "scope 1";
  if (/scope\s*2/i.test(sentence)) return "scope 2";
  if (/global|all\s+(?:owned\s+)?operations|company-wide/i.test(sentence)) return "all operations";
  return "unspecified";
}

function detectCertainty(sentence) {
  if (/may|might|could|estimate|approximately|around|about/i.test(sentence)) return "qualified";
  if (/target|aim|intend|plan|commit|pledge/i.test(sentence)) return "forward-looking";
  return "asserted";
}

export function extractClaims(text, document = {}) {
  const sentences = cleanText(text).split(SENTENCE_SPLIT).map(s => s.trim()).filter(Boolean);
  const claims = [];
  sentences.forEach((sentence, index) => {
    const metric = METRICS.find(m => m.cues.some(cue => cue.test(sentence)));
    if (!metric) return;
    const matches = [...sentence.matchAll(new RegExp(VALUE_RE.source, "gi"))];
    const year = sentence.match(YEAR_RE)?.[1] || document.year || "unspecified";
    const meaningful = matches.filter(m => !YEAR_RE.test(m[0]) && (m[3] || m[2] || Number(m[1].replace(/,/g, "")) < 1900));
    const selected = meaningful.find(m => m[3] && metric.units.some(u => normalizeUnit(m[3], m[2]).includes(u))) || meaningful[0];
    const status = /achieved|reached|met|completed/i.test(sentence) ? "achieved" : /missed|delayed|postponed|not\s+met/i.test(sentence) ? "missed" : /target|aim|commit|pledge/i.test(sentence) ? "planned" : "reported";
    claims.push({
      id: `${document.id || "doc"}-${index + 1}`,
      documentId: document.id || "doc",
      documentTitle: document.title || "Untitled document",
      sourceType: document.sourceType || "public document",
      page: document.page || index + 1,
      metricId: metric.id,
      metric: metric.label,
      value: selected ? normalizedValue(selected[1], selected[2] || "", selected[3] || "") : null,
      displayValue: selected ? selected[0].trim() : "qualitative",
      unit: selected ? normalizeUnit(selected[3] || "", selected[2] || "") : "",
      period: year,
      scope: detectScope(sentence),
      certainty: detectCertainty(sentence),
      status,
      text: sentence
    });
  });
  return claims;
}

export function compareFacets(a, b) {
  const sameMetric = a.metricId === b.metricId || [a.metricId, b.metricId].every(id => ["scope1", "scope2", "scope12"].includes(id));
  const periodComparable = a.period === b.period || a.period === "unspecified" || b.period === "unspecified";
  const scopeComparable = a.scope === b.scope || a.scope === "unspecified" || b.scope === "unspecified" || (a.scope === "all operations" && b.scope === "scope 1+2");
  const unitsComparable = !a.unit || !b.unit || a.unit === b.unit || [a.unit, b.unit].every(u => ["tco2e", "mtco2e"].includes(u));
  return { sameMetric, periodComparable, scopeComparable, unitsComparable, comparable: sameMetric && periodComparable && scopeComparable && unitsComparable };
}

function relativeDifference(a, b) {
  if (a == null || b == null || Math.max(Math.abs(a), Math.abs(b)) === 0) return 0;
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b));
}

export function classifyPair(a, b) {
  const facets = compareFacets(a, b);
  if (!facets.sameMetric) return { label: "no relevant evidence", type: "unrelated", severity: "none", confidence: 0.08, facets };
  if (!facets.comparable) {
    const failed = Object.entries(facets).filter(([k, v]) => k !== "comparable" && !v).map(([k]) => k.replace("Comparable", ""));
    return { label: "non-comparable", type: failed[0] || "scope/boundary", severity: "low", confidence: 0.96, facets, explanation: `The passages discuss the same topic but differ on ${failed.join(", ")}.` };
  }
  if (a.status !== b.status && [a.status, b.status].some(s => ["achieved", "missed"].includes(s))) {
    return { label: "potential contradiction", type: "target-status", severity: "high", confidence: 0.94, facets, explanation: `One source records the target as ${a.status}; the other records it as ${b.status}.` };
  }
  if (a.value != null && b.value != null) {
    const diff = relativeDifference(a.value, b.value);
    if (diff >= 0.05) return { label: "potential contradiction", type: "numeric", severity: diff >= 0.2 ? "critical" : "high", confidence: Math.min(0.99, 0.82 + diff / 2), facets, delta: Math.abs(a.value - b.value), relativeDelta: diff, explanation: `Comparable values differ by ${(diff * 100).toFixed(1)}%. Verify restatements, boundaries, and calculation methods.` };
    return { label: "supported", type: "numeric agreement", severity: "none", confidence: 0.93, facets, relativeDelta: diff, explanation: `Comparable values are within ${(diff * 100).toFixed(1)}% of each other.` };
  }
  const opposite = (/increase|rose|higher|grew/i.test(a.text) && /decrease|fell|lower|reduced/i.test(b.text)) || (/decrease|fell|lower|reduced/i.test(a.text) && /increase|rose|higher|grew/i.test(b.text));
  if (opposite) return { label: "potential contradiction", type: "trend", severity: "high", confidence: 0.88, facets, explanation: "The sources describe opposite directions for a comparable metric and period." };
  return { label: "uncertain", type: "insufficient detail", severity: "medium", confidence: 0.58, facets, explanation: "The passages are related, but the available text is not specific enough for a reliable contradiction decision." };
}

export function analyzeDocuments(primary, evidence) {
  const left = extractClaims(primary.text, primary);
  const right = extractClaims(evidence.text, evidence);
  const findings = [];
  left.forEach(claim => {
    const candidates = right.filter(r => r.metricId === claim.metricId || [r.metricId, claim.metricId].every(id => ["scope1", "scope2", "scope12"].includes(id)));
    if (!candidates.length) {
      findings.push({ id: `finding-${findings.length + 1}`, claim, evidence: null, result: { label: "no relevant evidence", type: "retrieval", severity: "low", confidence: 0.91, explanation: "No passage about this metric was found in the comparison document." } });
      return;
    }
    const ranked = candidates.map(candidate => ({ candidate, result: classifyPair(claim, candidate) })).sort((x, y) => y.result.confidence - x.result.confidence);
    findings.push({ id: `finding-${findings.length + 1}`, claim, evidence: ranked[0].candidate, result: ranked[0].result });
  });
  return { claims: { primary: left, evidence: right }, findings };
}

export function summarizeFindings(findings) {
  return findings.reduce((summary, f) => {
    summary.total += 1;
    summary[f.result.label] = (summary[f.result.label] || 0) + 1;
    return summary;
  }, { total: 0 });
}

export const taxonomy = METRICS.map(({ id, label }) => ({ id, label }));
