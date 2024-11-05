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

import { useMemo, useRef, useState } from 'react'
import { useHistory, useParams, useRouteMatch, useLocation } from 'react-router-dom'
import { useAsync, abortPreviousRequests, Nodes, getIsRequestAborted, noop } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '../../common/helpers/Helpers'
import { ALL_NAMESPACE_OPTION, K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../Constants'
import { getResourceList, getResourceListPayload } from '../ResourceBrowser.service'
import { K8SResourceListType, URLParams } from '../Types'
import { sortEventListData, removeDefaultForStorageClass } from '../Utils'
import { URLS } from '../../../config'
import { getPodRestartRBACPayload } from '../../v2/appDetails/k8Resource/nodeDetail/nodeDetail.api'
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
}: K8SResourceListType) => {
    // HOOKS
    const { push } = useHistory()
    const { url } = useRouteMatch()
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
                () =>
                    getResourceList(
                        getResourceListPayload(
                            clusterId,
                            selectedNamespace.value.toLowerCase(),
                            selectedResource,
                            filters,
                        ),
                        abortControllerRef.current.signal,
                    ),
                abortControllerRef,
            ),
        [selectedResource, clusterId, selectedNamespace, filters],
        selectedResource && selectedResource.gvk.Kind !== SIDEBAR_KEYS.nodeGVK.Kind,
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

    const handleResourceClick = (e) => {
        const { name, tab, namespace, origin } = e.currentTarget.dataset
        let resourceParam: string
        let kind: string
        let resourceName: string
        let _group: string
        const _namespace = namespace ?? ALL_NAMESPACE_OPTION.value
        if (origin === 'event') {
            const [_kind, _resourceName] = name.split('/')
            _group = selectedResource?.gvk.Group.toLowerCase() || K8S_EMPTY_GROUP
            resourceParam = `${_kind}/${_group}/${_resourceName}`
            kind = _kind
            resourceName = _resourceName
        } else {
            kind = selectedResource.gvk.Kind.toLowerCase()
            resourceParam = `${kind}/${selectedResource?.gvk?.Group?.toLowerCase() || K8S_EMPTY_GROUP}/${name}`
            resourceName = name
            _group = selectedResource?.gvk?.Group?.toLowerCase() || K8S_EMPTY_GROUP
        }

        const _url = `${URLS.RESOURCE_BROWSER}/${clusterId}/${_namespace}/${resourceParam}${
            tab ? `/${tab.toLowerCase()}` : ''
        }`
        const idPrefix = kind === 'node' ? `${_group}` : `${_group}_${_namespace}`
        addTab(idPrefix, kind, resourceName, _url)
            .then(() => push(_url))
            .catch(noop)
    }

    const handleNodeClick = (e) => {
        const { name } = e.currentTarget.dataset
        const _url = `${url.split('/').slice(0, -2).join('/')}/node/${K8S_EMPTY_GROUP}/${name}`
        addTab(K8S_EMPTY_GROUP, 'node', name, _url)
            .then(() => push(_url))
            .catch(noop)
    }

    return (
        <BaseResourceList
            isLoading={resourceListLoader}
            resourceListError={resourceListDataError}
            resourceList={resourceList}
            clusterId={clusterId}
            showStaleDataWarning={showStaleDataWarning}
            selectedResource={selectedResource}
            handleResourceClick={handleResourceClick}
            reloadResourceListData={reloadResourceListData}
            handleNodeClick={handleNodeClick}
            selectedNamespace={selectedNamespace}
            setSelectedNamespace={setSelectedNamespace}
            selectedCluster={selectedCluster}
            isOpen={isOpen}
            renderRefreshBar={renderRefreshBar}
            updateK8sResourceTab={updateK8sResourceTab}
            nodeType={nodeType}
            group={group}
        >
            {PodRestart && <PodRestart rbacPayload={getPodRestartRBACPayload()} />}
        </BaseResourceList>
    )
}
