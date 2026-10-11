"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSupportedPlaywrightVersion = assertSupportedPlaywrightVersion;
const internal_1 = require("@nx/devkit/internal");
const versions_1 = require("./versions");
function assertSupportedPlaywrightVersion(tree) {
    (0, internal_1.assertSupportedPackageVersion)(tree, '@playwright/test', versions_1.minSupportedPlaywrightVersion);
}
