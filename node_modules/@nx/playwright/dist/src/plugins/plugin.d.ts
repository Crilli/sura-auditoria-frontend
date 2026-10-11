import { type CreateNodes } from '@nx/devkit';
export interface PlaywrightPluginOptions {
    targetName?: string;
    ciTargetName?: string;
}
export declare const createNodes: CreateNodes<PlaywrightPluginOptions>;
export declare const createNodesV2: CreateNodes<PlaywrightPluginOptions>;
