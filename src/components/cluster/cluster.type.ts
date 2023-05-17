import { RouteComponentProps } from 'react-router-dom'
import internal from 'stream'
import { SERVER_MODE_TYPE } from '../../config'
import { OptionType } from '../app/types'
//import { ResponseType } from '@devtron-labs/devtron-fe-common-lib'

export const POLLING_INTERVAL = 30000

export const AuthenticationType = {
    BASIC: 'BASIC',
    ANONYMOUS: 'ANONYMOUS',
    IAM: 'IAM',
}


export interface UserDetails{
    userName: string
    errorInConnecting: string,
    config: ConfigCluster
}

export interface UserNameList {
    label: string,
    value: string,
}

export interface ClusterCheckType {
    isChecked: boolean
    value: 'INTERMEDIATE' | 'CHECKED'
}

export interface DataListType{
    id: number;
    cluster_name: string
    userInfos: UserDetails[]
    server_url: string
    active: boolean
    defaultClusterComponent: number
    insecureSkipTlsVerify: boolean
    //TODO delete
    // agentInstallationStage: number
    // k8sVersion: string
    // userName: string
    
    // errorInConnecting: string
    // isCdArgoSetup: boolean
}

export interface SaveClusterPayloadType {
    id : number,
    cluster_name: string,
    insecureSkipTlsVerify: boolean,
    config: ConfigCluster,
    active: boolean,
    prometheus_url: string,
    prometheusAuth: Record<string, string>,
    server_url: string,
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

export interface ClusterInfo {
    UserInfos: Record<string, UserInfos>
}


export interface ClusterResult {
    result?: Record<string, ClusterInfo>
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
    id: any
    cluster_name: any
    server_url: any
    active: any
    config: any
    toggleEditMode: any
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
