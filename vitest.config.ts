import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      passWithNoTests: true,
      root: fileURLToPath(new URL('./', import.meta.url)),
      projects: [
        {
          extends: true,
          test: {
            name: 'engine',
            environment: 'node',
            include: ['src/engine/**/*.spec.ts']
          }
        },
        {
          extends: true,
          test: {
            name: 'ui',
            environment: 'jsdom',
            exclude: [...configDefaults.exclude, 'e2e/**', 'src/engine/**']
          }
        }
      ]
    }
  })
);
