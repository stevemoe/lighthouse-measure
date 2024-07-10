export const runHwInteractions = async (page) => {
  await page.click("#klick1");
  await page.waitForNetworkIdle();
};
