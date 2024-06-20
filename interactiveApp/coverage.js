import puppeteer from 'puppeteer';
import fs from 'fs';

const throttlingOptions = {
    throughputKbps: 600,
    cpuSlowdownMultiplier: 4,
    requestLatencyMs: 400,
    downloadThroughputKbps: 600,
    uploadThroughputKbps: 750,
}

const lighthouseConfig = {
    config: {
        extends: 'lighthouse:default',
        settings: {
            onlyCategories: ["performance"],
            throttling: {
                throttlingOptions
            },
            // disableStorageReset: true,
            disableStorageReset: false,
            throttlingMethod: 'provided',
        }
    }
}

function getCurrentTimestamp() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Monate sind nullbasiert
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// const url = 'https://nextjs-interactive.vercel.app/';
// const url = 'https://qwik-interactive.vercel.app/';
const url = 'https://react-interactive.vercel.app/';

export const runCoverage = async (framework, interaction) => {
    const browser = await puppeteer.launch({headless: true});

    // const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // const flow = await startFlow(page,
    //     lighthouseConfig
    // );
    await Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage(),
    ]);

    await page.goto(`https://${framework}-interactive.vercel.app/`, {waitUntil: 'networkidle0'});

    // let totalBytes = 0;
    // let usedBytes = 0;
    // const coverage = [...jsCoverage, ...cssCoverage];
    // for (const entry of coverage) {
    //     totalBytes += entry.text.length;
    //     for (const range of entry.ranges) usedBytes += range.end - range.start - 1;
    // }
    // console.log(`Total bytes: ${totalBytes}`)
    // console.log(`Used bytes: ${usedBytes}`)
    // console.log(`Bytes used: ${(usedBytes / totalBytes) * 100}%`);

    if (interaction) {
        await page.click('#klick1');


        const counterUp = await page.waitForSelector('#klick2');
        for (let i = 0; i < 6; i++) {
            await counterUp.click();
        }

        await page.click("#klick3")
        const nameInput = await page.waitForSelector('#input4');
        await nameInput.type('Stefan');
        await nameInput.press('Enter');
        await page.click('#klick5');
        const nameButton = await page.waitForSelector('#klickStefan');
        await nameButton.click();
        await page.click('#klickwar');
        await page.click('#klickhier');
        await page.click('#klick9');
        await page.click('#klick10');
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));
        const lessButton1 = await page.waitForSelector('#klick11', {visible: true});
        await lessButton1.click();
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));
        const moreButton = await page.waitForSelector('#klick10', {visible: true});
        await moreButton.click();
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));
        const lessButton2 = await page.waitForSelector('#klick11', {visible: true});
        await lessButton2.click();
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));
        await page.click('#klick12');
        await page.waitForNetworkIdle();
        await page.hover("div > span.pl-1")
        await new Promise((resolve, reject) => setTimeout(resolve, 2000));

    }


    const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
    ]);


// Calculate JS coverage
    let totalJsBytes = 0;
    let usedJsBytes = 0;
    jsCoverage.forEach(entry => {
        totalJsBytes += entry.text.length;
        entry.ranges.forEach(range => {
            usedJsBytes += range.end - range.start - 1;
        });
    });

    // Calculate CSS coverage
    let totalCssBytes = 0;
    let usedCssBytes = 0;
    cssCoverage.forEach(entry => {
        totalCssBytes += entry.text.length;
        entry.ranges.forEach(range => {
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
    return {totalJsBytes, totalCssBytes, totalBytes, usedBytes, unusedJsBytes, unusedCssBytes};
};

const frameworks = ["qwik", "nextjs", "react", "solidjs", "solidjs-csr"];

const interaction = true;


for (let framework of frameworks) {

    for (let i = 0; i < 5; i++) {
        console.log(`Running coverage for ${framework}`);
        const outputFolder = `/Users/stefan/Library/Mobile Documents/com~apple~CloudDocs/Studium Media Engineering/Bachelorarbeit/Messwerte/Interactive App/${framework}/coverage/${interaction ? "with_interaction" : "page_load"}`;

        const coverageData = await runCoverage(framework, interaction);
        const csvData = [
            ['Type', 'Total Bytes', 'Unused Bytes', 'Unused Bytes prozentualer Anteil'],
            ['JS', coverageData.totalJsBytes, coverageData.unusedJsBytes, `${((coverageData.unusedJsBytes / coverageData.totalJsBytes) * 100).toFixed(2)} %`],
            ['CSS', coverageData.totalCssBytes, coverageData.unusedCssBytes, `${((coverageData.unusedCssBytes) / (coverageData.totalCssBytes) * 100).toFixed(2)} %`],
            ['Gesamt', coverageData.totalBytes, coverageData.totalBytes - coverageData.usedBytes, `${((coverageData.totalBytes - coverageData.usedBytes) / coverageData.totalBytes * 100).toFixed(2)} %`]
        ];

        const csvContent = csvData.map(e => e.join(',')).join('\n');

        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, {recursive: true});
        }
        fs.writeFileSync(`${outputFolder}/${framework}-coverage-${interaction ? "with_interaction" : "page_load"}-${getCurrentTimestamp()}.csv`, csvContent);
    }
}
