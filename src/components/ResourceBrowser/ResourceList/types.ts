import { ClusterOptionType } from '../Types'

export interface ClusterUpgradeCompatibilityInfoProps {
    clusterId: string
    selectedCluster: ClusterOptionType
    updateTabUrl: (url: string, dynamicTitle?: string) => void
}
