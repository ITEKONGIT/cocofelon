// scripts/transpose.js
import { run as runParse } from './parse.js';
import { run as runImages } from './images.js';
import { run as runSeries } from './series.js';

async function runPipeline() {
    console.log("[*] Orchestrating content pipeline...");
    try {
        await runParse();
        await runImages();
        await runSeries();
        console.log("[+] Content pipeline successful.");
    } catch (err) {
        console.error("[-] Pipeline failed:", err);
        process.exit(1);
    }
}

runPipeline();
