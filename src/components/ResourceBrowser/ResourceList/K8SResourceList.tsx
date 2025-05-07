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

import { useMemo, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getAIAnalyticsEvents } from 'src/Shared'

import {
    abortPreviousRequests,
    getIsRequestAborted,
    Nodes,
    useAsync,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { getPodRestartRBACPayload } from '@Components/v2/appDetails/k8Resource/nodeDetail/nodeDetail.api'

import { importComponentFromFELibrary } from '../../common/helpers/Helpers'
import { SIDEBAR_KEYS } from '../Constants'
import { cacheResult, getResourceData } from '../ResourceBrowser.service'
import { K8SResourceListType } from '../Types'
import { removeDefaultForStorageClass, sortEventListData } from '../Utils'
import BaseResourceList from './BaseResourceList'
import { ResourceListURLParams } from './types'

const PodRestart = importComponentFromFELibrary('PodRestart')
const getFilterOptionsFromSearchParams = importComponentFromFELibrary(
    'getFilterOptionsFromSearchParams',
    null,
    'function',
)

interface K8sResourceListFilterType {
    selectedNamespace: string
}

const parseK8sResourceListSearchParams = (searchParams: URLSearchParams): K8sResourceListFilterType => {
    const namespace = searchParams.get('namespace')
    const selectedNamespace = namespace ?? 'all'
    return { selectedNamespace }
}

export const K8SResourceList = ({
    selectedResource,
    selectedCluster,
    addTab,
    renderRefreshBar,
    updateK8sResourceTab,
    clusterName,
    lowercaseKindToResourceGroupMap,
}: K8SResourceListType) => {
    // HOOKS
    const location = useLocation()
    const { clusterId, kind, group } = useParams<ResourceListURLParams>()

    // STATES
    const { selectedNamespace } = useUrlFilters<string, K8sResourceListFilterType>({
        parseSearchParams: parseK8sResourceListSearchParams,
    })

    // REFS
    const abortControllerRef = useRef(new AbortController())

    /* NOTE: _filters is an object */
    const _filters = getFilterOptionsFromSearchParams?.(location.search)
    const filters = useMemo(() => _filters, [JSON.stringify(_filters)])

    const [resourceListLoader, _resourceList, _resourceListDataError, reloadResourceListData] = useAsync(
        () =>
            abortPreviousRequests(async () => {
                if (selectedResource) {
                    return cacheResult(
                        location.pathname,
                        getResourceData({
                            selectedResource,
                            selectedNamespace,
                            clusterId,
                            filters,
                            abortControllerRef,
                        }),
                    )
                }

                return null
            }, abortControllerRef),
        [selectedResource, clusterId, selectedNamespace, filters],
    )

    const resourceListDataError = getIsRequestAborted(_resourceListDataError) ? null : _resourceListDataError

    const resourceList = useMemo(() => {
        if (!_resourceList) {
            return null
        }
        const result = structuredClone(_resourceList.result)
        switch (selectedResource?.gvk.Kind) {
            case SIDEBAR_KEYS.eventGVK.Kind:
                result.data = sortEventListData(result.data)
                break
            case Nodes.StorageClass:
                result.data = removeDefaultForStorageClass(result.data)
                break
            default:
                break
        }
        // NOTE: for namespaced resource name+namespace will be unique
        // while for non-namespaced resources name will be unique
        result.data = (result.data ?? []).map((data, index) => ({
            id: `${selectedResource?.gvk?.Kind}-${data.name}-${data.namespace}-${index}`,
            ...data,
        }))
        return result
    }, [_resourceList])

    return (
        <BaseResourceList
            isLoading={resourceListLoader}
            resourceListError={resourceListDataError}
            resourceList={resourceList}
            clusterId={clusterId}
            clusterName={clusterName}
            selectedResource={selectedResource}
            reloadResourceListData={reloadResourceListData}
            selectedNamespace={selectedNamespace}
            selectedCluster={selectedCluster}
            renderRefreshBar={renderRefreshBar}
            updateK8sResourceTab={updateK8sResourceTab}
            nodeType={kind}
            group={group}
            addTab={addTab}
            hideBulkSelection={!getFilterOptionsFromSearchParams} // NOTE: hideBulkSelection if fe-lib not linked
            lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
        >
            {PodRestart && (
                <PodRestart
                    aiWidgetAnalyticsEvent={getAIAnalyticsEvents('RB_POD_RESTART')}
                    rbacPayload={getPodRestartRBACPayload()}
                />
            )}
        </BaseResourceList>
    )
}
