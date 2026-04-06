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

import { Dispatch, SetStateAction } from 'react'
import { MultiValue } from 'react-select'

import {
    AppDetails,
    AppEnvironment,
    DeploymentStatusDetailsBreakdownDataType,
    EnvAppsMetaDTO,
    OptionType,
    ResponseType,
    ScanResultDTO,
    SelectPickerProps,
    ServerErrors,
} from '@devtron-labs/devtron-fe-common-lib'

import { AggregatedNodes, UseGetDTAppDetailsReturnType } from '../../types'

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

export type AppMetricsTabType = 'aggregate' | 'pod'
export type ChartTypes = 'cpu' | 'ram' | 'status' | 'latency'
export type StatusTypes = '5xx' | '4xx' | '2xx' | 'Throughput'

export interface AppDetailsPathParams {
    appId: string
    envId?: string
}

export interface DataSourceDetailsDTO {
    id: number
    name: string
}

export interface DataSourceDetailsQueryParams {
    environmentName: string
}

export interface DataSourceDetailsType {
    dataSourceName: string
    dataSourceId: number
}

export interface ClusterConnectionResponse extends ResponseType {
    result?: {
        clusterReachable: boolean
        clusterName: string
    }
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
    environment?: AppEnvironment
    environments: AppEnvironment[]
    isAppView: boolean
    applications: EnvAppsMetaDTO['apps']
    appDetailsQueryData: UseGetDTAppDetailsReturnType
}

export interface AppStatusCardType {
    appDetails: AppDetails
    status: string
    cardLoading?: boolean
    setDetailed?: React.Dispatch<React.SetStateAction<boolean>>
    message?: string
}

export interface DeploymentStatusCardType {
    deploymentStatusDetailsBreakdownData?: Pick<
        DeploymentStatusDetailsBreakdownDataType,
        'deploymentStatus' | 'triggeredBy' | 'deploymentTriggerTime'
    >
    cardLoading?: boolean
    hideDetails?: boolean
    triggeredBy?: string
    isVirtualEnvironment?: boolean
}

export interface IssuesCardType {
    cardLoading?: boolean
    setErrorsList: React.Dispatch<React.SetStateAction<ErrorItem[]>>
    toggleIssuesModal?: React.Dispatch<React.SetStateAction<boolean>>
    setDetailed?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface SecurityVulnerabilityCardType {
    cardLoading: boolean
    appId?: string
    envId?: string
    installedAppId?: number
}

export interface DeployedCommitCardType {
    showCommitInfoDrawer: (e) => void
    cardLoading?: boolean
    envId: number | string
    ciArtifactId: number
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
    envId?: number
    installedAppId?: number
    artifactId?: number
}
export interface UseGetAppSecurityDetailsReturnType {
    scanResultLoading: boolean
    scanResultResponse: ResponseType<ScanResultDTO>
    scanResultError: ServerErrors
    reloadScanResult: () => void
}

export enum HibernationModalTypes {
    HIBERNATE = 'hibernate',
    RESUME = 'resume',
    CONFIGURE_PATCH = 'configurePatch',
}

type AppEnvDetailsType = 'app' | 'app-group'

export interface AppDetailProps {
    detailsType: AppEnvDetailsType
    filteredResourceIds: string
    resourceList: OptionType<string, string>[]
    setSelectedResourceList: Dispatch<SetStateAction<MultiValue<OptionType>>>
}

export type AppEnvDropdownProps = Pick<SelectPickerProps, 'options' | 'value'> & { isAppView?: boolean }

export type AppEnvSelectorProps =
    | {
          isAppView: true
          environments: AppEnvironment[]
          applications?: never
      }
    | {
          isAppView: false
          applications: EnvAppsMetaDTO['apps']
          environments?: never
      }
