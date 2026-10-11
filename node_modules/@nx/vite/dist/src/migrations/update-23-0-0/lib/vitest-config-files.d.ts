import { type Tree } from '@nx/devkit';
export declare function isVitestConfigFile(filePath: string): boolean;
export declare function isVitestWorkspaceFile(filePath: string): boolean;
export declare function visitVitestConfigFiles(tree: Tree, callback: (filePath: string) => void): void;
export declare function isJsOrTsFile(filePath: string): boolean;
