import React from 'react'
import { useEffect } from 'react';
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store';
import LogsComponent from '../k8Resource/nodeDetail/NodeDetailTabs/Logs.component';

function LogAnalyzerComponent() {

    useEffect(() => {
        AppDetailsStore.markAppDetailsTabActive(AppDetailsTabs.log_analyzer)
    }, [])

    return (
        <div className=" pl-20 pr-20" style={{ minHeight: '600px', background: 'black' }}>
            <LogsComponent selectedTab={null} />
        </div>
    )
}

export default LogAnalyzerComponent
