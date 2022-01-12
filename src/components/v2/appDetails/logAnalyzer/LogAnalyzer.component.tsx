import React from 'react';
import { useEffect } from 'react';
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store';
import LogsComponent from '../k8Resource/nodeDetail/NodeDetailTabs/Logs.component';
import { useRouteMatch } from 'react-router';

function LogAnalyzerComponent() {
    const { url } = useRouteMatch();

    useEffect(() => {
        AppDetailsStore.markAppDetailsTabActive(url);
    }, []);

    return (
        <div className="resource-node-wrapper">
            <LogsComponent selectedTab={null} isDeleted={false} />
        </div>
    );
}

export default LogAnalyzerComponent;
