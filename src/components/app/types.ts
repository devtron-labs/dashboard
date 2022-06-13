import { RouteComponentProps } from 'react-router';
import { DeploymentAppType } from '../v2/appDetails/appDetails.type';

export interface AddNewAppProps extends RouteComponentProps<{}> {
    close: () => void;
}

export interface OptionType {
    label: string;
    value: string;
}

export interface LabelTags {
    tags: OptionType[];
    inputTagValue: string;
    tagError: string;
}

export interface AddNewAppState {
    view: string;
    code: number;
    disableForm: boolean;
    projects: { id: number; name: string }[];
    showErrors: boolean;
    form: {
        appName: string;
        appId: number;
        projectId: number;
        cloneId: number;
        appCreationType: string;
    };
    labels: LabelTags;
    isValid: {
        projectId: boolean;
        appName: boolean;
        cloneAppId: boolean;
    };
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
    projectName?: string;
    clusterId?: number;
    deploymentAppType?: DeploymentAppType
}

export interface LabelTag {
    key: string;
    value: string;
}
export interface AppMetaInfo {
    appId: number;
    appName: string;
    createdBy: string;
    createdOn: string;
    projectId?: number;
    projectName?: string;
    labels?: LabelTag[];
}

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

interface Node {
    version: string;
    kind: string;
    namespace: string;
    name: string;
    uid: string;
    status?: string;
    networkingInfo?: NetworkingInfo;
    resourceVersion: string;
    health?: {
        status: string;
        message?: string;
    };
    parentRefs?: {
        kind: string;
        namespace: string;
        name: string;
        uid: string;
        group?: string;
    }[];
    group?: string;
    info?: {
        name: string;
        value: string;
    }[];
    images?: string[];
    url?: string;
}

export interface Pod extends Node {
    containers: any[];
    ready?: number;
}

interface NetworkingInfo {
    targetLabels?: {
        app: string;
    };
    targetRefs?: {
        kind: string;
        namespace: string;
        name: string;
    }[];
    ingress?: {
        ip: string;
    }[];
    externalURLs?: string[];
    labels?: {
        app: string;
        appId: string;
        envId: string;
        release: string;
        'rollouts-pod-template-hash': string;
    };
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
    webhookData: string;
}

interface Source {
    repoURL: string;
    path: string;
    targetRevision: string;
    helm: {
        valueFiles?: string[];
        status?: string;
    };
    chart?: any;
}

interface Health {
    status: string;
    message?: string;
}

interface Resource {
    group: string;
    version: string;
    kind: string;
    namespace: string;
    name: string;
    status: string;
    message: string;
    hookPhase: string;
    syncPhase: string;
    health?: Health;
}

interface Destination {
    server: string;
    namespace: string;
}

interface Sync {
    status?: string;
    comparedTo?: {
        source: Source;
        destination: Destination;
    };
    revision: string;
}

export interface Application {
    metadata: {
        name: string;
        namespace: string;
        selfLink: string;
        uid: string;
        resourceVersion: string;
        generation: number;
        creationTimestamp: Date;
        deletionTimestamp?: string;
    };
    spec: {
        source: Source;
        destination: Destination;
        project: string;
        syncPolicy: {
            automated: {
                prune: boolean;
            };
        };
    };
    status: {
        resources: Resource[];
        sync: Sync;
        health: Health;
        history: {
            revision: string;
            deployedAt: Date;
            id: number;
            source: Source;
        }[];
        reconciledAt: Date;
        operationState: {
            operation: {
                sync: Sync;
            };
            phase: string;
            message: string;
            syncResult: {
                resources: Resource[];
                revision: string;
                source: Source;
            };
            startedAt: Date;
            finishedAt: Date;
        };
        observedAt: Date;
        sourceType: string;
        summary: {
            externalURLs: string[];
            images: string[];
        };
        conditions?: {
            type: string;
            message: string;
            lastTransitionTime?: string;
        }[];
    };
    operation?: any;
}

export interface AppStreamData {
    result: {
        type: string;
        application: Application;
    };
}

export interface GenericNode<T> {
    group?: string;
    version: string;
    kind: T;
    name: string;
    appName?: string;
    namespace?: string;
}

export enum Nodes {
    Service = 'Service',
    Alertmanager = 'Alertmanager',
    PodSecurity = 'PodSecurityPolicy',
    ConfigMap = 'ConfigMap',
    ServiceAccount = 'ServiceAccount',
    ClusterRoleBinding = 'ClusterRoleBinding',
    RoleBinding = 'RoleBinding',
    ClusterRole = 'ClusterRole',
    Role = 'Role',
    Prometheus = 'Prometheus',
    ServiceMonitor = 'ServiceMonitor',
    Deployment = 'Deployment',
    MutatingWebhookConfiguration = 'MutatingWebhookConfiguration',
    DaemonSet = 'DaemonSet',
    Secret = 'Secret',
    ValidatingWebhookConfiguration = 'ValidatingWebhookConfiguration',
    Pod = 'Pod',
    Ingress = 'Ingress',
    ReplicaSet = 'ReplicaSet',
    Endpoints = 'Endpoints',
    Cluster = 'ClusterRoleBinding',
    PodSecurityPolicy = 'PodSecurityPolicy',
    CronJob = 'CronJob',
    Job = 'Job',
    ReplicationController = 'ReplicationController',
    StatefulSet = 'StatefulSet',
    Rollout = 'Rollout',
    PersistentVolumeClaim = 'PersistentVolumeClaim',
    PersistentVolume = 'PersistentVolume',
    Containers = 'Containers', // containers are being trated same way as nodes for nsted table generation
    InitContainers = 'InitContainers',
}
export type NodeType = keyof typeof Nodes;

export enum AggregationKeys {
    Workloads = 'Workloads',
    Networking = 'Networking',
    'Config & Storage' = 'Config & Storage',
    RBAC = 'RBAC',
    Administration = 'Administration',
    'Custom Resource' = 'Custom Resource',
    Other = 'Other',
}
export type AggregationKeysType = keyof typeof AggregationKeys;

type Aggregation = {
    [key in AggregationKeys]: NodesMap;
};

type NodesMap = {
    [key in NodeType]?: Map<string, any>;
};

export interface AggregatedNodes {
    nodes: NodesMap;
    aggregation: Aggregation;
    statusCount: {
        [status: string]: number;
    };
    nodeStatusCount: {
        [node in NodeType]?: {
            [status: string]: number;
        };
    };
    aggregatorStatusCount: {
        [aggregator in AggregationKeys]?: {
            [status: string]: number;
        };
    };
}

export enum NodeDetailTabs {
    EVENTS = 'EVENTS',
    LOGS = 'LOGS',
    MANIFEST = 'MANIFEST',
    DESCRIBE = 'DESCRIBE',
    TERMINAL = 'TERMINAL',
}
export type NodeDetailTabsType = keyof typeof NodeDetailTabs;
