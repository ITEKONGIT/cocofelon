import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    series: z.string().optional(),
    part: z.union([z.string(), z.number()]).optional(),
    difficulty: z.string().optional(),
    date: z.union([z.string(), z.date()]).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
