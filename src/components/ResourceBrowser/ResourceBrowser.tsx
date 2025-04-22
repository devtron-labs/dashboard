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
    ClusterDetail,
    DevtronProgressing,
    ErrorScreenManager,
    PageHeader,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { DEFAULT_CLUSTER_ID } from '@Components/cluster/cluster.type'
import { ClusterListView } from '@Components/ClusterNodes/ClusterList'

import { sortObjectArrayAlphabetically } from '../common'
import { renderNewClusterButton } from './PageHeader.buttons'
import { getClusterListing } from './ResourceBrowser.service'

const ResourceBrowser: React.FC = () => {
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const [detailClusterListLoading, detailClusterList, , reloadDetailClusterList] = useAsync(() =>
        getClusterListing(false, abortControllerRef),
    )
    const [initialLoading, clusterListMinData, error] = useAsync(() => getClusterListing(true, abortControllerRef))

    useEffect(
        () => () => {
            abortControllerRef.current.abort()
        },
        [],
    )

    const sortedClusterList: ClusterDetail[] = useMemo(
        () =>
            sortObjectArrayAlphabetically(detailClusterList || clusterListMinData || [], 'name').filter(
                (option) =>
                    !(window._env_.HIDE_DEFAULT_CLUSTER && option.id === DEFAULT_CLUSTER_ID) &&
                    !option.isVirtualCluster,
            ),
        [detailClusterList, clusterListMinData],
    )

    const renderContent = () => {
        if (error) {
            return <ErrorScreenManager code={error.code} />
        }

        return (
            <ClusterListView
                clusterOptions={sortedClusterList}
                clusterListLoader={detailClusterListLoading}
                initialLoading={initialLoading}
                refreshData={reloadDetailClusterList}
            />
        )
    }

    if (initialLoading) {
        return <DevtronProgressing parentClasses="h-100 flex bg__primary" classes="icon-dim-80" />
    }

    return (
        <div className="flexbox-col h-100 bg__primary">
            <PageHeader
                isBreadcrumbs={false}
                headerName="Kubernetes Resource Browser"
                renderActionButtons={renderNewClusterButton(reloadDetailClusterList)}
            />
            {renderContent()}
        </div>
    )
}

export default ResourceBrowser
