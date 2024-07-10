import puppeteer from "puppeteer";
import fs from "fs";
import { getCurrentTimestamp } from "../lib/timestamp.js";
import { runGbInteractions } from "./guestbookInteractions.js";

// const url = 'https://nextjs-interactive.vercel.app/';
// const url = 'https://qwik-interactive.vercel.app/';
const url = "https://react-interactive.vercel.app/";

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

  // Calculate JS coverage
  let totalJsBytes = 0;
  let usedJsBytes = 0;
  jsCoverage.forEach((entry) => {
    totalJsBytes += entry.text.length;
    entry.ranges.forEach((range) => {
      usedJsBytes += range.end - range.start - 1;
    });
  });

  // Calculate CSS coverage
  let totalCssBytes = 0;
  let usedCssBytes = 0;
  cssCoverage.forEach((entry) => {
    totalCssBytes += entry.text.length;
    entry.ranges.forEach((range) => {
      usedCssBytes += range.end - range.start - 1;
    });
  });

  // Calculate totals
  const totalBytes = totalJsBytes + totalCssBytes;
  const usedBytes = usedJsBytes + usedCssBytes;
  const unusedJsBytes = totalJsBytes - usedJsBytes;
  const unusedCssBytes = totalCssBytes - usedCssBytes;

  // Prepare CSV data

  // await flow.endTimespan();

  // await flow.navigate(
  //     // await page.click("#klickBurger").then((res) => console.log(res));
  //     // const dashboard = await page.waitForSelector('p#linkToDashboard');
  //     // await dashboard.click()
  //     "http://localhost:4173/dashboard/"
  // );

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
