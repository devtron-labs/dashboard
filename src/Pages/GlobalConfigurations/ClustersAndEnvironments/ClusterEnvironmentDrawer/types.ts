import { TagType } from '@devtron-labs/devtron-fe-common-lib'

export interface ClusterEnvironmentDrawerFormProps {
    environmentName: string
    namespace: string
    isProduction: boolean
    description: string
}

export interface ClusterEnvironmentDrawerProps extends ClusterEnvironmentDrawerFormProps {
    id: string
    clusterId: number
    prometheusEndpoint: string
    reload: () => void
    hideClusterDrawer: () => void
    isVirtual: boolean
}

export type GetClusterEnvironmentUpdatePayloadType = Pick<
    ClusterEnvironmentDrawerProps,
    'clusterId' | 'id' | 'prometheusEndpoint' | 'isVirtual'
> &
    Partial<Pick<ClusterNamespacesDTO, 'resourceVersion'>> & {
        data: ClusterEnvironmentDrawerFormProps
        namespaceLabels?: TagType[]
    }

export interface ClusterNamespacesLabel {
    key: string
    value: string
}

export interface ClusterNamespacesDTO {
    name: string
    labels: ClusterNamespacesLabel[]
    resourceVersion: string
}

export interface EnvironmentDeleteComponentProps {
    environmentName: string
    onDelete: () => void
    reload: () => void
    showConfirmationModal: boolean
    closeConfirmationModal: () => void
}
