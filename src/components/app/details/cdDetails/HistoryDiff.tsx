import React, { useState } from 'react';
import { useRouteMatch } from 'react-router';
import { NavLink, Redirect, Route, Switch } from 'react-router-dom';
import './cdDetail.scss';
import { useParams } from 'react-router';
import DeploymentTemplateHistory from './DeploymentTemplateHistory';

function HistoryDiff({ currentTemplate }) {
    const [tempValue, setTempValue] = useState('');
    const [loading, setLoading] = useState(false);
    let { path, url } = useRouteMatch();
    const { appId, envId, pipelineId } = useParams<{ appId; envId; pipelineId }>();

    const renderLeftHistoryConfiguration = () => {
        return (
            <div className="bcn-0">
                <NavLink
                    replace
                    className="tab-list__tab-link"
                    activeClassName="active"
                    to={`${url}/configuration/deployment-template`}
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
                        path={`${path}/configuration/deployment-template`}
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
