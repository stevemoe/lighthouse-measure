import puppeteer from 'puppeteer';
import fs from 'fs';
import {getCurrentTimestamp} from "../lib/timestamp.js";

export const runCoverage = async (framework, interaction) => {
    const browser = await puppeteer.launch({headless: true});

    const page = await browser.newPage();
    await Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage(),
    ]);

    await page.goto(`https://${framework}-hello-world.vercel.app/`, {waitUntil: 'networkidle0'});

    if (interaction) {
        await page.click('#klick1');
        await page.waitForNetworkIdle()
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));
    }


    const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
    ]);


    let totalJsBytes = 0;
    let usedJsBytes = 0;
    jsCoverage.forEach(entry => {
        totalJsBytes += entry.text.length;
        entry.ranges.forEach(range => {
            usedJsBytes += range.end - range.start - 1;
        });
    });

    let totalCssBytes = 0;
    let usedCssBytes = 0;
    cssCoverage.forEach(entry => {
        totalCssBytes += entry.text.length;
        entry.ranges.forEach(range => {
            usedCssBytes += range.end - range.start - 1;
        });
    });

    const totalBytes = totalJsBytes + totalCssBytes;
    const usedBytes = usedJsBytes + usedCssBytes;
    const unusedJsBytes = totalJsBytes - usedJsBytes;
    const unusedCssBytes = totalCssBytes - usedCssBytes;


    await browser.close();
    return {totalJsBytes, totalCssBytes, totalBytes, usedBytes, unusedJsBytes, unusedCssBytes};
};

// const frameworks = ["qwik-ssr", "nextjs-ssr", "react-csr", "solidjs-ssr", "solidjs-csr"];
const frameworks = ["solidjs-ssr", "solidjs-csr"];

const interaction = true;
const numberOfRuns = 5;
for (let framework of frameworks) {
    const outputFolder = `/Users/stefan/Library/Mobile Documents/com~apple~CloudDocs/Studium Media Engineering/Bachelorarbeit/Messwerte/HelloWorldApps/${framework}/coverage_2/${interaction ? "with_interaction" : "page_load"}`;
    let meansTotal = [];
    let meansUnused = [];
    for (let i = 0; i < numberOfRuns; i++) {
        console.log(`Running coverage for ${framework}`);

        const coverageData = await runCoverage(framework, interaction);
        const csvData = [
            ['Type', 'Total Bytes', 'Unused Bytes', 'Unused Bytes prozentualer Anteil'],
            ['JS', coverageData.totalJsBytes, coverageData.unusedJsBytes, `${((coverageData.unusedJsBytes / coverageData.totalJsBytes) * 100).toFixed(2)} %`],
            ['CSS', coverageData.totalCssBytes, coverageData.unusedCssBytes, `${((coverageData.unusedCssBytes) / (coverageData.totalCssBytes) * 100).toFixed(2)} %`],
            ['Gesamt', coverageData.totalBytes, coverageData.totalBytes - coverageData.usedBytes, `${((coverageData.totalBytes - coverageData.usedBytes) / coverageData.totalBytes * 100).toFixed(2)} %`]
        ];
        meansTotal.push(coverageData.totalBytes);
        meansUnused.push(coverageData.totalBytes - coverageData.usedBytes);
        const csvContent = csvData.map(e => e.join(',')).join('\n');

        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, {recursive: true});
        }
        fs.writeFileSync(`${outputFolder}/${framework}-coverage-${interaction ? "with_interaction" : "page_load"}-${getCurrentTimestamp()}.csv`, csvContent);
    }

    const meanCsvData = [
        ['Mean Total Bytes', 'Mean Unused Bytes'],
        [meansTotal.reduce((a, b) => a + b, 0) / numberOfRuns, meansUnused.reduce((a, b) => a + b, 0) / numberOfRuns]
    ];
    const meanCsvContent = meanCsvData.map(e => e.join(',')).join('\n');

    fs.writeFileSync(`${outputFolder}/${framework}-mean-coverage-${interaction ? "with_interaction" : "page_load"}-${getCurrentTimestamp()}.csv`, meanCsvContent);

}
