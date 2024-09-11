import { TagType } from '@devtron-labs/devtron-fe-common-lib'

import { ClusterNamespacesDTO } from '../clustersAndEnvironments.types'

export interface GlobalEnvironmentProps {
    environmentName: string
    namespace: string
    id: string
    clusterId: number
    prometheusEndpoint: string
    isProduction: boolean
    description: string
    reload: () => void
    hideClusterDrawer: () => void
    isVirtual: boolean
}

export interface GlobalEnvironmentFormProps {
    environmentName: string
    namespace: string
    isProduction: boolean
    description: string
}

export type GetGlobalEnvironmentUpdatePayloadType = Pick<
    GlobalEnvironmentProps,
    'clusterId' | 'id' | 'prometheusEndpoint' | 'isVirtual'
> &
    Pick<ClusterNamespacesDTO, 'resourceVersion'> & { data: GlobalEnvironmentFormProps; namespaceLabels: TagType[] }
