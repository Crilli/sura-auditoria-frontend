import { type TargetConfiguration, type Tree } from '@nx/devkit';
import { AggregatedLog } from '@nx/devkit/internal';
export declare function previewPostTargetTransformer(migrationLogs: AggregatedLog): (target: TargetConfiguration, tree: Tree, projectDetails: {
    projectName: string;
    root: string;
}, inferredTargetConfiguration: TargetConfiguration) => TargetConfiguration<any>;
