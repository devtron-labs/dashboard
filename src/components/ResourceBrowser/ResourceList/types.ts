/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    ApiResourceType,
    BaseRecentlyVisitedEntitiesTypes,
    FiltersTypeEnum,
    K8sResourceDetailDataType,
    ResponseType,
    ServerErrors,
    TableCellComponentProps,
    TableProps,
    TableViewWrapperProps,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import { ClusterListType } from '@Components/ClusterNodes/types'
import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'
import { NodeDetailPropsType } from '@Components/v2/appDetails/appDetails.type'

import { NODE_K8S_VERSION_FILTER_KEY } from '../Constants'
import {
    ClusterDetailBaseParams,
    ClusterOptionType,
    K8SResourceListType,
    NODE_SEARCH_KEYS,
    ResourceFilterOptionsProps,
} from '../Types'

export interface ClusterUpgradeCompatibilityInfoProps
    extends Pick<ClusterListType, 'updateTabUrl'>,
        Pick<K8SResourceListType, 'lowercaseKindToResourceGroupMap'> {
    clusterName: string
}

export interface ResourceListUrlFiltersType {
    targetK8sVersion: string
}

export interface K8sResourceListURLParams extends ClusterDetailBaseParams {
    version: string
    kind: string
    group: string
}

export interface K8sResourceDetailURLParams extends K8sResourceListURLParams {
    name: string
    namespace: string
}

export interface NodeDetailComponentWrapperProps
    extends Pick<UseTabsReturnType, 'removeTabByIdentifier' | 'updateTabUrl' | 'getTabId'>,
        Omit<NodeDetailPropsType, 'updateTabUrl' | 'removeTabByIdentifier'> {
    clusterName: string
}
export interface NodeDetailURLParams {
    name: string
}

export interface K8sResourceListFilterType
    extends Record<(typeof NODE_SEARCH_KEYS)[keyof typeof NODE_SEARCH_KEYS], string> {
    selectedNamespace?: string
    [NODE_K8S_VERSION_FILTER_KEY]?: string
    eventType: 'warning' | 'normal'
}

export interface AdminTerminalDummyProps
    extends Pick<UseTabsReturnType, 'markTabActiveById' | 'updateTabUrl' | 'getTabById'> {
    clusterName: string
}

export interface ResourcePageHeaderProps {
    breadcrumbs: ReturnType<typeof useBreadcrumb>['breadcrumbs']
    renderPageHeaderActionButtons?: () => JSX.Element
}

export interface ClusterListOptionsTypes {
    clusterList: ClusterOptionType[]
    inputValue: string
    recentlyVisitedResources: BaseRecentlyVisitedEntitiesTypes[]
    isInstallationStatusView?: boolean
}

// CLUSTER UPGRADE COMPATIBILITY INFO TABLE PROPS --------->
export type ClusterUpgradeCompatibilityInfoTableAdditionalProps = Pick<
    K8SResourceListType,
    'lowercaseKindToResourceGroupMap'
> & {
    reloadResourceListData: () => void
}

export type ClusterUpgradeCompatibilityInfoTableProps = TableProps<
    K8sResourceDetailDataType,
    FiltersTypeEnum.URL,
    ClusterUpgradeCompatibilityInfoTableAdditionalProps
>

export type ClusterUpgradeCompatibilityInfoTableWrapperProps = TableViewWrapperProps<
    K8sResourceDetailDataType,
    FiltersTypeEnum.URL,
    ClusterUpgradeCompatibilityInfoTableAdditionalProps
>

export type ClusterUpgradeCompatibilityInfoTableCellComponentProps = TableCellComponentProps<
    K8sResourceDetailDataType,
    FiltersTypeEnum.URL,
    ClusterUpgradeCompatibilityInfoTableAdditionalProps
>
// <--------- CLUSTER UPGRADE COMPATIBILITY INFO TABLE PROPS

// K8s RESOURCE LIST TABLE PROPS --------->
export interface K8sResourceListTableAdditionalProps
    extends Pick<
        K8SResourceListType,
        | 'selectedCluster'
        | 'selectedResource'
        | 'addTab'
        | 'lowercaseKindToResourceGroupMap'
        | 'clusterName'
        | 'renderRefreshBar'
    > {
    reloadResourceListData: () => void
    isNodeListing: boolean
    isEventListing: boolean
}

export type K8SResourceListViewWrapperProps = TableViewWrapperProps<
    K8sResourceDetailDataType,
    FiltersTypeEnum.URL,
    K8sResourceListTableAdditionalProps
> &
    Pick<K8sResourceListFilterType, 'selectedNamespace' | 'eventType'>

export type K8sResourceListTableCellComponentProps = TableCellComponentProps<
    K8sResourceDetailDataType,
    FiltersTypeEnum.URL,
    K8sResourceListTableAdditionalProps
>

export type K8sResourceListTableProps = TableProps<
    K8sResourceDetailDataType,
    FiltersTypeEnum.URL,
    K8sResourceListTableAdditionalProps
>
// <--------- K8s RESOURCE LIST TABLE PROPS

export type DynamicTabComponentWrapperProps = Pick<
    UseTabsReturnType,
    'updateTabUrl' | 'markTabActiveById' | 'getTabId' | 'getTabById'
> &
    ({ type: 'fixed'; addTab?: never } | { type: 'dynamic'; addTab: UseTabsReturnType['addTab'] }) & {
        children: React.ReactElement
    }

export interface ResourceRecommenderTableViewWrapperProps
    extends TableViewWrapperProps<
        unknown,
        FiltersTypeEnum.URL,
        ResourceFilterOptionsProps & {
            resourceListError: ServerErrors
            reloadResourceListData: () => void
        }
    > {}

export interface ResourceListProps {
    selectedCluster: ClusterOptionType
    k8SObjectMapRaw: ResponseType<ApiResourceType>
}
