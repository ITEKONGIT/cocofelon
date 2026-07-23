import * as yaml from 'js-yaml';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const blogDir = join(process.cwd(), 'src', 'content', 'blog');
const allowedCategories = new Set(['security', 'engineering', 'fintech', 'ai', 'notes']);
const errors = [];

for (const filePath of getMarkdownFiles(blogDir)) {
  validatePost(filePath);
}

if (errors.length > 0) {
  console.error('\nContent validation failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('[+] Content validation passed.');

function getMarkdownFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return getMarkdownFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.md') ? [fullPath] : [];
  });
}

function validatePost(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    errors.push(`${filePath}: missing valid frontmatter block.`);
    return;
  }

  let data;
  try {
    data = yaml.load(match[1]) || {};
  } catch (error) {
    errors.push(`${filePath}: invalid YAML frontmatter (${error.message}).`);
    return;
  }

  const body = match[2] || '';
  const status = data.status || 'published';

  if (!data.title || String(data.title).trim() === '') errors.push(`${filePath}: missing title.`);
  if (!data.slug || String(data.slug).trim() === '') errors.push(`${filePath}: missing slug.`);
  if (data.slug === 'untitled') errors.push(`${filePath}: unsafe slug "untitled".`);
  if (!data.date || String(data.date).includes('undefined')) errors.push(`${filePath}: missing valid date.`);
  if (!data.description || String(data.description).trim() === '') errors.push(`${filePath}: missing description.`);
  if (!data.category) errors.push(`${filePath}: missing category.`);
  if (!allowedCategories.has(data.category)) {
    errors.push(`${filePath}: category must be one of ${[...allowedCategories].join(', ')}.`);
  }
  if (data.tags !== undefined && !Array.isArray(data.tags)) errors.push(`${filePath}: tags must be an array.`);
  if (!['published', 'draft', undefined].includes(data.status)) errors.push(`${filePath}: status must be published or draft.`);

  if (status === 'published') {
    if (body.includes('[image:')) errors.push(`${filePath}: published post contains unresolved [image:] placeholder.`);
    if (body.includes('[code:')) errors.push(`${filePath}: published post contains unresolved [code:] placeholder.`);
  }
}
