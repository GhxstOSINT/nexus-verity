const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: process.platform === "win32" ? "msedge" : undefined,
  });
  const results = [];
  const check = (name, pass, detail = "") => {
    results.push({ name, pass: Boolean(pass), detail });
    if (!pass) throw new Error(`${name}: ${detail}`);
  };
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    acceptDownloads: true,
  });
  await page.goto("http://127.0.0.1:4174", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  check("cases page loads", await page.locator("#cases-title").isVisible());
  check(
    "portfolio contains the public example and four demo cases",
    (await page.locator("#caseList [data-open-case]").count()) === 5,
  );
  check(
    "portfolio summary reports all eleven findings",
    (await page.locator("#totalFindingsCount").textContent()) === "11",
  );
  check(
    "primary navigation is limited to two destinations",
    (await page.locator(".topbar [data-view]").count()) === 2,
  );
  check(
    "external requirement sections are absent",
    (await page
      .locator("#knowledge, #evaluation, #researchList, #sourceMap")
      .count()) === 0,
  );
  await page.locator("#startDemo").click();
  check(
    "guided demo opens the strongest review case",
    (await page.locator("#demoGuide").isVisible()) &&
      (await page.locator("#caseTitle").textContent()) === "Atlas Components",
  );
  await page.locator("#demoNext").click();
  check(
    "guided demo advances through product actions",
    (await page.locator("#demoProgress").textContent()) === "2 of 4",
  );
  await page.locator("#closeDemo").click();
  await page.locator("#workspace [data-action-view='cases']").click();
  await page.locator("#caseList [data-open-case]").first().click();
  check(
    "public Microsoft case opens in evidence workspace",
    (await page.locator("#caseTitle").textContent()) === "Microsoft",
  );
  check(
    "both evidence excerpts are visible",
    (await page.locator("#claimText").isVisible()) &&
      (await page.locator("#evidenceText").isVisible()),
  );
  check(
    "matching public disclosures are classified as supported",
    (await page.locator("#findingStatus").textContent()).includes("supported"),
  );
  check(
    "desktop finding rail exposes the case worklist",
    (await page.locator("#findingRail [data-finding]").count()) === 1,
  );
  await page.locator("#collapseRail").click();
  check(
    "finding rail can be collapsed",
    await page
      .locator("body")
      .evaluate((body) => body.classList.contains("rail-collapsed")),
  );
  await page.locator("#collapseRail").click();
  await page.locator("[data-source-side='claim']").click();
  check(
    "source provenance opens",
    (await page.locator("#sourceDialog[open]").isVisible()) &&
      (await page.locator("#sourceDialogContent").textContent()).includes(
        "MSFT-ESR-2025",
      ),
  );
  check(
    "public source links to the original",
    (
      (await page
        .locator("#sourceDialogContent .source-original")
        .getAttribute("href")) || ""
    ).includes("microsoft.com"),
  );
  await page.locator("#sourceDialog button[value='cancel']").click();
  await page.locator("#exportMenu summary").click();
  check(
    "export menu offers PDF CSV and JSON",
    (await page.locator("#exportMenu [data-export]").count()) === 3,
  );
  const csvDownloadPromise = page.waitForEvent("download");
  await page.locator("#exportMenu [data-export='csv']").click();
  const csvDownload = await csvDownloadPromise;
  check(
    "CSV evidence register downloads",
    (await csvDownload.suggestedFilename()).endsWith("evidence-register.csv"),
  );
  await page.locator("#exportMenu summary").click();
  const pdfDownloadPromise = page.waitForEvent("download");
  await page.locator("#exportMenu [data-export='pdf']").click();
  const pdfDownload = await pdfDownloadPromise,
    pdfStream = await pdfDownload.createReadStream();
  const pdfChunks = [];
  for await (const chunk of pdfStream) pdfChunks.push(chunk);
  check(
    "generated report is a valid PDF download",
    Buffer.concat(pdfChunks).subarray(0, 8).toString() === "%PDF-1.4",
  );
  await page.keyboard.press("1");
  check(
    "keyboard shortcut selects a review decision",
    await page
      .locator("button[data-decision='confirmed']")
      .evaluate((button) => button.classList.contains("selected")),
  );
  await page.locator("#reviewNote").fill("QA review note with source context.");
  await page.locator("#saveReview").click();
  check(
    "review decision persists locally",
    (await page.locator("#saveState").textContent()).includes("Saved"),
  );
  await page.locator("[data-scope='reviewed']").click();
  check(
    "reviewed filter works",
    (await page.locator("#findingsTable").textContent()).includes("confirmed"),
  );
  await page.locator("button[data-view='cases']").click();
  await page.locator("[data-case-scope='complete']").click();
  check(
    "completed scope isolates fully reviewed cases",
    await page
      .locator("#caseList")
      .textContent()
      .then((text) => text.includes("Microsoft")),
  );
  await page.locator("button[data-view='documents']").click();
  check(
    "document library lists source artifacts",
    (await page.locator("#documentLibrary [data-document-id]").count()) === 10,
  );
  await page.locator("#documentSearch").fill("Northstar");
  check(
    "document search filters records",
    (await page.locator("#documentLibrary [data-document-id]").count()) === 2,
  );
  await page.locator("[data-action-view='import']").first().click();
  await page.locator("#primaryText").fill("Primary only");
  await page.locator("#analyzeButton").click();
  check(
    "incomplete import is blocked with inline error",
    await page.locator("#importValidation").isVisible(),
  );
  await page.locator("#addEvidenceSource").click();
  check(
    "comparison form accepts multiple evidence sources",
    (await page.locator(".evidence-input").count()) === 2,
  );
  fs.mkdirSync(path.join(__dirname, "screenshots"), { recursive: true });
  await page.waitForTimeout(3400);
  await page.screenshot({
    path: path.join(__dirname, "screenshots", "multi-source-import.png"),
    fullPage: true,
  });
  await page
    .locator(".evidence-input")
    .nth(0)
    .locator(".evidence-text")
    .fill("FY2025 water withdrawal was 1.20 million m3.");
  await page
    .locator(".evidence-input")
    .nth(1)
    .locator(".evidence-title")
    .fill("Additional assurance source");
  await page
    .locator(".evidence-input")
    .nth(1)
    .locator(".evidence-text")
    .fill("FY2025 water withdrawal was 1.24 million m3.");
  await page
    .locator("#primaryText")
    .fill("FY2025 water withdrawal was 1.20 million m3.");
  await page.locator("#analyzeButton").click();
  check(
    "created case retains both comparison sources",
    (await page.locator("#caseMeta").textContent()).includes(
      "2 comparison sources",
    ),
  );
  await page.locator("#workspace [data-action-view='cases']").click();
  await page.waitForTimeout(3400);
  await page.screenshot({
    path: path.join(__dirname, "screenshots", "desktop.png"),
    fullPage: true,
  });
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  await mobile.goto("http://127.0.0.1:4174#workspace", {
    waitUntil: "networkidle",
  });
  await mobile.waitForTimeout(120);
  const mobileRoutePosition = await mobile.evaluate(() => ({
    scrollY,
    workspaceTop: document.querySelector("#workspace").getBoundingClientRect()
      .top,
    headerTop: document
      .querySelector("#workspace .review-header")
      .getBoundingClientRect().top,
  }));
  check(
    "direct mobile route starts at the workspace header",
    mobileRoutePosition.scrollY === 0 && mobileRoutePosition.headerTop >= 0,
    JSON.stringify(mobileRoutePosition),
  );
  check(
    "mobile evidence remains visible",
    (await mobile.locator("#claimText").isVisible()) &&
      (await mobile.locator("#evidenceText").isVisible()),
  );
  check(
    "mobile has no horizontal overflow",
    await mobile.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth + 1,
    ),
  );
  check(
    "mobile review controls remain operable",
    await mobile.locator("button[data-decision='confirmed']").isVisible(),
  );
  await mobile.screenshot({
    path: path.join(__dirname, "screenshots", "mobile.png"),
    fullPage: true,
  });
  await browser.close();
  const report = {
    runAt: new Date().toISOString(),
    passed: results.filter((result) => result.pass).length,
    total: results.length,
    results,
  };
  fs.writeFileSync(
    path.join(__dirname, "browser-qa-results.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});
