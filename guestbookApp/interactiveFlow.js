import puppeteer from "puppeteer";
import { startFlow } from "lighthouse";
import { clearSiteData, wait } from "../lib/utils.js";
import { runGbInteractions } from "./guestbookInteractions.js";

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
  await wait(5500);

  for (let i = 0; i < runs; i++) {
    console.log(`Lighthouse Ausführung ${i} für ${url} (${cacheOption})`);

    if (cacheOption === "no-cache") {
      await clearSiteData(page);
    }

    await flow.navigate(url);

    await flow.startTimespan();
    await runGbInteractions(page);
    await flow.endTimespan();
  }

  await flow.startTimespan(); // zu Testzwecken
  await page.click("#klickExpensive");
  await page.waitForSelector("#calcReady");
  await wait(2000);
  await flow.endTimespan();

  await browser.close();
  return flow;
};
