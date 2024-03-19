import React from 'react'
import { Link } from 'react-router-dom'
import {
    SortableTableHeaderCell,
    AppStatus,
    Pagination,
    UseUrlFiltersReturnType,
    GenericEmptyState,
    DEFAULT_BASE_PAGE_SIZE,
} from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'
import { LinkedCIAppDto } from './types'
import appListLoading from './constants'
import { SortableKeys } from '../../GlobalConfigurations/Authorization/PermissionGroups/List/constants'
import EmptyStateImage from '../../../assets/img/empty-noresult@2x.png'

const AppListRow = ({
    appId,
    appName,
    deploymentStatus,
    environmentId,
    environmentName,
    triggerMode,
}: LinkedCIAppDto) => {
    return (
        <Link
            to={`${URLS.APP}/${appId}/${URLS.APP_DETAILS}${environmentId ? `/${environmentId}` : ''}`}
            target="_blank"
            className="dc__no-decor"
        >
            <div
                className="display-grid dc__align-items-center linked-ci-detail__table-row cn-9 pl-20 pr-20 pt-8 pb-8 fs-13 fw-4 dc__hover-n50 "
                key={`${appId}-${environmentId}`}
            >
                <span className="dc__ellipsis-right">{appName}</span>
                <span>{environmentName}</span>
                <span className="dc__first-letter-capitalize">{triggerMode}</span>
                <span>
                    <AppStatus appStatus={deploymentStatus} />
                </span>
            </div>
        </Link>
    )
}

const LinkedCIAppList = ({
    appList,
    totalCount,
    isLoading,
    urlFilters,
}: {
    appList: LinkedCIAppDto[]
    totalCount: number
    isLoading: boolean
    urlFilters: UseUrlFiltersReturnType<SortableKeys>
}) => {
    const renderClearFilterButton = () => (
        <button type="button" onClick={urlFilters.clearFilters} className="cta secondary flex h-32">
            Clear Filters
        </button>
    )

    if (!isLoading && totalCount === 0) {
        return (
            <GenericEmptyState
                image={EmptyStateImage}
                classname="flex-grow-1"
                title="No Results"
                subTitle="We could not find any matching results"
                isButtonAvailable
                renderButton={renderClearFilterButton}
            />
        )
    }
    const { offset, pageSize, changePage, changePageSize, sortOrder } = urlFilters

    return (
        <div className="flexbox-col flex-grow-1 dc__overflow-auto">
            <div className="flexbox-col flex-grow-1">
                <div className="display-grid dc__align-items-center linked-ci-detail__table-row dc__uppercase pl-20 pr-20 pt-6 pb-6 dc__border-bottom fs-12 fw-6 cn-7">
                    {/* todo (Arun) -- fix this */}
                    <SortableTableHeaderCell
                        title="Application"
                        sortOrder={sortOrder}
                        isSorted={false}
                        triggerSorting={() => {}}
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
                            <AppListRow {...appData} />
                        ))}
                    </div>
                )}
            </div>
            <div>
                {!isLoading && totalCount > DEFAULT_BASE_PAGE_SIZE ? (
                    <Pagination
                        rootClassName="flex dc__content-space pl-20 pr-20 dc__border-top"
                        size={totalCount}
                        offset={offset}
                        pageSize={pageSize}
                        changePage={changePage}
                        changePageSize={changePageSize}
                    />
                ) : null}
            </div>
        </div>
    )
}

export default LinkedCIAppList
