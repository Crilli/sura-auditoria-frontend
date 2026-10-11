"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDependenciesInstalled = checkDependenciesInstalled;
exports.moveToDevDependencies = moveToDevDependencies;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const internal_2 = require("@nx/js/internal");
const semver_1 = require("semver");
const versions_1 = require("../../../utils/versions");
const version_utils_1 = require("../../../utils/version-utils");
function hasIncompatibleInstalledEsbuild(host) {
    const installedEsbuildVersion = (0, devkit_1.getDependencyVersionFromPackageJson)(host, 'esbuild');
    if (!installedEsbuildVersion) {
        return false;
    }
    try {
        return !(0, semver_1.intersects)(installedEsbuildVersion, internal_2.esbuildVersion, {
            includePrerelease: true,
        });
    }
    catch {
        return true;
    }
}
async function checkDependenciesInstalled(host, schema) {
    // Determine which vite version to install:
    // 1. Explicit flags take priority (useViteV5/V6/V7)
    // 2. If vite is already installed, keep the matching major version
    // 3. If esbuild is already installed but incompatible with Vite 8, use Vite 7
    // 4. Otherwise, use the latest default (^8.0.0)
    const installedMajor = (0, version_utils_1.getInstalledViteMajorVersion)(host);
    const installedEsbuildVersion = (0, devkit_1.getDependencyVersionFromPackageJson)(host, 'esbuild');
    const useViteV7ForEsbuildCompatibility = installedMajor == null && hasIncompatibleInstalledEsbuild(host);
    if (useViteV7ForEsbuildCompatibility) {
        devkit_1.output.warn({
            title: 'Installed esbuild is incompatible with Vite 8. Using Vite 7.',
            bodyLines: [
                `Found esbuild version "${installedEsbuildVersion}" in the workspace root package.json.`,
                `Update esbuild to a range compatible with ${internal_2.esbuildVersion} if you want newly generated Vite projects to use Vite 8 by default.`,
            ],
        });
    }
    const viteVersionToInstall = schema.useViteV5
        ? versions_1.viteV5Version
        : schema.useViteV6
            ? versions_1.viteV6Version
            : schema.useViteV7 ||
                installedMajor === 7 ||
                useViteV7ForEsbuildCompatibility
                ? versions_1.viteV7Version
                : installedMajor === 6
                    ? versions_1.viteV6Version
                    : installedMajor === 5
                        ? versions_1.viteV5Version
                        : versions_1.viteVersion;
    // vite pulls in esbuild, whose install script only validates the prebuilt
    // binary shipped via optional dependencies, so skip it.
    (0, internal_1.acknowledgeBuildScripts)(host, (0, devkit_1.detectPackageManager)(host.root), {
        esbuild: false,
    });
    return (0, devkit_1.addDependenciesToPackageJson)(host, {}, {
        '@nx/vite': versions_1.nxVersion,
        '@nx/web': versions_1.nxVersion,
        vite: viteVersionToInstall,
        jiti: versions_1.jitiVersion,
    }, undefined, schema.keepExistingVersions ?? true);
}
function moveToDevDependencies(tree) {
    let wasUpdated = false;
    (0, devkit_1.updateJson)(tree, 'package.json', (packageJson) => {
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.devDependencies = packageJson.devDependencies || {};
        if (packageJson.dependencies['@nx/vite']) {
            packageJson.devDependencies['@nx/vite'] =
                packageJson.dependencies['@nx/vite'];
            delete packageJson.dependencies['@nx/vite'];
            wasUpdated = true;
        }
        return packageJson;
    });
    return wasUpdated ? () => (0, devkit_1.installPackagesTask)(tree) : () => { };
}
