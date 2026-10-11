"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDependencies = ensureDependencies;
const devkit_1 = require("@nx/devkit");
const semver_1 = require("semver");
const versions_1 = require("./versions");
function ensureDependencies(host, schema) {
    const devDependencies = {};
    if (schema.uiFramework === 'react') {
        if (schema.compiler === 'swc') {
            devDependencies['@vitejs/plugin-react-swc'] = versions_1.vitePluginReactSwcVersion;
        }
        else {
            // @vitejs/plugin-react v6 requires Vite 8+, use v4 for older versions.
            // getDependencyVersionFromPackageJson resolves pnpm catalog: refs.
            const viteRange = (0, devkit_1.getDependencyVersionFromPackageJson)(host, 'vite');
            const coerced = viteRange ? (0, semver_1.coerce)(viteRange) : null;
            const viteMajor = coerced ? (0, semver_1.major)(coerced) : null;
            devDependencies['@vitejs/plugin-react'] =
                viteMajor !== null && viteMajor < 8
                    ? versions_1.vitePluginReactV4Version
                    : versions_1.vitePluginReactVersion;
        }
    }
    if (schema.includeLib) {
        devDependencies['vite-plugin-dts'] = versions_1.vitePluginDtsVersion;
        if ((0, devkit_1.detectPackageManager)() !== 'pnpm') {
            devDependencies['ajv'] = versions_1.ajvVersion;
        }
    }
    return (0, devkit_1.addDependenciesToPackageJson)(host, {}, devDependencies, undefined, true);
}
