import { useTabs } from '@Components/common/DynamicTabs'
import { ApiResourceGroupType, ServerErrors } from '@devtron-labs/devtron-fe-common-lib'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import {
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
    /**
     * If true, the kind from the API is used instead of the selected resource
     *
     * @default false
     */
    shouldOverrideSelectedResourceKind?: boolean
    k8SObjectMapRaw?: ApiResourceGroupType[]
}

export interface ClusterUpgradeCompatibilityInfoProps
    extends Pick<ReturnType<typeof useTabs>, 'addTab' | 'updateTabUrl'>,
        Pick<BaseResourceListProps, 'k8SObjectMapRaw' | 'clusterId' | 'clusterName' | 'selectedCluster'> {}
