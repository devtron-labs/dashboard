import React from 'react'
import { NavLink, Link } from 'react-router-dom';
import { URLS, AppListConstants} from '../../../config';
import ReactGA from 'react-ga';
import { useParams, useRouteMatch, useHistory } from 'react-router'
import  './header.css'

function EAHeaderComponent() {
    const match = useRouteMatch();
    const history = useHistory();
    const params = useParams<{ appId: string, appName: string}>()
    const { path } = useRouteMatch();

    return (
        <div className="app-page-header" style={{ gridTemplateColumns: "unset" }}>
            <div className="m-0 flex left fs-12 cn-9fw-4 fs-16">
                <Link to={`${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.HELM_APPS}`} className="devtron-breadcrumb__item">
                    <div className="cb-5">Helm apps</div>
                </Link>
                <span className="ml-4 mr-4">/</span>
                <span>{params.appName}</span>
            </div>
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab">
                    <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_DETAILS}`} className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'External App',
                                action: 'External App Details Clicked',
                            });
                        }}>App details
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_VALUES}`} className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'External App',
                                action: 'External App Values Clicked',
                            });
                        }}>Values
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_DEPLOYMNENT_HISTORY}`} className="tab-list__tab-link"
                             onClick={(event) => {
                                 ReactGA.event({
                                     category: 'External App',
                                     action: 'External App Deployment history Clicked',
                                 });
                             }}>Deployment history
                    </NavLink>
                </li>
            </ul>
        </div>
    )
};

export default EAHeaderComponent
