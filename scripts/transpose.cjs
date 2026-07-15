// scripts/transpose.js
import { run as runParse } from './parse.js';
import { run as runImages } from './images.js';
import { run as runSeries } from './series.js';

async function runPipeline() {
    console.log("[*] Orchestrating content pipeline...");
    await runParse();
    await runImages();
    await runSeries();
    console.log("[+] Pipeline complete.");
}

runPipeline().catch(console.error);
