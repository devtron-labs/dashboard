import React, { lazy, Suspense, useCallback, useRef, useEffect } from 'react';
import { Switch, Route, Redirect, NavLink } from 'react-router-dom';
import { ErrorBoundary, Progressing, BreadCrumb, useBreadcrumb } from '../../common';
import { getAppListMin } from '../../../services/service';
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import { URLS } from '../../../config';
import AppSelector from '../../AppSelector'
import ReactGA from 'react-ga';
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg';
import AppConfig from './appConfig/AppConfig';
import './appDetails/appDetails.scss';
import './app.css';

const TriggerView = lazy(() => import('./triggerView/TriggerView'));
const DeploymentMetrics = lazy(() => import('./metrics/DeploymentMetrics'));
const CIDetails = lazy(() => import('./cIDetails/CIDetails'));
const AppDetails = lazy(() => import('./appDetails/AppDetails'));
const CDDetails = lazy(() => import('./cdDetails/CDDetails'));
const TestRunList = lazy(() => import('./testViewer/TestRunList'));

export default function AppDetailsPage() {
    const { path } = useRouteMatch();
    const { appId } = useParams<{ appId }>();
    return <div className="app-details-page">
        <AppHeader />
        <ErrorBoundary>
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`} render={(props) => <AppDetails />} />
                    <Route path={`${path}/${URLS.APP_TRIGGER}`} render={(props) => <TriggerView />} />
                    <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?`}>
                        <CIDetails key={appId} />
                    </Route>
                    <Route path={`${path}/${URLS.APP_DEPLOYMENT_METRICS}/:envId(\\d+)?`} component={DeploymentMetrics} />
                    <Route path={`${path}/${URLS.APP_CD_DETAILS}/:envId(\\d+)?/:pipelineId(\\d+)?/:triggerId(\\d+)?`}>
                        <CDDetails key={appId} />
                    </Route>
                    <Route path={`${path}/${URLS.APP_CONFIG}`} component={AppConfig} />
                    {/* commented for time being */}
                    {/* <Route path={`${path}/tests/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                            render={() => <TestRunList />}
                        /> */}
                    <Redirect to={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`} />
                </Switch>
            </Suspense>
        </ErrorBoundary>
    </div>
}

export function AppHeader() {
    const { appId } = useParams<{ appId }>();
    const match = useRouteMatch();
    const history = useHistory();
    const location = useLocation();
    const currentPathname = useRef("");

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    const handleAppChange = useCallback(({ label, value }) => {
        const tab = currentPathname.current.replace(match.url, "").split("/")[1];
        const newUrl = generatePath(match.path, { appId: value });
        history.push(`${newUrl}/${tab}`);
        console.log(`${newUrl}/${tab}`);
        ReactGA.event({
            category: 'App Selector',
            action: 'App Selection Changed',
            label: tab,
        });
    }, [location.pathname])

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':appId(\\d+)': {
                    component: (
                        <AppSelector
                            primaryKey="appId"
                            primaryValue="name"
                            matchedKeys={[]}
                            api={getAppListMin}
                            apiPrimaryKey="id"
                            onChange={handleAppChange}
                        />
                    ),
                    linked: false,
                },
                app: {
                    component: <span className="cn-5 fs-18 lowercase">apps</span>,
                    linked: true,
                },
            },
        },
        [appId],
    );

    return <div className="page-header" style={{ gridTemplateColumns: "unset" }}>
        <h1 className="m-0 fw-6 flex left fs-18 cn-9">
            <BreadCrumb breadcrumbs={breadcrumbs} />
        </h1>
        <ul role="tablist" className="tab-list">
            <li className="tab-list__tab ellipsis-right">
                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_DETAILS}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'App Details Clicked',
                        });
                    }}>App Details
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_TRIGGER}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'Trigger Clicked',
                        });
                    }}>Trigger
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_CI_DETAILS}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'Build History Clicked',
                        });
                    }}>Build History
                </NavLink>
            </li>
            <li className="tab-list__tab">

                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_CD_DETAILS}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'Deployment History Clicked',
                        });
                    }}>Deployment History
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_DEPLOYMENT_METRICS}`} className="tab-list__tab-link"
                    onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'Deployment Metrics Clicked',
                        });
                    }}>Deployment Metrics
                </NavLink>
            </li>

            <li className="tab-list__tab">
                <NavLink activeClassName="active"
                    to={`${match.url}/${URLS.APP_CONFIG}`}
                    className="tab-list__tab-link flex" onClick={(event) => {
                        ReactGA.event({
                            category: 'App',
                            action: 'App Configuration Clicked',
                        });
                    }}>
                    <Settings className="tab-list__icon icon-dim-16 fcn-9 mr-4" />
                    App Configuration
                </NavLink>
            </li>
            {/* commented for time being */}
            {/* <li className="tab-list__tab">
                    <NavLink activeClassName="active" to={`${url}/tests`} className="tab-list__tab-link">
                        Tests
                    </NavLink>
                </li> */}
        </ul>
    </div>
}
