import { analyzeDocuments } from "./engine.js";

const seededCases = [
  {
    code: "PUBLIC–001",
    company: "Microsoft",
    title: "FY2024 Scope 1 and 2 progress",
    priority: "Medium",
    owner: "Unassigned",
    due: "Open",
    status: "In review",
    primary: {
      id: "MSFT-ESR-2025",
      title: "Microsoft Environmental Sustainability Report 2025",
      sourceType: "Sustainability report",
      page: 11,
      year: "2020",
      file: "2025-Microsoft-Environmental-Sustainability-Report.pdf",
      url: "https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/2025-Microsoft-Environmental-Sustainability-Report.pdf",
      text: "Our Scope 1 and 2 emissions decreased by 30% from the 2020 base year.",
    },
    evidence: {
      id: "MSFT-BLOG-2025",
      title: "Our 2025 Environmental Sustainability Report",
      sourceType: "Company statement",
      page: null,
      year: "2020",
      file: "Microsoft On the Issues — 29 May 2025",
      url: "https://blogs.microsoft.com/on-the-issues/2025/05/29/environmental-sustainability-report/",
      text: "We decreased our Scope 1 and 2 emissions by 29.9% from our 2020 baseline in FY24.",
    },
  },
  {
    code: "SYN–001",
    company: "Atlas Components",
    title: "FY2025 environmental claims",
    priority: "High",
    owner: "A. Kumar",
    due: "22 Oct",
    status: "In review",
    primary: {
      id: "DOC-ATL-SR25",
      title: "Atlas Components Sustainability Report 2025",
      sourceType: "Sustainability report",
      page: 18,
      year: "2025",
      file: "atlas-sustainability-2025.pdf",
      text: "In FY2025, Scope 1 and 2 emissions were 84,200 tCO2e across all owned operations. We reached 100% renewable electricity across global operations in FY2025. FY2025 water withdrawal was 1.20 million m3. FY2025 waste generated was 8,000 tonnes.",
    },
    evidence: {
      id: "DOC-ATL-RF25",
      title: "Atlas Components Regulatory Filing 2025",
      sourceType: "Regulatory filing",
      page: 74,
      year: "2025",
      file: "atlas-regulatory-filing-2025.pdf",
      text: "For FY2025, combined Scope 1 and 2 emissions were 103,600 tCO2e across all owned operations. Renewable electricity represented 68% of electricity consumed across global operations in FY2025. FY2025 water withdrawal was 1.22 million m3.",
    },
  },
  {
    code: "SYN–002",
    company: "Northstar Textiles",
    title: "Target and boundary review",
    priority: "High",
    owner: "A. Kumar",
    due: "24 Oct",
    status: "In review",
    primary: {
      id: "DOC-NOR-IR25",
      title: "Northstar Textiles Impact Report 2025",
      sourceType: "Sustainability report",
      page: 31,
      year: "2025",
      file: "northstar-impact-2025.pdf",
      text: "We achieved our target of 75% renewable electricity across all operations in FY2025. FY2025 Scope 3 emissions were 510,000 tCO2e.",
    },
    evidence: {
      id: "DOC-NOR-AS25",
      title: "Northstar Textiles Assurance Statement",
      sourceType: "Assurance statement",
      page: 9,
      year: "2025",
      file: "northstar-assurance-2025.pdf",
      text: "Renewable electricity represented 52% of electricity consumed across all operations in FY2025. FY2024 Scope 3 emissions were 505,000 tCO2e.",
    },
  },
  {
    code: "SYN–003",
    company: "Meridian Foods",
    title: "Water and waste disclosures",
    priority: "Medium",
    owner: "R. Shah",
    due: "29 Oct",
    status: "Queued",
    primary: {
      id: "DOC-MER-ESG25",
      title: "Meridian Foods ESG Update 2025",
      sourceType: "Sustainability report",
      page: 22,
      year: "2025",
      file: "meridian-esg-update-2025.pdf",
      text: "FY2025 water withdrawal was 2.40 million m3 across all facilities. Waste generated was 12,500 tonnes in FY2025.",
    },
    evidence: {
      id: "DOC-MER-BR25",
      title: "Meridian Foods Business Responsibility Filing",
      sourceType: "Regulatory filing",
      page: 48,
      year: "2025",
      file: "meridian-brsr-2025.pdf",
      text: "Total water withdrawal across all facilities in FY2025 was 2.40 million m3. Waste generated in FY2025 was 12,650 tonnes.",
    },
  },
  {
    code: "SYN–004",
    company: "Solace Mobility",
    title: "Scope and period alignment",
    priority: "Low",
    owner: "M. Iyer",
    due: "04 Nov",
    status: "Queued",
    primary: {
      id: "DOC-SOL-CR25",
      title: "Solace Mobility Climate Report 2025",
      sourceType: "Sustainability report",
      page: 16,
      year: "2025",
      file: "solace-climate-2025.pdf",
      text: "Scope 1 emissions were 31,400 tCO2e in FY2025 across global operations. Renewable electricity was 64% in FY2025.",
    },
    evidence: {
      id: "DOC-SOL-AF24",
      title: "Solace Mobility Annual Filing 2024",
      sourceType: "Regulatory filing",
      page: 92,
      year: "2024",
      file: "solace-annual-2024.pdf",
      text: "Scope 1 emissions were 31,900 tCO2e in FY2024 across global operations. Renewable electricity was 61% in FY2024.",
    },
  },
];

