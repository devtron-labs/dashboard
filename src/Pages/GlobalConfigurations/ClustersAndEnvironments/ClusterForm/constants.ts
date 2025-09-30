import { ClusterConfigTabEnum, ClusterFormKeys } from './types'

const PROMETHEUS_ERROR_KEYS: ClusterFormKeys[] = [
    'authType',
    'userName',
    'password',
    'prometheusTlsClientKey',
    'prometheusTlsClientCert',
    'endpoint',
]

export const CLUSTER_CONFIG_TAB_TO_ERROR_KEY_MAP: Record<ClusterConfigTabEnum, ClusterFormKeys[]> = {
    [ClusterConfigTabEnum.APPLICATION_MONITORING]: PROMETHEUS_ERROR_KEYS,
    [ClusterConfigTabEnum.CLUSTER_CONFIG]: [
        'cluster_name',
        'url',
        'proxyUrl',
        'sshUsername',
        'sshPassword',
        'sshAuthKey',
        'sshServerAddress',
        'tlsClientKey',
        'tlsClientCert',
        'certificateAuthorityData',
        'token',
    ],
    [ClusterConfigTabEnum.COST_VISIBILITY]: PROMETHEUS_ERROR_KEYS,
}
