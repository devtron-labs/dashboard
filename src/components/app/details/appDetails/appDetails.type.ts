import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { AggregatedNodes, AppStreamData, OptionType } from '../../types'
import { type } from 'os'

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
export interface SecurityVulnerabilititesProps {
    imageScanDeployInfoId: number
    severityCount: {
        critical: number
        moderate: number
        low: number
    }
    onClick: () => void
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
    resourceDetails?: any,
    isCollapsed?: boolean,
    kubeList?: {icon: any, message: string}[],
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
        GIT_COMMIT: DeploymentStatusDetailRow
        KUBECTL_APPLY: DeploymentStatusDetailRow
        APP_HEALTH: DeploymentStatusDetailRow
    }
}

export interface DeploymentStatusDetailBreakdownType {
    deploymentStatusDetailsBreakdownData: DeploymentStatusDetailsBreakdownDataType
    streamData?: AppStreamData
}

export interface DeploymentStatusDetailModalType{
  appName: string
  environmentName: string
  deploymentStatusDetailsBreakdownData: DeploymentStatusDetailsBreakdownDataType
  streamData: AppStreamData
}

export interface ModuleConfigResponse extends ResponseType {
  result?: {
    enabled: boolean
  }
}

export interface ClusterConnectionResponse extends ResponseType {
  result?: {
    clusterReachable: boolean
    clusterName: string,
  }
}

export type DeleteResponseType = {
    clusterName: string,
    clusterReachable: boolean,
    deleteInitiated: boolean,
}

export interface DeploymentStatusDetailRowType {
    type: string
    hideVerticalConnector?: boolean
    deploymentDetailedData: DeploymentStatusDetailsBreakdownDataType
    streamData?: AppStreamData
}

export interface ErrorInfoStatusBarType {
    nonDeploymentError: string
    type: string
    errorMessage: string
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
    appDetailsAPI: (appId: string, envId: string, timeout: number) => Promise<any>
    setAppDetailResultInParent?: (appDetails) => void
    isAppDeployment?: boolean
    environments: any
    isPollingRequired?: boolean
    setIsAppDeleted?: any
    commitInfo?: boolean
    isAppDeleted?: boolean
    showCommitInfo?: React.Dispatch<React.SetStateAction<boolean>>
}

export interface DeploymentStatusCardType {
  deploymentStatusDetailsBreakdownData?: DeploymentStatusDetailsBreakdownDataType
  loadingResourceTree?: boolean
  hideDeploymentStatusLeftInfo?: boolean
  hideDetails?: boolean
  deploymentTriggerTime?: string
  triggeredBy?: string
}