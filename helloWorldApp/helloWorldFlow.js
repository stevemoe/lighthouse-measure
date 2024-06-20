import puppeteer from 'puppeteer';
import {startFlow} from 'lighthouse';
import * as throttle from '@sitespeed.io/throttle'


export const runFlow = async (url, lighthouseConfig, cacheOption, runs) => {

    // if (!browser) {
    //     console.log("Launching browser");
    //     browser = await puppeteer.launch({headless: false});
    // }
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    if (cacheOption === "no-cache") {
        await page.setBypassServiceWorker(true);
        await page.setCacheEnabled(false);
    }
    const flow = await startFlow(page,
        lighthouseConfig
    );
    for (let i = 0; i < runs; i++) {
        console.log(`Lighthouse Ausführung ${i} für ${url} (${cacheOption})`);

        await flow.navigate(url);
        await flow.startTimespan();
        await page.click('#klick1');
        await page.waitForNetworkIdle()
        await flow.endTimespan();
    }

    await browser.close();

    return flow;
};


// (async () => {
//
//     const flowData = await runFlow(url, lighthouseConfig);
//
//     const date = getCurrentTimestamp();
//     fs.writeFileSync('helloWorldTestFlow/flow-result_' + date + '.json', JSON.stringify(await flowData.createFlowResult(), null, 2));
//     fs.writeFileSync('helloWorldTestFlow/report_' + date + '.html', await flowData.generateReport());
//
// })();
