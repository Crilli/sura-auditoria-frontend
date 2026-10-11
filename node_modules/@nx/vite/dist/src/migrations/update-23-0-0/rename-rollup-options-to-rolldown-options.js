"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = renameRollupOptionsToRolldownOptions;
const devkit_1 = require("@nx/devkit");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const picomatch = require("picomatch");
// Matches both bare-key form (rollupOptions: ...) and quoted-key form
// ('rollupOptions': ...) so configs written with JSON-style quoting are caught.
const ROLLUP_OPTIONS_SELECTOR = 'PropertyAssignment > :matches(Identifier[name=rollupOptions], StringLiteral[value=rollupOptions])';
const VITE_CONFIG_GLOB = '**/vite.*config*.{js,ts,mjs,mts,cjs,cts}';
async function renameRollupOptionsToRolldownOptions(tree) {
    const matchVite = picomatch(VITE_CONFIG_GLOB);
    (0, devkit_1.visitNotIgnoredFiles)(tree, '', (filePath) => {
        if (!matchVite(filePath)) {
            return;
        }
        const contents = tree.read(filePath, 'utf-8');
        if (!contents)
            return;
        if (!contents.includes('rollupOptions')) {
            return;
        }
        const sourceFile = (0, tsquery_1.ast)(contents);
        // Extra .text filter guards against the outer-PropertyAssignment descendant
        // trap: ensures the matched node's own name is `rollupOptions`, not a
        // nested node that merely contains an identifier with that name.
        const nodes = (0, tsquery_1.query)(sourceFile, ROLLUP_OPTIONS_SELECTOR).filter((node) => node.text === 'rollupOptions');
        if (nodes.length === 0) {
            return;
        }
        // Replace from end-to-start so positions stay valid as we mutate.
        let updated = contents;
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            const start = node.getStart();
            const end = node.getEnd();
            // Preserve quote style for StringLiteral keys ('rollupOptions' or "rollupOptions").
            const quoteChar = updated[start];
            const replacement = quoteChar === "'" || quoteChar === '"'
                ? `${quoteChar}rolldownOptions${quoteChar}`
                : 'rolldownOptions';
            updated = updated.slice(0, start) + replacement + updated.slice(end);
        }
        tree.write(filePath, updated);
    });
    await (0, devkit_1.formatFiles)(tree);
}
