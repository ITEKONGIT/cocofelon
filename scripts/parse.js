import * as yaml from 'js-yaml';

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function parse(rawContent, options = {}) {
  const { sourceName = 'incoming content' } = options;
  const trimmed = rawContent.trimStart();
  let frontmatter = {};
  let body = rawContent.trim();

  if (trimmed.startsWith('---')) {
    const match = trimmed.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) {
      throw new Error(`${sourceName}: frontmatter block is not closed correctly.`);
    }

    frontmatter = yaml.load(match[1]) || {};
    body = match[2].trim();
  }

  const title = typeof frontmatter.title === 'string' ? frontmatter.title.trim() : '';
  if (!title) {
    throw new Error(`${sourceName}: missing required frontmatter "title".`);
  }

  const slug = slugify(frontmatter.slug || title);
  if (!slug || slug === 'untitled') {
    throw new Error(`${sourceName}: refused to publish with unsafe slug "${slug || 'empty'}".`);
  }

  const status = frontmatter.status === 'draft' ? 'draft' : 'published';
  const category = normalizeCategory(frontmatter.category);
  const tags = normalizeTags(frontmatter.tags);
  const date = normalizeDate(frontmatter.date);
  const description = normalizeDescription(frontmatter.description, body);

  const images = [...body.matchAll(/\[image:\s*(.+?)\]/g)].map((match) => match[1].trim());

  return {
    frontmatter: {
      ...frontmatter,
      title,
      slug,
      date,
      description,
      category,
      tags,
      status,
      featured: Boolean(frontmatter.featured),
    },
    body,
    images,
  };
}

function normalizeCategory(category) {
  const allowed = new Set(['security', 'engineering', 'fintech', 'ai', 'notes']);
  const normalized = String(category || 'notes').toLowerCase().trim();
  return allowed.has(normalized) ? normalized : 'notes';
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
}

function normalizeDate(date) {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date "${date}". Use YYYY-MM-DD.`);
  }

  return parsed.toISOString().split('T')[0];
}

function normalizeDescription(description, body) {
  if (typeof description === 'string' && description.trim()) {
    return description.trim();
  }

  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[#>*_`[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    throw new Error('Missing required frontmatter "description" and body is empty.');
  }

  return text.slice(0, 180);
}
