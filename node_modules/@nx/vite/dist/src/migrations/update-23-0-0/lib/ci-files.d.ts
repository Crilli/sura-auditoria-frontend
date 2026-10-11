import { type Tree } from '@nx/devkit';
export declare function isCiFile(filePath: string): boolean;
export declare function visitCiFiles(tree: Tree, callback: (filePath: string, contents: string) => void): void;
