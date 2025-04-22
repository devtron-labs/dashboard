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

import React, { Dispatch, MutableRefObject, SetStateAction } from 'react'
import {
    OptionType,
    AppDetails as CommonAppDetails,
    Node as CommonNode,
    iNode as CommoniNode,
    ConfigurationType,
    FormProps,
    OptionsBase,
    SelectedResourceType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ExternalLink, OptionTypeWithIcon } from '../../externalLinks/ExternalLinks.type'
import { iLink } from '../utils/tabUtils/link.type'
import { EphemeralForm, EphemeralFormAdvancedType } from './k8Resource/nodeDetail/nodeDetail.type'
import { ClusterListType } from '@Components/ClusterNodes/types'
import { UpdateTabUrlParamsType, UseTabsReturnType } from '@Components/common/DynamicTabs/types'

export interface ApplicationObject extends iLink {
    selectedNode: string
    title: string
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
    EXTERNAL_HELM_CHART = 'external_helm_chart',
    EXTERNAL_ARGO_APP = 'external_argo_app',
    EXTERNAL_FLUX_APP = 'external_flux_app',
}

export enum K8sResourcePayloadAppType {
    DEVTRON_APP = 0,
    HELM_APP = 1,
    EXTERNAL_ARGO_APP = 2,
    EXTERNAL_FLUX_APP = 3,
}

export enum K8sResourcePayloadDeploymentType {
    HELM_INSTALLED = 0,
    ARGOCD_INSTALLED = 1,
    FLUXCD_INSTALLED = 2,
}

export interface EnvDetails {
    envType: EnvType
    envId: number
    appId: number
}

export enum AggregationKeys {
    Workloads = 'Workloads',
    Networking = 'Networking',
    ConfigAndStorage = 'Config & Storage',
    RBAC = 'RBAC',
    Administration = 'Administration',
    CustomResource = 'Custom Resource',
    OtherResources = 'Other Resources',
    Events = 'Events',
}

/**
 * @deprecated
 */
export enum NodeStatus {
    Degraded = 'degraded',
    Healthy = 'healthy',
    Progressing = 'progressing',
    Missing = 'missing',
    Suspended = 'suspended',
    Unknown = 'unknown',
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
    EndpointSlice = 'EndpointSlice',
    NetworkPolicy = 'NetworkPolicy',
    StorageClass = 'StorageClass',
    VolumeSnapshot = 'VolumeSnapshot',
    VolumeSnapshotContent = 'VolumeSnapshotContent',
    VolumeSnapshotClass = 'VolumeSnapshotClass',
    PodDisruptionBudget = 'PodDisruptionBudget',
    Event = 'Event',
}

/**
 *
 * @param nodeType
 * @returns AggregationKeys - Like Workflow for Deployment, DaemonSet, etc.
 */
export function getAggregator(nodeType: NodeType): AggregationKeys {
    switch (nodeType?.toLowerCase()) {
        case NodeType.DaemonSet.toLowerCase():
        case NodeType.Deployment.toLowerCase():
        case NodeType.Pod.toLowerCase():
        case NodeType.ReplicaSet.toLowerCase():
        case NodeType.Job.toLowerCase():
        case NodeType.CronJob.toLowerCase():
        case NodeType.ReplicationController.toLowerCase():
        case NodeType.StatefulSet.toLowerCase():
            return AggregationKeys.Workloads
        case NodeType.Ingress.toLowerCase():
        case NodeType.Service.toLowerCase():
        case NodeType.Endpoints.toLowerCase():
        case NodeType.EndpointSlice.toLowerCase():
        case NodeType.NetworkPolicy.toLowerCase():
            return AggregationKeys.Networking
        case NodeType.ConfigMap.toLowerCase():
        case NodeType.Secret.toLowerCase():
        case NodeType.PersistentVolume.toLowerCase():
        case NodeType.PersistentVolumeClaim.toLowerCase():
        case NodeType.StorageClass.toLowerCase():
        case NodeType.VolumeSnapshot.toLowerCase():
        case NodeType.VolumeSnapshotContent.toLowerCase():
        case NodeType.VolumeSnapshotClass.toLowerCase():
        case NodeType.PodDisruptionBudget.toLowerCase():
            return AggregationKeys.ConfigAndStorage
        case NodeType.ServiceAccount.toLowerCase():
        case NodeType.ClusterRoleBinding.toLowerCase():
        case NodeType.RoleBinding.toLowerCase():
        case NodeType.ClusterRole.toLowerCase():
        case NodeType.Role.toLowerCase():
        case NodeType.PodSecurityPolicy.toLowerCase():
            return AggregationKeys.RBAC
        case NodeType.MutatingWebhookConfiguration.toLowerCase():
        case NodeType.ValidatingWebhookConfiguration.toLowerCase():
            return AggregationKeys.Administration
        case NodeType.Alertmanager.toLowerCase():
        case NodeType.Prometheus.toLowerCase():
        case NodeType.ServiceMonitor.toLowerCase():
            return AggregationKeys.CustomResource
        case NodeType.Event.toLowerCase():
            return AggregationKeys.Events
        default:
            return AggregationKeys.CustomResource
    }
}

