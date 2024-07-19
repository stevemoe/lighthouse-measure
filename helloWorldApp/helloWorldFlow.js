import puppeteer from "puppeteer";
import { startFlow } from "lighthouse";
import { clearSiteData, wait } from "../lib/utils.js";
import { runHwInteractions } from "./helloWorldInteractions.js";

export const runHelloWorldFlow = async (
  url,
  lighthouseConfig,
  cacheOption,
  runs,
) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const flow = await startFlow(page, lighthouseConfig);
  await page.goto(url, {
    waitUntil: "networkidle0",
  });
  for (let i = 0; i < runs; i++) {
    await wait(5500);
    console.log(`Lighthouse Ausführung ${i} für ${url} (${cacheOption})`);

    if (cacheOption === "no-cache") {
      await clearSiteData(page);
    }

    await flow.navigate(url);

    await flow.startTimespan();
    await runHwInteractions(page);
    await flow.endTimespan();
  }

  await browser.close();

  return flow;
};
