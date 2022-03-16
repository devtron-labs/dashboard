import React, { useEffect } from 'react';
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store';
import { LogSearchTermType } from '../appDetails.type';
import LogsComponent from '../k8Resource/nodeDetail/NodeDetailTabs/Logs.component';

function LogAnalyzerComponent({ logSearchTerms, setLogSearchTerms }: LogSearchTermType) {
    useEffect(() => {
        AppDetailsStore.markAppDetailsTabActiveByIdentifier(AppDetailsTabs.log_analyzer);
    }, []);

    return (
        <div className="resource-node-wrapper">
            <LogsComponent
                selectedTab={null}
                isDeleted={false}
                logSearchTerms={logSearchTerms}
                setLogSearchTerms={setLogSearchTerms}
            />
        </div>
    );
}

export default LogAnalyzerComponent;
