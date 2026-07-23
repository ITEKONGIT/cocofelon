import * as yaml from 'js-yaml';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export function writePost(parsed) {
  const blogDir = join(process.cwd(), 'src', 'content', 'blog', parsed.frontmatter.slug);

  if (!existsSync(blogDir)) {
    mkdirSync(blogDir, { recursive: true });
  }

  const mdContent = buildMarkdownFile(parsed);
  writeFileSync(join(blogDir, 'index.md'), mdContent, 'utf-8');

  console.log(`✅ Post written: src/content/blog/${parsed.frontmatter.slug}/index.md`);

  return {
    postDir: blogDir,
    images: parsed.images,
    slug: parsed.frontmatter.slug,
    series: parsed.frontmatter.series || null,
    part: parsed.frontmatter.part || null,
  };
}

function buildMarkdownFile(parsed) {
  const ordered = orderFrontmatter(parsed.frontmatter);
  const frontmatter = yaml.dump(ordered, {
    lineWidth: 100,
    noRefs: true,
    sortKeys: false,
  }).trim();

  return `---\n${frontmatter}\n---\n\n${parsed.body.trim()}\n`;
}

function orderFrontmatter(frontmatter) {
  const ordered = {
    title: frontmatter.title,
    slug: frontmatter.slug,
    date: frontmatter.date,
    description: frontmatter.description,
    category: frontmatter.category,
    tags: frontmatter.tags,
    status: frontmatter.status,
    featured: frontmatter.featured,
  };

  for (const key of ['series', 'part', 'difficulty']) {
    if (frontmatter[key] !== undefined && frontmatter[key] !== null && frontmatter[key] !== '') {
      ordered[key] = frontmatter[key];
    }
  }

  return ordered;
}
