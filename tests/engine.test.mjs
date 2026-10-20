import test from "node:test";
import assert from "node:assert/strict";
import { extractClaims, compareFacets, classifyPair, analyzeDocuments } from "../engine.js";

const base = { id: "a", title: "A", sourceType: "Sustainability report", year: "2025" };

test("extracts an emissions claim with normalized number, period, and scope", () => {
  const [claim] = extractClaims("In FY2025, Scope 1 and 2 emissions were 84,200 tCO2e across all owned operations.", base);
  assert.equal(claim.metricId, "scope12");
  assert.equal(claim.value, 84200);
  assert.equal(claim.period, "2025");
  assert.equal(claim.scope, "scope 1+2");
});

test("marks different periods as non-comparable", () => {
  const [a] = extractClaims("FY2025 Scope 3 emissions were 500,000 tCO2e.", base);
  const [b] = extractClaims("FY2024 Scope 3 emissions were 510,000 tCO2e.", { ...base, id: "b", year: "2024" });
  assert.equal(compareFacets(a, b).periodComparable, false);
  assert.equal(classifyPair(a, b).label, "non-comparable");
});

test("flags a material numeric contradiction", () => {
  const [a] = extractClaims("FY2025 Scope 1 and 2 emissions were 84,200 tCO2e.", base);
  const [b] = extractClaims("FY2025 Scope 1 and 2 emissions were 103,600 tCO2e.", { ...base, id: "b" });
  const result = classifyPair(a, b);
  assert.equal(result.label, "potential contradiction");
  assert.equal(result.type, "numeric");
  assert.ok(result.relativeDelta > 0.18);
});

test("labels closely aligned values as supported", () => {
  const [a] = extractClaims("FY2025 water withdrawal was 1.20 million m3.", base);
  const [b] = extractClaims("FY2025 water withdrawal was 1.22 million m3.", { ...base, id: "b" });
  assert.equal(classifyPair(a, b).label, "supported");
});

test("end-to-end analysis preserves evidence and emits retrieval gaps", () => {
  const result = analyzeDocuments(
    { ...base, text: "FY2025 Scope 1 and 2 emissions were 84,200 tCO2e. FY2025 waste generated was 8,000 tonnes." },
    { ...base, id: "b", text: "FY2025 Scope 1 and 2 emissions were 103,600 tCO2e." }
  );
  assert.equal(result.findings.length, 2);
  assert.ok(result.findings[0].evidence.text.includes("103,600"));
  assert.equal(result.findings[1].result.label, "no relevant evidence");
});
