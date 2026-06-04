import archePreset from '@scirettaclienti-design/arche-design-system/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [archePreset],
  content: ['./src/**/*.{astro,mdx,ts,tsx,md,html}'],
};
