// series.js — Manages series tracking and navigation
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const CONTENT_DIR = join(process.cwd(), "src", "content", "blog");
const SERIES_DIR = join(process.cwd(), "src", "content", "series");

export function updateSeries(seriesName, newPost) {
  if (!seriesName) return null;

  // Find all posts in this series
  const allPosts = findAllPosts();
  const seriesPosts = allPosts
    .filter(p => p.series === seriesName)
    .sort((a, b) => (parseInt(a.part) || 0) - (parseInt(b.part) || 0));

  // Build navigation for the new post
  const currentIndex = seriesPosts.findIndex(p => p.slug === newPost.slug);
  
  const nav = {
    series: seriesName,
    total: seriesPosts.length,
    current: currentIndex + 1,
    prev: currentIndex > 0 ? {
      title: seriesPosts[currentIndex - 1].title,
      slug: seriesPosts[currentIndex - 1].slug,
      part: seriesPosts[currentIndex - 1].part,
    } : null,
    next: currentIndex < seriesPosts.length - 1 ? {
      title: seriesPosts[currentIndex + 1].title,
      slug: seriesPosts[currentIndex + 1].slug,
      part: seriesPosts[currentIndex + 1].part,
    } : null,
    allParts: seriesPosts.map(p => ({
      title: p.title,
      slug: p.slug,
      part: p.part,
    })),
  };

  // Generate the series hub page
  generateSeriesHub(seriesName, nav);

  console.log(`📚 Series "${seriesName}" updated: ${nav.allParts.length} parts`);
  return nav;
}

function findAllPosts() {
  if (!existsSync(CONTENT_DIR)) return [];

  const posts = [];
  const dirs = readdirSync(CONTENT_DIR, { withFileTypes: true });

  for (const dir of dirs) {
    if (dir.isDirectory()) {
      const mdPath = join(CONTENT_DIR, dir.name, "index.md");
      if (existsSync(mdPath)) {
        const content = readFileSync(mdPath, "utf-8");
        const frontmatter = extractFrontmatter(content);
        if (frontmatter) {
          posts.push({
            slug: dir.name,
            ...frontmatter,
          });
        }
      }
    }
  }

  return posts;
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm = {};
  match[1].split("\n").forEach(line => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      fm[key.trim()] = rest.join(":").trim().replace(/^"|"$/g, "");
    }
  });

  return fm;
}

function generateSeriesHub(seriesName, nav) {
  if (!existsSync(SERIES_DIR)) {
    mkdirSync(SERIES_DIR, { recursive: true });
  }

  const slug = seriesName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const hubContent = `---
title: "${seriesName}"
layout: ../../layouts/SeriesHub.astro
totalParts: ${nav.total}
---

A ${nav.total}-part series on ${seriesName}.

${nav.allParts.map(p => `- [Part ${p.part}: ${p.title}](/blog/${p.slug})`).join("\n")}
`;

  writeFileSync(join(SERIES_DIR, `${slug}.md`), hubContent);
  console.log(`📄 Series hub generated: series/${slug}.md`);
}

export function getSeriesList() {
  if (!existsSync(SERIES_DIR)) return [];

  return readdirSync(SERIES_DIR)
    .filter(f => f.endsWith(".md"))
    .map(f => {
      const content = readFileSync(join(SERIES_DIR, f), "utf-8");
      const fm = extractFrontmatter(content);
      return {
        slug: f.replace(".md", ""),
        title: fm?.title || f,
        totalParts: fm?.totalParts || 0,
      };
    });
}