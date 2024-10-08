import fs from "fs";
import { getLhrFilenamePrefix } from "lighthouse/report/generator/file-namer.js";
import { runInteractiveFlow } from "./interactiveFlow.js";
import * as throttle from "@sitespeed.io/throttle";
import {
  selectFramework,
  selectThrottlingOption,
} from "../lib/selectFunctions.js";

async function runLighthouse(
  framework,
  cacheOption,
  networkSpeed,
  numberOfRuns,
) {
  const url = `https://${framework}-interactive.vercel.app/`;
  const outputFolder = `output/${framework}/${networkSpeed}/${cacheOption}`;
  const lighthouseConfig = {
    config: {
      extends: "lighthouse:default",
      settings: {
        logLevel: "info",
        output: ["html", "json"],
        onlyCategories: ["performance"],
        throttling: {
          cpuSlowdownMultiplier: 10.2,
        },
        disableStorageReset: cacheOption === "cache",
        throttlingMethod: "provided",
      },
    },
  };

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  const flow = await runInteractiveFlow(
    url,
    lighthouseConfig,
    cacheOption,
    numberOfRuns,
  );
  const flowResult = await flow.createFlowResult();
  for (const format of lighthouseConfig.config.settings.output) {
    const reportPath = `${outputFolder}/${getLhrFilenamePrefix(flowResult.steps[0].lhr)}.${format}`;
    fs.writeFileSync(
      reportPath,
      format === "json"
        ? JSON.stringify(await flowResult, null, 2)
        : await flow.generateReport(),
    );
  }

  console.log(`Report für ${framework} gespeichert in ${outputFolder}`);
}

(async () => {
  const frameworks = ["qwik", "nextjs", "react", "solidjs", "solidjs-csr"];
  const numberOfRuns = 10;
  const framework = await selectFramework(frameworks);
  // const cacheOption = await selectCacheOption();
  // const cacheOptions = ["cache", "no-cache"];
  const cacheOptions = ["no-cache"];
  // const cacheOptions = ["cache"];
  const throttlingOption = await selectThrottlingOption();
  console.log(throttlingOption);
  await throttle.start(throttlingOption[1]);
  for (const cacheOption of cacheOptions) {
    console.log(
      `Testing ${framework} with ${cacheOption} and ${throttlingOption[0]}`,
    );
    if (framework === "alle") {
      for (const fw of frameworks) {
        await runLighthouse(fw, cacheOption, throttlingOption[0], numberOfRuns);
      }
    } else {
      await runLighthouse(
        framework,
        cacheOption,
        throttlingOption[0],
        numberOfRuns,
      );
    }
  }
  await throttle.stop();
  console.log("Throttle stopped");
})();
