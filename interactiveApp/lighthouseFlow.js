import puppeteer from 'puppeteer';
import {startFlow} from 'lighthouse';


// const url = 'https://nextjs-interactive.vercel.app/';
const url = 'https://qwik-interactive.vercel.app/';

export const runFlow = async (url, lighthouseConfig, browser) => {
    if (!browser) {
        console.log("Launching browser");
        browser = await puppeteer.launch();
    }
    // const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const flow = await startFlow(page,
        lighthouseConfig
    );
    await page.goto(url, {
        waitUntil: 'networkidle0',
    });


    await flow.navigate(url);

    await flow.startTimespan();

    // await Promise.all([
    //     page.coverage.startJSCoverage(),
    //     page.coverage.startCSSCoverage(),
    // ]);

    await page.click('#klick1');

    const counterUp = await page.waitForSelector('#klick2');
    for (let i = 0; i < 6; i++) {
        await counterUp.click();
    }

    await page.click("#klick3")
    const nameInput = await page.waitForSelector('#input4');
    await nameInput.type('Stefan');
    // await nameInput.press('Enter');
    await page.click('#klick5');

    await new Promise((resolve, reject) => setTimeout(resolve, 2000));
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
    await new Promise((resolve, reject) => setTimeout(resolve, 2000));
    await page.hover("div > span.pl-1")
    await new Promise((resolve, reject) => setTimeout(resolve, 2000));
    // await page.click('#klick13');

    await page.click("#klickBurger").then((res) => console.log(res));
    const dashboard = await page.waitForSelector('p#linkToDashboard');
        await dashboard.click();
        await new Promise((resolve, reject) => setTimeout(resolve, 5000));
    await flow.endTimespan();

    // await flow.startNavigation();
    // await dashboard.click()
    // await flow.endNavigation();
    // await flow.navigate(url + "dashboard/")

    // await flow.navigate(async () => {
    //     await dashboard.click();
    //     await new Promise((resolve, reject) => setTimeout(resolve, 2000));
    // });


//     // await page.click("#klickBurger").then((res) => console.log(res));
//     // const dashboard = await page.waitForSelector('p#linkToDashboard');
//     // await dashboard.click()
//     "http://localhost:4173/dashboard/"
// );


    // await browser.close();
    return flow;
};


// const flowData = await runFlow(url, lighthouseConfig);
// const date = getCurrentTimestamp();
// writeFileSync('flow-result_' + date + '.json', JSON.stringify(await flowData.createFlowResult(), null, 2));
// writeFileSync('report_' + date + '.html', await flowData.generateReport());

