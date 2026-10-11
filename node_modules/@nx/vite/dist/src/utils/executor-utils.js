"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTypes = validateTypes;
exports.createBuildableTsConfig = createBuildableTsConfig;
exports.loadViteDynamicImport = loadViteDynamicImport;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
const options_utils_1 = require("./options-utils");
const node_child_process_1 = require("node:child_process");
const js_1 = require("@nx/js");
const path_1 = require("path");
async function validateTypes(opts) {
    if (!opts.isVueProject) {
        const result = await (0, js_1.runTypeCheck)({
            workspaceRoot: opts.workspaceRoot,
            tsConfigPath: opts.tsconfig.startsWith(opts.workspaceRoot)
                ? opts.tsconfig
                : (0, path_1.join)(opts.workspaceRoot, opts.tsconfig),
            mode: 'noEmit',
            // TS 6 defaults rootDir to the tsconfig dir, so from-source workspace
            // libs (outside the project) trip TS6059. rootDir is emit-only and this
            // is noEmit, so widen it to the workspace root to clear the false error.
            rootDir: opts.workspaceRoot,
        });
        await (0, js_1.printDiagnostics)(result.errors, result.warnings);
        if (result.errors.length > 0) {
            throw new Error('Found type errors. See above.');
        }
    }
    else {
        const pm = (0, devkit_1.getPackageManagerCommand)();
        const cp = (0, node_child_process_1.execSync)(`${pm.exec} vue-tsc --noEmit -p ${opts.tsconfig} --composite false`, {
            cwd: opts.workspaceRoot,
            stdio: 'inherit',
            windowsHide: true,
        });
    }
}
function createBuildableTsConfig(projectRoot, options, context) {
    const tsConfig = options.tsConfig ?? (0, options_utils_1.getProjectTsConfigPath)(projectRoot);
    options['buildLibsFromSource'] ??= true;
    if (!options['buildLibsFromSource']) {
        const { dependencies } = (0, internal_1.calculateProjectBuildableDependencies)(context.taskGraph, context.projectGraph, context.root, context.projectName, 
        // When using incremental building and the serve target is called
        // we need to get the deps for the 'build' target instead.
        context.targetName === 'serve' ? 'build' : context.targetName, context.configurationName);
        // This tsconfig is used via the Vite ts paths plugin.
        // It can be also used by other user-defined Vite plugins (e.g. for creating type declaration files).
        const tmpTsConfigPath = (0, internal_1.createTmpTsConfig)(tsConfig, context.root, projectRoot, dependencies);
        process.env.NX_TSCONFIG_PATH = tmpTsConfigPath;
        return tmpTsConfigPath;
    }
    return tsConfig;
}
function loadViteDynamicImport() {
    return Function('return import("vite")')();
}
