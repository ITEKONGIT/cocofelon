// terminal-panel.js — Terminal-based transposer
// Run with: node transposer/terminal-panel.js

import { parse } from "./parse.js";
import { writePost } from "./output.js";
import { updateSeries } from "./series.js";
import { createInterface } from "readline";
import { execSync } from "child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function showBanner() {
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════╗
║              COCOFELON TRANSPOSER                ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Paste your blog content below.                  ║
║  Type DONE on a new line when finished.          ║
║  Type CLEAR to start over.                       ║
║  Type QUIT to exit.                              ║
║                                                  ║
║  Supported syntax:                               ║
║    ---                                           ║
║    title: My Post Title                          ║
║    series: Series Name                           ║
║    part: 1                                       ║
║    difficulty: Advanced                          ║
║    ---                                           ║
║    Your content...                               ║
║    [code:bash]                                   ║
║    your code here                                ║
║    [/code]                                       ║
║    [image: filename.png]                         ║
║    Caption: Description                          ║
║    ||redacted text||                             ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`);
}

function startPrompt() {
  console.log("\n📝 Paste your content (type DONE to finish):\n");

  const lines = [];

  function onLine(line) {
    const trimmed = line.trim();

    if (trimmed === "DONE") {
      rl.removeListener("line", onLine);
      processInput(lines.join("\n"));
    } else if (trimmed === "CLEAR") {
      lines.length = 0;
      showBanner();
      console.log("🗑️  Cleared. Paste again:\n");
    } else if (trimmed === "QUIT") {
      console.log("\n👋 Exiting...\n");
      rl.close();
      process.exit(0);
    } else {
      lines.push(line);
    }
  }

  rl.on("line", onLine);
}

function processInput(raw) {
  if (!raw.trim()) {
    console.log("\n❌ No content provided.\n");
    return askAgain();
  }

  console.log("\n🔍 Parsing...");

  const parsed = parse(raw);

  // Show summary
  console.log(`\n   Title:      ${parsed.frontmatter.title}`);
  console.log(`   Slug:       ${parsed.frontmatter.slug}`);
  if (parsed.frontmatter.series) {
    console.log(`   Series:     ${parsed.frontmatter.series} (Part ${parsed.frontmatter.part || "?"})`);
  }
  console.log(`   Difficulty: ${parsed.frontmatter.difficulty || "Not set"}`);
  console.log(`   Date:       ${parsed.frontmatter.date}`);
  console.log(`   Images:     ${parsed.images.length}`);
  console.log(`   Redacted:   ${parsed.hasRedacted ? "⚠️  Yes — verify before publishing" : "No"}`);

  // Show converted markdown preview
  console.log("\n📄 CONVERTED MARKDOWN PREVIEW:");
  console.log("─".repeat(60));
  console.log(buildPreview(parsed));
  console.log("─".repeat(60));

  // Action menu
  console.log("\n[W] Write to project   [C] Copy to clipboard   [E] Edit again   [Q] Quit");
  console.log("Choose an option: ");

  function onChoice(choice) {
    rl.removeListener("line", onChoice);

    switch (choice.trim().toUpperCase()) {
      case "W":
        writeToProject(parsed);
        break;

      case "C":
        copyToClipboard(parsed);
        break;

      case "E":
        showBanner();
        startPrompt();
        break;

      case "Q":
        console.log("\n👋 Exiting...\n");
        rl.close();
        process.exit(0);

      default:
        console.log("\n❌ Invalid choice. Choose W, C, E, or Q.\n");
        askForChoice();
    }
  }

  function askForChoice() {
    rl.on("line", onChoice);
  }

  askForChoice();
}

function writeToProject(parsed) {
  console.log("\n💾 Writing files...");

  const result = writePost(parsed);

  if (parsed.frontmatter.series) {
    const nav = updateSeries(parsed.frontmatter.series, {
      slug: parsed.frontmatter.slug,
      title: parsed.frontmatter.title,
      part: parsed.frontmatter.part,
    });

    if (nav) {
      console.log(`   Series: ${nav.series}`);
      console.log(`   Position: Part ${nav.current} of ${nav.total}`);
    }
  }

  if (parsed.images.length > 0) {
    console.log(`   ⚠️  ${parsed.images.length} image(s) referenced — place them in:`);
    console.log(`   src/content/blog/${parsed.frontmatter.slug}/images/`);
  }

  console.log(`\n✅ Post written to: src/content/blog/${parsed.frontmatter.slug}/index.md`);
  console.log("   Run 'npm run dev' to preview locally.");
  console.log("   Then git push to publish.\n");

  rl.close();
}

function copyToClipboard(parsed) {
  const markdown = buildPreview(parsed);

  try {
    if (process.platform === "win32") {
      execSync("clip", { input: markdown, shell: "powershell.exe" });
    } else {
      // Linux/Mac fallback
      execSync("pbcopy || xclip -selection clipboard", { input: markdown });
    }
    console.log("\n📋 Markdown copied to clipboard!\n");
  } catch {
    console.log("\n⚠️  Could not copy to clipboard. Here's the raw output:\n");
    console.log(markdown);
  }

  rl.close();
}

function buildPreview(parsed) {
  let out = "";

  out += "---\n";
  out += `title: "${parsed.frontmatter.title}"\n`;
  out += `date: ${parsed.frontmatter.date}\n`;
  out += `slug: ${parsed.frontmatter.slug}\n`;
  if (parsed.frontmatter.series) out += `series: "${parsed.frontmatter.series}"\n`;
  if (parsed.frontmatter.part) out += `part: ${parsed.frontmatter.part}\n`;
  if (parsed.frontmatter.difficulty) out += `difficulty: "${parsed.frontmatter.difficulty}"\n`;
  out += "---\n\n";
  out += parsed.body;
  out += "\n";

  return out;
}

function askAgain() {
  console.log("\n[P] Try again   [Q] Quit\n");

  rl.on("line", (choice) => {
    rl.removeAllListeners("line");

    if (choice.trim().toUpperCase() === "P") {
      showBanner();
      startPrompt();
    } else {
      console.log("\n👋 Exiting...\n");
      rl.close();
    }
  });
}

// Start
showBanner();
startPrompt();