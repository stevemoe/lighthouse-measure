import puppeteer from "puppeteer";
import fs from "fs";
import { getCurrentTimestamp } from "../lib/timestamp.js";
import { runHwInteractions } from "./helloWorldInteractions.js";
import { wait } from "../lib/utils.js";

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

export const runCoverage = async (framework, interaction) => {
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

  await page.goto(`https://${framework}-hello-world.vercel.app/`, {
    waitUntil: "networkidle0",
  });

  await page.waitForSelector("#klick1");

  if (interaction) {
    await runHwInteractions(page);
    await wait(1000);
  }

  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage(),
  ]);

  // console.log(JSON.stringify(jsCoverage));
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

const frameworks = [
  "qwik-ssr",
  "nextjs-ssr",
  "react-csr",
  "solidjs-ssr",
  "solidjs-csr",
];

const interaction = false;
const numberOfRuns = 5;
for (let framework of frameworks) {
  const outputFolder = `output/${framework}/coverage/${interaction ? "with_interaction" : "page_load"}`;
  let meansTotal = [];
  let meansUnused = [];
  for (let i = 0; i < numberOfRuns; i++) {
    console.log(`Running coverage for ${framework}`);

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
    meansTotal.push(coverageData.totalBytes);
    meansUnused.push(coverageData.totalBytes - coverageData.usedBytes);
    const csvContent = csvData.map((e) => e.join(",")).join("\n");

    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }
    fs.writeFileSync(
      `${outputFolder}/${framework}-coverage-${interaction ? "with_interaction" : "page_load"}-${getCurrentTimestamp()}.csv`,
      csvContent,
    );
  }

  const meanCsvData = [
    ["Mean Total Bytes", "Mean Unused Bytes"],
    [
      meansTotal.reduce((a, b) => a + b, 0) / numberOfRuns,
      meansUnused.reduce((a, b) => a + b, 0) / numberOfRuns,
    ],
  ];
  const meanCsvContent = meanCsvData.map((e) => e.join(",")).join("\n");

  fs.writeFileSync(
    `${outputFolder}/${framework}-mean-coverage-${interaction ? "with_interaction" : "page_load"}-${getCurrentTimestamp()}.csv`,
    meanCsvContent,
  );
}
