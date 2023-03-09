import { RouteComponentProps } from 'react-router'
import { KEY_VALUE } from '../../config'
import { Teams } from '../../services/service.types'
import { DeploymentAppType } from '../v2/appDetails/appDetails.type'

export interface AddNewAppProps extends RouteComponentProps<{}> {
    close: (e) => void
    isJobCreateView?: boolean
}

export interface OptionType {
    label: string
    value: string
}

export interface NumberOptionType {
    label: string
    value: number
}

export interface LabelTags {
    tags: OptionType[]
    inputTagValue: string
    tagError: string
}

export interface TagType {
    key: string
    value?: string
    description?: string
    propagate: boolean
    isInvalidKey?: boolean
    isInvalidValue?: boolean
}

export interface TagErrorType {
    isValid: boolean
    messages: string[]
}
export interface TagLabelSelectType {
    isCreateApp?: boolean
    labelTags: TagType[]
    setLabelTags: (tagList: TagType[]) => void
    tabIndex?: number
}

export interface TagDetailType {
    index: number
    tagData: TagType
    setTagData: (index: number, tagData: TagType) => void
    removeTag: (index: number) => void
    tabIndex?: number
}

export interface TagLabelValueSelectorType {
    selectedTagIndex: number
    tagData: TagType
    setTagData: (index: number, tagData: TagType) => void
    tagOptions?: OptionType[]
    isRequired?: boolean
    tagInputType?: KEY_VALUE
    placeholder?: string
    tabIndex?: number
    refVar?: React.MutableRefObject<any>
    dependentRef?: React.MutableRefObject<any>
}

export interface AddNewAppState {
    view: string
    code: number
    disableForm: boolean
    projects: { id: number; name: string }[]
    appNameErrors: boolean
    showErrors: boolean
    form: {
        appName: string
        description: string
        appId: number
        projectId: number
        cloneId: number
        appCreationType: string
    }
    tags: TagType[]
    isValid: {
        projectId: boolean
        appName: boolean
        cloneAppId: boolean
    }
}

export interface AppDetails {
    appId: number
    appName: string
    environmentId: number
    environmentName: string
    namespace: string
    lastDeployedTime: string
    lastDeployedBy: string
    materialInfo: MaterialInfo[]
    releaseVersion: string
    dataSource: string
    lastDeployedPipeline: string
    instanceDetail?: any
    otherEnvironment: OtherEnvironment[]
    resourceTree: ResourceTree
    projectName?: string
    clusterId?: number
    deploymentAppType?: DeploymentAppType
    deploymentAppDeleteRequest: boolean
}

export interface LabelTag {
    key: string
    value: string
}
export interface AppMetaInfo {
    appId: number
    appName: string
    createdBy: string
    description: string
    createdOn: string
    projectId?: number
    projectName?: string
    labels?: TagType[]
}

interface ResourceTree {
    nodes: Node[]
    newGenerationReplicaSet: string
    status: string
    podMetadata: PodMetadatum[]
    conditions?: any
}

export interface PodMetadatum {
    name: string
    uid: string
    containers: string[]
    isNew: boolean
}

interface Node {
    version: string
    kind: string
    namespace: string
    name: string
    uid: string
    status?: string
    networkingInfo?: NetworkingInfo
    resourceVersion: string
    health?: {
        status: string
        message?: string
    }
    parentRefs?: {
        kind: string
        namespace: string
        name: string
        uid: string
        group?: string
    }[]
    group?: string
    info?: {
        name: string
        value: string
    }[]
    images?: string[]
    url?: string
}

export interface Pod extends Node {
    containers: any[]
    ready?: number
}

interface NetworkingInfo {
    targetLabels?: {
        app: string
    }
    targetRefs?: {
        kind: string
        namespace: string
        name: string
    }[]
    ingress?: {
        ip: string
    }[]
    externalURLs?: string[]
    labels?: {
        app: string
        appId: string
        envId: string
        release: string
        'rollouts-pod-template-hash': string
    }
}

