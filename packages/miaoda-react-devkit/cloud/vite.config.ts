import { defineConfig, loadConfigFromFile, mergeConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function () {
  const projectRoot = process.cwd();
  const projectConfigPath = path.join(projectRoot, 'vite.config.ts');
  const loaded = await loadConfigFromFile(
    { command: 'serve', mode: 'development' },
    projectConfigPath,
    projectRoot
  );
  if (!loaded) {
    throw new Error(`Cannot load project vite config from ${projectConfigPath}`);
  }
  return mergeConfig(
    loaded.config,
    defineConfig({
      server: {
        port: Number(process.env.PORT) || 50000,
        strictPort: true,
      },
      root: projectRoot,
    })
  );
}
