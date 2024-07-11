import puppeteer from "puppeteer";
import fs from "fs";
import { getCurrentTimestamp } from "../lib/timestamp.js";
import { runGbInteractions } from "./guestbookInteractions.js";

// Code aus Puppeteer Docs
// https://pptr.dev/api/puppeteer.coverage

function calcCoverage(coverage) {
  let totalBytes = 0;
  let usedBytes = 0;
  coverage.forEach((entry) => {
    totalBytes += entry.text.length;
    entry.ranges.forEach((range) => {
      usedBytes += range.end - range.start - 1;
    });
  });
  return [totalBytes, usedBytes];
}

const runCoverage = async (framework, interaction) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({
    width: 412,
    height: 823,
    deviceScaleFactor: 1,
  });

  await Promise.all([
    page.coverage.startJSCoverage(),
    page.coverage.startCSSCoverage(),
  ]);

  await page.goto(`https://${framework}-interactive.vercel.app/`, {
    waitUntil: "networkidle0",
  });

  if (interaction) {
    await runGbInteractions(page);
  }

  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage(),
  ]);

  console.log(JSON.stringify(jsCoverage));
  // console.log(cssCoverage);
  const [totalJsBytes, usedJsBytes] = calcCoverage(jsCoverage);
  const [totalCssBytes, usedCssBytes] = calcCoverage(cssCoverage);

  const totalBytes = totalJsBytes + totalCssBytes;
  const usedBytes = usedJsBytes + usedCssBytes;
  const unusedJsBytes = totalJsBytes - usedJsBytes;
  const unusedCssBytes = totalCssBytes - usedCssBytes;

  await browser.close();
  return {
    totalJsBytes,
    totalCssBytes,
    totalBytes,
    usedBytes,
    unusedJsBytes,
    unusedCssBytes,
  };
};

const frameworks = ["qwik", "nextjs", "react", "solidjs", "solidjs-csr"];

const interaction = true;

for (let framework of frameworks) {
  for (let i = 0; i < 5; i++) {
    console.log(`Running coverage for ${framework}`);
    const outputFolder = `/Users/stefan/Library/Mobile Documents/com~apple~CloudDocs/Studium Media Engineering/Bachelorarbeit/Messwerte/Interactive App/${framework}/coverage/${interaction ? "with_interaction" : "page_load"}`;

    const coverageData = await runCoverage(framework, interaction);
    const csvData = [
      [
        "Type",
        "Total Bytes",
        "Unused Bytes",
        "Unused Bytes prozentualer Anteil",
      ],
      [
        "JS",
        coverageData.totalJsBytes,
        coverageData.unusedJsBytes,
        `${((coverageData.unusedJsBytes / coverageData.totalJsBytes) * 100).toFixed(2)} %`,
      ],
      [
        "CSS",
        coverageData.totalCssBytes,
        coverageData.unusedCssBytes,
        `${((coverageData.unusedCssBytes / coverageData.totalCssBytes) * 100).toFixed(2)} %`,
      ],
      [
        "Gesamt",
        coverageData.totalBytes,
        coverageData.totalBytes - coverageData.usedBytes,
        `${(((coverageData.totalBytes - coverageData.usedBytes) / coverageData.totalBytes) * 100).toFixed(2)} %`,
      ],
    ];

    const csvContent = csvData.map((e) => e.join(",")).join("\n");

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
    fs.writeFileSync(
      `${outputFolder}/${framework}-coverage-${interaction ? "with_interaction" : "page_load"}-${getCurrentTimestamp()}.csv`,
      csvContent,
    );
  }
}
