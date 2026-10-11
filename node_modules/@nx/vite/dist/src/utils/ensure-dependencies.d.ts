import { type GeneratorCallback, type Tree } from '@nx/devkit';
export type EnsureDependenciesOptions = {
    uiFramework: 'angular' | 'react' | 'none';
    compiler?: 'babel' | 'swc';
    includeLib?: boolean;
};
export declare function ensureDependencies(host: Tree, schema: EnsureDependenciesOptions): GeneratorCallback;
