"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSupportedViteVersion = assertSupportedViteVersion;
const internal_1 = require("@nx/devkit/internal");
const versions_1 = require("./versions");
function assertSupportedViteVersion(tree) {
    (0, internal_1.assertSupportedPackageVersion)(tree, 'vite', versions_1.minSupportedViteVersion);
}
