import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    slug: z.string(),                         // ← required
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    series: z.string().optional(),
    part: z.number().optional(),
    difficulty: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};