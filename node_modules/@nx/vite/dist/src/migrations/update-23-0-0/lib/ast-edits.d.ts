import type { Node } from 'typescript';
export interface TextEdit {
    start: number;
    end: number;
    replacement: string;
}
/**
 * Apply a list of non-overlapping edits to `contents`. Edits are sorted by
 * `start` descending so positions stay valid as text is spliced.
 */
export declare function applyTextEdits(contents: string, edits: TextEdit[]): string;
/**
 * Edit that removes `node` and a single trailing comma if present. Designed
 * for removing a `PropertyAssignment` from an object literal without leaving
 * a dangling separator.
 */
export declare function removeNodeWithTrailingCommaEdit(contents: string, node: Node): TextEdit;
/**
 * Edit that replaces the textual range of `node` with `replacement`.
 */
export declare function replaceNodeTextEdit(node: Node, replacement: string): TextEdit;
/**
 * Edit that replaces a string literal's content while preserving the user's
 * original quote style. `node` is expected to be a StringLiteral.
 */
export declare function replaceStringLiteralValueEdit(contents: string, node: Node, newValue: string): TextEdit;
