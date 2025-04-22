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
import { RouteComponentProps } from 'react-router-dom'

import { SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

import { SERVER_MODE_TYPE } from '../../config'
import { OptionType } from '../app/types'

export const POLLING_INTERVAL = 30000

export const DEFAULT_CLUSTER_ID = 1

export const AuthenticationType = {
    BASIC: 'BASIC',
    ANONYMOUS: 'ANONYMOUS',
    IAM: 'IAM',
}

export const emptyClusterTerminalParamsData = {
    selectedImage: null,
    selectedNamespace: null,
    selectedNode: null,
    selectedShell: null,
}

export interface UserDetails {
    userName: string
    errorInConnecting: string
    config: ConfigCluster
}

export interface UserNameList {
    label: string
    value: string
}

export enum SSHAuthenticationType {
    Password = 'PASSWORD',
    SSH_Private_Key = 'SSH_PRIVATE_KEY',
    Password_And_SSH_Private_Key = 'PASSWORD_AND_SSH_PRIVATE_KEY',
}

export interface RemoteConnectionConfig {
    connectionMethod: string
    proxyConfig: Record<string, string>
    sshConfig: Record<string, string>
}

export interface DataListType {
    id: number
    cluster_name: string
    userInfos: UserDetails[]
    server_url: string
    active: boolean
    defaultClusterComponent: number
    insecureSkipTlsVerify: boolean
    remoteConnectionConfig: RemoteConnectionConfig
}

export interface SaveClusterPayloadType {
    id: number
    cluster_name: string
    insecureSkipTlsVerify: boolean
    config: ConfigCluster
    active: boolean
    prometheus_url: string
    prometheusAuth: Record<string, string>
    server_url: string
    remoteConnectionConfig: RemoteConnectionConfig
}

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
    selectedImage: SelectPickerOptionType<string>
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

export const RemoteConnectionTypeCluster = 'cluster'

export type EditClusterFormProps = {
    id: number
    toggleEditMode: Dispatch<SetStateAction<boolean>>
    isProd?: boolean
    clusterName: string
    serverUrl: string
    prometheusUrl: string
    prometheusAuth: any
    defaultClusterComponent: any
    proxyUrl: string
    sshUsername: string
    sshPassword: string
    sshAuthKey: string
    sshServerAddress: string
    isConnectedViaSSHTunnel: boolean
    isTlsConnection: boolean
}

export type ClusterFormProps = { reload: () => void } & (
    | ({
          handleCloseCreateClusterForm?: never
          id: number
      } & EditClusterFormProps)
    | ({
          handleCloseCreateClusterForm: () => void
          id?: never
      } & Partial<Record<keyof EditClusterFormProps, never>>)
)

export interface AddClusterFormPrefilledInfoType {
    serverURL: string
}

export interface AddEnvironmentFormPrefilledInfoType {
    namespace: string
}
