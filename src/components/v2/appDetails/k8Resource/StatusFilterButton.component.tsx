import React, { useEffect } from 'react'
import IndexStore from '../index.store'
import { useState } from 'react'
import { Node } from '../appDetails.type'

interface TabState {
    status: string
    count: number
    isSelected: boolean
}

export const StatusFilterButtonComponent = ({
    nodes,
    shortDescription,
    handleFilterClick,
}: {
    nodes: Array<Node>
    shortDescription?: boolean
    handleFilterClick?: (selectedFilter: string) => void
}) => {
    const [selectedTab, setSelectedTab] = useState('all')

    let allNodeCount: number = 0,
        healthyNodeCount: number = 0,
        progressingNodeCount: number = 0,
        failedNodeCount: number = 0

    nodes?.forEach((_node) => {
        let _nodeHealth = _node.health?.status

        if (_nodeHealth?.toLowerCase() === 'healthy') {
            healthyNodeCount++
        } else if (_nodeHealth?.toLowerCase() === 'degraded') {
            failedNodeCount++
        } else if (_nodeHealth?.toLowerCase() === 'progressing') {
            progressingNodeCount++
        }
        allNodeCount++
    })

    const filters = [
        { status: 'ALL', count: allNodeCount, isSelected: 'all' == selectedTab },
        { status: 'HEALTHY', count: healthyNodeCount, isSelected: 'healthy' == selectedTab },
        { status: 'DEGRADED', count: failedNodeCount, isSelected: 'degraded' == selectedTab },
        { status: 'PROGRESSING', count: progressingNodeCount, isSelected: 'progressing' == selectedTab },
    ]

    // const handleFilterClick = (filterName: string) => {
    //     IndexStore.updateFilterType(filterName);
    //     setSelectedTab(filterName.toLowerCase());
    // };

    useEffect(() => {
        // handleFilterClick(selectedTab.toUpperCase())
        if (handleFilterClick) {
            handleFilterClick(selectedTab.toUpperCase())
        } else {
            IndexStore.updateFilterType(selectedTab.toUpperCase())
        }
    }, [nodes, selectedTab])

    return (
        <div className="en-2 bw-1 br-4 flexbox">
            {filters.length &&
                filters.map((filter: TabState, index: number) => {
                    return (
                        <React.Fragment key={`${'filter_tab_' + index}`}>
                            {filter.count > 0 && (
                                <a
                                    onClick={() => {
                                        setSelectedTab(filter.status.toLowerCase())
                                        // handleFilterClick(filter.status);
                                    }}
                                    className={`${
                                        filter.isSelected ? 'bcb-1 cn-9' : ''
                                    } p-6 pointer dc__border-right cn-5 pr-6 fw-6 dc__no-decor flex left`}
                                >
                                    {index !== 0 && (
                                        <span
                                            className={`dc__app-summary__icon icon-dim-16 mr-6 ${filter.status.toLowerCase()} ${filter.status.toLowerCase()}--node`}
                                            style={{ zIndex: 'unset' }}
                                        />
                                    )}
                                    {(filter.status === 'ALL' || !shortDescription) && (
                                        <span className="dc__first-letter-capitalize">
                                            {filter.status.toLowerCase()}
                                        </span>
                                    )}
                                    <span className={filter.status === 'ALL' || !shortDescription ? 'pl-4' : ''}>
                                        {filter.status === 'ALL' || !shortDescription? `(${filter.count})`: filter.count}
                                    </span>
                                </a>
                            )}
                        </React.Fragment>
                    )
                })}
        </div>
    )
}
