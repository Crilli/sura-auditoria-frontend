import { type Tree } from '@nx/devkit';
export declare function getViteE2EWebServerInfo(tree: Tree, projectName: string, configFilePath: string, isPluginBeingAdded: boolean, e2ePortOverride?: number, e2eCIPortOverride?: number): Promise<import("@nx/devkit/internal").E2EWebServerDetails>;
export declare function getReactRouterE2EWebServerInfo(tree: Tree, projectName: string, configFilePath: string, isPluginBeingAdded: boolean, e2ePortOverride?: number, e2eCIPortOverride?: number): Promise<import("@nx/devkit/internal").E2EWebServerDetails>;
