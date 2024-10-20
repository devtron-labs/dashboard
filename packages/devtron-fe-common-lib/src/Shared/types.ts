/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    OptionType,
    CommonNodeAttr,
    ResponseType,
    UserApprovalConfigType,
    VulnerabilityType,
    DeploymentAppTypes,
    ServerErrors,
    SortingParams,
} from '../Common'
import { KeyValueListType } from './Components'
import { EnvironmentTypeEnum, PatchOperationType } from './constants'

export enum EnvType {
    CHART = 'helm_charts',
    APPLICATION = 'apps',
}

export interface EnvDetails {
    envType: EnvType
    envId: number
    appId: number
}

interface OtherEnvironment {
    environmentId: number
    environmentName: string
    appMetrics: boolean
    infraMetrics: boolean
    prod: boolean
}

export interface PodMetaData {
    containers: Array<string>
    initContainers: any
    ephemeralContainers: any
    isNew: boolean
    name: string
    uid: string
}

export interface Info {
    value: string
    name: string
}

export interface Health {
    status: string
    message?: string
}

export interface TargetLabel {
    'app.kubernetes.io/instance': string
    'app.kubernetes.io/name': string
}
export interface TargetLabels {
    targetLabel: TargetLabel
}
export interface NetworkingInfo {
    targetLabels: TargetLabels
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
    Containers = 'Containers', // containers are being treated same way as nodes for nested table generation
    InitContainers = 'InitContainers',
    EndpointSlice = 'EndpointSlice',
    NetworkPolicy = 'NetworkPolicy',
    StorageClass = 'StorageClass',
    VolumeSnapshot = 'VolumeSnapshot',
    VolumeSnapshotContent = 'VolumeSnapshotContent',
    VolumeSnapshotClass = 'VolumeSnapshotClass',
    PodDisruptionBudget = 'PodDisruptionBudget',
    Event = 'Event',
    Namespace = 'Namespace',
    Overview = 'Overview',
}

// FIXME: This should be `typeof Nodes[keyof typeof Nodes]` instead since the key and values are not the same. Same to be removed from duplications in dashboard
export type NodeType = keyof typeof Nodes

export interface Node {
    createdAt: Date
    health: Health
    kind: NodeType
    name: string
    namespace: string
    networkingInfo: NetworkingInfo
    resourceVersion: string
    uid: string
    version: string
    parentRefs: Array<Node>
    group: string
    isSelected: boolean
    info: Info[]
    port: number
    canBeHibernated: boolean
    isHibernated: boolean
}

// eslint-disable-next-line no-use-before-define
export interface iNodes extends Array<iNode> {}

export interface iNode extends Node {
    childNodes: iNodes
    type: NodeType
    status: string
}
export interface ResourceTree {
    conditions: any
    newGenerationReplicaSet: string
    nodes: Array<Node>
    podMetadata: Array<PodMetaData>
    status: string
    resourcesSyncResult?: Record<string, string>
}

export enum AppType {
    DEVTRON_APP = 'devtron_app',
    DEVTRON_HELM_CHART = 'devtron_helm_chart',
    EXTERNAL_HELM_CHART = 'external_helm_chart',
    EXTERNAL_ARGO_APP = 'external_argo_app',
    EXTERNAL_FLUX_APP = 'external_flux_app',
}

export interface HelmReleaseStatus {
    status: string
    message: string
    description: string
}

interface MaterialInfo {
    author: string
    branch: string
    message: string
    modifiedTime: string
    revision: string
    url: string
    webhookData: string
}
export interface FluxAppStatusDetail {
    status: string
    message: string
    reason: string
}
export interface AppDetails {
    appId?: number
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
    materialInfo?: MaterialInfo[]
    releaseVersion?: string
    dataSource?: string
    lastDeployedPipeline?: string
    otherEnvironment?: OtherEnvironment[]
    projectName?: string
    appType?: AppType
    helmReleaseStatus?: HelmReleaseStatus
    clusterId?: number
    notes?: string
    deploymentAppType?: DeploymentAppTypes
    ipsAccessProvided?: boolean
    externalCi?: boolean
    clusterName?: string
    dockerRegistryId?: string
    deploymentAppDeleteRequest?: boolean
    userApprovalConfig?: string
    isVirtualEnvironment?: boolean
    imageTag?: string
    helmPackageName?: string
    appStatus?: string
    chartAvatar?: string
    fluxTemplateType?: string
    FluxAppStatusDetail?: FluxAppStatusDetail
}

export enum RegistryType {
    GIT = 'git',
    GITHUB = 'github',
    GITLAB = 'gitlab',
    BITBUCKET = 'bitbucket',
    DOCKER = 'docker',
    DOCKER_HUB = 'docker-hub',
    ACR = 'acr',
    QUAY = 'quay',
    ECR = 'ecr',
    ARTIFACT_REGISTRY = 'artifact-registry',
    GCR = 'gcr',
    OTHER = 'other',
}

