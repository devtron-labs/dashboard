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
    RBBulkOperationType,
    TableCellComponentProps,
    TableViewWrapperProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { ClusterListType } from '@Components/ClusterNodes/types'
import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'
import { NodeDetailPropsType } from '@Components/v2/appDetails/appDetails.type'

import { NODE_K8S_VERSION_FILTER_KEY } from '../Constants'
import { ClusterDetailBaseParams, K8SResourceListType, NODE_SEARCH_KEYS } from '../Types'

export interface ClusterUpgradeCompatibilityInfoProps
    extends Pick<UseTabsReturnType, 'addTab'>,
        Pick<ClusterListType, 'updateTabUrl'> {
    clusterName: string
}

export interface ResourceListUrlFiltersType {
    targetK8sVersion: string
}

export type BulkOperationsModalState = RBBulkOperationType | 'closed'

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
    extends Pick<
            UseTabsReturnType,
            'removeTabByIdentifier' | 'updateTabUrl' | 'getTabId' | 'markTabActiveById' | 'addTab'
        >,
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
}

export interface K8SResourceListViewWrapperProps
    extends TableViewWrapperProps,
        Pick<
            K8SResourceListType,
            'selectedCluster' | 'selectedResource' | 'updateK8sResourceTab' | 'renderRefreshBar'
        > {
    selectedNamespace: string
}

export interface K8sResourceListTableCellComponentProps
    extends TableCellComponentProps,
        Pick<
            K8SResourceListType,
            'selectedCluster' | 'selectedResource' | 'addTab' | 'lowercaseKindToResourceGroupMap'
        > {}
