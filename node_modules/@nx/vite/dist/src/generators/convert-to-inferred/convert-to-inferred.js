"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToInferred = convertToInferred;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const plugin_1 = require("../../plugins/plugin");
const build_post_target_transformer_1 = require("./lib/build-post-target-transformer");
const serve_post_target_transformer_1 = require("./lib/serve-post-target-transformer");
const preview_post_target_transformer_1 = require("./lib/preview-post-target-transformer");
const assert_supported_vite_version_1 = require("../../utils/assert-supported-vite-version");
async function convertToInferred(tree, options) {
    (0, assert_supported_vite_version_1.assertSupportedViteVersion)(tree);
    const projectGraph = await (0, devkit_1.createProjectGraphAsync)();
    const migrationLogs = new internal_1.AggregatedLog();
    const migratedProjects = await (0, internal_1.migrateProjectExecutorsToPlugin)(tree, projectGraph, '@nx/vite/plugin', plugin_1.createNodesV2, {
        buildTargetName: 'build',
        serveTargetName: 'serve',
        previewTargetName: 'preview',
        serveStaticTargetName: 'serve-static',
    }, [
        {
            executors: ['@nx/vite:build'],
            postTargetTransformer: build_post_target_transformer_1.buildPostTargetTransformer,
            targetPluginOptionMapper: (target) => ({ buildTargetName: target }),
        },
        {
            executors: ['@nx/vite:dev-server'],
            postTargetTransformer: (0, serve_post_target_transformer_1.servePostTargetTransformer)(migrationLogs),
            targetPluginOptionMapper: (target) => ({ serveTargetName: target }),
        },
        {
            executors: ['@nx/vite:preview-server'],
            postTargetTransformer: (0, preview_post_target_transformer_1.previewPostTargetTransformer)(migrationLogs),
            targetPluginOptionMapper: (target) => ({ previewTargetName: target }),
        },
    ], options.project);
    if (migratedProjects.size === 0) {
        throw new internal_1.NoTargetsToMigrateError();
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return () => {
        migrationLogs.flushLogs();
    };
}
exports.default = convertToInferred;
