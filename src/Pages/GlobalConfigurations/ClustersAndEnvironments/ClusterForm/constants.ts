import { ClusterConfigTabEnum, ClusterFormKeys } from './types'

export const CLUSTER_CONFIG_TAB_TO_ERROR_KEY_MAP: Record<ClusterConfigTabEnum, ClusterFormKeys[]> = {
    [ClusterConfigTabEnum.APPLICATION_MONITORING]: [],
    [ClusterConfigTabEnum.CLUSTER_CONFIG]: ['cluster_name', 'url', 'token'],
    [ClusterConfigTabEnum.COST_VISIBILITY]: [],
}
