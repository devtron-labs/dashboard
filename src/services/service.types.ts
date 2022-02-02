import { VulnerabilityType } from '../components/common';

export interface ResponseType {
    code: number;
    status: string;
    result?: any;
    errors?: any;
}

export interface APIOptions {
    timeout?: number;
    signal?: AbortSignal;
    preventAutoLogout?: boolean;
}

export interface RootObject {
    code: number;
    status?: string;
    result: any;
}

export interface CDPipelines {
    pipelines: CDPipeline[];
}

type DeploymentStrategyType = 'CANARY' | 'ROLLING' | 'RECREATE' | 'BLUE_GREEN'

export interface DeploymentStrategy {
    deploymentTemplate: DeploymentStrategyType;
    config: any;
    default: boolean;
}

export interface PrePostStage {
    triggerType: 'AUTOMATIC' | 'MANUAL';
    name: string;
    config: string;
}

export interface CDPipeline {
    id: number;
    environmentId: number;
    environmentName: string;
    ciPipelineId: number;
    triggerType: string;
    name: string;
    strategies: DeploymentStrategy[];
    deploymentTemplate: string;
    preStage: PrePostStage;
    postStage: PrePostStage;
    preStageConfigMapSecretNames: { configMaps: string[], secrets: string[] };
    postStageConfigMapSecretNames: { configMaps: string[], secrets: string[] };
    runPreStageInEnv: boolean;
    runPostStageInEnv: boolean;
    isClusterCdActive: boolean;
}

export interface TeamList extends RootObject {
    result: Teams[];
}

export interface Teams {
    id: number;
    name: string;
    active: boolean;
}

export interface AppListMin extends ResponseType {
    result?: { id: number, name: string }[];
}

export interface ProjectFilteredApps extends ResponseType {
    result?: {
        projectId: number;
        projectName: string;
        appList: {
            id: number;
            name: string;
        }[]
    }[]
}

export interface AppEnvironment {
    environmentId: number;
    environmentName: string;
    appMetrics: boolean;
    infraMetrics: boolean;
    prod: boolean;
}

export interface AppOtherEnvironment extends ResponseType {
    result?: AppEnvironment[]
}

export interface LastExecutionResponseType {
    code: number;
    status: string;
    result: {
        scanExecutionId: number;
        lastExecution: string;
        appId?: number;
        appName?: string;
        envId?: number;
        envName?: string;
        pod?: string;
        replicaSet?: string;
        image?: string;
        objectType: 'app' | 'chart';
        scanned: boolean;
        scanEnabled: boolean;
        severityCount: {
            critical: number;
            moderate: number;
            low: number;
        },
        vulnerabilities: VulnerabilityType[]
    }
}

export interface LastExecutionMinResponseType {
    code: number;
    status: string;
    result: {
        lastExecution: string;
        imageScanDeployInfoId: number;
        severityCount: {
            critical: number;
            moderate: number;
            low: number;
        },
    }
}

export interface HostURLConfig {
    id: number,
    key: string;
    value: string,
    active: boolean,
}

export interface HostURLConfigResponse extends ResponseType {
    result?: HostURLConfig;
}

export interface ClusterEnvironmentDetailList extends ResponseType {
    result?: ClusterEnvironmentDetail[]
}

export interface ClusterEnvironmentDetail {
    id: number, //envId
    environment_name : string,
    active: boolean,
    cluster_id : number
    cluster_name : string,
    namespace : string
}

export interface EnvironmentListHelmResponse extends ResponseType{
    result?: EnvironmentListHelmResult[]
}

export interface EnvironmentListHelmResult {
    clusterId : number,
    clusterName : string,
    environments : EnvironmentHelmResult[]
}

export interface EnvironmentHelmResult {
    environmentId : number,
    environmentName: string,
    namespace: string,
    environmentIdentifier: string
}

export interface ClusterListResponse extends ResponseType {
    result?: Cluster[]
}

export interface Cluster {
    id: number,
    cluster_name : string,
    active: boolean
}