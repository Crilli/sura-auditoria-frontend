"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVitestConfigFile = isVitestConfigFile;
exports.isVitestWorkspaceFile = isVitestWorkspaceFile;
exports.visitVitestConfigFiles = visitVitestConfigFiles;
exports.isJsOrTsFile = isJsOrTsFile;
const devkit_1 = require("@nx/devkit");
const picomatch = require("picomatch");
// Vitest options can live in either `vitest.config.*` (dedicated) or
// `vite.config.*` (the `test:` block consumed by the inferred plugin).
const CONFIG_GLOBS = [
    '**/vitest.*config*.{js,ts,mjs,mts,cjs,cts}',
    '**/vite.*config*.{js,ts,mjs,mts,cjs,cts}',
];
const WORKSPACE_GLOB = '**/vitest.workspace.{js,ts,mjs,mts,cjs,cts}';
const configMatchers = CONFIG_GLOBS.map((g) => picomatch(g));
const workspaceMatcher = picomatch(WORKSPACE_GLOB);
function isVitestConfigFile(filePath) {
    return configMatchers.some((m) => m(filePath));
}
function isVitestWorkspaceFile(filePath) {
    return workspaceMatcher(filePath);
}
function visitVitestConfigFiles(tree, callback) {
    (0, devkit_1.visitNotIgnoredFiles)(tree, '', (filePath) => {
        if (isVitestConfigFile(filePath)) {
            callback(filePath);
        }
    });
}
const TS_JS_RE = /\.[cm]?[jt]sx?$/;
function isJsOrTsFile(filePath) {
    return TS_JS_RE.test(filePath);
}
