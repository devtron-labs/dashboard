import React, { useState } from 'react';
import { useParams, useRouteMatch } from 'react-router';
import { NavLink, Redirect, Route, Switch } from 'react-router-dom';
import './cdDetail.scss';
import DeploymentTemplateHistory from './DeploymentTemplateHistory';

function HistoryDiff({ currentTemplate }) {
    const [tempValue, setTempValue] = useState('');
    const [loading, setLoading] = useState(false);
    const { path, url } = useRouteMatch();
    const { appId, envId, pipelineId, triggerId } = useParams<{ appId; envId; pipelineId; triggerId }>();

    const renderLeftHistoryConfiguration = () => {
        return (
            <div className="bcn-0">
                {/* TODO: Use url match or similar to generate these URLs instead of manual creation */}
                <NavLink
                    replace
                    className="tab-list__tab-link"
                    activeClassName="active"
                    to={`/app/${appId}/cd-details/${envId}/${pipelineId}/${triggerId}/configuration/deployment-template`}
                >
                    <div className="historical-diff__left">
                        Deployment template
                        <div className="cg-5">2 changes</div>
                    </div>
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
                            <DeploymentTemplateHistory setTempValue={setTempValue} currentTemplate={currentTemplate} />
                        )}
                    />
                </Switch>
            </div>
        );
    };

    return (
        <div className="historical-diff__container">
            {renderLeftHistoryConfiguration()}
            {renderRightHistoryConfiguration()}
        </div>
    );
}

export default HistoryDiff;
