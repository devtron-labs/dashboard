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

import {
    ClusterEnvironmentCategoryType,
    ClusterStatusType,
    EnvListMinDTO,
    FiltersTypeEnum,
    OptionType,
    SelectPickerOptionType,
    TableProps,
    UseUrlFiltersReturnType,
} from '@devtron-labs/devtron-fe-common-lib'

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

export interface ClusterComponentType {
    name: string
    appId: number
    installedAppId: number
    envId: number
    envName: string
    status: ClusterComponentStatusType
}

export interface ClusterMetadataTypes {
    id: number
    cluster_name: string
    active: boolean
    errorInConnecting?: string
    isVirtualCluster?: boolean
    isProd: boolean
    remoteConnectionConfig: RemoteConnectionConfig
    insecureSkipTlsVerify: boolean
    installationId: number
    server_url: string
    prometheus_url: string
    prometheusAuth: any
    proxyUrl: string
    toConnectWithSSHTunnel: boolean
    sshTunnelConfig: any
    environments: EnvListMinDTO[]
    description: string
    category: SelectPickerOptionType
}

export interface ClusterComponentModalProps {
    components: ClusterComponentType[] | null
    environmentName: string
    redirectToChartDeployment: (appId, envId) => void
    callRetryClusterInstall: () => void
    close: (event) => void
}