const $ = (id) => document.getElementById(id);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>\"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
  );
const storedCases = JSON.parse(
  localStorage.getItem("nexus-verity-cases") || "[]",
);
const cases = [...storedCases, ...seededCases];
const reviews = JSON.parse(
  localStorage.getItem("nexus-verity-reviews") || "{}",
);
const importedPages = new Map();
let activeCase = 0;
let activeFinding = 0;
let scopeFilter = "all";
let caseScope = "all";
let selectedDecision = "";
let analysis = caseAnalysis(0);

function evidenceDocuments(item) {
  return item.evidenceDocuments?.length
    ? item.evidenceDocuments
    : item.evidence
      ? [item.evidence]
      : [];
}
function caseAnalysis(index) {
  return analyzeDocuments(
    cases[index].primary,
    evidenceDocuments(cases[index]),
  );
}
function reviewKey(finding) {
  return `${cases[activeCase].code}-${finding.id}`;
}
function reviewedCount(index) {
  const item = cases[index];
  return caseAnalysis(index).findings.filter(
    (finding) => reviews[`${item.code}-${finding.id}`],
  ).length;
}
function resultClass(label) {
  return label === "supported"
    ? "supported"
    : label === "potential contradiction"
      ? "flagged"
      : "neutral";
}
function toast(message, type = "success") {
  const node = document.createElement("div");
  node.className = `toast ${type}`;
  node.textContent = message;
  $("toastRegion").append(node);
  setTimeout(() => node.remove(), 3200);
}
function download(name, content, type = "application/json") {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([content], { type }));
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}
function caseExportData() {
  const item = cases[activeCase];
  return {
    case: item,
    findings: analysis.findings,
    reviews: Object.fromEntries(
      Object.entries(reviews).filter(([key]) => key.startsWith(item.code)),
    ),
    exportedAt: new Date().toISOString(),
  };
}
function reportRows() {
  const item = cases[activeCase];
  return analysis.findings.map((finding, index) => {
    const saved = reviews[reviewKey(finding)] || {};
    return {
      caseId: item.code,
      company: item.company,
      finding: index + 1,
      metric: finding.claim.metric,
      result: finding.result.label,
      confidence: `${Math.round(finding.result.confidence * 100)}%`,
      claimSource: finding.claim.documentTitle,
      claimPage: finding.claim.page || "",
      evidenceSource: finding.evidence?.documentTitle || "",
      evidencePage: finding.evidence?.page || "",
      explanation: finding.result.explanation,
      decision: saved.decision || "Pending",
      reviewerNote: saved.note || "",
      savedAt: saved.savedAt || "",
    };
  });
}
function exportCsv() {
  const rows = reportRows(),
    headers = Object.keys(rows[0] || { caseId: "" });
  const csv = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(",")),
  ].join("\r\n");
  download(
    `${cases[activeCase].code.toLowerCase().replace("–", "-")}-evidence-register.csv`,
    csv,
    "text/csv;charset=utf-8",
  );
}
function pdfEscape(value) {
  return String(value)
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/([\\()])/g, "\\$1");
}
function wrapReportLine(value, width = 88) {
  const words = String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" "),
    lines = [];
  let line = "";
  words.forEach((word) => {
    if (`${line} ${word}`.trim().length > width && line) {
      lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  });
  if (line) lines.push(line);
  return lines;
}
function createPdfReport() {
  const item = cases[activeCase],
    summary = reportRows();
  const lines = [
    "NEXUS VERITY - EVIDENCE REVIEW REPORT",
    "",
    `${item.company} | ${item.code}`,
    item.title,
    `Generated ${new Date().toLocaleString()}`,
    `Comparison sources: ${evidenceDocuments(item).length}`,
    "",
  ];
  summary.forEach((row) => {
    lines.push(
      `Finding ${row.finding}: ${row.metric}`,
      `Result: ${row.result} | Confidence: ${row.confidence} | Decision: ${row.decision}`,
    );
    lines.push(
      ...wrapReportLine(
        `Claim: ${row.claimSource}${row.claimPage ? `, page ${row.claimPage}` : ""}`,
      ),
    );
    lines.push(
      ...wrapReportLine(
        `Evidence: ${row.evidenceSource || "No matching source"}${row.evidencePage ? `, page ${row.evidencePage}` : ""}`,
      ),
    );
    lines.push(...wrapReportLine(`Explanation: ${row.explanation}`));
    if (row.reviewerNote)
      lines.push(...wrapReportLine(`Reviewer note: ${row.reviewerNote}`));
    lines.push("");
  });
  const pages = [];
  for (let index = 0; index < lines.length; index += 47)
    pages.push(lines.slice(index, index + 47));
  const objects = [
    "",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  const pageIds = [];
  pages.forEach((pageLines) => {
    const pageId = objects.length + 1,
      contentId = pageId + 1;
    pageIds.push(pageId);
    const stream = `BT\n/F1 10 Tf\n48 750 Td\n14 TL\n${pageLines.map((line) => `(${pdfEscape(line)}) Tj T*`).join("\n")}\nET`;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    objects.push(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
  });
  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  let pdf = "%PDF-1.4\n",
    offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)
    .join(
      "\n",
    )}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  download(
    `${item.code.toLowerCase().replace("–", "-")}-review-report.pdf`,
    pdf,
    "application/pdf",
  );
}
function highlight(text, displayValue) {
  const safe = esc(text);
  return !displayValue || displayValue === "qualitative"
    ? safe
    : safe.replace(esc(displayValue), `<mark>${esc(displayValue)}</mark>`);
}
function facts(claim) {
  if (!claim) return `<div><dt>Evidence</dt><dd>Not found</dd></div>`;
  return [
    ["Metric", claim.metric],
    ["Value", claim.displayValue],
    ["Period", claim.period],
    ["Scope", claim.scope],
  ]
    .map(
      ([key, value]) =>
        `<div><dt>${esc(key)}</dt><dd>${esc(value || "Not stated")}</dd></div>`,
    )
    .join("");
}

