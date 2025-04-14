import { ClusterDetail } from '@devtron-labs/devtron-fe-common-lib'

export interface ClusterViewType {
    clusterOptions: ClusterDetail[]
    clusterListLoader: boolean
    initialLoading: boolean
    refreshData: () => void
}

export interface ClusterListTypes {
    filteredList: ClusterDetail[]
    clusterListLoader: boolean
    showKubeConfigModal: boolean
    onChangeShowKubeConfigModal: () => void
    setSelectedClusterName: React.Dispatch<React.SetStateAction<string>>
}
export interface ClusterListRowTypes extends Omit<ClusterListTypes, 'filteredList'> {
    clusterData: ClusterDetail
}

export interface ClusterSelectionBodyTypes extends ClusterViewType {
    filteredList: ClusterDetail[]
}
