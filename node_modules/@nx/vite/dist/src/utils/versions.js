"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jitiVersion = exports.ajvVersion = exports.vitePluginDtsVersion = exports.vitePluginReactSwcVersion = exports.vitePluginReactV4Version = exports.vitePluginReactVersion = exports.minSupportedViteVersion = exports.viteV5Version = exports.viteV6Version = exports.viteV7Version = exports.viteVersion = exports.nxVersion = void 0;
const path_1 = require("path");
exports.nxVersion = require((0, path_1.join)('@nx/vite', 'package.json')).version;
// Also update @nx/remix/utils/versions when changing vite version
exports.viteVersion = '^8.0.0';
exports.viteV7Version = '^7.0.0';
exports.viteV6Version = '^6.0.0';
exports.viteV5Version = '^5.0.0';
// Lowest supported vite major. Kept at v5 because @nx/cypress (v13) still
// installs vite 5; generators throw below this floor via assertSupportedViteVersion.
exports.minSupportedViteVersion = '5.0.0';
exports.vitePluginReactVersion = '^6.0.0';
exports.vitePluginReactV4Version = '^4.2.0';
// Single constants: peer ranges span the whole supported vite window
// (vite-plugin-dts -> `vite: *`, plugin-react-swc -> `vite: ^4..^8`), so no
// per-major map is needed.
exports.vitePluginReactSwcVersion = '^4.3.0';
exports.vitePluginDtsVersion = '~4.5.0';
exports.ajvVersion = '^8.0.0';
exports.jitiVersion = '2.4.2';
