import type { Plugin } from 'vite';
import { AssetGlob } from '@nx/js/internal';
/**
 * @deprecated Will be removed in Nx v24. Use Vite's native `publicDir` option
 * for static assets, or the `vite-plugin-static-copy` package for anything
 * that needs glob-based copying. See
 * https://nx.dev/docs/technologies/build-tools/vite/configure-vite for details.
 */
export declare function nxCopyAssetsPlugin(_assets: (string | AssetGlob)[]): Plugin;
