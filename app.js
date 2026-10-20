import { analyzeDocuments } from "./engine.js";

const seededCases = [
  {code:"SYN–001",company:"Atlas Components",title:"FY2025 environmental claims",priority:"High",owner:"A. Kumar",due:"22 Oct",status:"In review",primary:{id:"DOC-ATL-SR25",title:"Atlas Components Sustainability Report 2025",sourceType:"Sustainability report",page:18,year:"2025",file:"atlas-sustainability-2025.pdf",text:"In FY2025, Scope 1 and 2 emissions were 84,200 tCO2e across all owned operations. We reached 100% renewable electricity across global operations in FY2025. FY2025 water withdrawal was 1.20 million m3. FY2025 waste generated was 8,000 tonnes."},evidence:{id:"DOC-ATL-RF25",title:"Atlas Components Regulatory Filing 2025",sourceType:"Regulatory filing",page:74,year:"2025",file:"atlas-regulatory-filing-2025.pdf",text:"For FY2025, combined Scope 1 and 2 emissions were 103,600 tCO2e across all owned operations. Renewable electricity represented 68% of electricity consumed across global operations in FY2025. FY2025 water withdrawal was 1.22 million m3."}},
  {code:"SYN–002",company:"Northstar Textiles",title:"Target and boundary review",priority:"High",owner:"A. Kumar",due:"24 Oct",status:"In review",primary:{id:"DOC-NOR-IR25",title:"Northstar Textiles Impact Report 2025",sourceType:"Sustainability report",page:31,year:"2025",file:"northstar-impact-2025.pdf",text:"We achieved our target of 75% renewable electricity across all operations in FY2025. FY2025 Scope 3 emissions were 510,000 tCO2e."},evidence:{id:"DOC-NOR-AS25",title:"Northstar Textiles Assurance Statement",sourceType:"Assurance statement",page:9,year:"2025",file:"northstar-assurance-2025.pdf",text:"Renewable electricity represented 52% of electricity consumed across all operations in FY2025. FY2024 Scope 3 emissions were 505,000 tCO2e."}},
  {code:"SYN–003",company:"Meridian Foods",title:"Water and waste disclosures",priority:"Medium",owner:"R. Shah",due:"29 Oct",status:"Queued",primary:{id:"DOC-MER-ESG25",title:"Meridian Foods ESG Update 2025",sourceType:"Sustainability report",page:22,year:"2025",file:"meridian-esg-update-2025.pdf",text:"FY2025 water withdrawal was 2.40 million m3 across all facilities. Waste generated was 12,500 tonnes in FY2025."},evidence:{id:"DOC-MER-BR25",title:"Meridian Foods Business Responsibility Filing",sourceType:"Regulatory filing",page:48,year:"2025",file:"meridian-brsr-2025.pdf",text:"Total water withdrawal across all facilities in FY2025 was 2.40 million m3. Waste generated in FY2025 was 12,650 tonnes."}},
  {code:"SYN–004",company:"Solace Mobility",title:"Scope and period alignment",priority:"Low",owner:"M. Iyer",due:"04 Nov",status:"Queued",primary:{id:"DOC-SOL-CR25",title:"Solace Mobility Climate Report 2025",sourceType:"Sustainability report",page:16,year:"2025",file:"solace-climate-2025.pdf",text:"Scope 1 emissions were 31,400 tCO2e in FY2025 across global operations. Renewable electricity was 64% in FY2025."},evidence:{id:"DOC-SOL-AF24",title:"Solace Mobility Annual Filing 2024",sourceType:"Regulatory filing",page:92,year:"2024",file:"solace-annual-2024.pdf",text:"Scope 1 emissions were 31,900 tCO2e in FY2024 across global operations. Renewable electricity was 61% in FY2024."}}
];

const $ = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
const storedCases = JSON.parse(localStorage.getItem("nexus-verity-cases") || "[]");
const cases = [...storedCases, ...seededCases];
const reviews = JSON.parse(localStorage.getItem("nexus-verity-reviews") || "{}");
let activeCase = 0;
let activeFinding = 0;
let scopeFilter = "all";
let selectedDecision = "";
let analysis = caseAnalysis(0);

