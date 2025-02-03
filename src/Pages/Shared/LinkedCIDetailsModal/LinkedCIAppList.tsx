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

import { Link } from 'react-router-dom'
import { SortableTableHeaderCell, GenericFilterEmptyState, DeploymentStatus } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { LinkedCIApp, LinkedCIAppListProps } from './types'
import { SortableKeys, appListLoading } from './constants'
import { getLinkedCIAppUrl } from './utils'

const AppListRow = ({ appId, appName, deploymentStatus, environmentName, triggerMode, environmentId }: LinkedCIApp) => (
    <Link to={getLinkedCIAppUrl({ appId, environmentId })} target="_blank" className="dc__no-decor">
        <div className="display-grid dc__align-items-center linked-ci-detail__table-row cn-9 pl-20 pr-20 pt-8 pb-8 fs-13 fw-4 dc__hover-n50 ">
            <span className="dc__truncate">
                <Tippy className="default-tt" placement="right" arrow={false} content={appName}>
                    <span className="dc__truncate dc__w-fit-content cb-5">{appName}</span>
                </Tippy>
            </span>
            {environmentName ? (
                <>
                    <span className="dc__truncate dc__w-fit-content">{environmentName}</span>
                    <span className="dc__first-letter-capitalize">{triggerMode}</span>
                    <DeploymentStatus status={deploymentStatus} />
                </>
            ) : (
                <span className="cn-7">No deployment pipeline</span>
            )}
        </div>
    </Link>
)

const LinkedCIAppList = ({ appList, totalCount, isLoading, urlFilters }: LinkedCIAppListProps) => {
    if (!isLoading && (totalCount === 0 || appList.length === 0)) {
        return <GenericFilterEmptyState classname="flex-grow-1" handleClearFilters={urlFilters.clearFilters} />
    }
    const { sortOrder, handleSorting } = urlFilters

    const sortByAppName = () => {
        handleSorting(SortableKeys.appName)
    }

    return (
        <div className="flexbox-col dc__content-space flex-grow-1">
            <div className="flexbox-col flex-grow-1">
                <div className="display-grid dc__align-items-center linked-ci-detail__table-row dc__uppercase pl-20 pr-20 pt-6 pb-6 dc__border-bottom-n1 fs-12 fw-6 cn-7 dc__position-sticky dc__top-88 bg__primary dc__zi-4">
                    <SortableTableHeaderCell
                        title="Application"
                        sortOrder={sortOrder}
                        isSorted
                        triggerSorting={sortByAppName}
                        disabled={isLoading}
                    />
                    <span>Deploys To (ENV)</span>
                    <span>Trigger Mode</span>
                    <span>Last Deployment Status</span>
                </div>
                {isLoading ? (
                    <div className="flexbox-col flex-grow-1 show-shimmer-loading">
                        {appListLoading.map((appData) => (
                            <div
                                className="display-grid dc__align-items-center linked-ci-detail__table-row pl-20 pr-20 pt-10 pb-10"
                                key={appData.appId}
                            >
                                <span className="child child-shimmer-loading" />
                                <span className="child child-shimmer-loading" />
                                <span className="child child-shimmer-loading" />
                                <span className="child child-shimmer-loading" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flexbox-col flex-grow-1 dc__overflow-auto">
                        {appList.map((appData) => (
                            <AppListRow {...appData} key={`${appData.appId}-${appData.environmentId}`} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LinkedCIAppList
