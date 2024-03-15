import React from 'react'
import { Link } from 'react-router-dom'
import {
    SortableTableHeaderCell,
    SortingOrder,
    AppStatus,
    useAsync,
    Pagination,
} from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'
import { LinkedCIAppDto } from './types'
import { getAppList } from './service'
import appListLoading from './constants'

const AppListRow = ({
    appId,
    appName,
    deploymentStatus,
    environmentId,
    environmentName,
    triggerMode,
}: LinkedCIAppDto) => {
    return (
        <Link to={`${URLS.APP}/${appId}`}>
            <div
                className="display-grid dc__align-items-center linked-ci-detail__table-row cn-9 pl-20 pr-20 pt-8 pb-8 fs-13 fw-4 dc__hover-n50 "
                key={`${appId}-${environmentId}`}
            >
                <span className="dc__ellipsis-right">{appName}</span>
                <span>{environmentName}</span>
                <span>{triggerMode}</span>
                <span>
                    <AppStatus appStatus={deploymentStatus} />
                </span>
            </div>
        </Link>
    )
}

const LinkedCIAppList = ({ ciPipelineId }: { ciPipelineId: string }) => {
    const [loading, result, error] = useAsync(() => getAppList(ciPipelineId))

    const renderShimmer = () => {
        return (
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
        )
    }

    if (error) {
        return <div className="flexbox-col flex-grow-1 dc__overflow-scroll">Error</div>
    }

    return (
        <div className="flexbox-col flex-grow-1">
            <div className="flexbox-col flex-grow-1">
                <div className="display-grid dc__align-items-center linked-ci-detail__table-row dc__uppercase pl-20 pr-20 pt-6 pb-6 dc__border-bottom fs-12 fw-6 cn-7">
                    {/* todo (Arun) -- fix this */}
                    <SortableTableHeaderCell
                        title="Application"
                        sortOrder={SortingOrder.ASC}
                        isSorted={false}
                        triggerSorting={() => {}}
                        disabled={false}
                    />
                    <span>Deploys To (ENV)</span>
                    <span>Trigger Mode</span>
                    <span>Last Deployment Status</span>
                </div>
                {loading ? (
                    renderShimmer()
                ) : (
                    <div className="flexbox-col flex-grow-1 dc__overflow-scroll">
                        {result.data.map((appData) => (
                            <AppListRow {...appData} />
                        ))}
                    </div>
                )}
            </div>
            <div>
                {/* todo (Arun) -- fix this */}
                {!loading && result.totalCount > 20 ? (
                    <Pagination
                        rootClassName="flex dc__content-space pl-20 pr-20 dc__border-top"
                        size={result.totalCount}
                        offset={0}
                        pageSize={20}
                        changePage={() => {}}
                        changePageSize={() => {}}
                    />
                ) : null}
            </div>
        </div>
    )
}

export default LinkedCIAppList
