import React, { useEffect } from 'react';
import IndexStore from '../index.store';
import { useParams } from 'react-router';
import { useState } from 'react';
import { useSharedState } from '../../utils/useSharedState';
import { Node } from '../appDetails.type';

interface TabState {
    status: string,
    count: number,
    isSelected: boolean
}

export const StatusFilterButtonComponent = ({nodes}: {nodes: Array<Node>}) => {

    const [selectedTab, setSelectedTab] = useState('all');
    let allNodeCount: number = 0,
        healthyNodeCount: number = 0,
        progressingNodeCount: number = 0,
        failedNodeCount: number = 0;

    nodes?.forEach((_node) => {
        let _nodeHealth = _node.health?.status || '';

        if (_nodeHealth.toLowerCase() === 'healthy' || _nodeHealth == '') {
            healthyNodeCount++;
        } else if (_nodeHealth.toLowerCase() === 'degraded') {
            failedNodeCount++;
        } else if (_nodeHealth.toLowerCase() === 'progressing') {
            progressingNodeCount++;
        }
        allNodeCount++;
    });

    const filters = [
        { status: 'ALL', count: allNodeCount, isSelected: "all" == selectedTab },
        { status: 'HEALTHY', count: healthyNodeCount, isSelected: "healthy" == selectedTab },
        { status: 'DEGRADED', count: failedNodeCount, isSelected: "degraded" == selectedTab },
        { status: 'PROGRESSING', count: progressingNodeCount, isSelected: "progressing" == selectedTab },
    ];

    const params = useParams<{ envId: string; appId: string }>();

    const handleFilterClick = (filterName: string) => {
        IndexStore.updateFilterType(filterName);
        setSelectedTab(filterName.toLowerCase());
    };

    return (
        <div className="en-2 bw-1 br-4 flexbox">
            {filters.length &&
                filters.map((filter: TabState, index: number) => {
                    return (
                        <React.Fragment key={`${'filter_tab_' + index}`}>
                            {filter.count > 0 && (
                                <a
                                    onClick={() => {
                                        handleFilterClick(filter.status);
                                    }}
                                    className={`${
                                        filter.isSelected ? 'bcb-1' : ''
                                    } p-6 pointer border-right cn-9 pr-6 fw-6 no-decor flex left`}
                                >
                                    {index !== 0 && (
                                        <span
                                            className={`app-summary__icon icon-dim-16 mr-6 ${filter.status.toLowerCase()} ${filter.status.toLowerCase()}--node`}
                                            style={{ zIndex: 'unset' }}
                                        />
                                    )}
                                    <span className="capitalize">{filter.status.toLowerCase()}</span>
                                    <span className="pl-4">({filter.count})</span>
                                </a>
                            )}
                        </React.Fragment>
                    );
                })}
        </div>
    );
};
