import React, { useEffect } from 'react';
import IndexStore from '../index.store';
import { useParams } from 'react-router';
import { useState } from 'react';
import { useSharedState } from '../../utils/useSharedState';

export const StatusFilterButtonComponent: React.FC<{}> = ({}) => {
    const [tabs, setTabs] = useState([]);
    const [selectedTab, setSelectedTab] = useState('all');
    const params = useParams<{ envId: string; appId: string }>();

    const handleFilterClick = (filterName: string) => {
        IndexStore.updateFilterType(filterName);
        setSelectedTab(filterName.toLowerCase());
    };

    useEffect(() => {
        const nodeSubs = IndexStore.getAppDetailsNodesObservable().subscribe((nodes) => {
            if (nodes && nodes.length > 0) {
                let allNodeCount: number = 0,
                    healthyNodeCount: number = 0,
                    progressingNodeCount: number = 0,
                    failedNodeCount: number = 0;

                nodes.forEach((_node) => {
                    let _nodeHealth = _node.health?.status || '';

                    if (_nodeHealth.toLowerCase() === 'healthy') {
                        healthyNodeCount++;
                    } else if (_nodeHealth.toLowerCase() === 'degraded') {
                        failedNodeCount++;
                    } else if (_nodeHealth.toLowerCase() === 'progressing') {
                        progressingNodeCount++;
                    }
                    allNodeCount++;
                });

                const statusViewTabJSON = [
                    { status: 'ALL', count: allNodeCount, isSelected: true },
                    { status: 'HEALTHY', count: healthyNodeCount, isSelected: false },
                    { status: 'DEGRADED', count: failedNodeCount, isSelected: false },
                    { status: 'PROGRESSING', count: progressingNodeCount, isSelected: false },
                ];

                setTabs(statusViewTabJSON);
            }
        });

        return (): void => {
            nodeSubs.unsubscribe();
        };
    }, []);

    return (
        <div className="en-2 bw-1 br-4 flexbox">
            {tabs.length &&
                tabs.map((tab: any, index: number) => {
                    return (
                        <React.Fragment key={`${'filter_tab_' + index}`}>
                            {tab.count > 0 && (
                                <a
                                    onClick={() => {
                                        handleFilterClick(tab.status);
                                    }}
                                    className={`${
                                        tab.status.toLowerCase() === selectedTab ? 'bcb-1' : ''
                                    } p-6 pointer border-right cn-9 pr-6 fw-6 no-decor flex left`}
                                >
                                    {index !== 0 && (
                                        <span
                                            className={`app-summary__icon icon-dim-16 mr-6 ${tab.status.toLowerCase()} ${tab.status.toLowerCase()}--node`}
                                            style={{ zIndex: 'unset' }}
                                        />
                                    )}
                                    <span className="capitalize">{tab.status.toLowerCase()}</span>
                                    <span className="pl-4">({tab.count})</span>
                                </a>
                            )}
                        </React.Fragment>
                    );
                })}
        </div>
    );
};
