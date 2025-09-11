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
import { useLocation } from 'react-router-dom'

import {
    BreadCrumb,
    BreadcrumbText,
    ClusterDetail,
    DevtronProgressing,
    ErrorScreenManager,
    getInfrastructureManagementBreadcrumb,
    PageHeader,
    useAsync,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import { ClusterListView } from '@Components/ClusterNodes/ClusterList'
import { DEFAULT_CLUSTER_ID } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/cluster.type'

import { sortObjectArrayAlphabetically } from '../common'
import { KUBERNETES_RESOURCE_BROWSER_DESCRIPTION } from './Constants'
import { renderNewClusterButton } from './PageHeader.buttons'
import { getClusterListing } from './ResourceBrowser.service'

const ResourceBrowser: React.FC = () => {
    const parentRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController>(new AbortController())

    const [detailClusterListLoading, detailClusterList, , reloadDetailClusterList] = useAsync(() =>
        getClusterListing(false, abortControllerRef),
    )
    const [initialLoading, clusterListMinData, error] = useAsync(() => getClusterListing(true, abortControllerRef))

    const { pathname } = useLocation()
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ...getInfrastructureManagementBreadcrumb(),
                'resource-browser': {
                    component: <BreadcrumbText heading="Resource Browser" isActive />,
                },
            },
        },
        [pathname],
    )

    useEffect(
        () => () => {
            abortControllerRef.current.abort()
        },
        [],
    )

    const sortedClusterList: ClusterDetail[] = useMemo(
        () => sortObjectArrayAlphabetically(detailClusterList || clusterListMinData || [], 'name'),
        [detailClusterList, clusterListMinData],
    )

    const filteredSortedCluserList = useMemo(
        () =>
            sortedClusterList.filter(
                (option) =>
                    !(window._env_.HIDE_DEFAULT_CLUSTER && option.id === DEFAULT_CLUSTER_ID) &&
                    !option.isVirtualCluster,
            ),
        [sortedClusterList],
    )

    const renderContent = () => {
        if (error) {
            return <ErrorScreenManager code={error.code} />
        }

        return (
            <ClusterListView
                parentRef={parentRef}
                clusterOptions={filteredSortedCluserList}
                clusterListLoader={detailClusterListLoading}
                initialLoading={initialLoading}
                refreshData={reloadDetailClusterList}
            />
        )
    }

    if (initialLoading) {
        return <DevtronProgressing parentClasses="h-100 flex bg__primary" classes="icon-dim-80" />
    }

    const renderBreadcrumb = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    return (
        <div className="flexbox-col h-100 bg__primary" ref={parentRef}>
            <PageHeader
                tippyProps={{
                    isTippyCustomized: true,
                    tippyRedirectLink: 'RESOURCE_BROWSER',
                    tippyMessage: KUBERNETES_RESOURCE_BROWSER_DESCRIPTION,
                    tippyHeader: 'Resource Browser',
                }}
                isBreadcrumbs
                breadCrumbs={renderBreadcrumb}
                renderActionButtons={renderNewClusterButton(reloadDetailClusterList, sortedClusterList.length)}
            />
            {renderContent()}
        </div>
    )
}

export default ResourceBrowser
