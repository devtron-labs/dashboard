import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { SortableTableHeaderCell, SortingOrder } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../config'
import { LinkedCIAppListDto } from './types'
import AppListData from './constants'

const AppListRow = ({ appName, environment, triggerMode, deploymentStatus }: LinkedCIAppListDto) => {
    return (
        <Link to={URLS.APP}>
            <div className="linked-ci-apps pl-20 pr-20 pt-8 pb-8 fs-13 fw-4 dc__hover-n50 ">
                <span className="dc__ellipsis-right">{appName}</span>
                <span>{environment}</span>
                <span>{triggerMode}</span>
                <span> {deploymentStatus} </span>
            </div>
        </Link>
    )
}

const LinkedCIAppList = () => {
    const [sortOrder, setSortOrder] = useState(SortingOrder.ASC)

    const handleSorting = () => {
        setSortOrder(SortingOrder.DESC)
    }

    return (
        <div>
            <div className="linked-ci-apps dc__uppercase pl-20 pr-20 pt-6 pb-6 dc__border-bottom fs-12 fw-6">
                {/* todo (Arun) -- fix this */}
                <SortableTableHeaderCell
                    title="Application"
                    sortOrder={sortOrder}
                    isSorted={false}
                    triggerSorting={handleSorting}
                    disabled={false}
                />
                <span>Deploys To (ENV)</span>
                <span>Trigger Mode</span>
                <span>Last Deployment Status</span>
            </div>
            <div className="flexbox-col flex-grow-1 dc__overflow-scroll">
                {AppListData.map((appData) => (
                    <AppListRow {...appData} />
                ))}
            </div>
        </div>
    )
}

export default LinkedCIAppList
