import { useTabs } from '@Components/common/DynamicTabs'
import { ClusterOptionType } from '../Types'

export interface ClusterUpgradeCompatibilityInfoProps
    extends Pick<ReturnType<typeof useTabs>, 'addTab' | 'updateTabUrl'> {
    clusterId: string
    selectedCluster: ClusterOptionType
}
