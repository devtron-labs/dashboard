import { iLink } from '../utils/tabUtils/link.type';

export interface ApplicationObject extends iLink {
    selectedNode: string;
    title: string;
}

export enum APIEnvType {
    CHART = 'chart',
    APPLICATION = 'apps',
}

export enum EnvType {
    CHART = 'helm_charts',
    APPLICATION = 'apps',
}

export enum AppType {
    DEVTRON_APP = 'devtron_app',
    DEVTRON_HELM_CHART = 'devtron_helm_chart',
    EXTERNAL_HELM_CHART = 'external_helm_chart'
}

export interface EnvDetails {
    envType: EnvType;
    envId: number;
    appId: number;
}

export enum AggregationKeys {
    Workloads = 'Workloads',
    Networking = 'Networking',
    ConfigAndStorage = 'Config & Storage',
    RBAC = 'RBAC',
    Administration = 'Administration',
    CustomResource = 'Custom Resource',
    Other = 'Other',
}

export enum NodeStatus {
    Degraded = 'degraded',
    Healthy = 'healthy',
    Progressing = 'progressing',
    Missing = 'missing'
}

export enum NodeType {
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
    Containers = 'Containers', // containers are being treated same way as nodes for nested table generation
    InitContainers = 'InitContainers',
}

// export type NodeType = keyof typeof NodeType;

export function getAggregator(nodeType: NodeType): AggregationKeys {
    switch (nodeType.toLowerCase()) {
        case NodeType.DaemonSet.toLowerCase():
        case NodeType.Deployment.toLowerCase():
        case NodeType.Pod.toLowerCase():
        case NodeType.ReplicaSet.toLowerCase():
        case NodeType.Job.toLowerCase():
        case NodeType.CronJob.toLowerCase():
        case NodeType.ReplicationController.toLowerCase():
        case NodeType.StatefulSet.toLowerCase():
            return AggregationKeys.Workloads;
        case NodeType.Ingress.toLowerCase():
        case NodeType.Service.toLowerCase():
        case NodeType.Endpoints.toLowerCase():
            return AggregationKeys.Networking;
        case NodeType.ConfigMap.toLowerCase():
        case NodeType.Secret.toLowerCase():
        case NodeType.PersistentVolume.toLowerCase():
        case NodeType.PersistentVolumeClaim.toLowerCase():
            return AggregationKeys.ConfigAndStorage;
        case NodeType.ServiceAccount.toLowerCase():
        case NodeType.ClusterRoleBinding.toLowerCase():
        case NodeType.RoleBinding.toLowerCase():
        case NodeType.ClusterRole.toLowerCase():
        case NodeType.Role.toLowerCase():
            return AggregationKeys.RBAC;
        case NodeType.MutatingWebhookConfiguration.toLowerCase():
        case NodeType.PodSecurityPolicy.toLowerCase():
        case NodeType.ValidatingWebhookConfiguration.toLowerCase():
            return AggregationKeys.Administration;
        case NodeType.Alertmanager.toLowerCase():
        case NodeType.Prometheus.toLowerCase():
        case NodeType.ServiceMonitor.toLowerCase():
            return AggregationKeys.CustomResource;
        default:
            return AggregationKeys.CustomResource;
    }
}

export enum DeploymentAppType {
    helm = 'helm',
    argo_cd = 'argo_cd',
}

export interface AppDetails {
    appId: number
    appName: string
    appStoreAppName?: string
    appStoreAppVersion?: string
    appStoreChartId?: number
    appStoreChartName?: string
    appStoreInstalledAppVersionId?: number
    ciArtifactId?: number
    deprecated?: false
    environmentId?: number
    environmentName: string
    installedAppId?: number
    instanceDetail?: null
    k8sVersion?: string
    lastDeployedBy?: string
    lastDeployedTime: string
    namespace: string
    resourceTree: ResourceTree
    materialInfo?: MaterialInfo[];
    releaseVersion?: string;
    dataSource?: string;
    lastDeployedPipeline?: string;
    otherEnvironment?: OtherEnvironment[];
    projectName?: string;
    appType?: AppType;
    additionalData?: any;
    clusterId?: number;
    notes?: string;
    deploymentAppType?: DeploymentAppType
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

interface OtherEnvironment {
    environmentId: number;
    environmentName: string;
    appMetrics: boolean;
    infraMetrics: boolean;
    prod: boolean;
}

export interface ResourceTree {
    conditions: any;
    newGenerationReplicaSet: string;
    nodes: Array<Node>;
    podMetadata: Array<PodMetaData>;
    status: string;
}

export interface PodMetaData {
    containers: Array<string>;
    initContainers: any;
    isNew: boolean;
    name: string;
    uid: string;
}

export interface Info {
    value: string;
    name: string;
}
export interface Node {
    //createdAt: Date;
    health: Health;
    kind: NodeType;
    name: string;
    namespace: string;
    networkingInfo: NetworkingInfo;
    resourceVersion: string;
    uid: string;
    version: string;
    parentRefs: Array<Node>;
    group: string;
    isSelected: boolean
    info: Info[]
    canBeHibernated: boolean
    isHibernated: boolean
}

export interface Health {
    status: string;
}

export interface NetworkingInfo {
    targetLabels: TargetLabels;
}

export interface TargetLabels {
    targetLabel: TargetLabel;
}

export interface TargetLabel {
    'app.kubernetes.io/instance': string;
    'app.kubernetes.io/name': string;
}

export interface iNodes extends Array<iNode> {}

export interface iNode extends Node {
    childNodes: iNodes;
    type: NodeType;
    status: string;
}

export interface AppStreamData {
    result: {
        type: string;
        application: Application;
    };
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

export interface LogSearchTermType {
    logSearchTerms: Record<string, string>;
    setLogSearchTerms: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export interface AppStatusDetailType {
    close: () => void
    appStreamData: any
    showAppStatusMessage?: boolean
}

export interface StatusFilterButtonType {
  nodes: Array<Node>
  handleFilterClick?: (selectedFilter: string) => void
}