function caseAnalysis(index) { return analyzeDocuments(cases[index].primary, cases[index].evidence); }
function reviewKey(finding) { return `${cases[activeCase].code}-${finding.id}`; }
function reviewedCount(index) { const item = cases[index]; return caseAnalysis(index).findings.filter(finding => reviews[`${item.code}-${finding.id}`]).length; }
function resultClass(label) { return label === "supported" ? "supported" : label === "potential contradiction" ? "flagged" : "neutral"; }
function toast(message, type = "success") { const node = document.createElement("div"); node.className = `toast ${type}`; node.textContent = message; $("toastRegion").append(node); setTimeout(() => node.remove(), 3200); }
function download(name, content, type = "application/json") { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([content], { type })); link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); }
function highlight(text, displayValue) { const safe = esc(text); return !displayValue || displayValue === "qualitative" ? safe : safe.replace(esc(displayValue), `<mark>${esc(displayValue)}</mark>`); }
function facts(claim) { if (!claim) return `<div><dt>Evidence</dt><dd>Not found</dd></div>`; return [["Metric", claim.metric], ["Value", claim.displayValue], ["Period", claim.period], ["Scope", claim.scope]].map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value || "Not stated")}</dd></div>`).join(""); }

function renderCases() {
  const query = $("caseSearch").value.trim().toLowerCase();
  const status = $("caseStatus").value;
  const rows = cases.map((item, index) => ({ item, index, findings: caseAnalysis(index).findings })).filter(({ item }) => (!query || `${item.company} ${item.code} ${item.title}`.toLowerCase().includes(query)) && (status === "all" || item.status === status));
  $("caseList").innerHTML = rows.length ? `<div class="case-row case-row-head" aria-hidden="true"><span>Company</span><span>Status</span><span>Findings</span><span>Reviewed</span><span>Due</span><span></span></div>${rows.map(({ item, index, findings }) => `<button class="case-row" data-open-case="${index}"><span class="case-name"><strong>${esc(item.company)}</strong><small>${esc(item.code)} · ${esc(item.title)}</small></span><span><i class="status-dot ${item.status === "In review" ? "live" : ""}"></i>${esc(item.status)}</span><span>${findings.length}</span><span>${reviewedCount(index)} / ${findings.length}</span><span>${esc(item.due)}</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>`).join("")}` : `<div class="empty-state"><strong>No cases found</strong><span>Try a different search or status.</span></div>`;
  document.querySelectorAll("[data-open-case]").forEach(button => button.addEventListener("click", () => { activeCase = Number(button.dataset.openCase); activeFinding = 0; renderCase(); switchView("workspace"); }));
}

function renderCaseSwitcher() { $("caseSwitcher").innerHTML = cases.map((item, index) => `<option value="${index}">${esc(item.company)}</option>`).join(""); $("caseSwitcher").value = String(activeCase); }
function renderCase() {
  const item = cases[activeCase]; analysis = caseAnalysis(activeCase); activeFinding = Math.min(activeFinding, Math.max(analysis.findings.length - 1, 0));
  $("caseTitle").textContent = item.company; $("caseMeta").textContent = `${item.code} · ${item.title} · Assigned to ${item.owner} · Due ${item.due}`;
  renderCaseSwitcher(); renderTable(); renderFinding(); renderCases(); renderDocuments();
}

function renderFinding() {
  const finding = analysis.findings[activeFinding];
  if (!finding) { $("finding-title").textContent = "No comparable claims found"; return; }
  const { claim, evidence, result } = finding;
  $("claimDocument").textContent = claim.documentTitle; $("claimPage").textContent = claim.page ? `p. ${claim.page}` : "Location unavailable"; $("claimType").textContent = claim.sourceType; $("claimText").innerHTML = highlight(claim.text, claim.displayValue); $("claimFacts").innerHTML = facts(claim);
  $("evidenceDocument").textContent = evidence?.documentTitle || "No matching passage"; $("evidencePage").textContent = evidence?.page ? `p. ${evidence.page}` : "—"; $("evidenceType").textContent = evidence?.sourceType || "Retrieval result"; $("evidenceText").innerHTML = evidence ? highlight(evidence.text, evidence.displayValue) : "No relevant evidence was retrieved for this metric."; $("evidenceFacts").innerHTML = facts(evidence);
  $("findingStatus").className = `status-chip ${resultClass(result.label)}`; $("findingStatus").textContent = result.label; $("finding-title").textContent = result.type.replace(/\b\w/g, char => char.toUpperCase()); $("findingExplanation").textContent = result.explanation; $("findingConfidence").textContent = `${Math.round(result.confidence * 100)}%`;
  $("facetList").innerHTML = result.facets ? Object.entries(result.facets).filter(([key]) => key !== "comparable").map(([key, value]) => `<span class="facet ${value ? "" : "fail"}">${esc(key.replace(/([A-Z])/g, " $1"))}: ${value ? "match" : "check"}</span>`).join("") : `<span class="facet fail">No evidence match</span>`;
  const saved = reviews[reviewKey(finding)] || {}; selectedDecision = saved.decision || ""; $("reviewNote").value = saved.note || ""; $("noteCount").textContent = $("reviewNote").value.length;
  document.querySelectorAll("[data-decision]").forEach(button => button.classList.toggle("selected", button.dataset.decision === selectedDecision));
  $("saveState").textContent = saved.savedAt ? `Saved ${new Date(saved.savedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}` : "";
  $("progressLabel").textContent = `Finding ${activeFinding + 1} of ${analysis.findings.length}`;
  const reviewed = reviewedCount(activeCase), percent = analysis.findings.length ? Math.round(reviewed / analysis.findings.length * 100) : 0;
  $("reviewPercent").textContent = `${percent}% reviewed`; $("reviewProgressBar").style.width = `${percent}%`; $("previousFinding").disabled = activeFinding === 0; $("nextFinding").disabled = activeFinding >= analysis.findings.length - 1;
  document.querySelectorAll("#findingsTable tr[data-finding]").forEach(row => row.classList.toggle("active", Number(row.dataset.finding) === activeFinding));
}

function filteredFindings() {
  const resultFilter = $("statusFilter").value;
  return analysis.findings.map((finding, index) => ({ finding, index, saved: reviews[reviewKey(finding)] })).filter(({ finding, saved }) => (resultFilter === "all" || finding.result.label === resultFilter) && (scopeFilter === "all" || (scopeFilter === "reviewed" ? saved : !saved)));
}
function renderTable() {
  const rows = filteredFindings();
  $("findingsTable").innerHTML = rows.length ? rows.map(({ finding, index, saved }) => `<tr data-finding="${index}" tabindex="0"><td>${String(index + 1).padStart(2, "0")}</td><td><strong>${esc(finding.claim.metric)}</strong></td><td><span class="table-result ${resultClass(finding.result.label)}">${esc(finding.result.label)}</span></td><td>${Math.round(finding.result.confidence * 100)}%</td><td>${saved ? esc(saved.decision) : "Pending"}</td></tr>`).join("") : `<tr><td colspan="5"><div class="empty-state">No findings match this filter.</div></td></tr>`;
  document.querySelectorAll("#findingsTable tr[data-finding]").forEach(row => { const open = () => { activeFinding = Number(row.dataset.finding); renderFinding(); window.scrollTo({ top: 0, behavior: "smooth" }); }; row.addEventListener("click", open); row.addEventListener("keydown", event => { if (event.key === "Enter") open(); }); });
}

function allDocuments() { const seen = new Map(); cases.forEach(item => [item.primary, item.evidence].forEach(document => seen.set(document.id, document))); return [...seen.values()]; }
function renderDocuments() {
  const query = $("documentSearch").value.trim().toLowerCase(), type = $("documentType").value;
  const rows = allDocuments().filter(document => (!query || `${document.title} ${document.id} ${document.file}`.toLowerCase().includes(query)) && (type === "all" || document.sourceType === type));
  $("documentLibrary").innerHTML = rows.length ? `<div class="document-row document-row-head" aria-hidden="true"><span>Document</span><span>Type</span><span>Year</span><span>Location</span></div>${rows.map(document => `<button class="document-row" data-document-id="${esc(document.id)}"><span class="document-name"><strong>${esc(document.title)}</strong><small>${esc(document.id)}</small></span><span>${esc(document.sourceType)}</span><span>${esc(document.year || "—")}</span><span>${esc(document.page ? `p. ${document.page}` : "—")}</span></button>`).join("")}` : `<div class="empty-state"><strong>No documents found</strong><span>Try a broader search.</span></div>`;
  document.querySelectorAll("[data-document-id]").forEach(button => button.addEventListener("click", () => showSource(allDocuments().find(item => item.id === button.dataset.documentId))));
}
function showSource(document) {
  if (!document) return;
  $("sourceDialogContent").innerHTML = `<div class="source-detail"><p>${esc(document.title)}</p><div class="source-detail-grid"><div><span>Document ID</span><strong>${esc(document.id)}</strong></div><div><span>Type</span><strong>${esc(document.sourceType)}</strong></div><div><span>File</span><strong>${esc(document.file || "Local text")}</strong></div><div><span>Location</span><strong>${esc(document.page ? `Page ${document.page}` : "Not supplied")}</strong></div></div><blockquote>${esc(document.text)}</blockquote></div>`;
  $("sourceDialog").showModal();
}
function switchView(view) {
  document.querySelectorAll(".view").forEach(section => section.classList.toggle("active", section.id === view));
  document.querySelectorAll("[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  history.replaceState(null, "", `#${view}`); window.scrollTo(0, 0); requestAnimationFrame(() => window.scrollTo(0, 0)); if (view === "cases") renderCases(); if (view === "documents") renderDocuments();
}
async function readFile(input, target, state) {
  const file = input.files[0]; if (!file) return;
  if (file.size > 25 * 1024 * 1024) { $(state).textContent = "File exceeds 25 MB"; return; }
  $(state).textContent = `Reading ${file.name}…`;
  try {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const pdfjs = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs"); pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs";
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise, pages = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) { const page = await pdf.getPage(pageNumber), content = await page.getTextContent(); pages.push(content.items.map(item => item.str).join(" ")); }
      $(target).value = pages.join("\n");
    } else $(target).value = await file.text();
    $(state).textContent = `${file.name} · ready`;
  } catch { $(state).textContent = "Could not read this file. Paste its text instead."; }
}

