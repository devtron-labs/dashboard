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
    ACTION_STATE,
    ApiResponseResultType,
    ResponseType,
    ServerErrors,
    SeverityCount,
} from '@devtron-labs/devtron-fe-common-lib'
import { AggregatedNodes, OptionType } from '../../types'
import { SyncErrorType, AppDetails } from '../../../v2/appDetails/appDetails.type'

export enum AppMetricsTab {
    Aggregate = 'aggregate',
    Pod = 'pod',
}

export enum ChartType {
    Cpu = 'cpu',
    Ram = 'ram',
    Status = 'status',
    Latency = 'latency',
}

export enum StatusType {
    status5xx = '5xx',
    status4xx = '4xx',
    status2xx = '2xx',
    Throughput = 'Throughput',
}

export enum CalendarFocusInput {
    StartDate = 'startDate',
    EndDate = 'endDate',
}

export type AppMetricsTabType = 'aggregate' | 'pod'
export type ChartTypes = 'cpu' | 'ram' | 'status' | 'latency'
export type StatusTypes = '5xx' | '4xx' | '2xx' | 'Throughput'
export type CalendarFocusInputType = 'startDate' | 'endDate'

export interface AppDetailsPathParams {
    appId: string
    envId?: string
}

export interface SyncStageResourceDetail {
    id: number
    cdWorkflowRunnerId: number
    resourceGroup: string
    resourceKind: string
    resourceName: string
    resourcePhase: string
    resourceStatus: string
    statusMessage: string
}

export interface DeploymentStatusDetailsTimelineType {
    id: number
    cdWorkflowRunnerId: number
    status: string
    statusDetail: string
    statusTime: string
    resourceDetails?: SyncStageResourceDetail[]
}

export interface DeploymentStatusDetailsType {
    deploymentFinishedOn: string
    deploymentStartedOn: string
    triggeredBy: string
    statusFetchCount: number
    statusLastFetchedAt: string
    timelines: DeploymentStatusDetailsTimelineType[]
    wfrStatus?: string
}

export interface DeploymentStatusDetailsResponse extends ResponseType {
    result?: DeploymentStatusDetailsType
}

interface DeploymentStatusDetailRow {
    icon: string
    displayText: string
    displaySubText: string
    time: string
    resourceDetails?: any
    isCollapsed?: boolean
    kubeList?: { icon: any; message: string }[]
    timelineStatus?: string
}
export interface DeploymentStatusDetailsBreakdownDataType {
    deploymentStatus: string
    deploymentStatusText: string
    deploymentTriggerTime: string
    deploymentEndTime: string
    deploymentError: string
    triggeredBy: string
    nonDeploymentError: string
    deploymentStatusBreakdown: {
        DEPLOYMENT_INITIATED: DeploymentStatusDetailRow
        GIT_COMMIT?: DeploymentStatusDetailRow
        ARGOCD_SYNC?: DeploymentStatusDetailRow
        KUBECTL_APPLY?: DeploymentStatusDetailRow
        APP_HEALTH?: DeploymentStatusDetailRow
        HELM_PACKAGE_GENERATED?: DeploymentStatusDetailRow
    }
}

export interface DeploymentStatusDetailModalType {
    appName: string
    environmentName: string
    deploymentStatusDetailsBreakdownData: DeploymentStatusDetailsBreakdownDataType
    isVirtualEnvironment: boolean
    /**
     * Loading state for the timeline data
     */
    isLoading: boolean
}

export interface ModuleConfigResponse extends ResponseType {
    result?: {
        enabled: boolean
    }
}

export interface ClusterConnectionResponse extends ResponseType {
    result?: {
        clusterReachable: boolean
        clusterName: string
    }
}

export type DeleteResponseType = {
    clusterName: string
    clusterReachable: boolean
    deleteInitiated: boolean
}

export interface DeploymentStatusDetailRowType {
    type: string
    hideVerticalConnector?: boolean
    deploymentDetailedData: DeploymentStatusDetailsBreakdownDataType
}

