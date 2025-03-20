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

import { K8sResourceDetailType, ServerErrors, RBBulkOperationType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactNode } from 'react'
import { ClusterListType } from '@Components/ClusterNodes/types'
import { UseTabsReturnType } from '@Components/common/DynamicTabs/types'
import { K8SResourceListType, ResourceBrowserActionMenuType, ResourceFilterOptionsProps, URLParams } from '../Types'

export interface BaseResourceListProps
    extends Partial<Pick<ResourceFilterOptionsProps, 'areFiltersHidden' | 'searchPlaceholder'>>,
        Pick<ResourceBrowserActionMenuType, 'hideDeleteResource'>,
        Pick<
            K8SResourceListType,
            | 'addTab'
            | 'renderRefreshBar'
            | 'selectedCluster'
            | 'selectedResource'
            | 'showStaleDataWarning'
            | 'clusterName'
            | 'setWidgetEventDetails'
            | 'handleResourceClick'
            | 'lowercaseKindToResourceGroupMap'
        >,
        Pick<URLParams, 'nodeType' | 'group'> {
    isLoading: boolean
    resourceListError: ServerErrors
    resourceList: K8sResourceDetailType
    clusterId: string
    reloadResourceListData: () => void
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
    extends Pick<UseTabsReturnType, 'addTab' | 'markTabActiveById' | 'getTabId'>,
        Pick<ClusterListType, 'updateTabUrl'>,
        Pick<
            BaseResourceListProps,
            'lowercaseKindToResourceGroupMap' | 'clusterId' | 'clusterName' | 'selectedCluster' | 'handleResourceClick'
        > {}

export interface ResourceListUrlFiltersType {
    targetK8sVersion: string
}

export type BulkOperationsModalState = RBBulkOperationType | 'closed'
