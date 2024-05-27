import React, { useMemo } from 'react'
import {
    showError,
    getUserRole,
    DevtronProgressing,
    useAsync,
    PageHeader,
    ErrorScreenManager,
} from '@devtron-labs/devtron-fe-common-lib'
import { sortObjectArrayAlphabetically } from '../common'
import ClusterSelectionList from '../ClusterNodes/ClusterSelectionList'
import { getClusterList, getClusterListMin } from '../ClusterNodes/clusterNodes.service'
import { ClusterDetail } from '../ClusterNodes/types'
import { AddClusterButton } from './PageHeader.buttons'

const ResourceBrowser: React.FC = () => {
    const [detailClusterListLoading, detailClusterList, , reloadDetailClusterList] = useAsync(async () => {
        try {
            return await getClusterList()
        } catch (err) {
            showError(err)
            return null
        }
    })
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

    const renderContent = () => {
        if (error) {
            return <ErrorScreenManager code={error.code} />
        }

        return (
            <ClusterSelectionList
                clusterOptions={sortedClusterList}
                isSuperAdmin={isSuperAdmin}
                clusterListLoader={detailClusterListLoading}
                refreshData={reloadDetailClusterList}
            />
        )
    }

    if (initialLoading) {
        return <DevtronProgressing parentClasses="h-100 flex bcn-0" classes="icon-dim-80" />
    }

    return (
        <div className="resource-browser-container h-100 bcn-0">
            <PageHeader
                isBreadcrumbs={false}
                headerName="Kubernetes Resource Browser"
                renderActionButtons={AddClusterButton}
            />
            {renderContent()}
        </div>
    )
}

export default ResourceBrowser
