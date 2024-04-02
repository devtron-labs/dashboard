import React, { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { showError, getUserRole, DevtronProgressing, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import PageHeader from '../common/header/PageHeader'
import { sortObjectArrayAlphabetically } from '../common'
import { ALL_NAMESPACE_OPTION, K8S_EMPTY_GROUP, SIDEBAR_KEYS } from './Constants'
import ClusterSelectionList from '../ClusterNodes/ClusterSelectionList'
import { getClusterList, getClusterListMin } from '../ClusterNodes/clusterNodes.service'
import { ClusterDetail } from '../ClusterNodes/types'
import { URLS } from '../../config'
import { addClusterButton } from './PageHeader.buttons'
import './ResourceBrowser.scss'

const ResourceBrowser: React.FC<Record<string, never>> = () => {
    const { push } = useHistory()
    const [detailClusterListLoading, detailClusterList, detailClusterListError, reloadDetailClusterList] =
        useAsync(getClusterList)
    const [initialLoading, data, error] = useAsync(() =>
        Promise.all([getClusterListMin(), window._env_?.K8S_CLIENT ? null : getUserRole()]),
    )
    /* transpose the data */
    const [clusterListMinData = null, userRoleData = null] = data || []

    const sortedClusterList: ClusterDetail[] = useMemo(
        () =>
            sortObjectArrayAlphabetically(
                detailClusterList?.result || clusterListMinData?.result || [],
                'name',
            ) as ClusterDetail[],
        [detailClusterList, clusterListMinData],
    )

    const isSuperAdmin = userRoleData?.result.superAdmin || false

    const onClusterSelection = (selected): void => {
        const url = `${URLS.RESOURCE_BROWSER}/${selected.value}/${ALL_NAMESPACE_OPTION.value}/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`
        push(url)
    }

    if (error || detailClusterListError) {
        showError(error || detailClusterListError)
    }

    return (
        <div className="resource-browser-container h-100 bcn-0">
            <PageHeader
                isBreadcrumbs={false}
                headerName="Kubernetes Resource Browser"
                renderActionButtons={addClusterButton}
            />
            {initialLoading ? (
                <div style={{ height: 'calc(100vh - 48px)' }}>
                    <DevtronProgressing parentClasses="h-100 flex bcn-0" classes="icon-dim-80" />
                </div>
            ) : (
                <ClusterSelectionList
                    clusterOptions={sortedClusterList}
                    onClusterSelection={onClusterSelection}
                    isSuperAdmin={isSuperAdmin}
                    clusterListLoader={detailClusterListLoading}
                    refreshData={reloadDetailClusterList}
                />
            )}
        </div>
    )
}

export default ResourceBrowser
