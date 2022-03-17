import React, { useState } from 'react';
import { useParams, useRouteMatch } from 'react-router';
import { NavLink, Redirect, Route, Switch } from 'react-router-dom';
import { Progressing } from '../../../common';
import './cdDetail.scss';
import DeploymentTemplateHistory from './DeploymentTemplateHistory';

function HistoryDiff({ currentConfiguration, loader, codeEditorLoading, baseTemplateConfiguration }) {
    const { path } = useRouteMatch();
    const { appId, envId, pipelineId, triggerId } = useParams<{ appId; envId; pipelineId; triggerId }>();

    //NOTE: will be using this later while cm and cs integartion

    // const renderLeftHistoryConfiguration = () => {
    //     return (
    //         <div className="history_diff__wrapper bcn-0 border-right">
    //             {/* TODO: Use url match or similar to generate these URLs instead of manual creation */}

    //             <NavLink
    //                 style={{ maxHeight: '60px' }}
    //                 replace
    //                 className={`bcb-1 cursor tab-list__tab-link historical-diff__left`}
    //                 activeClassName="active"
    //                 to={`/app/${appId}/cd-details/${envId}/${pipelineId}/${triggerId}/configuration/deployment-template`}
    //             >
    //                 Deployment template
    //             </NavLink>
    //         </div>
    //     );
    // };

    return (
        <div className="historical-diff__container">
            {/* NOTE: removing for the time being, will add when working on other keys as well */}

            {/* { renderLeftHistoryConfiguration()} */}
            {loader ? <Progressing pageLoader /> : <> 
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
        );</>}
        </div>
    );
}

export default HistoryDiff;