document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));
document.querySelectorAll("[data-action-view]").forEach(button => button.addEventListener("click", event => { event.preventDefault(); switchView(button.dataset.actionView); }));
$("caseSearch").addEventListener("input", renderCases); $("caseStatus").addEventListener("change", renderCases); $("documentSearch").addEventListener("input", renderDocuments); $("documentType").addEventListener("change", renderDocuments);
$("caseSwitcher").addEventListener("change", event => { activeCase = Number(event.target.value); activeFinding = 0; renderCase(); }); $("statusFilter").addEventListener("change", renderTable);
document.querySelectorAll("[data-scope]").forEach(button => button.addEventListener("click", () => { scopeFilter = button.dataset.scope; document.querySelectorAll("[data-scope]").forEach(item => item.classList.toggle("active", item === button)); renderTable(); }));
$("previousFinding").addEventListener("click", () => { if (activeFinding > 0) { activeFinding -= 1; renderFinding(); } }); $("nextFinding").addEventListener("click", () => { if (activeFinding < analysis.findings.length - 1) { activeFinding += 1; renderFinding(); } });
document.querySelectorAll("[data-decision]").forEach(button => button.addEventListener("click", () => { selectedDecision = button.dataset.decision; document.querySelectorAll("[data-decision]").forEach(item => item.classList.toggle("selected", item === button)); }));
$("reviewNote").addEventListener("input", event => { $("noteCount").textContent = event.target.value.length; });
$("saveReview").addEventListener("click", () => { const finding = analysis.findings[activeFinding]; if (!selectedDecision) { toast("Choose a review decision first.", "error"); return; } reviews[reviewKey(finding)] = { decision: selectedDecision, note: $("reviewNote").value.trim(), savedAt: new Date().toISOString() }; localStorage.setItem("nexus-verity-reviews", JSON.stringify(reviews)); renderTable(); renderFinding(); renderCases(); toast("Decision saved in this browser."); });
$("exportButton").addEventListener("click", () => { const item = cases[activeCase]; download(`${item.code.toLowerCase().replace("–", "-")}-review.json`, JSON.stringify({ case: item, findings: analysis.findings, reviews: Object.fromEntries(Object.entries(reviews).filter(([key]) => key.startsWith(item.code))) }, null, 2)); toast("Review exported."); });
document.querySelectorAll("[data-source-side]").forEach(button => button.addEventListener("click", () => showSource(button.dataset.sourceSide === "claim" ? cases[activeCase].primary : cases[activeCase].evidence)));
$("primaryFile").addEventListener("change", event => readFile(event.target, "primaryText", "primaryFileState")); $("evidenceFile").addEventListener("change", event => readFile(event.target, "evidenceInputText", "evidenceFileState"));
$("importForm").addEventListener("submit", event => {
  event.preventDefault(); const primaryText = $("primaryText").value.trim(), evidenceText = $("evidenceInputText").value.trim();
  if (!primaryText || !evidenceText) { $("importValidation").hidden = false; $("importValidation").textContent = "Add text for both documents before comparing them."; return; }
  const index = storedCases.length + 1;
  const item = { code: `LOCAL–${String(index).padStart(3, "0")}`, company: "Local comparison", title: "Imported evidence review", priority: "Medium", owner: "You", due: "Not set", status: "In review", primary: { id: `LOCAL-A-${index}`, title: $("primaryTitle").value.trim() || "Reported disclosure", sourceType: "Sustainability report", page: null, year: "", file: $("primaryFile").files[0]?.name || "Pasted text", text: primaryText }, evidence: { id: `LOCAL-B-${index}`, title: $("evidenceTitle").value.trim() || "Comparison evidence", sourceType: "Regulatory filing", page: null, year: "", file: $("evidenceFile").files[0]?.name || "Pasted text", text: evidenceText } };
  storedCases.unshift(item); localStorage.setItem("nexus-verity-cases", JSON.stringify(storedCases)); cases.unshift(item); activeCase = 0; activeFinding = 0; $("importValidation").hidden = true; renderCase(); switchView("workspace"); toast("Comparison created.");
});

const initialView = ["cases", "workspace", "documents", "import"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "cases";
renderCases(); renderDocuments(); renderCase(); switchView(initialView);
