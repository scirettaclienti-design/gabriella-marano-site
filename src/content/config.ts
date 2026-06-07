import { defineCollection, z } from 'astro:content';

const editorialSchema = z.object({
  title: z.string(),
  date: z.date(),
  outlet: z.string().optional(),
  publisher: z.string().optional(),
  summary: z.string(),
  externalUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  // Optional cover (string path) — to be wired when Gabriella sends real images.
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
});

const televisione = defineCollection({ type: 'content', schema: editorialSchema });
const scrittura = defineCollection({ type: 'content', schema: editorialSchema });
const formazione = defineCollection({ type: 'content', schema: editorialSchema });
const incontri = defineCollection({ type: 'content', schema: editorialSchema });

export const collections = { televisione, scrittura, formazione, incontri };