function renderCases() {
  const query = $("caseSearch").value.trim().toLowerCase();
  const status = $("caseStatus").value;
  const all = cases.map((item, index) => ({
    item,
    index,
    findings: caseAnalysis(index).findings,
    reviewed: reviewedCount(index),
  }));
  const totalFindings = all.reduce((sum, row) => sum + row.findings.length, 0),
    reviewedFindings = all.reduce((sum, row) => sum + row.reviewed, 0);
  $("openCasesCount").textContent = all.filter(
    (row) => row.reviewed < row.findings.length,
  ).length;
  $("totalFindingsCount").textContent = totalFindings;
  $("pendingFindingsCount").textContent = Math.max(
    0,
    totalFindings - reviewedFindings,
  );
  const rows = all.filter(
    ({ item, findings, reviewed }) =>
      (!query ||
        `${item.company} ${item.code} ${item.title}`
          .toLowerCase()
          .includes(query)) &&
      (status === "all" || item.status === status) &&
      (caseScope === "all" ||
        (caseScope === "complete"
          ? reviewed === findings.length
          : reviewed < findings.length)),
  );
  $("caseList").innerHTML = rows.length
    ? `<div class="case-row case-row-head" aria-hidden="true"><span>Company</span><span>Status</span><span>Highest signal</span><span>Review</span><span>Owner</span><span>Due</span><span></span></div>${rows
        .map(({ item, index, findings, reviewed }) => {
          const signal = findings.some(
            (f) => f.result.label === "potential contradiction",
          )
            ? "potential contradiction"
            : findings.some((f) => f.result.label === "non-comparable")
              ? "non-comparable"
              : findings.some((f) => f.result.label === "uncertain")
                ? "uncertain"
                : "supported";
          const percent = findings.length
            ? Math.round((reviewed / findings.length) * 100)
            : 0;
          return `<button class="case-row" data-open-case="${index}"><span class="case-name"><strong>${esc(item.company)}</strong><small>${esc(item.code)} · ${esc(item.title)}</small></span><span><i class="status-dot ${item.status === "In review" ? "live" : ""}"></i>${esc(item.status)}</span><span><span class="table-result ${resultClass(signal)}">${esc(signal)}</span></span><span class="review-cell"><i class="mini-progress"><span style="width:${percent}%"></span></i><small>${reviewed}/${findings.length}</small></span><span>${esc(item.owner)}</span><span>${esc(item.due)}</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>`;
        })
        .join("")}`
    : `<div class="empty-state"><strong>No cases found</strong><span>Try a different search or filter.</span></div>`;
  document.querySelectorAll("[data-open-case]").forEach((button) =>
    button.addEventListener("click", () => {
      activeCase = Number(button.dataset.openCase);
      activeFinding = 0;
      renderCase();
      switchView("workspace");
    }),
  );
}