export enum DefaultUserKey {
    system = 'system',
    admin = 'admin',
}

export enum Severity {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
    UNKNOWN = 'unknown',
}

export enum ImagePromotionTabs {
    REQUEST = 'request',
    PENDING = 'pending',
}

export interface ArtifactPromotionMetadata {
    isConfigured: boolean
    isApprovalPendingForPromotion: boolean
}

export interface Material {
    gitMaterialId: number
    materialName: string
}

export interface WorkflowType {
    id: string
    name: string
    gitMaterials?: Material[]
    ciConfiguredGitMaterialId?: number
    startX: number
    startY: number
    width: number
    height: number
    nodes: CommonNodeAttr[]
    dag: any
    showTippy?: boolean
    appId?: number
    isSelected?: boolean
    approvalConfiguredIdsMap?: Record<number, UserApprovalConfigType>
    imageReleaseTags: string[]
    appReleaseTags?: string[]
    tagsEditable?: boolean
    hideImageTaggingHardDelete?: boolean
    artifactPromotionMetadata?: ArtifactPromotionMetadata
}

export enum ModuleStatus {
    HEALTHY = 'healthy',
    NONE = 'none',
    UNKNOWN = 'unknown',
    UPGRADING = 'upgrading',
    UPGRADE_FAILED = 'upgradeFailed',
    // Module Status
    INSTALLED = 'installed',
    INSTALLING = 'installing',
    INSTALL_FAILED = 'installFailed',
    NOT_INSTALLED = 'notInstalled',
    TIMEOUT = 'timeout',
}

export interface WebHookData {
    Id: number
    EventActionType: string
    Data: any
}

export interface GitTriggers {
    Commit: string
    Author: string
    Date: Date | string
    Message: string
    Changes: string[]
    WebhookData: WebHookData
    GitRepoUrl: string
    GitRepoName: string
    CiConfigureSourceType: string
    CiConfigureSourceValue: string
}

export interface RuntimeParamsAPIResponseType {
    envVariables: Record<string, string>
}

export interface RuntimeParamsTriggerPayloadType {
    runtimeParams: RuntimeParamsAPIResponseType
}

export enum CIMaterialSidebarType {
    CODE_SOURCE = 'Code Source',
    PARAMETERS = 'Parameters',
}

export enum CDMaterialSidebarType {
    IMAGE = 'Image',
    PARAMETERS = 'Parameters',
}

/**
 * @example Usage with specific enum for path & `unknown` type for value
 * ```ts
 * enum PatchKeys {
 *  name = 'name',
 *  description = 'description',
 * }
 *
 * const query: PatchQueryType<PatchKeys> = {
 *  op: PatchOperationType.replace,
 *  path: PatchKeys.name,
 *  value: '1'
 * }
 * ```
 *
 * @example Usage with specific enum for path & custom type for value
 * ```ts
 * enum PatchKeys {
 *  name = 'name',
 *  description = 'description',
 * }
 *
 * const query: PatchQueryType<PatchKeys, number> = {
 *  op: PatchOperationType.replace,
 *  path: PatchKeys.name,
 *  value: 1
 * }
 * ```
 *
 * @example Usage with `PatchOperationType.remove`
 * Note: Value is not allowed for remove operation
 *
 * ```ts
 * const query: PatchQueryType<string> = {
 *  op: PatchOperationType.remove,
 *  path: 'name'
 * }
 * ```
 */
export type PatchQueryType<T extends string, K = unknown> = {
    /**
     * The path of the json to be patched
     */
    path: T
} & (
    | {
          /**
           * Operation type for patch
           */
          op: PatchOperationType.replace
          /**
           * Corresponding value for the operation
           */
          value: K
      }
    | {
          /**
           * Operation type for patch
           */
          op: PatchOperationType.remove
          value?: never
      }
    | {
          /**
           * Operation type for add
           */
          op: PatchOperationType.add
          value?: K
      }
)

export interface GroupedOptionsType {
    label: string
    options: OptionType[]
}

/**
 * Enum for devtron resources
 */
export enum ResourceKindType {
    devtronApplication = 'application/devtron-application',
    helmChart = 'application/helm-application',
    job = 'job',
    cluster = 'cluster',
    release = 'release',
    releaseTrack = 'release-track',
    releaseChannel = 'release-channel',
    tenant = 'tenant',
    installation = 'installation',
    environment = 'environment',
    cdPipeline = 'cd-pipeline',
    project = 'project',
}

/**
 * Versions support for the resources on BE
 *
 * TODO: Rename to ApiVersionType
 */
export enum ResourceVersionType {
    v1 = 'v1',
    alpha1 = 'alpha1',
}

export interface SeverityCount {
    critical: number
    high: number
    medium: number
    low: number
    unknown: number
}
export enum PolicyKindType {
    lockConfiguration = 'lock-configuration',
}

