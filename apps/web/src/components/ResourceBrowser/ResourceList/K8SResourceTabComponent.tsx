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

import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAsync, abortPreviousRequests, ApiResourceGroupType } from '@devtron-labs/devtron-fe-common-lib'
import { K8SResourceTabComponentProps, URLParams } from '../Types'
import { getResourceGroupList } from '../ResourceBrowser.service'
import { SIDEBAR_KEYS } from '../Constants'
import Sidebar from './Sidebar'
import { K8SResourceList } from './K8SResourceList'
import ConnectingToClusterState from './ConnectingToClusterState'
import NodeDetailsList from '../../ClusterNodes/NodeDetailsList'

const K8SResourceTabComponent = ({
    selectedCluster,
    renderRefreshBar,
    isSuperAdmin,
    addTab,
    isOpen,
    showStaleDataWarning,
    updateK8sResourceTab,
    updateK8sResourceTabLastSyncMoment,
}: K8SResourceTabComponentProps) => {
    const { clusterId } = useParams<URLParams>()
    const [selectedResource, setSelectedResource] = useState<ApiResourceGroupType>({
        gvk: SIDEBAR_KEYS.nodeGVK,
        namespaced: false,
        isGrouped: false,
    })

    const abortControllerRef = useRef(new AbortController())

    const [loading, k8SObjectMap, error, reload] = useAsync(
        () =>
            abortPreviousRequests(
                () => getResourceGroupList(clusterId, abortControllerRef.current?.signal),
                abortControllerRef,
            ),
        [clusterId],
    )

    const errorMessage = error?.errors?.[0]?.userMessage || error?.message || null

    if (loading || (error && error.code !== 403)) {
        return (
            <ConnectingToClusterState
                loader={loading}
                errorMsg={errorMessage}
                selectedCluster={selectedCluster}
                handleRetry={reload}
                requestAbortController={abortControllerRef.current}
            />
        )
    }

    return (
        <div className="resource-browser bcn-0">
            <Sidebar
                apiResources={k8SObjectMap?.result.apiResources || null}
                selectedResource={selectedResource}
                setSelectedResource={setSelectedResource}
                isOpen={isOpen}
                updateK8sResourceTab={updateK8sResourceTab}
                updateK8sResourceTabLastSyncMoment={updateK8sResourceTabLastSyncMoment}
            />
            {/* NOTE: if we directly use nodeType for this check
             * component will mount/dismount on every tab change */}
            {selectedResource?.gvk.Kind === SIDEBAR_KEYS.nodeGVK.Kind ? (
                <NodeDetailsList
                    isSuperAdmin={isSuperAdmin}
                    addTab={addTab}
                    renderRefreshBar={renderRefreshBar}
                    showStaleDataWarning={showStaleDataWarning}
                />
            ) : (
                <K8SResourceList
                    selectedResource={selectedResource}
                    selectedCluster={selectedCluster}
                    addTab={addTab}
                    isOpen={isOpen}
                    renderRefreshBar={renderRefreshBar}
                    showStaleDataWarning={showStaleDataWarning}
                    updateK8sResourceTab={updateK8sResourceTab}
                />
            )}
        </div>
    )
}

export default K8SResourceTabComponent