function renderCaseSwitcher() {
  $("caseSwitcher").innerHTML = cases
    .map(
      (item, index) => `<option value="${index}">${esc(item.company)}</option>`,
    )
    .join("");
  $("caseSwitcher").value = String(activeCase);
}
function renderCase() {
  const item = cases[activeCase];
  analysis = caseAnalysis(activeCase);
  activeFinding = Math.min(
    activeFinding,
    Math.max(analysis.findings.length - 1, 0),
  );
  const sourceTotal = evidenceDocuments(item).length;
  $("caseTitle").textContent = item.company;
  $("caseMeta").textContent =
    `${item.code} · ${item.title} · ${sourceTotal} comparison source${sourceTotal === 1 ? "" : "s"} · Assigned to ${item.owner} · Due ${item.due}`;
  renderCaseSwitcher();
  renderTable();
  renderFinding();
  renderCases();
  renderDocuments();
}

function renderFinding() {
  const finding = analysis.findings[activeFinding];
  if (!finding) {
    $("finding-title").textContent = "No comparable claims found";
    return;
  }
  const { claim, evidence, result } = finding;
  $("claimDocument").textContent = claim.documentTitle;
  $("claimPage").textContent = claim.page
    ? `p. ${claim.page}`
    : "Location unavailable";
  $("claimType").textContent = claim.sourceType;
  $("claimText").innerHTML = highlight(claim.text, claim.displayValue);
  $("claimFacts").innerHTML = facts(claim);
  $("evidenceDocument").textContent =
    evidence?.documentTitle || "No matching passage";
  $("evidencePage").textContent = evidence?.page ? `p. ${evidence.page}` : "—";
  $("evidenceType").textContent = evidence?.sourceType || "Retrieval result";
  $("evidenceText").innerHTML = evidence
    ? highlight(evidence.text, evidence.displayValue)
    : "No relevant evidence was retrieved for this metric.";
  $("evidenceFacts").innerHTML = facts(evidence);
  $("findingStatus").className = `status-chip ${resultClass(result.label)}`;
  $("findingStatus").textContent = result.label;
  $("finding-title").textContent = result.type.replace(/\b\w/g, (char) =>
    char.toUpperCase(),
  );
  $("findingExplanation").textContent = result.explanation;
  $("findingConfidence").textContent =
    `${Math.round(result.confidence * 100)}%`;
  $("facetList").innerHTML = result.facets
    ? Object.entries(result.facets)
        .filter(([key]) => key !== "comparable")
        .map(
          ([key, value]) =>
            `<span class="facet ${value ? "" : "fail"}">${esc(key.replace(/([A-Z])/g, " $1"))}: ${value ? "match" : "check"}</span>`,
        )
        .join("")
    : `<span class="facet fail">No evidence match</span>`;
  const saved = reviews[reviewKey(finding)] || {};
  selectedDecision = saved.decision || "";
  $("reviewNote").value = saved.note || "";
  $("noteCount").textContent = $("reviewNote").value.length;
  document
    .querySelectorAll("[data-decision]")
    .forEach((button) =>
      button.classList.toggle(
        "selected",
        button.dataset.decision === selectedDecision,
      ),
    );
  $("saveState").textContent = saved.savedAt
    ? `Saved ${new Date(saved.savedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
    : "";
  $("progressLabel").textContent =
    `Finding ${activeFinding + 1} of ${analysis.findings.length}`;
  const reviewed = reviewedCount(activeCase),
    percent = analysis.findings.length
      ? Math.round((reviewed / analysis.findings.length) * 100)
      : 0;
  $("reviewPercent").textContent = `${percent}% reviewed`;
  $("reviewProgressBar").style.width = `${percent}%`;
  $("previousFinding").disabled = activeFinding === 0;
  $("nextFinding").disabled = activeFinding >= analysis.findings.length - 1;
  document
    .querySelectorAll("#findingsTable tr[data-finding]")
    .forEach((row) =>
      row.classList.toggle(
        "active",
        Number(row.dataset.finding) === activeFinding,
      ),
    );
  document
    .querySelectorAll("#findingRail [data-finding]")
    .forEach((row) =>
      row.classList.toggle(
        "active",
        Number(row.dataset.finding) === activeFinding,
      ),
    );
}

function filteredFindings() {
  const resultFilter = $("statusFilter").value;
  return analysis.findings
    .map((finding, index) => ({
      finding,
      index,
      saved: reviews[reviewKey(finding)],
    }))
    .filter(
      ({ finding, saved }) =>
        (resultFilter === "all" || finding.result.label === resultFilter) &&
        (scopeFilter === "all" ||
          (scopeFilter === "reviewed" ? saved : !saved)),
    );
}
function renderTable() {
  const rows = filteredFindings();
  $("findingsTable").innerHTML = rows.length
    ? rows
        .map(
          ({ finding, index, saved }) =>
            `<tr data-finding="${index}" tabindex="0"><td>${String(index + 1).padStart(2, "0")}</td><td><strong>${esc(finding.claim.metric)}</strong></td><td><span class="table-result ${resultClass(finding.result.label)}">${esc(finding.result.label)}</span></td><td>${Math.round(finding.result.confidence * 100)}%</td><td>${saved ? esc(saved.decision) : "Pending"}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="5"><div class="empty-state">No findings match this filter.</div></td></tr>`;
  document
    .querySelectorAll("#findingsTable tr[data-finding]")
    .forEach((row) => {
      const open = () => {
        activeFinding = Number(row.dataset.finding);
        renderFinding();
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter") open();
      });
    });
  $("railCount").textContent = `${rows.length} shown`;
  $("findingRail").innerHTML = rows.length
    ? rows
        .map(
          ({ finding, index, saved }) =>
            `<button class="finding-item ${index === activeFinding ? "active" : ""}" data-finding="${index}"><i class="${resultClass(finding.result.label)}"></i><span><strong>${esc(finding.claim.metric)}</strong><small>${esc(finding.result.label)} · ${Math.round(finding.result.confidence * 100)}%</small>${saved ? `<small class="reviewed">Reviewed · ${esc(saved.decision)}</small>` : ""}</span></button>`,
        )
        .join("")
    : `<div class="empty-state"><strong>No findings</strong><span>Change the current filter.</span></div>`;
  document.querySelectorAll("#findingRail [data-finding]").forEach((button) =>
    button.addEventListener("click", () => {
      activeFinding = Number(button.dataset.finding);
      renderFinding();
    }),
  );
}

function allDocuments() {
  const seen = new Map();
  cases.forEach((item) =>
    [item.primary, ...evidenceDocuments(item)].forEach((document) =>
      seen.set(document.id, document),
    ),
  );
  return [...seen.values()];
}
function renderDocuments() {
  const query = $("documentSearch").value.trim().toLowerCase(),
    type = $("documentType").value;
  const rows = allDocuments().filter(
    (document) =>
      (!query ||
        `${document.title} ${document.id} ${document.file}`
          .toLowerCase()
          .includes(query)) &&
      (type === "all" || document.sourceType === type),
  );
  $("documentLibrary").innerHTML = rows.length
    ? `<div class="document-row document-row-head" aria-hidden="true"><span>Document</span><span>Type</span><span>Year</span><span>Location</span></div>${rows.map((document) => `<button class="document-row" data-document-id="${esc(document.id)}"><span class="document-name"><strong>${esc(document.title)}</strong><small>${esc(document.id)}</small></span><span>${esc(document.sourceType)}</span><span>${esc(document.year || "—")}</span><span>${esc(document.page ? `p. ${document.page}` : "—")}</span></button>`).join("")}`
    : `<div class="empty-state"><strong>No documents found</strong><span>Try a broader search.</span></div>`;
  document
    .querySelectorAll("[data-document-id]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        showSource(
          allDocuments().find((item) => item.id === button.dataset.documentId),
        ),
      ),
    );
}
function showSource(document) {
  if (!document) return;
  $("sourceDialogContent").innerHTML =
    `<div class="source-detail"><p>${esc(document.title)}</p><div class="source-detail-grid"><div><span>Document ID</span><strong>${esc(document.id)}</strong></div><div><span>Type</span><strong>${esc(document.sourceType)}</strong></div><div><span>File</span><strong>${esc(document.file || "Local text")}</strong></div><div><span>Location</span><strong>${esc(document.page ? `Page ${document.page}` : "Web page")}</strong></div></div><blockquote>${esc(document.text)}</blockquote>${document.url ? `<a class="button source-original" href="${esc(document.url)}" target="_blank" rel="noreferrer">Open original document</a>` : ""}</div>`;
  $("sourceDialog").showModal();
}
function switchView(view, updateHash = true) {
  document
    .querySelectorAll(".view")
    .forEach((section) =>
      section.classList.toggle("active", section.id === view),
    );
  document
    .querySelectorAll("[data-view]")
    .forEach((button) =>
      button.classList.toggle("active", button.dataset.view === view),
    );
  if (updateHash) history.replaceState(null, "", `#${view}`);
  const resetScroll = () =>
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  resetScroll();
  requestAnimationFrame(() => requestAnimationFrame(resetScroll));
  setTimeout(resetScroll, 80);
  if (view === "cases") renderCases();
  if (view === "documents") renderDocuments();
}
async function readFile(input, target, state) {
  const targetNode = typeof target === "string" ? $(target) : target,
    stateNode = typeof state === "string" ? $(state) : state;
  const file = input.files[0];
  if (!file) return;
  if (file.size > 25 * 1024 * 1024) {
    stateNode.textContent = "File exceeds 25 MB";
    return;
  }
  stateNode.textContent = `Reading ${file.name}…`;
  try {
    if (
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    ) {
      const pdfjs = await import(
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs"
      );
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs";
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() })
          .promise,
        pages = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        stateNode.textContent = `Reading page ${pageNumber} of ${pdf.numPages}…`;
        const page = await pdf.getPage(pageNumber),
          content = await page.getTextContent();
        pages.push({
          page: pageNumber,
          text: content.items.map((item) => item.str).join(" "),
        });
      }
      importedPages.set(targetNode.id, pages);
      targetNode.value = pages.map((page) => page.text).join("\n\n");
      stateNode.textContent = `${file.name} · ${pdf.numPages} pages · citations ready`;
    } else {
      importedPages.delete(targetNode.id);
      targetNode.value = await file.text();
      stateNode.textContent = `${file.name} · ready`;
    }
  } catch {
    importedPages.delete(targetNode.id);
    stateNode.textContent = "Could not read this file. Paste its text instead.";
  }
}

