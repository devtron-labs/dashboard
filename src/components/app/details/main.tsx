import React, { lazy, Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Switch, Route, Redirect, NavLink } from 'react-router-dom';
import { ErrorBoundary, Progressing, showError, asyncWrap, BreadCrumb, useBreadcrumb } from '../../common';
import { getAppConfigStatus, getAppListMin } from '../../../services/service';
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import { URLS, getNextStageURL } from '../../../config';
import AppSelector from '../../AppSelector'
import ReactGA from 'react-ga';
import './appDetails/appDetails.scss';

const TriggerView = lazy(() => import('./triggerView/TriggerView'));
const DeploymentMetrics = lazy(() => import('./metrics/DeploymentMetrics'));
const CIDetails = lazy(() => import('./cIDetails/CIDetails'));
const AppDetails = lazy(() => import('./appDetails/AppDetails'));
const CDDetails = lazy(() => import('./cdDetails/CDDetails'));
const TestRunList = lazy(() => import('./testViewer/TestRunList'));

export default function AppDetailsPage() {
    const { url, path } = useRouteMatch()
    const { appId } = useParams<{ appId }>()
    return (
        <div className="app-details-page">
            <AppHeader />
            <ErrorBoundary>
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        <Route path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`} render={() => <AppDetails />} />
                        <Route path={`${path}/${URLS.APP_TRIGGER}`} render={() => <TriggerView />} />
                        <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?`}>
                            <CIDetails key={appId} />
                        </Route>
                        <Route path={`${path}/${URLS.APP_DEPLOYMENT_METRICS}/:envId(\\d+)?`} component={DeploymentMetrics} />
                        <Route path={`${path}/${URLS.APP_CD_DETAILS}/:envId(\\d+)?/:pipelineId(\\d+)?/:triggerId(\\d+)?`}>
                            <CDDetails key={appId} />
                        </Route>
                        {/* commented for time being */}
                        {/* <Route path={`${path}/tests/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                            render={() => <TestRunList />}
                        /> */}
                        <Redirect to={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`} />
                    </Switch>
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}

export function AppHeader() {
    const { appId } = useParams<{ appId }>();
    const match = useRouteMatch();
    const history = useHistory();
    const [configStatusLoading, setConfigStatusLoading] = useState(false);
    const location = useLocation()
    const currentPathname = useRef("")

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    const handleAppChange = useCallback(({ label, value }) => {
        const tab = currentPathname.current.replace(match.url, "").split("/")[1]
        const newUrl = generatePath(match.path, { appId: value })
        history.push(`${newUrl}/${tab}`)
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

    async function handleEditApp(e) {
        setConfigStatusLoading(true);
        const [error, result] = await asyncWrap(getAppConfigStatus(Number(appId)));
        if (error) {
            showError(error);
            return;
        }
        const newUrl = getNextStageURL(result.result, appId);
        history.push(newUrl);
    }

    return (
        <div className="page-header page-header--tabs">
            <h1 className="page-header__title flex left fs-18 cn-9">
                <BreadCrumb breadcrumbs={breadcrumbs} />
            </h1>
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab ellipsis-right">
                    <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_DETAILS}`} className="tab-list__tab-link">
                        App Details
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink activeClassName="active" to={`${match.url}/${URLS.APP_TRIGGER}`} className="tab-list__tab-link">
                        Trigger
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CI_DETAILS}`}
                        className="tab-list__tab-link"
                    >
                        Build History
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CD_DETAILS}`}
                        className="tab-list__tab-link"
                    >
                        Deployment History
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_DEPLOYMENT_METRICS}`}
                        className="tab-list__tab-link"
                    >
                        Deployment Metrics
                    </NavLink>
                </li>
                {/* commented for time being */}
                {/* <li className="tab-list__tab">
                    <NavLink activeClassName="active" to={`${url}/tests`} className="tab-list__tab-link">
                        Tests
                    </NavLink>
                </li> */}
            </ul>
            <div className="flex page-header__cta-container">
                <button type="button"
                    className="cta-with-img flex cancel"
                    onClick={handleEditApp}
                    disabled={configStatusLoading}>
                    {configStatusLoading ? <Progressing /> : (
                        <><Settings className="icon-dim-20 mr-5" /> Configure</>
                    )}
                </button>
            </div>
        </div>
    );
}
