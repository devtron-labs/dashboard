export enum EnvType {
    CHART = 'CHART',
    APPLICATION = 'APPLICATION'
}

export interface EnvDetails {
    envType: EnvType,
    envId: number,
    appId: number
}


export enum AggregationKeys {
    Workloads = 'Workloads',
    Networking = 'Networking',
    ConfigAndStorage = 'Config & Storage',
    RBAC = 'RBAC',
    Administration = 'Administration',
    CustomResource = 'Custom Resource',
    Other = 'Other'
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
    Containers = 'Containers',// containers are being trated same way as nodes for nsted table generation
    InitContainers = 'InitContainers'
}

export type NodeType = keyof typeof Nodes;

export function getAggregator(nodeType: NodeType): AggregationKeys {
    switch (nodeType) {
        case Nodes.DaemonSet:
        case Nodes.Deployment:
        case Nodes.Pod:
        case Nodes.ReplicaSet:
        case Nodes.Job:
        case Nodes.CronJob:
        case Nodes.ReplicationController:
        case Nodes.StatefulSet:
            return AggregationKeys.Workloads;
        case Nodes.Ingress:
        case Nodes.Service:
        case Nodes.Endpoints:
            return AggregationKeys.Networking;
        case Nodes.ConfigMap:
        case Nodes.Secret:
        case Nodes.PersistentVolume:
        case Nodes.PersistentVolumeClaim:
            return AggregationKeys.ConfigAndStorage;
        case Nodes.ServiceAccount:
        case Nodes.ClusterRoleBinding:
        case Nodes.RoleBinding:
        case Nodes.ClusterRole:
        case Nodes.Role:
            return AggregationKeys.RBAC;
        case Nodes.MutatingWebhookConfiguration:
        case Nodes.PodSecurityPolicy:
        case Nodes.ValidatingWebhookConfiguration:
            return AggregationKeys.Administration;
        case Nodes.Alertmanager:
        case Nodes.Prometheus:
        case Nodes.ServiceMonitor:
            return AggregationKeys.CustomResource;
        default:
            return AggregationKeys.CustomResource;
    }
}

export interface AppDetails {
    appId: number
    appName: string
    appStoreAppName: string
    appStoreAppVersion: string
    appStoreChartId: number
    appStoreChartName: string
    appStoreInstalledAppVersionId: number
    ciArtifactId: number
    deprecated: false
    environmentId: number
    environmentName: string
    installedAppId: number
    instanceDetail: null
    k8sVersion: string
    lastDeployedBy: string
    lastDeployedTime: string
    namespace: string
    resourceTree: ResourceTree
}

export interface ResourceTree {
    conditions: any
    newGenerationReplicaSet: string
    nodes: Array<Node>
    podMetadata: any
    status: string
}

export interface Node {
    health: Health
    kind: NodeType
    name: string
    namespace: string
    networkingInfo: TargetLabels
    resourceVersion: string
    uid: string
    version: string,
    parentRefs: Array<Node>
}

export interface Health {
    status: string
}

export interface NetworkingInfo {
    targetLabels: TargetLabels
}

export interface TargetLabels {
    "app.kubernetes.io/instance": string
    "app.kubernetes.io/name": string
}