function addEvidenceSource() {
  const index = document.querySelectorAll(".evidence-input").length;
  const section = document.createElement("section");
  section.className = "document-input evidence-input";
  section.dataset.sourceIndex = index;
  section.innerHTML = `<div class="input-heading"><span>B${index + 1}</span><div><h2>Comparison source ${index + 1}</h2><p>Filing, assurance statement, policy, or public disclosure</p></div><button class="icon-button remove-source" type="button" aria-label="Remove comparison source"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button></div><label>Document title<input class="evidence-title" value="Additional comparison source" required></label><label>Document text<textarea class="evidence-text" id="evidenceInputText-${index}" rows="12" placeholder="Paste document text or choose a text-based file" required></textarea></label><label class="file-picker"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 16V4m0 0L8 8m4-4 4 4M5 16v4h14v-4"/></svg>Choose TXT or PDF<input class="evidence-file" type="file" accept=".txt,.pdf,text/plain,application/pdf"></label><span class="file-state evidence-file-state">Maximum 25 MB</span>`;
  $("evidenceInputs").append(section);
  section
    .querySelector(".evidence-file")
    .addEventListener("change", (event) =>
      readFile(
        event.target,
        section.querySelector(".evidence-text"),
        section.querySelector(".evidence-file-state"),
      ),
    );
  section.querySelector(".remove-source").addEventListener("click", () => {
    importedPages.delete(section.querySelector(".evidence-text").id);
    section.remove();
    toast("Comparison source removed.");
  });
  section.querySelector(".evidence-title").focus();
}

