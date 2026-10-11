/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// Hasta ahora `apps/auditoria` no tenía forma de ejecutar pruebas: no es un
// proyecto de Nx (sus fuentes las compila `shell`, que las incluye por ruta
// relativa en su `tsconfig.app.json`) y el `tsconfig.spec.json` de shell solo
// mira su propio `src`.
//
// Esta configuración lo monta como proyecto de vitest y nada más: el
// `vitest.config.ts` de la raíz ya recoge todos los `vite.config.*` del
// repositorio, así que `npx vitest run` ejecuta estas pruebas junto a las de
// las librerías. A propósito NO se añade un `project.json`: convertir
// `apps/auditoria` en proyecto de Nx haría que el import relativo de
// `apps/shell/src/app/app.routes.ts` pasara a cruzar una frontera entre
// proyectos y `@nx/enforce-module-boundaries` lo rechazaría.
//
// No hace falta instalar nada: vitest, jsdom y el plugin de Analog ya están en
// las dependencias de desarrollo, y es el mismo montaje que usa
// `libs/ui-components`.
export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/auditoria',
  plugins: [angular(), nxViteTsPaths()],
  test: {
    name: 'auditoria',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/auditoria',
      provider: 'v8' as const,
    },
  },
}));
