import * as fs from 'fs';
import {getLhrFilenamePrefix} from "lighthouse/report/generator/file-namer.js";
import * as throttle from '@sitespeed.io/throttle'
import {selectFramework, selectThrottlingOption} from "../lib/selectFunctions.js";
import {runFlow} from "./helloWorldFlow.js";

async function runLighthouse(framework, cacheOption, networkSpeed, numberOfRuns) {
    const url = `https://${framework}-hello-world.vercel.app/`;
    const outputFolder = `/Users/stefan/Library/Mobile Documents/com~apple~CloudDocs/Studium Media Engineering/Bachelorarbeit/Messwerte/HelloWorldApps/${framework}/${networkSpeed}/${cacheOption}`;
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

    // const browser = await puppeteer.launch({headless: true});

    // for (let i = 1; i <= numberOfRuns; i++) {
    const flow = await runFlow(url, lighthouseConfig, cacheOption, numberOfRuns);
    const flowResult = await flow.createFlowResult();
    for (const format of lighthouseConfig.config.settings.output) {
        const reportPath = `${outputFolder}/${getLhrFilenamePrefix(flowResult.steps[0].lhr)}.${format}`;
        fs.writeFileSync(reportPath, format === "json" ? JSON.stringify(flowResult, null, 2) : await flow.generateReport());
    }

    console.log(`Report für ${framework} gespeichert in ${outputFolder}`);
    // }

    // await browser.close();
}

(async () => {
    const frameworks = ["qwik-ssr", "nextjs-ssr", "react-csr", "solidjs-ssr", "solidjs-csr"];
    const numberOfRuns = 10;
    const framework = await selectFramework(frameworks);
    // const cacheOption = await selectCacheOption();
    const cacheOptions = ["cache", "no-cache"]
    const throttlingOption = await selectThrottlingOption();
    await throttle.start(throttlingOption[1]);
    for (const cacheOption of cacheOptions) {
        console.log(`Testing ${framework} with ${cacheOption} and ${throttlingOption}`)
        if (framework === 'alle') {
            for (const fw of frameworks) {
                await runLighthouse(fw, cacheOption, throttlingOption[0], numberOfRuns);
            }
        } else {
            await runLighthouse(framework, cacheOption, throttlingOption[0], numberOfRuns);
        }
    }
    await throttle.stop();

})();
