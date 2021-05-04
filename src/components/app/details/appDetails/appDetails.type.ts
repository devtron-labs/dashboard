

interface ResourceTree {
    nodes: Node[];
    newGenerationReplicaSet: string;
    status: string;
    podMetadata: PodMetadatum[];
    conditions?: any;
}

export interface PodMetadatum {
    name: string;
    uid: string;
    containers: string[];
    isNew: boolean;
}

export interface OtherEnvironment {
    environmentId: number;
    environmentName: string;
    appMetrics: boolean;
    infraMetrics: boolean;
    prod: boolean;
}

interface MaterialInfo {
    author: string;
    branch: string;
    message: string;
    modifiedTime: string;
    revision: string;
    url: string;
}
export interface AppDetails {
    appId: number;
    appName: string;
    environmentId: number;
    environmentName: string;
    namespace: string;
    lastDeployedTime: string;
    lastDeployedBy: string;
    materialInfo: MaterialInfo[];
    releaseVersion: string;
    dataSource: string;
    lastDeployedPipeline: string;
    instanceDetail?: any;
    otherEnvironment: OtherEnvironment[];
    resourceTree: ResourceTree;
}

export enum AppMetricsTab {
    Aggregate = 'aggregate',
    Pod = 'pod'
}

export enum ChartType {
    Cpu = 'cpu',
    Ram = 'ram',
    Status = 'status',
    Latency = 'latency'
}

export enum StatusType {
    status5xx = '5xx',
    status4xx = '4xx',
    status2xx = '2xx',
    Throughput = 'Throughput',
}

export enum CalendarFocusInput {
    StartDate = "startDate",
    EndDate = "endDate",
}

export type AppMetricsTabType = 'aggregate' | 'pod';
export type ChartTypes = 'cpu' | 'ram' | 'status' | 'latency';
export type StatusTypes = '5xx' | '4xx' | '2xx' | 'Throughput';
export type CalendarFocusInputType = 'startDate' | 'endDate';

export interface AppDetailsPathParams {
    appId: string;
    envId?: string;
}
export interface SecurityVulnerabilititesProps {
    imageScanDeployInfoId: number;
    severityCount: {
        critical: number;
        moderate: number;
        low: number;
    };
    onClick: () => void;
}