export type SocketConnectionType = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'DISCONNECTING'

export interface NodeSelectorsType {
    logsPaused: boolean
    logsCleared: boolean
    socketConnection: SocketConnectionType
    nodeName?: string
    selectedNodes?: string
    isAppDeployment?: boolean
    containerName?: string
    selectedContainer?: string
    nodes: AggregatedNodes
    shell: { label: string; value: string }
    isReconnection: boolean
    nodeItems: OptionType[]
    setSelectNode: (flag) => void
    setIsReconnection: (flag) => void
    selectShell: (shell: { label: string; value: string }) => void
    setTerminalCleared: (flag: boolean) => void
    handleLogsPause: (e: any) => void
    selectNode: (nodeName: string) => void
    selectContainer: (containerName: string) => void
    setSocketConnection: (value: SocketConnectionType) => void
    setLogsCleared: (e: any) => void
    children?: any
}

export interface DetailsType {
    environment?: any
    appDetailsAPI: (appId: string, envId: string, timeout: number, signal?: AbortSignal) => Promise<any>
    setAppDetailResultInParent?: (appDetails) => void
    isAppDeployment?: boolean
    environments: any
    isPollingRequired?: boolean
    setIsAppDeleted?: any
    commitInfo?: boolean
    isAppDeleted?: boolean
    showCommitInfo?: React.Dispatch<React.SetStateAction<boolean>>
    isVirtualEnvRef?: React.MutableRefObject<boolean>
    isDeploymentBlocked?: boolean
    filteredEnvIds?: string
    deploymentUserActionState?: ACTION_STATE
    onCloseHideDeploymentWindowConfirmationModal?: () => void
}

export interface DeletedAppComponentType extends SyncErrorType {
    resourceTreeFetchTimeOut: boolean
}

export interface AppStatusCardType {
    appDetails: AppDetails
    status: string
    cardLoading?: boolean
    setDetailed?: React.Dispatch<React.SetStateAction<boolean>>
    message?: string
}

export interface DeploymentStatusCardType {
    deploymentStatusDetailsBreakdownData?: DeploymentStatusDetailsBreakdownDataType
    cardLoading?: boolean
    hideDetails?: boolean
    triggeredBy?: string
    isVirtualEnvironment?: boolean
    refetchDeploymentStatus: (showTimeline?: boolean) => void
}

export interface IssuesCardType {
    cardLoading?: boolean
    setErrorsList: React.Dispatch<React.SetStateAction<ErrorItem[]>>
    toggleIssuesModal?: React.Dispatch<React.SetStateAction<boolean>>
    setDetailed?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface SecurityVulnerabilityCardType {
    cardLoading?: boolean
    appId?: string
    envId?: string
    installedAppId?: number
    artifactId?: number
    isExternalCI?: boolean
}

export interface DeployedCommitCardType {
    showCommitInfoDrawer: () => void
    cardLoading?: boolean
    envId: number | string
    ciArtifactId: number
}

export interface LoadingCardType {
    wider?: boolean
}

export type ErrorItem = {
    error: string
    message: string
}

export interface IssuesListingModalType {
    closeIssuesListingModal: () => void
    errorsList: ErrorItem[]
}

export interface LastUpdatedCardType {
    deploymentTriggerTime: string
    triggeredBy: string
    cardLoading: boolean
}

export interface UseGetAppSecurityDetailsProps {
    appId: number
    envId: number
    installedAppId?: number
    artifactId?: number
    imageScanDeployInfoId?: number
    isSecurityScanV2Enabled: boolean
}
export interface UseGetAppSecurityDetailsReturnType {
    scanDetailsLoading: boolean
    scanDetailsResponse: ResponseType<ApiResponseResultType>
    scanDetailsError: ServerErrors
    reloadScanDetails: () => void
    severityCount: SeverityCount
    totalCount: number
}
