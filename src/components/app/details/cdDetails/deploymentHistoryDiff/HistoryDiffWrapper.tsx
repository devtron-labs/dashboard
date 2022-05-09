import React from 'react';
import { Progressing } from '../../../../common';
import { DeploymentTemplateHistoryType } from '../cd.type';
import '../cdDetail.scss';
import DeploymentHistoryRightDiffView from './DeploymentHistoryRightDiffView';
import DeploymentHistorySidebar from './DeploymentHistorySidebar';

function HistoryDiff({ currentConfiguration, loader, codeEditorLoading, baseTemplateConfiguration }: DeploymentTemplateHistoryType) {

    return (
        <div className="">
            {loader ? (
                <Progressing pageLoader />
            ) : (
                <div className="historical-diff__container bcn-1">
                    <DeploymentHistorySidebar />
                    <DeploymentHistoryRightDiffView
                        currentConfiguration={currentConfiguration}
                        baseTemplateConfiguration={baseTemplateConfiguration}
                        codeEditorLoading={codeEditorLoading}
                    />
                </div>
            )}
        </div>
    );
}

export default HistoryDiff;
