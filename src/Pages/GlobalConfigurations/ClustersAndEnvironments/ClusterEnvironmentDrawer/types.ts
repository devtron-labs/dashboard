import { TagType } from '@devtron-labs/devtron-fe-common-lib'

import { ClusterNamespacesDTO } from '../clustersAndEnvironments.types'

export interface ClusterEnvironmentDrawerProps {
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

export interface ClusterEnvironmentDrawerFormProps {
    environmentName: string
    namespace: string
    isProduction: boolean
    description: string
}

export type GetClusterEnvironmentUpdatePayloadType = Pick<
    ClusterEnvironmentDrawerProps,
    'clusterId' | 'id' | 'prometheusEndpoint' | 'isVirtual'
> &
    Partial<Pick<ClusterNamespacesDTO, 'resourceVersion'>> & {
        data: ClusterEnvironmentDrawerFormProps
        namespaceLabels?: TagType[]
    }
