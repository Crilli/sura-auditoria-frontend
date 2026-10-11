import { type Tree } from '@nx/devkit';
/**
 * Hybrid migration paired with `ai-instructions-for-vitest-3.md`. Applies the
 * deterministic, AST-tractable Vitest 1.x/2.x → 3.x changes mechanically and
 * returns an `agentContext` describing any shape it could not handle, so the
 * paired prompt's agent can finish those by hand.
 */
export default function migrateToVitest3(tree: Tree): Promise<{
    agentContext: string[];
}>;