export interface OtherEnvironment {
    environmentId: number
    environmentName: string
    appMetrics: boolean
    infraMetrics: boolean
    prod: boolean
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

interface Source {
    repoURL: string
    path: string
    targetRevision: string
    helm: {
        valueFiles?: string[]
        status?: string
    }
    chart?: any
}

interface Health {
    status: string
    message?: string
}

export interface Resource {
    group: string
    version: string
    kind: string
    namespace: string
    name: string
    status: string
    message: string
    hookPhase: string
    syncPhase: string
    health?: Health
}

interface Destination {
    server: string
    namespace: string
}

interface Sync {
    status?: string
    comparedTo?: {
        source: Source
        destination: Destination
    }
    revision: string
}

export interface Application {
    metadata: {
        name: string
        namespace: string
        selfLink: string
        uid: string
        resourceVersion: string
        generation: number
        creationTimestamp: Date
        deletionTimestamp?: string
    }
    spec: {
        source: Source
        destination: Destination
        project: string
        syncPolicy: {
            automated: {
                prune: boolean
            }
        }
    }
    status: {
        resources: Resource[]
        sync: Sync
        health: Health
        history: {
            revision: string
            deployedAt: Date
            id: number
            source: Source
        }[]
        reconciledAt: Date
        operationState: {
            operation: {
                sync: Sync
            }
            phase: string
            message: string
            syncResult: {
                resources: Resource[]
                revision: string
                source: Source
            }
            startedAt: Date
            finishedAt: Date
        }
        observedAt: Date
        sourceType: string
        summary: {
            externalURLs: string[]
            images: string[]
        }
        conditions?: {
            type: string
            message: string
            lastTransitionTime?: string
        }[]
    }
    operation?: any
}

export interface AppStreamData {
    result: {
        type: string
        application: Application
    }
}

export interface GenericNode<T> {
    group?: string
    version: string
    kind: T
    name: string
    appName?: string
    namespace?: string
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
}
export type NodeType = keyof typeof Nodes

export enum AggregationKeys {
    Workloads = 'Workloads',
    Networking = 'Networking',
    'Config & Storage' = 'Config & Storage',
    RBAC = 'RBAC',
    Administration = 'Administration',
    'Custom Resource' = 'Custom Resource',
    'Other Resources' = 'Other Resources',
    Events = 'Events',
}
export type AggregationKeysType = keyof typeof AggregationKeys

type Aggregation = {
    [key in AggregationKeys]: NodesMap
}

type NodesMap = {
    [key in NodeType]?: Map<string, any>
}

export interface AggregatedNodes {
    nodes: NodesMap
    aggregation: Aggregation
    statusCount: {
        [status: string]: number
    }
    nodeStatusCount: {
        [node in NodeType]?: {
            [status: string]: number
        }
    }
    aggregatorStatusCount: {
        [aggregator in AggregationKeys]?: {
            [status: string]: number
        }
    }
}

export enum NodeDetailTabs {
    EVENTS = 'EVENTS',
    LOGS = 'LOGS',
    MANIFEST = 'MANIFEST',
    DESCRIBE = 'DESCRIBE',
    TERMINAL = 'TERMINAL',
}
export type NodeDetailTabsType = keyof typeof NodeDetailTabs

export enum SortingOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export interface CreateAppLabelsRequest {
    id: number
    labels?: TagType[]
    teamId?: number
}

export interface LabelTagsType {
    tags: OptionType[]
    inputTagValue: string
    tagError: string
}

export interface AppOverviewProps {
    appMetaInfo: AppMetaInfo
    getAppMetaInfoRes: () => Promise<AppMetaInfo>
    isJobOverview?: boolean
}

export interface AboutAppInfoModalProps {
    isLoading: boolean
    appId: string
    description: string
    onClose: (e) => void
    appMetaInfo: AppMetaInfo
    currentLabelTags?: TagType[]
    getAppMetaInfoRes: () => Promise<AppMetaInfo>
    fetchingProjects?: boolean
    projectsList?: Teams[]
    isJobOverview?: boolean
}

export interface DeleteComponentProps {
    setDeleting: (boolean) => void
    toggleConfirmation: any
    deleteComponent: (any) => Promise<any>
    title: string
    component: string
    payload: any
    confirmationDialogDescription?: string
    redirectTo?: boolean
    url?: string
    reload?: () => void
    configuration?: string
}

export interface AppStatusType {
    appStatus: string
    isDeploymentStatus?: boolean
    isJobCreateView?: boolean
}

export interface ResizableTagTextAreaProps {
  className?: string
  minHeight?: number
  maxHeight?: number
  value?: string
  onChange?: (e) => void
  onBlur?: (e) => void
  onFocus?: (e) => void
  placeholder?: string
  tabIndex?: number
  refVar?: React.MutableRefObject<HTMLTextAreaElement>
  dependentRef?: React.MutableRefObject<HTMLTextAreaElement>
}

export interface JobPipeline {
    ci_pipeline_id: number;
    ci_pipeline_name: string;
    started_on: string;
    status: string;
}