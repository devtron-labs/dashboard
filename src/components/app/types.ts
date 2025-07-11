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

import React, { Dispatch, SetStateAction } from 'react'

import {
    ACTION_STATE,
    AppEnvironment,
    BaseAppMetaData,
    DeploymentAppTypes,
    DeploymentStatusDetailsBreakdownDataType,
    HelmReleaseStatus,
    PodMetadatum,
    ReleaseMode,
    TagType,
    Teams,
} from '@devtron-labs/devtron-fe-common-lib'

import { APP_TYPE } from '@Config/constants'
import { CreateAppFormStateType } from '@Pages/App/CreateAppModal/types'

import { GroupFilterType } from '../ApplicationGroup/AppGroup.types'
import { DetailsType, ErrorItem, HibernationModalTypes } from './details/appDetails/appDetails.type'
import { CDMaterialProps } from './details/triggerView/types'

interface CDModalProps {
    cdPipelineId?: number
    triggerType?: string
    parentEnvironmentName: string
    ciPipelineId?: number
    isRedirectedFromAppDetails?: boolean
    deploymentUserActionState?: ACTION_STATE
}

export interface AppDetails extends CDModalProps {
    appStoreChartId: number
    appStoreChartName: string
    appStoreAppVersion: string
    appStoreAppName: string
    appId: number
    deploymentAppType?: DeploymentAppTypes
    externalCi?: boolean
    isApprovalPolicyApplicable?: boolean
    ciArtifactId?: number
    parentArtifactId?: number
    deprecated?: boolean
    k8sVersion?: number
    clusterName?: string
    dockerRegistryId?: string
    ipsAccessProvided?: boolean
    description?: string
    isVirtualEnvironment?: boolean
    image?: string
    helmPackageName?: string
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
    deploymentAppDeleteRequest: boolean
    imageTag?: string
    isPipelineTriggered?: boolean
    releaseMode: ReleaseMode
    trafficSwitched?: boolean
    pcoId?: number
}

export interface LabelTag {
    key: string
    value: string
}

interface ChartUsed {
    appStoreAppName: string
    appStoreAppVersion: string
    appStoreChartId: number
    appStoreChartName: string
    chartAvatar?: string
}

interface GitMaterial {
    displayName: string
    redirectionUrl: string
}

export interface AppMetaInfo extends BaseAppMetaData, Partial<Pick<CreateAppFormStateType, 'templateConfig'>> {
    appId: number
    appName: string
    createdBy: string
    description: string
    createdOn: string
    projectId?: number
    projectName?: string
    labels?: TagType[]
    /**
     * Available only for helm apps
     */
    chartUsed?: ChartUsed
    note?: Note
    gitMaterials?: GitMaterial[]
}

export interface ArtifactsCiJob {
    artifacts?: string[]
}

interface Note {
    id: number
    description: string
    updatedBy: string
    updatedOn: string
}

export interface AppHeaderType extends GroupFilterType {
    appName: string
    appMetaInfo: AppMetaInfo
    reloadMandatoryProjects: boolean
}

interface ResourceTree {
    nodes: Node[]
    newGenerationReplicaSet: string
    status: string
    podMetadata: PodMetadatum[]
    conditions?: any
    releaseStatus?: HelmReleaseStatus
    // lastSnapshotTime and wfrId are only available for isolated
    lastSnapshotTime?: string
    wfrId?: number
    hasDrift?: boolean
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
    hasDrift?: boolean
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

/**
 * @deprecated - use from fe-common
 */
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
    Node = 'Node',
    Overview = 'Overview',
    MonitoringDashboard = 'MonitoringDashboard',
    UpgradeCluster = 'UpgradeCluster',
    ResourceRecommender = 'ResourceRecommender',
}
/**
 * @deprecated - use from fe-common
 */
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
    Namespaces = 'Namespaces',
    // eslint-disable-next-line @typescript-eslint/no-shadow
    Nodes = 'Nodes',
}
export type AggregationKeysType = keyof typeof AggregationKeys