const demoSteps = [
  {
    title: "Start with a review case",
    copy: "This case contains a clear numeric conflict. The header keeps ownership, source count, and review progress visible.",
    selector: ".review-header",
  },
  {
    title: "Read the exact evidence",
    copy: "The reported claim and the strongest matching source stay side by side, with document names and page citations attached.",
    selector: ".evidence-stage",
  },
  {
    title: "Check why it was flagged",
    copy: "Nexus Verity checks metric, period, scope, and units before showing the result, confidence, and explanation.",
    selector: ".finding-panel",
  },
  {
    title: "Decide and export",
    copy: "The reviewer confirms or revises the finding, records a note, then exports an audit-ready PDF, CSV register, or JSON record.",
    selector: ".review-header-actions",
  },
];
let demoStep = 0;
function renderDemoStep() {
  const step = demoSteps[demoStep];
  document
    .querySelectorAll(".demo-focus")
    .forEach((node) => node.classList.remove("demo-focus"));
  const target = document.querySelector(step.selector);
  target?.classList.add("demo-focus");
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
  $("demoProgress").textContent = `${demoStep + 1} of ${demoSteps.length}`;
  $("demoTitle").textContent = step.title;
  $("demoCopy").textContent = step.copy;
  $("demoBack").disabled = demoStep === 0;
  $("demoNext").textContent =
    demoStep === demoSteps.length - 1 ? "Finish" : "Next";
}
function startDemo() {
  const demoCase = cases.findIndex((item) => item.code === "SYN–001");
  activeCase = demoCase >= 0 ? demoCase : 0;
  activeFinding = 0;
  renderCase();
  switchView("workspace");
  demoStep = 0;
  $("demoGuide").hidden = false;
  setTimeout(renderDemoStep, 100);
}
function closeDemo() {
  $("demoGuide").hidden = true;
  document
    .querySelectorAll(".demo-focus")
    .forEach((node) => node.classList.remove("demo-focus"));
}

