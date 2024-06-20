// (async () => {
//     const frameworks = ["qwik-ssr", "nextjs-ssr", "react-csr", "solidjs-ssr", "solidjs-csr"];
//     const urls = [];
//     for (const framework of frameworks) {
//
//         urls.push(`https://${framework}-hello-world.vercel.app/`);
//     }
//     console.log(urls);
// })();


import {selectThrottlingOption} from "../lib/selectFunctions.js";

(async () => {
    const res = await selectThrottlingOption();
    console.log("res: ", res);
})();
