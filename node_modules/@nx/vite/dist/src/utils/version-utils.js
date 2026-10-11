"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalledViteVersion = getInstalledViteVersion;
exports.getInstalledViteMajorVersion = getInstalledViteMajorVersion;
const devkit_1 = require("@nx/devkit");
const semver_1 = require("semver");
function getInstalledViteVersion(tree) {
    const installedViteVersion = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, 'vite');
    if (!installedViteVersion ||
        installedViteVersion === 'latest' ||
        installedViteVersion === 'beta') {
        return undefined;
    }
    return (0, semver_1.clean)(installedViteVersion) ?? (0, semver_1.coerce)(installedViteVersion)?.version;
}
function getInstalledViteMajorVersion(tree) {
    const installedViteVersion = getInstalledViteVersion(tree);
    if (!installedViteVersion) {
        return undefined;
    }
    const installedMajor = (0, semver_1.major)(installedViteVersion);
    if (installedMajor < 5 || installedMajor > 8) {
        return undefined;
    }
    return installedMajor;
}
