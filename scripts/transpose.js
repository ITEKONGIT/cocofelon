import { parse } from './parse.js';
import { processImages } from './images.js';
import { updateSeries } from './series.js';
import { writePost } from './output.js';
import { readdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

async function runPipeline() {
    console.log("[*] Orchestrating content pipeline from incoming/...");
    const incomingDir = './incoming';
    const files = readdirSync(incomingDir).filter(f => f.endsWith('.txt'));

    for (const file of files) {
        console.log(`[*] Processing: ${file}`);
        const rawContent = readFileSync(join(incomingDir, file), 'utf-8');
        
        try {
            // 1. Parse
            const parsed = await parse(rawContent);
            
            // 2. Write to project structure
            const result = writePost(parsed);
            
            // 3. Process images
            if (parsed.images && parsed.images.length > 0) {
                await processImages(parsed.images, result.postDir, incomingDir);
            }
            
            // 4. Update Series
            if (parsed.frontmatter.series) {
                await updateSeries(parsed.frontmatter.series, {
                    slug: parsed.frontmatter.slug,
                    title: parsed.frontmatter.title,
                    part: parsed.frontmatter.part
                });
            }

            console.log(`[+] Successfully flushed: ${parsed.frontmatter.title}`);
            // Optional: Uncomment below to auto-delete processed file
            // unlinkSync(join(incomingDir, file));
        } catch (err) {
            console.error(`[-] Failed to process ${file}:`, err);
        }
    }
    console.log("[+] All files flushed.");
}

runPipeline();
