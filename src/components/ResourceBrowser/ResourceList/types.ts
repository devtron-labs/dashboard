import { K8sResourceDetailType, ServerErrors, ALL_NAMESPACE_OPTION } from '@devtron-labs/devtron-fe-common-lib'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import { ClusterListType } from '@Components/ClusterNodes/types'
import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'
import {
    K8SResourceListType,
    ResourceBrowserActionMenuType,
    ResourceFilterOptionsProps,
    SidebarType,
    URLParams,
} from '../Types'

export interface BaseResourceListProps
    extends Partial<Pick<ResourceFilterOptionsProps, 'areFiltersHidden' | 'searchPlaceholder'>>,
        Pick<ResourceBrowserActionMenuType, 'hideDeleteResource'>,
        Pick<
            K8SResourceListType,
            | 'addTab'
            | 'isOpen'
            | 'renderRefreshBar'
            | 'selectedCluster'
            | 'selectedResource'
            | 'showStaleDataWarning'
            | 'clusterName'
            | 'setWidgetEventDetails'
            | 'handleResourceClick'
            | 'lowercaseKindToResourceGroupMap'
        >,
        Pick<SidebarType, 'updateK8sResourceTab'>,
        Pick<URLParams, 'nodeType' | 'group'> {
    isLoading: boolean
    resourceListError: ServerErrors
    resourceList: K8sResourceDetailType
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
}

export interface ClusterUpgradeCompatibilityInfoProps
    extends Pick<UseTabsReturnType, 'addTab'>,
        Pick<ClusterListType, 'updateTabUrl'>,
        Pick<
            BaseResourceListProps,
            'lowercaseKindToResourceGroupMap' | 'clusterId' | 'clusterName' | 'selectedCluster' | 'handleResourceClick'
        > {}

export interface ResourceListUrlFiltersType {
    targetK8sVersion: string
}

export type BulkOperationType = 'restart' | 'delete'

export type BulkOperationsModalState = BulkOperationType | 'closed'