type Aggregation = {
    [key in AggregationKeys]: NodesMap
}

type NodesMap = {
    [key in NodeType]?: Map<string, any>
}

/**
 * @deprecated- Use from fe-common
 */
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

export interface EditAppRequest {
    id: number
    labels: TagType[]
    teamId: number
    description: AppMetaInfo['description']
}

export interface AppOverviewProps {
    appMetaInfo: AppMetaInfo
    getAppMetaInfoRes: () => Promise<AppMetaInfo>
    filteredEnvIds?: string
    /**
     * Type of the application
     *
     * @default 'app'
     */
    appType: APP_TYPE.JOB | APP_TYPE.DEVTRON_APPS | APP_TYPE.HELM_CHART
}

export interface AboutAppInfoModalProps extends Pick<AppOverviewProps, 'appType'> {
    isLoading: boolean
    appId: string
    description: string
    onClose: (e) => void
    appMetaInfo: AppMetaInfo
    currentLabelTags?: TagType[]
    getAppMetaInfoRes: () => Promise<AppMetaInfo>
    fetchingProjects?: boolean
    projectsList?: Teams[]
}

export interface JobPipeline {
    ciPipelineID: number
    ciPipelineName: string
    startedOn: string
    status: string
    dataTestId?: string
    environmentName?: string
    environmentId?: string
    lastTriggeredEnvironmentName?: string
}

export interface TagChipsContainerType {
    appType: APP_TYPE
    labelTags: TagType[]
    onAddTagButtonClick: (e) => void
    resourceName: string
    /**
     * Toggles the background to white when true
     */
    whiteBackground?: boolean
}
export interface SourceInfoType extends Pick<DetailsType, 'isAppView'>, Partial<Pick<DetailsType, 'applications'>> {
    appDetails: AppDetails
    setDetailed?: React.Dispatch<React.SetStateAction<boolean>>
    environment: AppEnvironment
    environments: AppEnvironment[]
    showCommitInfo?: React.Dispatch<React.SetStateAction<boolean>>
    showUrlInfo?: React.Dispatch<React.SetStateAction<boolean>>
    showHibernateModal?: React.Dispatch<React.SetStateAction<HibernationModalTypes>>
    deploymentStatusDetailsBreakdownData?: DeploymentStatusDetailsBreakdownDataType
    loadingDetails?: boolean
    loadingResourceTree?: boolean
    isVirtualEnvironment?: boolean
    setRotateModal?: React.Dispatch<React.SetStateAction<boolean>>
    toggleIssuesModal?: React.Dispatch<React.SetStateAction<boolean>>
    envId?: number | string
    ciArtifactId?: number
    setErrorsList?: React.Dispatch<React.SetStateAction<ErrorItem[]>>
    filteredEnvIds?: string
    deploymentUserActionState?: ACTION_STATE
    setHibernationPatchChartName?: Dispatch<SetStateAction<string>>
    isResourceTreeReloading?: boolean
    handleOpenCDModal?: (isForRollback?: boolean) => () => void
}

export interface AppDetailsCDModalType
    extends Pick<
            AppDetails,
            'appId' | 'environmentId' | 'isVirtualEnvironment' | 'deploymentAppType' | 'environmentName'
        >,
        Pick<SourceInfoType, 'loadingDetails'> {
    cdModal: CDModalProps
    appName?: string
    handleSuccess?: CDMaterialProps['handleSuccess']
    materialType: string
    closeCDModal: () => void
}

export interface EnvironmentListMinType {
    active?: boolean
    appCount?: number
    cluster_name?: string
    default?: boolean
    description?: boolean
    environmentIdentifier?: string
    environment_name: string
    id?: number
    isClusterCdActive?: boolean
    isVirtualEnvironment?: boolean
    namespace?: string
    allowedDeploymentTypes?: DeploymentAppTypes[]
}

export interface EditDescRequest {
    id: number
    environment_name: string
    cluster_id: number
    namespace: string
    active: boolean
    default: boolean
    description: string
}
