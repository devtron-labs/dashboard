import { ClusterStatusType } from '@devtron-labs/devtron-fe-common-lib'

interface MapData {
    name: string
    value: number
    status: Extract<ClusterStatusType, ClusterStatusType.HEALTHY | ClusterStatusType.UNHEALTHY>
    href?: string
}

export interface ClusterTreeMapData {
    id: number
    label?: string
    data: MapData[]
}

export interface ClusterMapProps {
    isLoading?: boolean
    treeMapData: ClusterTreeMapData[]
}
