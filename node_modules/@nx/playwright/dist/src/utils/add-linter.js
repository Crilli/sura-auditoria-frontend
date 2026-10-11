"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLinterToPlaywrightProject = addLinterToPlaywrightProject;
const devkit_1 = require("@nx/devkit");
const eslint_1 = require("@nx/eslint");
const internal_1 = require("@nx/eslint/internal");
const versions_1 = require("./versions");
async function addLinterToPlaywrightProject(tree, options) {
    if (options.linter === 'none') {
        return () => { };
    }
    const tasks = [];
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const eslintFile = (0, internal_1.findEslintFile)(tree, projectConfig.root);
    const enableTypedLinting = (0, internal_1.isTypedLintingEnabled)(options);
    if (!eslintFile) {
        tasks.push(await (0, eslint_1.lintProjectGenerator)(tree, {
            project: options.project,
            linter: options.linter,
            skipFormat: true,
            tsConfigPaths: [(0, devkit_1.joinPathFragments)(projectConfig.root, 'tsconfig.json')],
            enableTypedLinting,
            skipPackageJson: options.skipPackageJson,
            rootProject: options.rootProject,
            addPlugin: options.addPlugin,
        }));
    }
    if (!options.linter || options.linter !== 'eslint') {
        return (0, devkit_1.runTasksInSerial)(...tasks);
    }
    tasks.push(!options.skipPackageJson
        ? (0, devkit_1.addDependenciesToPackageJson)(tree, {}, { 'eslint-plugin-playwright': versions_1.eslintPluginPlaywrightVersion }, undefined, true)
        : () => { });
    if ((0, internal_1.isEslintConfigSupported)(tree, projectConfig.root) ||
        (0, internal_1.isEslintConfigSupported)(tree)) {
        if ((0, internal_1.useFlatConfig)(tree)) {
            (0, internal_1.addPredefinedConfigToFlatLintConfig)(tree, projectConfig.root, 'flat/recommended', {
                moduleName: 'playwright',
                moduleImportPath: 'eslint-plugin-playwright',
                spread: false,
                insertAtTheEnd: false,
            });
            (0, internal_1.addOverrideToLintConfig)(tree, projectConfig.root, {
                files: ['*.ts', '*.js'],
                rules: {},
            });
            // `lintProjectGenerator` only runs when the project has no ESLint config
            // (it already emits the projectService block in that case). For an
            // existing flat config it didn't run, so emit the block here when typed
            // linting is requested.
            if (eslintFile && enableTypedLinting) {
                (0, internal_1.addTypedLintingToFlatConfig)(tree, projectConfig.root);
            }
        }
        else {
            const addExtendsTask = (0, internal_1.addExtendsToLintConfig)(tree, projectConfig.root, 'plugin:playwright/recommended');
            tasks.push(addExtendsTask);
            if (options.rootProject) {
                (0, internal_1.addPluginsToLintConfig)(tree, projectConfig.root, '@nx');
                (0, internal_1.addOverrideToLintConfig)(tree, projectConfig.root, internal_1.javaScriptOverride);
            }
            (0, internal_1.addOverrideToLintConfig)(tree, projectConfig.root, {
                files: [`${options.directory}/**/*.{ts,js,tsx,jsx}`],
                // Only emit `parserOptions.project` here on the legacy `.eslintrc`
                // stack. Flat configs use `parserOptions.projectService` emitted by
                // `lintProjectGenerator`.
                parserOptions: enableTypedLinting
                    ? { project: `${projectConfig.root}/tsconfig.*?.json` }
                    : undefined,
                rules: {},
            });
        }
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
