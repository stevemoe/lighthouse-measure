import puppeteer from "puppeteer";
import { startFlow } from "lighthouse";
import { clearSiteData, wait } from "../lib/utils.js";

export const runHelloWorldFlow = async (
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
    await page.waitForNetworkIdle();
    await flow.endTimespan();
  }

  await browser.close();

  return flow;
};
