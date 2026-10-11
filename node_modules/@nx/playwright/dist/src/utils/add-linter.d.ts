import { GeneratorCallback, Tree } from '@nx/devkit';
import { Linter, LinterType } from '@nx/eslint';
export interface PlaywrightLinterOptions {
    project: string;
    linter: Linter | LinterType;
    enableTypedLinting?: boolean;
    /**
     * @deprecated Use `enableTypedLinting` instead. This option will be removed in Nx v24.
     */
    setParserOptionsProject?: boolean;
    skipPackageJson: boolean;
    rootProject: boolean;
    js?: boolean;
    /**
     * Directory from the project root, where the playwright files will be located.
     **/
    directory: string;
    addPlugin?: boolean;
}
export declare function addLinterToPlaywrightProject(tree: Tree, options: PlaywrightLinterOptions): Promise<GeneratorCallback>;
