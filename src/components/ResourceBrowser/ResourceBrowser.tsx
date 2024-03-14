import React, { useMemo } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { showError, getUserRole, DevtronProgressing, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import PageHeader from '../common/header/PageHeader'
import { sortObjectArrayAlphabetically } from '../common'
import { ALL_NAMESPACE_OPTION, K8S_EMPTY_GROUP, SIDEBAR_KEYS } from './Constants'
import { URLS } from '../../config'
import ClusterSelectionList from '../ClusterNodes/ClusterSelectionList'
import { getClusterList, getClusterListMin } from '../ClusterNodes/clusterNodes.service'
import { ClusterDetail } from '../ClusterNodes/types'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import './ResourceBrowser.scss'

const addClusterButton = () => (
    /* funcs returning JSX should be memoized if declared inside react func body
     * thus declaring it outside to avoid using useCallback */
    <>
        <NavLink
            className="flex dc__no-decor cta small h-28 pl-8 pr-10 pt-5 pb-5 lh-n fcb-5 mr-16"
            to={URLS.GLOBAL_CONFIG_CLUSTER}
        >
            <Add data-testid="add_cluster_button" className="icon-dim-16 mr-4 fcb-5 dc__vertical-align-middle" />
            Add cluster
        </NavLink>
        <span className="dc__divider" />
    </>
)

const ResourceBrowser: React.FC<Record<string, never>> = () => {
    const { push } = useHistory()

    /* this list is to be used by ClusterSelectionList to refresh on demand;
     * thus not immediately fetching results, it will only run when reloadClusterList is called */
    const [clusterListLoading, clusterList, clusterListError, reloadClusterList] = useAsync(getClusterList)
    const [initialLoading, data, error] = useAsync(() =>
        Promise.all([getClusterListMin(), window._env_.K8S_CLIENT ? null : getUserRole()]),
    )
    /* transpose the data */
    const [clusterListData, userRoleData] = data || []

    const sortedClusterList: ClusterDetail[] = useMemo(
        () =>
            sortObjectArrayAlphabetically(
                clusterList?.result || clusterListData?.result || [],
                'name',
            ) as ClusterDetail[],
        [clusterListLoading, initialLoading],
    )

    const onChangeCluster = (selected): void => {
        const url = `${URLS.RESOURCE_BROWSER}/${selected.value}/${ALL_NAMESPACE_OPTION.value}/${SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()}/${K8S_EMPTY_GROUP}`
        push(url)
    }

    if (error || clusterListError) {
        showError(error || clusterListError)
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
                    onChangeCluster={onChangeCluster}
                    isSuperAdmin={userRoleData?.result.superAdmin || false}
                    clusterListLoader={clusterListLoading}
                    refreshData={reloadClusterList}
                />
            )}
        </div>
    )
}

export default ResourceBrowser
