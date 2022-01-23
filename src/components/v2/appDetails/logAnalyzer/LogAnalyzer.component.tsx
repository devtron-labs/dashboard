import React from 'react';
import { useEffect } from 'react';
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store';
import LogsComponent from '../k8Resource/nodeDetail/NodeDetailTabs/Logs.component';
import { useRouteMatch } from 'react-router';
import { URLS } from '../../../../config';

function LogAnalyzerComponent() {
    const { url } = useRouteMatch();

    useEffect(() => {
        AppDetailsStore.markAppDetailsTabActiveByIdentifier(AppDetailsTabs.log_analyzer);
    }, []);

    return (
        <div className="resource-node-wrapper">
            <LogsComponent selectedTab={null} isDeleted={false} />
        </div>
    );
}

export default LogAnalyzerComponent;
