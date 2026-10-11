import { type Tree } from '@nx/devkit';
/**
 * Inline `vitest.workspace.*` files whose project list is a static array of
 * string literals into the sibling root `vitest.config.*` under
 * `test.projects` (creating the config file when none exists), then delete
 * the workspace file. Vitest 4 removed workspace files entirely.
 *
 * Anything not statically tractable (dynamic arrays, inline project objects,
 * non-object-literal configs, pre-existing `test.projects`) is left in place
 * and reported through `unhandled` for the agent.
 */
export declare function inlineVitestWorkspaceFiles(tree: Tree, unhandled: string[]): {
    foundWorkspaceFiles: boolean;
};
