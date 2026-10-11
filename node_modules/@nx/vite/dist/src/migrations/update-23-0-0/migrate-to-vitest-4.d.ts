import { type Tree } from '@nx/devkit';
/**
 * Hybrid migration paired with `ai-instructions-for-vitest-4.md`. Applies the
 * deterministic, AST-tractable Vitest 3.x → 4.0 changes mechanically and
 * forwards an `agentContext` describing any shape it could not handle so the
 * paired prompt's agent can finish the rest.
 *
 * The "apply" set is intentionally narrow (renames, deletions of dead options,
 * single-property string rewrites). Anything requiring cross-cutting surgery
 * (e.g. pool option flattening, `deps.* → server.deps.*` merge, browser
 * provider function-form rewrite, workspace file inlining) is detected and
 * logged for the agent.
 */
export default function migrateToVitest4(tree: Tree): Promise<{
    nextSteps?: string[];
    agentContext?: string[];
}>;
