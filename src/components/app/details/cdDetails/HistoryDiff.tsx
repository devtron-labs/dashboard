import React, { useState } from 'react';
import { useRouteMatch } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import { Progressing } from '../../../common';
import './cdDetail.scss';
import DeploymentTemplateHistory from './DeploymentTemplateHistory';

function HistoryDiff({ currentConfiguration, loader, codeEditorLoading, baseTemplateConfiguration }) {
    const { path } = useRouteMatch();

    return (
        <div className="historical-diff__container">
            {loader ? (
                <Progressing pageLoader />
            ) : (
                <div className="historical-diff__right ci-details__body bcn-1">
                    <Switch>
                        <Route
                            path={path}
                            render={(props) => (
                                <DeploymentTemplateHistory
                                    currentConfiguration={currentConfiguration}
                                    baseTemplateConfiguration={baseTemplateConfiguration}
                                    codeEditorLoading={codeEditorLoading}
                                />
                            )}
                        />
                    </Switch>
                </div>
            )}
        </div>
    );
}

export default HistoryDiff;