document
  .querySelectorAll("[data-view]")
  .forEach((button) =>
    button.addEventListener("click", () => switchView(button.dataset.view)),
  );
document.querySelectorAll("[data-action-view]").forEach((button) =>
  button.addEventListener("click", (event) => {
    event.preventDefault();
    switchView(button.dataset.actionView);
  }),
);
$("caseSearch").addEventListener("input", renderCases);
$("caseStatus").addEventListener("change", renderCases);
$("documentSearch").addEventListener("input", renderDocuments);
$("documentType").addEventListener("change", renderDocuments);
document.querySelectorAll("[data-case-scope]").forEach((button) =>
  button.addEventListener("click", () => {
    caseScope = button.dataset.caseScope;
    document
      .querySelectorAll("[data-case-scope]")
      .forEach((item) => item.classList.toggle("active", item === button));
    renderCases();
  }),
);
$("caseSwitcher").addEventListener("change", (event) => {
  activeCase = Number(event.target.value);
  activeFinding = 0;
  renderCase();
});
$("statusFilter").addEventListener("change", renderTable);
document.querySelectorAll("[data-scope]").forEach((button) =>
  button.addEventListener("click", () => {
    scopeFilter = button.dataset.scope;
    document
      .querySelectorAll("[data-scope]")
      .forEach((item) => item.classList.toggle("active", item === button));
    renderTable();
  }),
);
$("previousFinding").addEventListener("click", () => {
  if (activeFinding > 0) {
    activeFinding -= 1;
    renderFinding();
  }
});
$("nextFinding").addEventListener("click", () => {
  if (activeFinding < analysis.findings.length - 1) {
    activeFinding += 1;
    renderFinding();
  }
});
document.querySelectorAll("[data-decision]").forEach((button) =>
  button.addEventListener("click", () => {
    selectedDecision = button.dataset.decision;
    document
      .querySelectorAll("[data-decision]")
      .forEach((item) => item.classList.toggle("selected", item === button));
  }),
);
$("reviewNote").addEventListener("input", (event) => {
  $("noteCount").textContent = event.target.value.length;
});
$("saveReview").addEventListener("click", () => {
  const finding = analysis.findings[activeFinding];
  if (!selectedDecision) {
    toast("Choose a review decision first.", "error");
    return;
  }
  reviews[reviewKey(finding)] = {
    decision: selectedDecision,
    note: $("reviewNote").value.trim(),
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem("nexus-verity-reviews", JSON.stringify(reviews));
  renderTable();
  renderFinding();
  renderCases();
  toast("Decision saved in this browser.");
});
document.querySelectorAll("[data-export]").forEach((button) =>
  button.addEventListener("click", () => {
    const format = button.dataset.export,
      item = cases[activeCase];
    if (format === "pdf") createPdfReport();
    if (format === "csv") exportCsv();
    if (format === "json")
      download(
        `${item.code.toLowerCase().replace("–", "-")}-review.json`,
        JSON.stringify(caseExportData(), null, 2),
      );
    $("exportMenu").open = false;
    toast(`${format.toUpperCase()} report exported.`);
  }),
);
document.querySelectorAll("[data-source-side]").forEach((button) =>
  button.addEventListener("click", () => {
    const finding = analysis.findings[activeFinding],
      documentId =
        button.dataset.sourceSide === "claim"
          ? finding?.claim?.documentId
          : finding?.evidence?.documentId;
    showSource(allDocuments().find((item) => item.id === documentId));
  }),
);
document.querySelectorAll("[data-copy-side]").forEach((button) =>
  button.addEventListener("click", async () => {
    const finding = analysis.findings[activeFinding],
      claim =
        button.dataset.copySide === "claim"
          ? finding?.claim
          : finding?.evidence;
    if (!claim) {
      toast("No excerpt is available to copy.", "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(
        `${claim.text}\n— ${claim.documentTitle}${claim.page ? `, p. ${claim.page}` : ""}`,
      );
      toast("Excerpt and citation copied.");
    } catch {
      toast("Copy failed. Select the excerpt manually.", "error");
    }
  }),
);
$("collapseRail").addEventListener("click", () => {
  document.body.classList.toggle("rail-collapsed");
  $("collapseRail").setAttribute(
    "aria-label",
    document.body.classList.contains("rail-collapsed")
      ? "Expand findings"
      : "Collapse findings",
  );
});
$("primaryFile").addEventListener("change", (event) =>
  readFile(event.target, "primaryText", "primaryFileState"),
);
$("evidenceFile").addEventListener("change", (event) =>
  readFile(event.target, "evidenceInputText", "evidenceFileState"),
);
$("addEvidenceSource").addEventListener("click", addEvidenceSource);
$("startDemo").addEventListener("click", startDemo);
$("closeDemo").addEventListener("click", closeDemo);
$("demoBack").addEventListener("click", () => {
  if (demoStep > 0) {
    demoStep -= 1;
    renderDemoStep();
  }
});
$("demoNext").addEventListener("click", () => {
  if (demoStep >= demoSteps.length - 1) closeDemo();
  else {
    demoStep += 1;
    renderDemoStep();
  }
});
$("importForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const primaryText = $("primaryText").value.trim();
  const sourceSections = [...document.querySelectorAll(".evidence-input")],
    sourceValues = sourceSections
      .map((section) => ({
        section,
        text: section.querySelector(".evidence-text").value.trim(),
      }))
      .filter((source) => source.text);
  if (!primaryText || !sourceValues.length) {
    $("importValidation").hidden = false;
    $("importValidation").textContent =
      "Add text for the reported disclosure and at least one comparison source.";
    return;
  }
  const index = storedCases.length + 1;
  const primary = {
    id: `LOCAL-A-${index}`,
    title: $("primaryTitle").value.trim() || "Reported disclosure",
    sourceType: "Sustainability report",
    page: null,
    year: "",
    file: $("primaryFile").files[0]?.name || "Pasted text",
    text: primaryText,
    pages: importedPages.get("primaryText") || undefined,
  };
  const evidenceDocuments = sourceValues.map(
    ({ section, text }, sourceIndex) => {
      const textarea = section.querySelector(".evidence-text"),
        file = section.querySelector(".evidence-file");
      return {
        id: `LOCAL-B${sourceIndex + 1}-${index}`,
        title:
          section.querySelector(".evidence-title").value.trim() ||
          `Comparison source ${sourceIndex + 1}`,
        sourceType: "Regulatory filing",
        page: null,
        year: "",
        file: file.files[0]?.name || "Pasted text",
        text,
        pages: importedPages.get(textarea.id) || undefined,
      };
    },
  );
  const item = {
    code: `LOCAL–${String(index).padStart(3, "0")}`,
    company: "Local comparison",
    title: `Imported review · ${evidenceDocuments.length} source${evidenceDocuments.length === 1 ? "" : "s"}`,
    priority: "Medium",
    owner: "You",
    due: "Not set",
    status: "In review",
    primary,
    evidenceDocuments,
  };
  storedCases.unshift(item);
  localStorage.setItem("nexus-verity-cases", JSON.stringify(storedCases));
  cases.unshift(item);
  activeCase = 0;
  activeFinding = 0;
  $("importValidation").hidden = true;
  renderCase();
  switchView("workspace");
  toast("Comparison created.");
});

const initialView = ["cases", "workspace", "documents", "import"].includes(
  location.hash.slice(1),
)
  ? location.hash.slice(1)
  : "cases";
// Remove the native anchor before first paint so a direct #workspace URL never
// scrolls the page underneath the sticky application header.
if (location.hash)
  history.replaceState(null, "", `${location.pathname}${location.search}`);
renderCases();
renderDocuments();
renderCase();
switchView(initialView, false);

document.addEventListener("keydown", (event) => {
  if (
    !$("workspace").classList.contains("active") ||
    $("sourceDialog").open ||
    /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)
  )
    return;
  const key = event.key.toLowerCase();
  if (key === "j" && activeFinding < analysis.findings.length - 1) {
    activeFinding += 1;
    renderFinding();
  }
  if (key === "k" && activeFinding > 0) {
    activeFinding -= 1;
    renderFinding();
  }
  if (["1", "2", "3"].includes(key)) {
    const decision = { 1: "confirmed", 2: "revised", 3: "non-comparable" }[key];
    document.querySelector(`[data-decision="${decision}"]`)?.click();
  }
  if ((event.ctrlKey || event.metaKey) && key === "s") {
    event.preventDefault();
    $("saveReview").click();
  }
});
