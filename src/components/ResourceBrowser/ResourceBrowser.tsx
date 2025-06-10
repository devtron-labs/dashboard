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
    ClusterStatusType,
    DevtronProgressing,
    ErrorScreenManager,
    PageHeader,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { DEFAULT_CLUSTER_ID } from '@Components/cluster/cluster.type'
import { ClusterListView } from '@Components/ClusterNodes/ClusterList'

import { sortObjectArrayAlphabetically } from '../common'
import { renderNewClusterButton } from './PageHeader.buttons'
import { getClusterListing, getPodAndPVCResourcesStatus } from './ResourceBrowser.service'
import { ResourceStatusFilter } from './Types'

const ResourceBrowser: React.FC = () => {
    const parentRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const [detailClusterListLoading, detailClusterListRes, , reloadDetailClusterList] = useAsync(() =>
        Promise.all([
            getClusterListing(false, abortControllerRef),
            // TODO: this api call is be to removed after airtel demo
            getPodAndPVCResourcesStatus(1),
        ]),
    )
    const [initialLoading, clusterListMinData, error] = useAsync(() => getClusterListing(true, abortControllerRef))

    const [detailClusterList, podAndPVCResourcesStatus] = detailClusterListRes ?? []

    useEffect(
        () => () => {
            abortControllerRef.current.abort()
        },
        [],
    )

    const sortedClusterList: ClusterDetail[] = useMemo(
        () =>
            sortObjectArrayAlphabetically(detailClusterList || clusterListMinData || [], 'name')
                .filter(
                    (option) =>
                        !(window._env_.HIDE_DEFAULT_CLUSTER && option.id === DEFAULT_CLUSTER_ID) &&
                        !option.isVirtualCluster,
                )
                // TODO: this logic is be to removed after airtel demo
                .map<ClusterDetail>((item) => {
                    const resourcesErrors = Object.values(podAndPVCResourcesStatus ?? {}).filter(
                        (status) => status === ResourceStatusFilter.ERROR,
                    )

                    return {
                        ...item,
                        nodeErrors: resourcesErrors.map(
                            (resourcesError, index) => ({ [`error-${index}`]: resourcesError }),
                            {},
                        ),
                        status: resourcesErrors ? ClusterStatusType.UNHEALTHY : item.status,
                    }
                }),
        [detailClusterList, clusterListMinData, podAndPVCResourcesStatus],
    )

    const renderContent = () => {
        if (error) {
            return <ErrorScreenManager code={error.code} />
        }

        return (
            <ClusterListView
                parentRef={parentRef}
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
        <div className="flexbox-col h-100 bg__primary" ref={parentRef}>
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
