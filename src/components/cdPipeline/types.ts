import { RouteComponentProps } from 'react-router';

export const CD_PATCH_ACTION = {
    DELETE: 1,
    UPDATE: 2,
}

export interface DeploymentStrategy {
    deploymentTemplate: string;
    config: any;
    default: boolean;
}

export interface SavedDeploymentStrategy {
    deploymentTemplate: string;
    config: any;
    default: boolean;
    isCollapsed?: boolean;
    defaultConfig?: any;
    yamlStr?: any;
    jsonStr?: any;
}

export interface CDPipelineProps extends RouteComponentProps<{ appId: string, ciPipelineId: string, cdPipelineId?: string, workflowId: string }> {
    appName: string;
    getWorkflows: () => void;
    close: () => void;
}

export interface CDStageType {
    name?: string;
    triggerType: string;
    config: string;
    status?: string;
    cdWorkflowId?: number;
    cdWorkflowRunnerId?: number;
}
export interface Environment {
    id: number;
    name: string;
    namespace: string;
    active: boolean;
    isClusterCdActive: boolean;

}
export interface CDPipelineState {
    environments: Environment[];
    view: string;
    code: number;
    loadingData: boolean;
    strategies: DeploymentStrategy[];
    pipelineConfig: {
        id: number;
        environmentId: number;
        ciPipelineId: number;
        triggerType: string;
        name: string;
        preStage: CDStageType & { switch: string };
        postStage: CDStageType & { switch: string };
        strategies: SavedDeploymentStrategy[];
        namespace: string;
        preStageConfigMapSecretNames: {
            configMaps: string[];
            secrets: string[];
        },
        postStageConfigMapSecretNames: {
            configMaps: string[];
            secrets: string[];
        },
        runPreStageInEnv: boolean;
        runPostStageInEnv: boolean;
        isClusterCdActive: boolean;
    };
    showPreStage: boolean;
    showPostStage: boolean;
    showDeleteModal: boolean;
    shouldDeleteApp: boolean;
    showError: boolean;
    showPreBuild: boolean;
    showDocker: boolean;
    showPostBuild: boolean;
}

