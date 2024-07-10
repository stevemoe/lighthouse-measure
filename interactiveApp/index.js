import fs from 'fs';
import {getLhrFilenamePrefix} from "lighthouse/report/generator/file-namer.js";
import {runFlow} from "./lighthouseFlow.js";
import puppeteer from "puppeteer";
import {selectFramework, selectThrottlingOption} from "../lib/selectFunctions.js";

async function runLighthouse(framework, cacheOption, networkSpeed) {
    const url = `https://${framework}-interactive.vercel.app/`;
    const outputFolder = `/Users/stefan/Library/Mobile Documents/com~apple~CloudDocs/Studium Media Engineering/Bachelorarbeit/Messwerte/Interactive App/${framework}/${networkSpeed}/${cacheOption}`;
    const lighthouseConfig = {
        config: {
            extends: 'lighthouse:default',
            settings: {
                logLevel: 'info',
                output: ['html', 'json'],
                onlyCategories: ["performance"],
                throttling: {
                    // requestLatencyMs: 0,
                    // downloadThroughputKbps: 0,
                    // uploadThroughputKbps: 0,
                    cpuSlowdownMultiplier: 10.2,
                },
                disableStorageReset: cacheOption === 'cache',
                throttlingMethod: 'provided',
            }
        }
    }

    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, {recursive: true});
    }

    const browser = await puppeteer.launch({headless: false});


    for (let i = 1; i <= numberOfRuns; i++) {
        console.log(`Lighthouse Ausführung ${i} für ${url} (${cacheOption})`);
        // const runnerResult = await lighthouse(url, options);
        const flow = await runFlow(url, lighthouseConfig, browser);
        const flowResult = await flow.createFlowResult();
        for (const format of lighthouseConfig.config.settings.output) {
            const reportPath = `${outputFolder}/${getLhrFilenamePrefix(flowResult.steps[0].lhr)}.${format}`;
            fs.writeFileSync(reportPath, format === "json" ? JSON.stringify(await flowResult, null, 2) : await flow.generateReport());
        }

        console.log(`Report ${i} gespeichert in ${outputFolder}`);
    }

    // await chrome.kill();
    await browser.close();
}

const frameworks = ["qwik", "nextjs", "react", "solidjs", "solidjs-csr"];
const numberOfRuns = 2;

(async () => {
    const framework = await selectFramework(frameworks);
    // const cacheOption = await selectCacheOption();
    const cacheOptions = ["cache", "no-cache"]
    const throttlingOption = await selectThrottlingOption();

    // await throttle.start(throttlingProfiles[throttlingOption]);
    for (const cacheOption of cacheOptions) {
        console.log(`Testing ${framework} with ${cacheOption} and ${throttlingOption}`)
        if (framework === 'alle') {
            for (const fw of frameworks) {
                await runLighthouse(fw, cacheOption, throttlingOption);
            }
        } else {
            await runLighthouse(framework, cacheOption, throttlingOption);
        }
    }
    // await new Promise(resolve => setTimeout(resolve, 50000));
    // await throttle.stop();

})();
