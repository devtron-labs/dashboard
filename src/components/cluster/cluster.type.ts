import { RouteComponentProps } from 'react-router-dom'
import { SERVER_MODE_TYPE } from '../../config'
import { OptionType } from '../app/types'

export const POLLING_INTERVAL = 30000

export const DEFAULT_CLUSTER_ID = 1

export const AuthenticationType = {
    BASIC: 'BASIC',
    ANONYMOUS: 'ANONYMOUS',
    IAM: 'IAM',
}

export interface UserDetails {
    userName: string
    errorInConnecting: string,
    config: ConfigCluster
}

export interface UserNameList {
    label: string,
    value: string,
}

export enum SSHAuthenticationType {
    Password = "PASSWORD",
    SSH_Private_Key = "SSH_PRIVATE_KEY",
    Password_And_SSH_Private_Key = "PASSWORD_AND_SSH_PRIVATE_KEY"
}

export interface DataListType {
    id: number;
    cluster_name: string
    userInfos: UserDetails[]
    server_url: string
    active: boolean
    defaultClusterComponent: number
    insecureSkipTlsVerify: boolean
    proxy_url: string
    isConnectedViaSSHTunnel: boolean
    sshTunnelConfig: Record<string, string>
}

export interface SaveClusterPayloadType {
    id: number,
    cluster_name: string,
    insecureSkipTlsVerify: boolean,
    config: ConfigCluster,
    active: boolean,
    prometheus_url: string,
    prometheusAuth: Record<string, string>,
    server_url: string,
    proxy_url: string,
    isConnectedViaSSHTunnel: boolean
    sshTunnelConfig: Record<string, string>,
}

export const DEFAULT_SECRET_PLACEHOLDER = '••••••••'

export enum ClusterComponentStatus {
    WF_UNKNOWN = 'WF_UNKNOWN',
    REQUEST_ACCEPTED = 'REQUEST_ACCEPTED',
    ENQUEUED = 'ENQUEUED',
    QUE_ERROR = 'QUE_ERROR',
    DEQUE_ERROR = 'DEQUE_ERROR',
    TRIGGER_ERROR = 'TRIGGER_ERROR',
    DEPLOY_SUCCESS = 'DEPLOY_SUCCESS',
    DEPLOY_INIT = 'DEPLOY_INIT',
    GIT_ERROR = 'GIT_ERROR',
    GIT_SUCCESS = 'GIT_SUCCESS',
    ACD_ERROR = 'ACD_ERROR',
    ACD_SUCCESS = 'ACD_SUCCESS',
}

export type ClusterComponentStatusType = keyof typeof ClusterComponentStatus

export type ClusterInstallStage = -1 | 0 | 1 | 2 | 3

export interface ClusterComponentType {
    name: string
    appId: number
    installedAppId: number
    envId: number
    envName: string
    status: ClusterComponentStatusType
}

export interface ClusterComponentModalProps {
    agentInstallationStage: ClusterInstallStage
    components: ClusterComponentType[] | null
    environmentName: string
    redirectToChartDeployment: (appId, envId) => void
    callRetryClusterInstall: () => void
    close: (event) => void
}

export interface ClusterInstallStatusProps {
    agentInstallationStage: ClusterInstallStage
    envName: string | undefined
    onClick: (...args) => void
}

export interface ConfigCluster {
    bearerToken: string
    cert_auth_data: string
    cert_data: string
    tls_key: string
}

export interface UserInfos {
    username: string
    config: ConfigCluster
}

export interface ClusterListProps extends RouteComponentProps<{}> {
    serverMode: SERVER_MODE_TYPE
    isSuperAdmin: boolean
}

export interface ClusterStepModal {
    subTitle: string
    command: string
    clusterName: string
}

export interface ClusterTerminalParamsType {
    selectedImage: OptionType
    selectedNamespace: OptionType
    selectedNode: OptionType
    selectedShell: OptionType
}

export interface ClusterFormType {
    id: number
    cluster_name: string
    server_url: string
    active: boolean
    config: any
    toggleEditMode: boolean
    reload: any
    prometheus_url: any
    prometheusAuth: any
    defaultClusterComponent: any
    isGrafanaModuleInstalled: boolean
    isTlsConnection: boolean
    isClusterSelect: boolean
    isClusterDetails: boolean
    toggleCheckTlsConnection: () => void
    isDrawer: boolean
}
