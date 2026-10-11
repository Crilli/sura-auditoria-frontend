"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCiFile = isCiFile;
exports.visitCiFiles = visitCiFiles;
const devkit_1 = require("@nx/devkit");
const picomatch = require("picomatch");
// Common CI provider configs. Mechanical edits inside YAML are risky
// (comments, anchors, multi-line strings), so the pre-pass only scans these
// for legacy tokens and forwards file paths as advisory context.
const CI_GLOBS = [
    '**/.github/workflows/*.{yml,yaml}',
    '**/.gitlab-ci.yml',
    '**/.gitlab-ci.*.yml',
    '**/azure-pipelines.{yml,yaml}',
    '**/azure-pipelines.*.{yml,yaml}',
    '**/.circleci/config.yml',
    '**/bitbucket-pipelines.yml',
];
const ciMatchers = CI_GLOBS.map((g) => picomatch(g));
function isCiFile(filePath) {
    return ciMatchers.some((m) => m(filePath));
}
function visitCiFiles(tree, callback) {
    (0, devkit_1.visitNotIgnoredFiles)(tree, '', (filePath) => {
        if (!isCiFile(filePath))
            return;
        const contents = tree.read(filePath, 'utf-8');
        callback(filePath, contents);
    });
}
