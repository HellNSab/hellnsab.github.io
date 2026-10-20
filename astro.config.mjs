// @ts-check
import { defineConfig } from 'astro/config';

// Replace YOUR-GITHUB-USERNAME with your GitHub username.
// If your repository is named YOUR-GITHUB-USERNAME.github.io, keep `base` as '/'.
// Otherwise (e.g. a repo named "blog"), set base: '/blog'.
export default defineConfig({
  site: 'https://hellnsab.github.io',
  base: '/blog',
});
