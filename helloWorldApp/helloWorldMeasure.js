import * as fs from "fs";
import { getLhrFilenamePrefix } from "lighthouse/report/generator/file-namer.js";
import * as throttle from "@sitespeed.io/throttle";
import { runHelloWorldFlow } from "./helloWorldFlow.js";
import {
  selectFramework,
  selectThrottlingOption,
} from "../lib/selectFunctions.js";

async function runLighthouse(
  framework,
  cacheOption,
  networkSpeed,
  numberOfRuns,
  local,
  port,
) {
  let url = `https://${framework}-hello-world.vercel.app/`;
  let outputFolder = `output/${framework}/${networkSpeed}/${cacheOption}/page_load`;
  if (local) {
    url = `http://localhost:${port}`;
    outputFolder = `output/HelloWorldApps/local/${framework}/${networkSpeed}/${cacheOption}/page_load`;
  }

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

  const flow = await runHelloWorldFlow(
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
        ? JSON.stringify(flowResult, null, 2)
        : await flow.generateReport(),
    );
  }

  console.log(`Report für ${framework} gespeichert in ${outputFolder}`);
}

(async () => {
  const frameworks = [
    "qwik-ssr",
    "nextjs-ssr",
    "react-csr",
    "solidjs-ssr",
    "solidjs-csr",
  ];
  const localPorts = {
    "qwik-ssr": 4173,
    "nextjs-ssr": 3001,
    "react-csr": 3002,
    "solidjs-ssr": 3003,
    "solidjs-csr": 3004,
  };
  const numberOfRuns = 1;
  const local = false;
  const framework = await selectFramework(frameworks);
  // const cacheOption = await selectCacheOption();
  // const cacheOptions = ["cache", "no-cache"];
  const cacheOptions = ["cache", "no-cache"];
  const throttlingOption = await selectThrottlingOption();
  console.log(throttlingOption);
  await throttle.start(throttlingOption[1]);
  for (const cacheOption of cacheOptions) {
    console.log(
      `Testing ${framework} with ${cacheOption} and ${throttlingOption[0]}`,
    );
    if (framework === "alle") {
      for (const fw of frameworks) {
        const port = localPorts[fw];
        await runLighthouse(
          fw,
          cacheOption,
          throttlingOption[0],
          numberOfRuns,
          local,
          port,
        );
      }
    } else {
      const port = localPorts[framework];
      await runLighthouse(
        framework,
        cacheOption,
        throttlingOption[0],
        numberOfRuns,
        local,
        port,
      );
    }
  }
  await throttle.stop();
  console.log("Throttle stopped");
})();
