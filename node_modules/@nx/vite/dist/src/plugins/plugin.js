"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNodesV2 = exports.createNodes = exports.createDependencies = void 0;
const internal_1 = require("@nx/devkit/internal");
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const internal_2 = require("@nx/js/internal");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const file_hasher_1 = require("nx/src/hasher/file-hasher");
const cache_directory_1 = require("nx/src/utils/cache-directory");
const executor_utils_1 = require("../utils/executor-utils");
const picomatch = require("picomatch");
/**
 * @deprecated The 'createDependencies' function is now a no-op. This functionality is included in 'createNodesV2'.
 */
const createDependencies = () => {
    return [];
};
exports.createDependencies = createDependencies;
const viteConfigGlob = '**/vite.config.{js,ts,mjs,mts,cjs,cts}';
exports.createNodes = [
    viteConfigGlob,
    async (configFilePaths, options, context) => {
        const optionsHash = (0, file_hasher_1.hashObject)(options);
        const normalizedOptions = normalizeOptions(options);
        const cachePath = (0, node_path_1.join)(cache_directory_1.workspaceDataDirectory, `vite-${optionsHash}.hash`);
        const targetsCache = new internal_1.PluginCache(cachePath);
        const isUsingTsSolutionSetup = (0, internal_2.isUsingTsSolutionSetup)();
        const { roots: projectRoots, configFiles: validConfigFiles } = configFilePaths.reduce((acc, configFile) => {
            const potentialRoot = (0, node_path_1.dirname)(configFile);
            if (checkIfConfigFileShouldBeProject(potentialRoot, context)) {
                acc.roots.push(potentialRoot);
                acc.configFiles.push(configFile);
            }
            return acc;
        }, {
            roots: [],
            configFiles: [],
        });
        const detectedPackageManager = (0, devkit_1.detectPackageManager)(context.workspaceRoot);
        const pmc = (0, devkit_1.getPackageManagerCommand)(detectedPackageManager);
        const lockfile = (0, js_1.getLockFileName)(detectedPackageManager);
        const tsconfigChainsByProjectRoot = collectTsconfigInputsByProjectRoot(projectRoots, context.workspaceRoot);
        const hashes = await (0, internal_1.calculateHashesForCreateNodes)(projectRoots, { ...normalizedOptions, isUsingTsSolutionSetup }, context, projectRoots.map((root) => [
            lockfile,
            ...(tsconfigChainsByProjectRoot.get(root) ?? []),
        ]));
        try {
            return await (0, devkit_1.createNodesFromFiles)(async (configFile, _, context, idx) => {
                const projectRoot = (0, node_path_1.dirname)(configFile);
                // Do not create a project if package.json and project.json isn't there.
                const siblingFiles = (0, node_fs_1.readdirSync)((0, node_path_1.join)(context.workspaceRoot, projectRoot));
                const tsConfigFiles = siblingFiles.filter((p) => picomatch('tsconfig*{.json,.*.json}')(p)) ?? [];
                const hasReactRouterConfig = siblingFiles.some((configFile) => {
                    const parts = configFile.split('.');
                    return (parts[0] === 'react-router' &&
                        parts[1] === 'config' &&
                        parts.length > 2);
                });
                const hash = hashes[idx] + configFile;
                if (!targetsCache.has(hash)) {
                    targetsCache.set(hash, await buildViteTargets(configFile, projectRoot, normalizedOptions, tsConfigFiles, hasReactRouterConfig, isUsingTsSolutionSetup, context, pmc, tsconfigChainsByProjectRoot.get(projectRoot) ?? []));
                }
                const { projectType, metadata, targets } = targetsCache.get(hash);
                const project = {
                    root: projectRoot,
                    targets,
                    metadata,
                };
                // If project is buildable, then the project type.
                // If it is not buildable, then leave it to other plugins/project.json to set the project type.
                if (project.targets[normalizedOptions.buildTargetName]) {
                    project.projectType = projectType;
                }
                return {
                    projects: {
                        [projectRoot]: project,
                    },
                };
            }, validConfigFiles, options, context);
        }
        finally {
            targetsCache.writeToDisk();
        }
    },
];
exports.createNodesV2 = exports.createNodes;
async function buildViteTargets(configFilePath, projectRoot, options, tsConfigFiles, hasReactRouterConfig, isUsingTsSolutionSetup, context, pmc, tsconfigInputs) {
    const absoluteConfigFilePath = (0, devkit_1.joinPathFragments)(context.workspaceRoot, configFilePath);
    // Workaround for the `build$3 is not a function` error that we sometimes see in agents.
    // This should be removed later once we address the issue properly
    try {
        const importEsbuild = () => new Function('return import("esbuild")')();
        await importEsbuild();
    }
    catch {
        // do nothing
    }
    // Workaround for race condition with ESM-only Vite plugins (e.g. @vitejs/plugin-vue@6+)
    // If vite.config.ts is compiled as CJS, then when both require('@vitejs/plugin-vue') and import('@vitejs/plugin-vue')
    // are pending in the same process, Node will throw an error:
    // Error [ERR_INTERNAL_ASSERTION]: Cannot require() ES Module @vitejs/plugin-vue/dist/index.js because it is not yet fully loaded.
    // This may be caused by a race condition if the module is simultaneously dynamically import()-ed via Promise.all().
    try {
        const importVuePlugin = () => new Function('return import("@vitejs/plugin-vue")')();
        await importVuePlugin();
    }
    catch {
        // Plugin not installed or not needed, ignore
    }
    const { resolveConfig } = await (0, executor_utils_1.loadViteDynamicImport)();
    const viteBuildConfig = await resolveConfig({
        configFile: absoluteConfigFilePath,
        mode: 'development',
        root: projectRoot,
    }, 'build');
    const metadata = {};
    const { buildOutputs, isBuildable, hasServeConfig } = getOutputs(viteBuildConfig, projectRoot, context.workspaceRoot);
    const namedInputs = (0, internal_1.getNamedInputs)(projectRoot, context);
    const targets = {};
    if (hasReactRouterConfig) {
        // If we have a react-router config, we can skip the rest of the targets
        return { targets, metadata: {}, projectType: 'application' };
    }
    const hasRemixPlugin = viteBuildConfig.plugins &&
        viteBuildConfig.plugins.some((p) => p.name === 'remix');
    if (!hasRemixPlugin && isBuildable) {
        targets[options.buildTargetName] = await buildTarget(options.buildTargetName, namedInputs, buildOutputs, projectRoot, isUsingTsSolutionSetup, pmc);
        // If running in library mode, then there is nothing to serve.
        if (!viteBuildConfig.build?.lib || hasServeConfig) {
            const devTarget = serveTarget(projectRoot, isUsingTsSolutionSetup, pmc);
            targets[options.serveTargetName] = {
                ...devTarget,
                metadata: {
                    ...devTarget.metadata,
                    deprecated: 'Use devTargetName instead. This option will be removed in Nx 22.',
                },
            };
            targets[options.devTargetName] = devTarget;
            targets[options.previewTargetName] = previewTarget(projectRoot, options.buildTargetName, pmc);
            targets[options.serveStaticTargetName] = serveStaticTarget(options, isUsingTsSolutionSetup);
        }
    }
    if (tsConfigFiles.length) {
        const tsConfigToUse = ['tsconfig.app.json', 'tsconfig.lib.json', 'tsconfig.json'].find((t) => tsConfigFiles.includes(t)) ?? tsConfigFiles[0];
        // Check if the project uses Vue plugin
        const hasVuePlugin = viteBuildConfig.plugins?.some((p) => p.name === 'vite:vue' || p.name === 'vite:vue2');
        // Explicit `compiler` option wins over inference so users can override
        // when their setup isn't detected (e.g. custom/non-standard Vue plugin).
        const resolvedCompiler = options.compiler ?? (hasVuePlugin ? 'vue-tsc' : 'tsc');
        const typeCheckCommand = resolvedCompiler;
        const typeCheckExternalDeps = resolvedCompiler === 'tsgo'
            ? ['@typescript/native-preview']
            : resolvedCompiler === 'vue-tsc'
                ? ['vue-tsc', 'typescript']
                : ['typescript'];
        targets[options.typecheckTargetName] = {
            cache: true,
            inputs: [
                ...('production' in namedInputs
                    ? ['production', '^production']
                    : ['default', '^default']),
                { externalDependencies: typeCheckExternalDeps },
            ],
            command: isUsingTsSolutionSetup
                ? `${typeCheckCommand} --build --emitDeclarationOnly`
                : `${typeCheckCommand} --noEmit -p ${tsConfigToUse}`,
            options: { cwd: (0, devkit_1.joinPathFragments)(projectRoot) },
            metadata: {
                description: `Runs type-checking for the project.`,
                technologies: hasVuePlugin ? ['typescript', 'vue'] : ['typescript'],
                help: {
                    command: isUsingTsSolutionSetup
                        ? `${pmc.exec} ${typeCheckCommand} --build --help`
                        : `${pmc.exec} ${typeCheckCommand} -p ${tsConfigToUse} --help`,
                    example: isUsingTsSolutionSetup
                        ? { args: ['--force'] }
                        : { options: { noEmit: true } },
                },
            },
        };
        if (isUsingTsSolutionSetup) {
            targets[options.typecheckTargetName].dependsOn = [
                `^${options.typecheckTargetName}`,
            ];
            targets[options.typecheckTargetName].syncGenerators = [
                '@nx/js:typescript-sync',
            ];
        }
    }
    (0, internal_2.addBuildAndWatchDepsTargets)(context.workspaceRoot, projectRoot, targets, options, pmc);
    return {
        targets,
        metadata,
        projectType: viteBuildConfig.build?.lib ? 'library' : 'application',
    };
}
async function buildTarget(buildTargetName, namedInputs, outputs, projectRoot, isUsingTsSolutionSetup, pmc) {
    const buildTarget = {
        command: `vite build`,
        options: { cwd: (0, devkit_1.joinPathFragments)(projectRoot) },
        cache: true,
        dependsOn: [`^${buildTargetName}`],
        inputs: [
            ...('production' in namedInputs
                ? ['production', '^production']
                : ['default', '^default']),
            {
                externalDependencies: ['vite'],
            },
        ],
        outputs,
        metadata: {
            technologies: ['vite'],
            description: `Run Vite build`,
            help: {
                command: `${pmc.exec} vite build --help`,
                example: {
                    options: {
                        sourcemap: true,
                        manifest: 'manifest.json',
                    },
                },
            },
        },
    };
    if (isUsingTsSolutionSetup) {
        buildTarget.syncGenerators = ['@nx/js:typescript-sync'];
    }
    return buildTarget;
}
function serveTarget(projectRoot, isUsingTsSolutionSetup, pmc) {
    const targetConfig = {
        continuous: true,
        command: `vite`,
        options: {
            cwd: (0, devkit_1.joinPathFragments)(projectRoot),
        },
        metadata: {
            technologies: ['vite'],
            description: `Starts Vite dev server`,
            help: {
                command: `${pmc.exec} vite --help`,
                example: {
                    options: {
                        port: 3000,
                    },
                },
            },
        },
    };
    if (isUsingTsSolutionSetup) {
        targetConfig.syncGenerators = ['@nx/js:typescript-sync'];
    }
    return targetConfig;
}
function previewTarget(projectRoot, buildTargetName, pmc) {
    const targetConfig = {
        continuous: true,
        command: `vite preview`,
        dependsOn: [buildTargetName],
        options: {
            cwd: (0, devkit_1.joinPathFragments)(projectRoot),
        },
        metadata: {
            technologies: ['vite'],
            description: `Locally preview Vite production build`,
            help: {
                command: `${pmc.exec} vite preview --help`,
                example: {
                    options: {
                        port: 3000,
                    },
                },
            },
        },
    };
    return targetConfig;
}
function serveStaticTarget(options, isUsingTsSolutionSetup) {
    const targetConfig = {
        continuous: true,
        executor: '@nx/web:file-server',
        options: {
            buildTarget: `${options.buildTargetName}`,
            spa: true,
        },
    };
    if (isUsingTsSolutionSetup) {
        targetConfig.syncGenerators = ['@nx/js:typescript-sync'];
    }
    return targetConfig;
}
function getOutputs(viteBuildConfig, projectRoot, workspaceRoot) {
    // TODO(jack): Remove this cast when @nx/vite switches to moduleResolution:
    // "nodenext". Vite 8's rolldown types are ESM-only (.d.mts) and not
    // resolvable under moduleResolution: "node", which breaks rolldownOptions
    // on ResolvedConfig.
    const { build, server } = viteBuildConfig;
    const buildOutputPath = normalizeOutputPath(build?.outDir, projectRoot, workspaceRoot, 'dist');
    const isBuildable = Boolean(build?.lib ||
        viteBuildConfig?.builder?.buildApp ||
        build?.rollupOptions?.input || // Vite <8
        build?.rolldownOptions?.input || // Vite >=8
        (0, node_fs_1.existsSync)((0, node_path_1.join)(workspaceRoot, projectRoot, 'index.html')));
    const hasServeConfig = Boolean(server?.host || server?.port);
    return {
        buildOutputs: [buildOutputPath],
        isBuildable,
        hasServeConfig,
    };
}
function normalizeOutputPath(outputPath, projectRoot, workspaceRoot, path) {
    if (!outputPath) {
        if (projectRoot === '.') {
            return `{projectRoot}/${path}`;
        }
        else {
            return `{workspaceRoot}/${path}/{projectRoot}`;
        }
    }
    else {
        if ((0, node_path_1.isAbsolute)(outputPath)) {
            return `{workspaceRoot}/${(0, node_path_1.relative)(workspaceRoot, outputPath)}`;
        }
        else {
            if (outputPath.startsWith('..')) {
                return (0, devkit_1.joinPathFragments)('{workspaceRoot}', projectRoot, outputPath);
            }
            else {
                return (0, devkit_1.joinPathFragments)('{projectRoot}', outputPath);
            }
        }
    }
}
function normalizeOptions(options) {
    options ??= {};
    options.buildTargetName ??= 'build';
    options.serveTargetName ??= 'serve';
    options.devTargetName ??= 'dev';
    options.previewTargetName ??= 'preview';
    options.serveStaticTargetName ??= 'serve-static';
    options.typecheckTargetName ??= 'typecheck';
    return options;
}
/**
 * Collects tsconfig files that Vite's esbuild-based config bundler reads
 * but are outside the project root (and thus not covered by `default`).
 *
 * Vite < 8 uses esbuild's Build API to bundle config files. esbuild walks
 * UP from the entry point, reading and parsing every `tsconfig.json` in
 * every ancestor directory plus their `extends` chains. Vite >= 8 uses
 * rolldown with `tsconfig: false`, but pnpm can resolve different Vite
 * versions per project, so we always collect — the walk is cheap (cached
 * JSON reads) and over-declaring inputs for Vite 8 projects is harmless.
 */
