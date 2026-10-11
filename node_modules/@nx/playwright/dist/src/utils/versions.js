"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eslintPluginPlaywrightVersion = exports.playwrightVersion = exports.minPlaywrightVersionForBlobReports = exports.minSupportedPlaywrightVersion = exports.nxVersion = void 0;
const path_1 = require("path");
exports.nxVersion = require((0, path_1.join)('@nx/playwright', 'package.json')).version;
exports.minSupportedPlaywrightVersion = '1.36.0';
exports.minPlaywrightVersionForBlobReports = '1.37.0';
exports.playwrightVersion = '^1.37.0';
exports.eslintPluginPlaywrightVersion = '^1.6.2';
