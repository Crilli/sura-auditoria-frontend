import { CreateDependencies, CreateNodes } from '@nx/devkit';
export interface VitePluginOptions {
    buildTargetName?: string;
    /**
     * @deprecated Use devTargetName instead. This option will be removed in Nx 22.
     */
    serveTargetName?: string;
    devTargetName?: string;
    previewTargetName?: string;
    serveStaticTargetName?: string;
    typecheckTargetName?: string;
    /**
     * The compiler to use for type-checking. When unset, defaults to `vue-tsc`
     * for Vue projects (detected via the `vite:vue` plugin) and `tsc` otherwise.
     * Set to `tsgo` to use the TypeScript Go compiler (`@typescript/native-preview`),
     * or `vue-tsc` to force Vue-aware type-checking when auto-detection misses your setup.
     */
    compiler?: 'tsc' | 'tsgo' | 'vue-tsc';
    watchDepsTargetName?: string;
    buildDepsTargetName?: string;
}
/**
 * @deprecated The 'createDependencies' function is now a no-op. This functionality is included in 'createNodesV2'.
 */
export declare const createDependencies: CreateDependencies;
export declare const createNodes: CreateNodes<VitePluginOptions>;
export declare const createNodesV2: CreateNodes<VitePluginOptions>;
