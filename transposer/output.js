// output.js — Takes parsed data, writes files to the project
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

export function writePost(parsed) {
  const blogDir = join(process.cwd(), "src", "content", "blog", parsed.frontmatter.slug);

  // Create the blog post directory
  if (!existsSync(blogDir)) {
    mkdirSync(blogDir, { recursive: true });
  }

  // Build the final .md file with Astro-compatible frontmatter
  const mdContent = buildMarkdownFile(parsed);

  // Write the markdown file
  writeFileSync(join(blogDir, "index.md"), mdContent, "utf-8");

  console.log(`✅ Post written: src/content/blog/${parsed.frontmatter.slug}/index.md`);

  // Return info about images that need processing
  return {
    postDir: blogDir,
    images: parsed.images,
    slug: parsed.frontmatter.slug,
    series: parsed.frontmatter.series || null,
    part: parsed.frontmatter.part || null,
  };
}

function buildMarkdownFile(parsed) {
  const f = parsed.frontmatter;

  let frontmatter = `---
title: "${f.title}"
date: ${f.date}
slug: ${f.slug}`;

  if (f.series) frontmatter += `\nseries: "${f.series}"`;
  if (f.part) frontmatter += `\npart: ${f.part}`;
  if (f.difficulty) frontmatter += `\ndifficulty: "${f.difficulty}"`;

  frontmatter += `\n---\n\n${parsed.body}`;

  return frontmatter;
}