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

import React, { useEffect, useMemo, useRef } from 'react'
import {
    showError,
    getUserRole,
    DevtronProgressing,
    useAsync,
    PageHeader,
    ErrorScreenManager,
    getIsRequestAborted,
} from '@devtron-labs/devtron-fe-common-lib'
import { DEFAULT_CLUSTER_ID } from '@Components/cluster/cluster.type'
import { sortObjectArrayAlphabetically } from '../common'
import ClusterSelectionList from '../ClusterNodes/ClusterSelectionList'
import { getClusterList, getClusterListMin } from '../ClusterNodes/clusterNodes.service'
import { ClusterDetail } from '../ClusterNodes/types'
import { AddClusterButton } from './PageHeader.buttons'

const ResourceBrowser: React.FC = () => {
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const [detailClusterListLoading, detailClusterList, , reloadDetailClusterList] = useAsync(async () => {
        try {
            return await getClusterList(abortControllerRef.current.signal)
        } catch (err) {
            if (!getIsRequestAborted(err)) {
                showError(err)
            }
            return null
        }
    })
    const [initialLoading, data, error] = useAsync(() =>
        Promise.all([getClusterListMin(), window._env_?.K8S_CLIENT ? null : getUserRole()]),
    )
    /* transpose the data */
    const [clusterListMinData = null, userRoleData = null] = data || []

    useEffect(
        () => () => {
            abortControllerRef.current.abort()
        },
        [],
    )

    const sortedClusterList: ClusterDetail[] = useMemo(
        () =>
            sortObjectArrayAlphabetically(detailClusterList?.result || clusterListMinData?.result || [], 'name').filter(
                (option) =>
                    !(window._env_.HIDE_DEFAULT_CLUSTER && option.id === DEFAULT_CLUSTER_ID) &&
                    !option.isVirtualCluster,
            ),
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
                initialLoading={initialLoading}
                refreshData={reloadDetailClusterList}
            />
        )
    }

    if (initialLoading) {
        return <DevtronProgressing parentClasses="h-100 flex bcn-0" classes="icon-dim-80" />
    }

    return (
        <div className="resource-browser-container flexbox-col h-100 bcn-0">
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
