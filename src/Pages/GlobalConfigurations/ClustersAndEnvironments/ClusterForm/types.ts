import { Dispatch, ReactNode, SetStateAction, SyntheticEvent } from 'react'

import {
    ClusterDetailListType,
    PromoetheusConfig,
    RemoteConnectionType,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'

import { SSHAuthenticationType } from '../cluster.type'

export interface ConnectClusterViaKubeconfigProps {
    reload: () => void
    handleModalClose: () => void
}

export interface ClusterConfigurationsProps {
    id: number
    remoteConnectionMethod: RemoteConnectionType
    isTlsConnection: boolean
    state
    handleOnChange: (event: SyntheticEvent) => void
    handleOnBlur: (event: SyntheticEvent) => void
    handleOnFocus: (event: SyntheticEvent) => void
    toggleCheckTlsConnection: () => void
    SSHConnectionType: SSHAuthenticationType
    changeRemoteConnectionType: (event: SyntheticEvent) => void
    changeSSHAuthenticationType: (event: SyntheticEvent) => void
    selectedCategory: SelectPickerOptionType
    setSelectedCategory: Dispatch<SetStateAction<SelectPickerOptionType>>
    initialIsTlsConnection: boolean
}

export interface KubeConfigEditorProps {
    saveYamlData: string
    setSaveYamlData: Dispatch<SetStateAction<string>>
    errorText: string
}

export interface ApplicationMonitoringProps {
    prometheusConfig: PromoetheusConfig
    prometheusUrl: string
    isAppMetricsEnabled: boolean
    toggleAppMetrics: () => void
    handleOnChange: (event: SyntheticEvent) => void
    onPrometheusAuthTypeChange: (event: SyntheticEvent) => void
    isGrafanaModuleInstalled: boolean
    isCostVisibilityEnabled: boolean
}

export enum ClusterConfigTabEnum {
    CLUSTER_CONFIG = 'cluster-config',
    APPLICATION_MONITORING = 'application-monitoring',
    COST_VISIBILITY = 'cost-visibility',
}

export enum ClusterConfigPages {
    BASIC_CONFIG = 'basic-config',
    CONNECTION_PROTOCOL_CONFIG = 'connection-protocol-config',
    TLS_CONFIG = 'tls-config',
}

export type ClusterFormKeys =
    | 'cluster_name'
    | 'url'
    | 'userName'
    | 'password'
    | 'prometheusTlsClientKey'
    | 'prometheusTlsClientCert'
    | 'proxyUrl'
    | 'sshUsername'
    | 'sshPassword'
    | 'sshAuthKey'
    | 'sshServerAddress'
    | 'tlsClientKey'
    | 'tlsClientCert'
    | 'certificateAuthorityData'
    | 'token'
    | 'endpoint'
    | 'authType'
    | 'isProd'

export interface ClusterFormNavButtonProps {
    isActive: boolean
    title: string
    subtitle?: ReactNode
    onClick: () => void
    hasError: boolean
}

export interface CostModuleStateType extends Pick<ClusterDetailListType['costModuleConfig'], 'enabled'> {
    config: ClusterDetailListType['costModuleConfig']['config']
}