export interface LastExecutionResultType {
    lastExecution: string
    severityCount: SeverityCount
    vulnerabilities: VulnerabilityType[]
    scanExecutionId?: number
    appId?: number
    appName?: string
    envId?: number
    envName?: string
    pod?: string
    replicaSet?: string
    image?: string
    objectType?: 'app' | 'chart'
    scanned?: boolean
    scanEnabled?: boolean
    scanToolId?: number
    imageScanDeployInfoId?: number
}

export interface LastExecutionResponseType extends ResponseType<LastExecutionResultType> {}

export interface MaterialSecurityInfoType {
    isScanned: boolean
    isScanEnabled: boolean
}

export enum WebhookEventNameType {
    PULL_REQUEST = 'Pull Request',
    TAG_CREATION = 'Tag Creation',
}

export type IntersectionOptions = {
    root?: React.RefObject<Element>
    rootMargin?: string
    threshold?: number | number[]
    once?: boolean
    defaultIntersecting?: boolean
}

export type IntersectionChangeHandler = (entry: IntersectionObserverEntry) => void
// FIXME: This should be `typeof Nodes[keyof typeof Nodes]` instead since the key and values are not the same. Same to be removed from duplications in dashboard

export interface InputFieldState<T = string> {
    value: T
    error: string
}

export enum AggregationKeys {
    Workloads = 'Workloads',
    Networking = 'Networking',
    'Config & Storage' = 'Config & Storage',
    RBAC = 'RBAC',
    Administration = 'Administration',
    'Custom Resource' = 'Custom Resource',
    'Other Resources' = 'Other Resources',
    Events = 'Events',
    Namespaces = 'Namespaces',
}

export type AggregationKeysType = keyof typeof AggregationKeys

export enum GitOpsAuthModeType {
    SSH = 'SSH',
    PASSWORD = 'PASSWORD',
    SSH_AND_PASSWORD = 'PAT_AND_SSH',
}

export interface BaseGitOpsType {
    authMode: GitOpsAuthModeType
    sshKey: string
    sshHost: string
    username: string
    token: string
}

export type GitOpsFieldKeyType =
    | 'host'
    | 'username'
    | 'token'
    | 'gitHubOrgId'
    | 'azureProjectName'
    | 'gitLabGroupId'
    | 'bitBucketWorkspaceId'
    | 'bitBucketProjectKey'
    | 'sshHost'
    | 'sshKey'

export interface AppInfoListType {
    application: string
    appStatus: string
    deploymentStatus: string
    lastDeployed: string
    lastDeployedImage?: string
    lastDeployedBy?: string
    appId: number
    envId: number
    pipelineId?: number
    commits?: string[]
    ciArtifactId?: number
}

export interface EnvListMinDTO {
    id: number
    active: boolean
    allowedDeploymentTypes: DeploymentAppTypes[] | null
    appCount: number
    cluster_id: number
    cluster_name: string
    default: boolean
    description: string
    environmentIdentifier: string
    environment_name: string
    isClusterCdActive: boolean
    isDigestEnforcedForEnv: boolean
    isVirtualEnvironment: boolean
    namespace: string
}

export interface EnvironmentType {
    /**
     * Unique identifier for the environment
     */
    id: number
    /**
     * Name of the environment
     */
    name: string
    /**
     * Associated namespace for the environment
     */
    namespace: string
    /**
     * Type of the environment
     */
    environmentType: EnvironmentTypeEnum
    /**
     * Associated cluster for the environment
     */
    cluster: string
    /**
     * If true, denotes virtual environment
     */
    isVirtual: boolean
}

export interface CreatedByDTO {
    icon: boolean
    id: number
    name: string
}

export enum DependencyType {
    UPSTREAM = 'upstream',
    DOWNSTREAM = 'downstream',
    LEVEL = 'level',
}

export enum PromiseAllStatusType {
    FULFILLED = 'fulfilled',
    REJECTED = 'rejected',
}

export type ApiQueuingWithBatchResponseItem<T> =
    | {
          status: PromiseAllStatusType.FULFILLED
          value: T
      }
    | {
          status: PromiseAllStatusType.REJECTED
          reason: ServerErrors
      }

export interface BatchConfigType {
    lastIndex: number
    results: any[]
    concurrentCount: number
    completedCalls: number
}
export interface scrollableInterface {
    autoBottomScroll: boolean
}

export enum URLProtocolType {
    HTTP = 'http:',
    HTTPS = 'https:',
    SSH = 'ssh:',
    SMTP = 'smtp:',
    S3 = 's3:',
}

export type BaseFilterQueryParams<T> = {
    /**
     * Offset for the list result
     */
    offset?: number
    /**
     * Number of items required in the list
     */
    size?: number
    /**
     * Search string (if any)
     */
    searchKey?: string
    /**
     * If true, all items are returned with any search / filtering applied without pagination
     */
    showAll?: boolean
} & SortingParams<T>

export type DataAttributes = Record<`data-${string}`, unknown>

export interface RuntimeParamsListItemType extends KeyValueListType {
    id: number
}

export enum RuntimeParamsHeadingType {
    KEY = 'key',
    VALUE = 'value',
}
