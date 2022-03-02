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
    downstreamNodeSize: number;
    getWorkflows: () => void;
    close: (showSuccessCD?: boolean, environmentId?: number) => void;
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
        parentPipelineId: number;
        parentPipelineType: string;
    };
    showDeleteModal: boolean;
    shouldDeleteApp: boolean;
    showForceDeleteDialog: boolean;
    showError: boolean;
    showPreStage: boolean;
    showDeploymentStage: boolean;
    showPostStage: boolean;
    isAdvanced: boolean;
    forceDeleteDialogMessage: string;
    forceDeleteDialogTitle: string;
}


export interface PipelineConfig{
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
        parentPipelineId: number;
        parentPipelineType: string;
    };


export interface BasicCDPipelineModalProps {
view: string;
pipelineConfig: PipelineConfig;
environments: Environment[];
selectEnvironment: (selection: Environment[]) => void;
handleNamespaceChange: (event: any, environment: any) => void
savePipeline: () => void;
loadingData: boolean;
showError: boolean;
close: () => void;
cdPipelineId: string;
strategies: DeploymentStrategy[]
selectStrategy :(selection: string) => void;

}

export interface AdvanceCDPipelineModalProps{
    close: ()=> void;
    pipelineConfig: PipelineConfig;
    environments: Environment[];
    selectEnvironment: (selection: Environment[]) => void;
    handleNamespaceChange: (event: any, environment: any) => void
    handlePipelineName:(event: any) => void
    handlePreBuild:() => void
    showPreBuild: boolean;
    showPreStage: boolean;
    showPostStage: boolean;
    showPostBuild: boolean;
    handleStageConfigChange: (value: string, stageType: 'preStage' | 'postStage', key: 'triggerType' | 'config' | 'switch') => void
    configMapAndSecrets: any[];
    handleConfigmapAndSecretsChange: (selection: any, stage: any)=> void;
    handleRunInEnvCheckbox: (event, key) => void
    handleDocker: () => void;
    showDocker: boolean;
    handlePostBuild: ()=> void;
    cdPipelineId: string;
    savePipeline: ()=> void;
    loadingData: boolean;
    strategies: DeploymentStrategy[]
    allStrategies: { [key: string]: any; }
    toggleStrategy: (selection: string)=> void;
    deleteStrategy:(selection: string)=> void;
    handleStrategyChange: (event: any, selection: string, key: "json" | "yaml")=> void;
    setDefaultStrategy :(selection: string) => void;
    selectStrategy :(selection: string) => void;
    deleteStage: (key: "preStage" | "postStage") => void
    renderAddStage: (key: "preStage" | "postStage") => void;
}
