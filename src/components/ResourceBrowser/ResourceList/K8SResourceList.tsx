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

import { useAsync, abortPreviousRequests, Nodes, getIsRequestAborted } from '@devtron-labs/devtron-fe-common-lib'
import { useMemo, useRef, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { getPodRestartRBACPayload } from '@Components/v2/appDetails/k8Resource/nodeDetail/nodeDetail.api'
import { importComponentFromFELibrary } from '../../common/helpers/Helpers'
import { ALL_NAMESPACE_OPTION, SIDEBAR_KEYS } from '../Constants'
import { getResourceData } from '../ResourceBrowser.service'
import { K8SResourceListType, URLParams } from '../Types'
import { sortEventListData, removeDefaultForStorageClass } from '../Utils'
import BaseResourceList from './BaseResourceList'

const PodRestart = importComponentFromFELibrary('PodRestart')
const getFilterOptionsFromSearchParams = importComponentFromFELibrary(
    'getFilterOptionsFromSearchParams',
    null,
    'function',
)

export const K8SResourceList = ({
    selectedResource,
    selectedCluster,
    addTab,
    renderRefreshBar,
    isOpen,
    showStaleDataWarning,
    updateK8sResourceTab,
    setWidgetEventDetails,
    handleResourceClick,
    clusterName,
    lowercaseKindToResourceGroupMap,
}: K8SResourceListType) => {
    // HOOKS
    const location = useLocation()
    const { clusterId, nodeType, group } = useParams<URLParams>()

    // STATES
    const [selectedNamespace, setSelectedNamespace] = useState(ALL_NAMESPACE_OPTION)

    // REFS
    const abortControllerRef = useRef(new AbortController())

    /* NOTE: _filters is an object */
    const _filters = getFilterOptionsFromSearchParams?.(location.search)
    const filters = useMemo(() => _filters, [JSON.stringify(_filters)])

    const [resourceListLoader, _resourceList, _resourceListDataError, reloadResourceListData] = useAsync(
        () =>
            abortPreviousRequests(
                async () =>
                    getResourceData({ selectedResource, selectedNamespace, clusterId, filters, abortControllerRef }),
                abortControllerRef,
            ),
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
        result.data = result.data.map((data, index) => ({ id: index, ...data }))
        return result
    }, [_resourceList])

    return (
        <BaseResourceList
            isLoading={resourceListLoader}
            resourceListError={resourceListDataError}
            resourceList={resourceList}
            clusterId={clusterId}
            clusterName={clusterName}
            showStaleDataWarning={showStaleDataWarning}
            selectedResource={selectedResource}
            reloadResourceListData={reloadResourceListData}
            selectedNamespace={selectedNamespace}
            setSelectedNamespace={setSelectedNamespace}
            selectedCluster={selectedCluster}
            isOpen={isOpen}
            renderRefreshBar={renderRefreshBar}
            updateK8sResourceTab={updateK8sResourceTab}
            nodeType={nodeType}
            group={group}
            addTab={addTab}
            hideBulkSelection={!getFilterOptionsFromSearchParams} // NOTE: hideBulkSelection if fe-lib not linked
            setWidgetEventDetails={setWidgetEventDetails}
            lowercaseKindToResourceGroupMap={lowercaseKindToResourceGroupMap}
            handleResourceClick={handleResourceClick}
        >
            {PodRestart && <PodRestart rbacPayload={getPodRestartRBACPayload()} />}
        </BaseResourceList>
    )
}
