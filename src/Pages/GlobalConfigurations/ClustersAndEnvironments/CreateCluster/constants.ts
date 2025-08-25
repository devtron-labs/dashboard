import { CreateClusterTypeEnum } from './types'

export const CREATE_CLUSTER_TITLE: Record<CreateClusterTypeEnum, string> = {
    [CreateClusterTypeEnum.CONNECT_USING_SERVER_URL]: 'Connect Kubernetes Cluster',
    [CreateClusterTypeEnum.CONNECT_USING_KUBECONFIG]: 'Connect Kubernetes Cluster',
    [CreateClusterTypeEnum.CREATE_CLUSTER]: 'Create Kubernetes Cluster',
    [CreateClusterTypeEnum.ADD_ISOLATED_CLUSTER]: 'Create Isolated Cluster',
}
