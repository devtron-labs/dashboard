import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAsync, abortPreviousRequests } from '@devtron-labs/devtron-fe-common-lib'
import { ApiResourceGroupType, K8SResourceTabComponentProps, URLParams } from '../Types'
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
    markTerminalTabActive,
    updateK8sResourceTab,
    updateK8sResourceTabLastSyncMoment,
}: K8SResourceTabComponentProps) => {
    const { clusterId, nodeType } = useParams<URLParams>()
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

    useEffect(
        () =>
            nodeType !== SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase() &&
            k8SObjectMap &&
            setSelectedResource(
                (prev) =>
                    k8SObjectMap?.result.apiResources.find((item) => item.gvk.Kind.toLowerCase() === nodeType) || prev,
            ),
        [k8SObjectMap],
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
                    markTerminalTabActive={markTerminalTabActive}
                />
            ) : (
                <K8SResourceList
                    selectedResource={selectedResource}
                    selectedCluster={selectedCluster}
                    addTab={addTab}
                    renderRefreshBar={renderRefreshBar}
                    showStaleDataWarning={showStaleDataWarning}
                    updateK8sResourceTab={updateK8sResourceTab}
                />
            )}
        </div>
    )
}

export default K8SResourceTabComponent