export type AppDetails = CommonAppDetails

interface MaterialInfo {
    author: string
    branch: string
    message: string
    modifiedTime: string
    revision: string
    url: string
    webhookData: string
}

interface OtherEnvironment {
    environmentId: number
    environmentName: string
    appMetrics: boolean
    infraMetrics: boolean
    prod: boolean
}

export interface ResourceTree {
    conditions: any
    newGenerationReplicaSet: string
    nodes: Array<Node>
    podMetadata: Array<PodMetaData>
    status: string
    resourcesSyncResult?: Record<string, string>
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

export type Node = CommonNode

export interface Health {
    status: string
    message?: string
}

export interface NetworkingInfo {
    targetLabels: TargetLabels
}

export interface TargetLabels {
    targetLabel: TargetLabel
}

export interface TargetLabel {
    'app.kubernetes.io/instance': string
    'app.kubernetes.io/name': string
}

export type iNode = CommoniNode

export interface iNodes extends Array<iNode> {}

export interface AppStreamData {
    result: {
        type: string
        application: Application
    }
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

interface Resource {
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

export interface LogSearchTermType {
    logSearchTerms: Record<string, string>
    setLogSearchTerms: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

export interface LogAnalyzerProps extends LogSearchTermType {
    handleMarkLogAnalyzerTabSelected: () => void
}

export interface NodeDetailPropsType
    extends LogSearchTermType,
        Pick<ClusterListType, 'lowercaseKindToResourceGroupMap' | 'updateTabUrl'> {
    loadingResources?: boolean
    isResourceBrowserView?: boolean
    selectedResource?: SelectedResourceType
    removeTabByIdentifier?: UseTabsReturnType['removeTabByIdentifier']
    clusterName?: string
    isExternalApp?: boolean
}

export interface LogsComponentProps extends Omit<NodeDetailPropsType, 'lowercaseKindToResourceGroupMap' | 'updateTabUrl' | 'tabs'> {
    selectedTab: (_tabName: string, _url?: string) => void
    isDeleted: boolean
    ephemeralContainerType?: string
    ephemeralForm?: EphemeralForm
    targetContainerOption?: OptionType[]
    ephemeralFormAdvanced?: EphemeralFormAdvancedType
    imageListOption?: OptionType[]
}

export interface TerminalComponentProps {
    selectedTab: (_tabName: string, _url?: string) => void
    isDeleted: boolean
    isResourceBrowserView?: boolean
    selectedResource?: SelectedResourceType
    selectedContainer: Map<string, string>
    setSelectedContainer: (containerName: Map<string, string>) => void
    containers: Options[]
    setContainers?: React.Dispatch<React.SetStateAction<Options[]>>
    selectedContainerName: OptionType
    setSelectedContainerName: React.Dispatch<React.SetStateAction<OptionType>>
    switchSelectedContainer: (string) => void
    showTerminal: boolean
}

export interface Options extends OptionsBase {
    selected: boolean
}
export interface PodContainerOptions {
    podOptions: Options[]
    containerOptions: Options[]
}

export interface LogState {
    selectedPodOption: string
    selectedContainerOption: string
    grepTokens?: any
}

export interface StatusFilterButtonType {
    nodes: Array<Node>
    handleFilterClick?: (selectedFilter: string) => void
}

export interface SyncErrorType {
    showApplicationDetailedModal?: () => void
}

export interface ResourceInfoActionPropsType {
    selectedTab: (_tabName: string, _url: string) => void
    isDeleted: boolean
    isResourceBrowserView?: boolean
    selectedResource?: SelectedResourceType
}

export interface ManifestViewRefType {
    data: {
        error: boolean
        secretViewAccess: boolean
        desiredManifest: string
        manifest: string
        activeManifestEditorData: string
        modifiedManifest: string
        /*
         * Normalized live manifest for manifest diff view
         */
        normalizedLiveManifest: string
        guiSchema: Record<string, string>
        lockedKeys: string[] | null
    }
    id: string
}

export enum ManifestCodeEditorMode {
    READ = 'read',
    EDIT = 'edit',
    APPLY_CHANGES = 'applyChanges',
    CANCEL = 'cancel',
}

export interface ManifestActionPropsType extends ResourceInfoActionPropsType {
    hideManagedFields: boolean
    toggleManagedFields: (managedFieldsExist: boolean) => void
    manifestViewRef: MutableRefObject<ManifestViewRefType>
    getComponentKey: () => string
    showManifestCompareView: boolean
    setShowManifestCompareView: Dispatch<SetStateAction<boolean>>
    manifestCodeEditorMode: ManifestCodeEditorMode
    setManifestCodeEditorMode: Dispatch<SetStateAction<ManifestCodeEditorMode>>
    handleSwitchToYAMLMode: () => void
    manifestFormConfigurationType: ConfigurationType
    handleUpdateUnableToParseManifest: (value: boolean) => void
    handleManifestGUIErrors: FormProps['onError']
    manifestGUIFormRef: FormProps['ref']
    isManifestEditable: boolean
}

export interface NodeTreeDetailTabProps {
    appDetails: AppDetails
    isReloadResourceTreeInProgress: boolean
    handleReloadResourceTree: () => void
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
    isDevtronApp?: boolean
    isExternalApp?: boolean
    isDeploymentBlocked?: boolean
    isVirtualEnvironment: boolean
}

export interface NodeComponentProps extends Pick<UseTabsReturnType, 'addTab'>, Pick<NodeDeleteComponentType, 'removeTabByIdentifier' | 'tabs'> {
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
    isDevtronApp?: boolean
    clusterId?: number
    isDeploymentBlocked?: boolean
}

export interface K8ResourceComponentProps extends Pick<NodeComponentProps, 'addTab'>, Pick<NodeDeleteComponentType, 'removeTabByIdentifier' | 'tabs'>  {
    clickedNodes: Map<string, string>
    registerNodeClick: Dispatch<SetStateAction<Map<string, string>>>
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
    isDevtronApp?: boolean
    clusterId?: number
    isDeploymentBlocked?: boolean
    handleMarkK8sResourceTabSelected: () => void
    handleUpdateK8sResourceTabUrl: (props: Omit<UpdateTabUrlParamsType, 'id'>) => void
}

export interface AppDetailsComponentType extends
    Pick<NodeTreeDetailTabProps, 'handleReloadResourceTree' | 'isReloadResourceTreeInProgress'> {
    externalLinks?: ExternalLink[]
    monitoringTools?: OptionTypeWithIcon[]
    isExternalApp: boolean
    _init?: () => void
    loadingDetails: boolean
    loadingResourceTree: boolean
}

export interface NodeDeleteComponentType extends Pick<UseTabsReturnType, 'tabs' | 'removeTabByIdentifier'> {
    nodeDetails: Node
    appDetails: AppDetails
    isDeploymentBlocked: boolean
}

export interface NodeDetailComponentWrapperProps extends Pick<UseTabsReturnType, 'addTab' | 'markTabActiveById' | 'getTabId' | 'updateTabUrl'> {
    nodeDetailComponentProps: Omit<NodeDetailPropsType, 'updateTabUrl'>
}