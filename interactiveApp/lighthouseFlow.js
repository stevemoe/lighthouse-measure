import puppeteer from "puppeteer";
import { startFlow } from "lighthouse";
import { clearSiteData, wait } from "../lib/utils.js";

// const url = 'https://nextjs-interactive.vercel.app/';
const url = "https://qwik-interactive.vercel.app/";

export const runInteractiveFlow = async (
  url,
  lighthouseConfig,
  cacheOption,
  runs,
) => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  const flow = await startFlow(page, lighthouseConfig);
  await page.goto(url, {
    waitUntil: "networkidle0",
  });
  await wait(2000);
  for (let i = 0; i < runs; i++) {
    console.log(`Lighthouse Ausführung ${i} für ${url} (${cacheOption})`);

    if (cacheOption === "no-cache") {
      await clearSiteData(page);
    }

    await flow.navigate(url);

    await flow.startTimespan();

    await page.click("#klick1");

    const counterUp = await page.waitForSelector("#klick2");
    for (let i = 0; i < 6; i++) {
      await counterUp.click();
    }

    await page.click("#klick3");
    const nameInput = await page.waitForSelector("#input4");
    await nameInput.type("Stefan");
    await page.click("#klick5");

    await wait(2000);
    const nameButton = await page.waitForSelector("#klickStefan");
    await nameButton.click();
    await page.click("#klickwar");
    await page.click("#klickhier");
    await page.click("#klick9");
    await page.click("#klick10");
    await wait(1000);
    const lessButton1 = await page.waitForSelector("#klick11", {
      visible: true,
    });
    await lessButton1.click();
    await wait(1000);
    const moreButton = await page.waitForSelector("#klick10", {
      visible: true,
    });
    await moreButton.click();
    await wait(1000);
    const lessButton2 = await page.waitForSelector("#klick11", {
      visible: true,
    });
    await lessButton2.click();
    await wait(1000);
    await page.click("#klick12");
    await page.waitForNetworkIdle();
    await wait(2000);
    await page.hover("div > span.pl-1");
    await wait(2000);

    await page.click("#klickBurger");
    const dashboard = await page.waitForSelector("p#linkToDashboard");
    await dashboard.click();
    await page.waitForNavigation();
    await flow.endTimespan();
  }
  await browser.close();
  return flow;
};
