"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nxCopyAssetsPlugin = nxCopyAssetsPlugin;
const node_path_1 = require("node:path");
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
const deprecation_1 = require("../src/utils/deprecation");
/**
 * @deprecated Will be removed in Nx v24. Use Vite's native `publicDir` option
 * for static assets, or the `vite-plugin-static-copy` package for anything
 * that needs glob-based copying. See
 * https://nx.dev/docs/technologies/build-tools/vite/configure-vite for details.
 */
function nxCopyAssetsPlugin(_assets) {
    (0, deprecation_1.warnNxCopyAssetsPluginDeprecation)();
    let config;
    let handler;
    let dispose;
    if (global.NX_GRAPH_CREATION)
        return;
    return {
        name: 'nx-copy-assets-plugin',
        configResolved(_config) {
            config = _config;
        },
        async buildStart() {
            const relativeProjectRoot = (0, node_path_1.relative)(devkit_1.workspaceRoot, config.root);
            const assets = _assets.map((a) => {
                if (typeof a === 'string') {
                    return (0, devkit_1.joinPathFragments)(relativeProjectRoot, a);
                }
                else {
                    return {
                        ...a,
                        input: (0, devkit_1.joinPathFragments)(relativeProjectRoot, a.input),
                    };
                }
            });
            handler = new internal_1.CopyAssetsHandler({
                rootDir: devkit_1.workspaceRoot,
                projectDir: config.root,
                outputDir: config.build.outDir.startsWith(config.root)
                    ? config.build.outDir
                    : (0, node_path_1.join)(config.root, config.build.outDir),
                assets,
            });
            if (this.meta.watchMode && (0, devkit_1.isDaemonEnabled)()) {
                dispose = await handler.watchAndProcessOnAssetChange();
            }
        },
        async writeBundle() {
            await handler.processAllAssetsOnce();
        },
        async closeWatcher() {
            dispose == null ? void 0 : dispose();
        },
    };
}
