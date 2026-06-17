#!/usr/bin/env node
// transpose.js — Master CLI. Run with: node transpose.js incoming/your-post.txt

import { parse } from "./transposer/parse.js";
import { writePost } from "./transposer/output.js";
import { processImages } from "./transposer/images.js";
import { updateSeries } from "./transposer/series.js";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

// Get the input file from command line
const inputFile = process.argv[2];

if (!inputFile) {
  console.log(`
╔══════════════════════════════════════════╗
║        🖥️  COCOFELON TRANSPOSER        ║
╠══════════════════════════════════════════╣
║                                          ║
║  Usage:                                  ║
║    node transpose.js incoming/post.txt   ║
║                                          ║
║  Your custom syntax:                     ║
║    ---                                   ║
║    title: My Post                        ║
║    series: API Hacking                   ║
║    difficulty: Advanced                  ║
║    ---                                   ║
║    Content here...                       ║
║    [code:bash]                           ║
║    curl example.com                      ║
║    [/code]                               ║
║    [image: screenshot.png]               ║
║    Caption: Description                  ║
║    ||Redacted content||                  ║
║                                          ║
╚══════════════════════════════════════════╝
  `);
  process.exit(0);
}

const inputPath = resolve(inputFile);

if (!existsSync(inputPath)) {
  console.error(`❌ File not found: ${inputPath}`);
  process.exit(1);
}

console.log("\n🔍 Reading post...");
const raw = readFileSync(inputPath, "utf-8");

console.log("📝 Parsing content...");
const parsed = parse(raw);

console.log(`   Title: ${parsed.frontmatter.title}`);
console.log(`   Slug: ${parsed.frontmatter.slug}`);
if (parsed.frontmatter.series) {
  console.log(`   Series: ${parsed.frontmatter.series} (Part ${parsed.frontmatter.part})`);
}
console.log(`   Difficulty: ${parsed.frontmatter.difficulty || "Not set"}`);

console.log("\n💾 Writing files...");
const result = writePost(parsed);

// Process images
const sourceDir = join(inputPath, "..");
if (parsed.images.length > 0) {
  console.log(`\n🖼️  Processing ${parsed.images.length} image(s)...`);
  const imageResults = processImages(parsed.images, result.postDir, sourceDir);
  
  const succeeded = imageResults.filter(i => i.status === "copied").length;
  const missing = imageResults.filter(i => i.status === "missing").length;
  
  if (succeeded) console.log(`   ✅ ${succeeded} copied successfully`);
  if (missing) console.log(`   ⚠️  ${missing} not found`);
}

// Update series navigation
if (parsed.frontmatter.series) {
  console.log("\n📚 Updating series...");
  const nav = updateSeries(parsed.frontmatter.series, {
    slug: parsed.frontmatter.slug,
    title: parsed.frontmatter.title,
    part: parsed.frontmatter.part,
  });

  if (nav) {
    console.log(`   Series: ${nav.series}`);
    console.log(`   Position: Part ${nav.current} of ${nav.total}`);
    if (nav.prev) console.log(`   ◀  Previous: Part ${nav.prev.part}`);
    if (nav.next) console.log(`   ▶  Next: Part ${nav.next.part}`);
  }
}

// Show redaction warning
if (parsed.hasRedacted) {
  console.log("\n🔒 Redacted content detected — verify before publishing");
}

console.log(`
✅ Done! Post is ready.
   View: src/content/blog/${parsed.frontmatter.slug}/index.md

   To preview: npm run dev
   To publish: git add . && git commit -m "New post: ${parsed.frontmatter.title}" && git push
`);