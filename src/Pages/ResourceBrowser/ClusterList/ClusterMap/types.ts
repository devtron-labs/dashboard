import { ClusterStatusType } from '@Components/ClusterNodes/types'

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
    treeMapData: ClusterTreeMapData[]
}
