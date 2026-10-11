import { type Tree } from '@nx/devkit';
/**
 * Packages that run vitest through a package.json script but have no local
 * vite/vitest config relied on Vitest 3 running their own test files from the
 * package directory. In Vitest 4 the same invocation climbs up to the root
 * `vitest.config.*`, resolves its `test.projects` globs relative to the
 * package directory, matches nothing, and hard-errors with "No projects were
 * found". A minimal local config stops the climb and lets `@nx/vitest` infer
 * the package's test target. Returns the created file paths.
 */
export declare function generateLocalVitestConfigs(tree: Tree): string[];
