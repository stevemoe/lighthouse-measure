export const clearSiteData = async (page) => {
  const client = await page.createCDPSession();

  await client.send("Storage.clearDataForOrigin", {
    origin: "*",
    storageTypes: "all",
  });
  await client.send("Network.clearBrowserCache");
};

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