export interface ClusterInstallStatusProps {
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

export interface ClusterProps extends RouteComponentProps<{}> {
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

export const RemoteConnectionTypeCluster = 'cluster'

export type EditClusterFormProps = {
    id: number
    hideEditModal: () => void
    isProd?: boolean
    clusterName: string
    serverUrl: string
    prometheusUrl: string
    prometheusAuth: any
    proxyUrl: string
    sshUsername: string
    sshPassword: string
    sshAuthKey: string
    sshServerAddress: string
    isConnectedViaSSHTunnel: boolean
    isTlsConnection: boolean
}

export type ClusterFormProps = { reload: () => void } & Pick<ClusterMetadataTypes, 'category'> &
    (
        | ({
              handleCloseCreateClusterForm?: never
              id: number
              installationId: number
          } & EditClusterFormProps)
        | ({
              handleCloseCreateClusterForm: () => void
              id?: never
              installationId?: never
          } & Partial<Record<keyof EditClusterFormProps, never>>)
    )

export interface AddClusterFormPrefilledInfoType {
    serverURL: string
}

export interface AddEnvironmentFormPrefilledInfoType {
    namespace: string
}
export interface DeleteClusterConfirmationModalProps extends Pick<Cluster, 'clusterName'> {
    clusterId: string
    handleClose: () => void
    installationId: string
    handleSuccess?: () => void
    reload: () => void
}

export interface DeleteClusterPayload {
    id: number
}

export interface UserNameDropDownListProps {
    clusterDetail: DataListType
    selectedUserNameOptions: Record<string, any>
    onChangeUserName: (selectedOption: any, clusterDetail: DataListType) => void
}

export interface EditClusterDrawerContentProps
    extends Pick<
        Cluster,
        | 'sshTunnelConfig'
        | 'insecureSkipTlsVerify'
        | 'category'
        | 'isProd'
        | 'installationId'
        | 'toConnectWithSSHTunnel'
        | 'proxyUrl'
        | 'prometheusUrl'
        | 'serverUrl'
        | 'clusterName'
        | 'clusterId'
    > {
    reload: () => void
    handleModalClose: () => void
}

export interface EnvironmentDTO {
    id: number
    environment_name: string
    cluster_id: number
    cluster_name: string
    active: boolean
    default: boolean
    prometheus_endpoint: string
    namespace: string
    isClusterCdActive: boolean
    description: string
    isVirtualEnvironment: boolean
    category: ClusterEnvironmentCategoryType
}

export interface Environment
    extends Omit<
        EnvironmentDTO,
        'environment_name' | 'cluster_id' | 'prometheus_endpoint' | 'default' | 'cluster_name'
    > {
    environmentName: EnvironmentDTO['environment_name']
    clusterId: EnvironmentDTO['cluster_id']
    prometheusEndpoint: EnvironmentDTO['prometheus_endpoint']
    isProd: EnvironmentDTO['default']
    clusterName: EnvironmentDTO['cluster_name']
}

export interface ClusterDTO {
    category: ClusterEnvironmentCategoryType
    cluster_name: string
    description: string
    id: number
    insecureSkipTlsVerify: boolean
    installationId: number
    isProd: boolean
    isVirtualCluster: boolean
    server_url: string
    sshTunnelConfig: any
    prometheus_url: string
    proxyUrl: string
    toConnectWithSSHTunnel: boolean
    clusterStatus: ClusterStatusType
}

export interface Cluster
    extends Omit<ClusterDTO, 'server_url' | 'cluster_name' | 'prometheus_url' | 'id' | 'category' | 'clusterStatus'> {
    serverUrl: ClusterDTO['server_url']
    clusterName: ClusterDTO['cluster_name']
    prometheusUrl: ClusterDTO['prometheus_url']
    clusterId: ClusterDTO['id']
    category: SelectPickerOptionType
    status: ClusterStatusType
}

export interface ClusterRowData
    extends Pick<Cluster, 'clusterId' | 'clusterName' | 'serverUrl' | 'isVirtualCluster' | 'status'> {
    envCount: number
    clusterType: string
    clusterCategory: string
}

export enum ClusterEnvTabs {
    CLUSTERS = 'clusters',
    ENVIRONMENTS = 'environments',
}

export enum EnvListSortableKeys {
    ENV_NAME = 'envName',
    ENV_CATEGORY = 'envCategory',
    ENV_TYPE = 'envType',
    ENV_NAMESPACE = 'namespace',
}

export enum ClusterEnvFilterKeys {
    SELECTED_TAB = 'selectedTab',
    CLUSTER_ID = 'clusterId',
}

export enum ClusterListFields {
    ICON = 'icon',
    CLUSTER_NAME = 'clusterName',
    CLUSTER_TYPE = 'clusterType',
    ENV_COUNT = 'envCount',
    CLUSTER_CATEGORY = 'clusterCategory',
    SERVER_URL = 'serverUrl',
    ACTIONS = 'actions',
}

export type ClusterEnvFilterType = Record<ClusterEnvFilterKeys, string>

export type ClusterTableProps = TableProps<ClusterRowData, FiltersTypeEnum.STATE, {}>

export type EnvNamespaceRowType = {
    envId: number
    clusterId: number
    environmentName: string
    namespace: string
    envType: string
    category: string
    description: string
    namespaceNotFound: boolean
}

export interface EnvironmentListProps {
    isLoading: boolean
    clusterList: Cluster[]
    clusterIdVsEnvMap: Record<number, Environment[]>
    showUnmappedEnvs: boolean
    filterConfig: Pick<UseUrlFiltersReturnType<EnvListSortableKeys>, 'sortBy' | 'sortOrder' | 'searchKey'>
    filterClusterId: string
    handleSorting: UseUrlFiltersReturnType<EnvListSortableKeys>['handleSorting']
    reloadEnvironments: () => void
}

export type DeleteEnvConfigType = Pick<EnvNamespaceRowType, 'envId' | 'clusterId'>

export type EditEnvConfigType = Pick<EnvNamespaceRowType, 'envId' | 'clusterId'> & { isVirtualCluster: boolean }

export interface ClusterEnvListProps
    extends Pick<EnvironmentListProps, 'filterConfig' | 'showUnmappedEnvs' | 'filterClusterId'> {
    clusterDetails: Cluster
    environments: Environment[]
    setDeleteEnvConfig: Dispatch<SetStateAction<DeleteEnvConfigType>>
    setEditEnvConfig: Dispatch<SetStateAction<EditEnvConfigType>>
}

export interface EditEnvProps {
    environments: Environment[]
    envId: number
    reload: () => void
    handleClose: () => void
    isVirtualCluster: boolean
}

export interface DeleteEnvProps extends Omit<EditEnvProps, 'isVirtualCluster'> {}

export interface EditDeleteClusterProps {
    clusterList: Cluster[]
    reloadClusterList: () => void
    handleClose: () => void
}