function collectTsconfigInputsByProjectRoot(projectRoots, workspaceRoot) {
    const jsonCache = new Map();
    const result = new Map();
    const rootTsConfigName = (0, js_1.getRootTsConfigFileName)();
    for (const projectRoot of projectRoots) {
        if (projectRoot === '.')
            continue;
        const outside = [];
        const seen = new Set();
        const projectPrefix = `${projectRoot}/`;
        const collect = (absolutePath) => {
            const wsRelative = (0, node_path_1.relative)(workspaceRoot, absolutePath)
                .split(node_path_1.sep)
                .join('/');
            if (seen.has(wsRelative))
                return;
            seen.add(wsRelative);
            if (wsRelative.startsWith('../') || wsRelative === '..')
                return;
            if (wsRelative.startsWith('node_modules/') ||
                wsRelative.includes('/node_modules/'))
                return;
            if (wsRelative === projectRoot || wsRelative.startsWith(projectPrefix))
                return;
            if (wsRelative === rootTsConfigName)
                return;
            outside.push(wsRelative);
        };
        // Walk the project tsconfig's extends chain
        const projectTsconfig = (0, node_path_1.join)(workspaceRoot, projectRoot, 'tsconfig.json');
        if ((0, node_fs_1.existsSync)(projectTsconfig)) {
            (0, internal_2.walkTsconfigExtendsChain)(projectTsconfig, (absPath) => {
                collect(absPath);
                return 'continue';
            }, { jsonCache });
        }
        // Walk UP ancestor directories — esbuild reads every tsconfig.json
        // between the entry point and the filesystem root.
        let dir = (0, node_path_1.dirname)(projectRoot);
        while (dir && dir !== '.') {
            const ancestorTsconfig = (0, node_path_1.join)(workspaceRoot, dir, 'tsconfig.json');
            if ((0, node_fs_1.existsSync)(ancestorTsconfig)) {
                (0, internal_2.walkTsconfigExtendsChain)(ancestorTsconfig, (absPath) => {
                    collect(absPath);
                    return 'continue';
                }, { jsonCache });
            }
            const parent = (0, node_path_1.dirname)(dir);
            if (parent === dir)
                break;
            dir = parent;
        }
        // Check the workspace root itself (dirname loop above stops at '.')
        const rootTsconfig = (0, node_path_1.join)(workspaceRoot, 'tsconfig.json');
        if ((0, node_fs_1.existsSync)(rootTsconfig)) {
            (0, internal_2.walkTsconfigExtendsChain)(rootTsconfig, (absPath) => {
                collect(absPath);
                return 'continue';
            }, { jsonCache });
        }
        if (outside.length > 0) {
            result.set(projectRoot, outside);
        }
    }
    return result;
}
function checkIfConfigFileShouldBeProject(projectRoot, context) {
    // Do not create a project if package.json and project.json isn't there.
    const siblingFiles = (0, node_fs_1.readdirSync)((0, node_path_1.join)(context.workspaceRoot, projectRoot));
    if (!siblingFiles.includes('package.json') &&
        !siblingFiles.includes('project.json')) {
        return false;
    }
    return true;
}
