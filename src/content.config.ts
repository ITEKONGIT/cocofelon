import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.union([z.string(), z.date()]),
    description: z.string(),
    category: z.enum(['security', 'engineering', 'fintech', 'ai', 'notes']),
    tags: z.array(z.string()).default([]),
    status: z.enum(['published', 'draft']).default('published'),
    featured: z.boolean().default(false),
    series: z.string().optional(),
    part: z.union([z.string(), z.number()]).optional(),
    difficulty: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
