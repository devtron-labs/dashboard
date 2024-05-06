import React, { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAsync, abortPreviousRequests } from '@devtron-labs/devtron-fe-common-lib'
import { K8SResourceTabComponentProps, URLParams } from '../Types'
import { getResourceGroupList } from '../ResourceBrowser.service'
import { SIDEBAR_KEYS } from '../Constants'
import Sidebar from './Sidebar'
import { K8SResourceList } from './K8SResourceList'
import ConnectingToClusterState from './ConnectingToClusterState'
import NodeDetailsList from '../../ClusterNodes/NodeDetailsList'
import '../ResourceBrowser.scss'

const K8SResourceTabComponent = ({
    selectedCluster,
    renderRefreshBar,
    isSuperAdmin,
    addTab,
    showStaleDataWarning,
    updateK8sResourceTab,
    updateK8sResourceTabLastSyncMoment,
    enableShortcut,
}: K8SResourceTabComponentProps) => {
    const { clusterId } = useParams<URLParams>()
    const [selectedResource, setSelectedResource] = useState({
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

    const errorMessage = error?.errors?.[0]?.userMessage || error?.['message'] || null

    if (loading || error) {
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
                updateK8sResourceTab={updateK8sResourceTab}
                updateK8sResourceTabLastSyncMoment={updateK8sResourceTabLastSyncMoment}
                enableShortcut={enableShortcut}
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
                    renderRefreshBar={renderRefreshBar}
                    showStaleDataWarning={showStaleDataWarning}
                    updateK8sResourceTab={updateK8sResourceTab}
                    enableShortcut={enableShortcut}
                />
            )}
        </div>
    )
}

export default K8SResourceTabComponent
