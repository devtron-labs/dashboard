import React, { useState } from 'react';
import { useParams, useRouteMatch } from 'react-router';
import { NavLink, Redirect, Route, Switch } from 'react-router-dom';
import { Progressing } from '../../../common';
import './cdDetail.scss';
import DeploymentTemplateHistory from './DeploymentTemplateHistory';

function HistoryDiff({ currentConfiguration, loader }) {
    const [tempValue, setTempValue] = useState('');
    const { path, url } = useRouteMatch();
    const { appId, envId, pipelineId, triggerId } = useParams<{ appId; envId; pipelineId; triggerId }>();

    const renderLeftHistoryConfiguration = () => {
        return (
            <div className="history_diff__wrapper bcn-0 border-right">
                {/* TODO: Use url match or similar to generate these URLs instead of manual creation */}

                <NavLink
                    style={{ maxHeight: '60px' }}
                    replace
                    className={`bcb-1 cursor tab-list__tab-link historical-diff__left`}
                    activeClassName="active"
                    to={`/app/${appId}/cd-details/${envId}/${pipelineId}/${triggerId}/configuration/deployment-template`}
                >
                    Deployment template
                </NavLink>
            </div>
        );
    };

    const renderRightHistoryConfiguration = () => {
        return (
            <div className="historical-diff__right ci-details__body bcn-1">
                <Switch>
                    <Route
                        path={path}
                        render={(props) => (
                            <DeploymentTemplateHistory setTempValue={setTempValue} currentConfiguration={currentConfiguration} />
                        )}
                    />
                </Switch>
            </div>
        );
    };

    return (
        <div className="historical-diff__container">
           { renderLeftHistoryConfiguration()}
            {loader ?  <Progressing pageLoader /> : 
            <>
           { renderRightHistoryConfiguration()}
            </>
}
        </div>
    );
}

export default HistoryDiff;
