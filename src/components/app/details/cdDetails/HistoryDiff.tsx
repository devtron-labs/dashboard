import React, { useState } from 'react';
import { useRouteMatch } from 'react-router';
import { NavLink, Redirect, Route, Switch } from 'react-router-dom';
import CodeEditor from '../../../CodeEditor/CodeEditor';
import { Progressing } from '../../../common';
import { GitChanges, Artifacts } from '../cIDetails/CIDetails';
import './cdDetail.scss';
import CompareWithBaseConfig from './CompareWithBaseConfig';
import DeploymentConfiguration from './DeploymentConfiguration';
import DeploymentTemplateHistory from './DeploymentTemplateHistory';
import { getCDBuildReport } from './service';

function HistoryDiff() {
    const [tempValue, setTempValue] = useState('');
    const [loading, setLoading] = useState(false)
    let { path } = useRouteMatch();

   const renderLeftHistoryConfiguration = () => {
       return<><div>
            <NavLink replace className="tab-list__tab-link" activeClassName="active" to={`deployment-template`}>
                <div className="historical-diff__left">
                    Deployment template
                    <div className="cg-5">2 changes</div>
                </div>
            </NavLink>
       </div>
       </>

    }

    const renderRightHistoryConfiguration = () => {
          
            return <>
                <div className="historical-diff__right ci-details__body bcn-1">
                    {loading ? <Progressing pageLoader/>
                    :<Switch>
                        <Route path={`${path}/deployment-configuration`} render={props => <DeploymentTemplateHistory setTempValue={setTempValue}/>} />
                    </Switch>}
                </div>
            </>
    }

    return (
        <div className="historical-diff__container">
           {renderLeftHistoryConfiguration}
            {renderRightHistoryConfiguration}
            <NavLink replace className="tab-list__tab-link border-right" activeClassName="active" to={`deployment-template`}>
                <div className="historical-diff__left">
                    Deployment template
                    <div className="cg-5">2 changes</div>
                </div>
            </NavLink>
            <DeploymentTemplateHistory setTempValue={setTempValue}/>
        </div>
    );
}

export default HistoryDiff;
