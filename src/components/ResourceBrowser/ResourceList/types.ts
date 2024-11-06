import { useTabs } from '@Components/common/DynamicTabs'
import { ServerErrors } from '@devtron-labs/devtron-fe-common-lib'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import {
    ClusterOptionType,
    K8SResourceListType,
    ResourceBrowserActionMenuType,
    ResourceDetailType,
    ResourceFilterOptionsProps,
    URLParams,
} from '../Types'
import { ALL_NAMESPACE_OPTION } from '../Constants'

export interface BaseResourceListProps
    extends Partial<Pick<ResourceFilterOptionsProps, 'areFiltersHidden' | 'searchPlaceholder'>>,
        Pick<ResourceBrowserActionMenuType, 'hideDeleteResource'>,
        Pick<
            K8SResourceListType,
            | 'addTab'
            | 'isOpen'
            | 'renderRefreshBar'
            | 'updateK8sResourceTab'
            | 'selectedCluster'
            | 'selectedResource'
            | 'showStaleDataWarning'
            | 'clusterName'
        >,
        Pick<URLParams, 'nodeType' | 'group'> {
    isLoading: boolean
    resourceListError: ServerErrors
    resourceList: ResourceDetailType
    clusterId: string
    reloadResourceListData: () => void
    selectedNamespace: typeof ALL_NAMESPACE_OPTION
    setSelectedNamespace: Dispatch<SetStateAction<typeof ALL_NAMESPACE_OPTION>>
    children?: ReactNode
    showGenericNullState?: boolean
    hideBulkSelection?: boolean
}

export interface ClusterUpgradeCompatibilityInfoProps
    extends Pick<ReturnType<typeof useTabs>, 'addTab' | 'updateTabUrl'> {
    clusterId: string
    clusterName: string
    selectedCluster: ClusterOptionType
}
