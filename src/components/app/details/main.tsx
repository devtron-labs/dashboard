import React, { lazy, Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Switch, Route, Redirect, NavLink } from 'react-router-dom';
import { ErrorBoundary, Progressing, showError, asyncWrap, useBreadcrumb, BreadCrumb } from '../../common';
import { getAppConfigStatus, getAppListMin, getSourceConfig } from '../../../services/service';
import { getTestSuites } from '../../../components/app/details/testViewer/service';
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import { URLS, getNextStageURL } from '../../../config';
import AppSelector from '../../AppSelector'
import ReactGA from 'react-ga';
import moment from 'moment'
import './appDetails/appDetails.scss';
const TriggerView = lazy(() => import('./triggerView/TriggerView'));
const DeploymentMetrics = lazy(() => import('./metrics/DeploymentMetrics'));
const CIDetails = lazy(() => import('./cIDetails/CIDetails'));
const AppDetails = lazy(() => import('./appDetails/AppDetails'));
const CDDetails = lazy(() => import('./cdDetails/CDDetails'));
const TestRunList = lazy(() => import('./testViewer/TestRunList'));

export default function AppDetailsPage() {
    const { url, path } = useRouteMatch();
    const { appId } = useParams<{ appId }>();

    return <div className="app-details-page">
        <ErrorBoundary>
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`} render={() => {
                        return <>
                            <AppHeader />
                            <AppDetails />
                        </>
                    }} />
                    <Route path={`${path}/${URLS.APP_TRIGGER}`} render={() => {
                        return <>
                            <AppHeader />
                            <TriggerView />
                        </>
                    }} />
                    <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?`}>
                        <AppHeader />
                        <CIDetails key={appId} />
                    </Route>
                    <Route path={`${path}/${URLS.APP_DEPLOYMENT_METRICS}/:envId(\\d+)?`}
                        render={(props) => {
                            return <>
                                <AppHeader />
                                <DeploymentMetrics {...props} />
                            </>
                        }}
                    />
                    <Route path={`${path}/${URLS.APP_CD_DETAILS}/:envId(\\d+)?/:pipelineId(\\d+)?/:triggerId(\\d+)?`}>
                        <AppHeader />
                        <CDDetails key={appId} />
                    </Route>
                    <Route path={`${path}/tests/:pipelineId(\\d+)/:triggerId(\\d+)`}
                        render={() => {
                            return <>
                                <AppHeaderTestsTrigger />
                                <TestRunList />
                            </>
                        }}
                    />
                    <Route path={`${path}/tests/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                        render={() => {
                            return <>
                                <AppHeader />
                                <TestRunList />
                            </>
                        }}
                    />
                    <Redirect to={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`} />
                </Switch>
            </Suspense>
        </ErrorBoundary>
    </div>
}

export function AppHeader() {
    const { appId } = useParams<{ appId }>();
    const { url, path } = useRouteMatch();
    const { push } = useHistory();
    const [configStatusLoading, setConfigStatusLoading] = useState(false);
    const { pathname } = useLocation()
    const currentPathname = useRef("")
    useEffect(() => {
        currentPathname.current = pathname
    }, [pathname])

    const handleAppChange = useCallback(({ label, value }) => {
        const tab = currentPathname.current.replace(url, "").split("/")[1]
        const newUrl = generatePath(path, { appId: value })
        push(`${newUrl}`);
        ReactGA.event({
            category: 'App Selector',
            action: 'App Selection Changed',
            label: tab,
        });
    }, [pathname])

    // const { breadcrumbs } = useBreadcrumb(
    //     {
    //         alias: {
    //             ':appId(\\d+)': {
    //                 component: (
    //                     <AppSelector
    //                         primaryKey="appId"
    //                         primaryValue="name"
    //                         matchedKeys={[]}
    //                         api={getAppListMin}
    //                         apiPrimaryKey="id"
    //                         onChange={handleAppChange}
    //                     />
    //                 ),
    //                 linked: false,
    //             },
    //             app: {
    //                 component: <span className="cn-5 fs-18 lowercase">apps</span>,
    //                 linked: true,
    //             },
    //         },
    //     },
    //     [appId],
    // );


    async function handleEditApp(e) {
        setConfigStatusLoading(true);
        const [error, result] = await asyncWrap(getAppConfigStatus(Number(appId)));
        if (error) {
            showError(error);
            return;
        }
        const newUrl = getNextStageURL(result.result, appId);
        push(newUrl);
    }

    return <div className="page-header page-header--tabs">
        <h1 className="page-header__title flex left fs-18 cn-9">
            {/* <BreadCrumb breadcrumbs={breadcrumbs} /> */}
            <span className="cn-5 fs-18 lowercase" onClick={() => {
                push('/app');
            }}>apps</span>
            <span className="cn-9 fs-18">/</span>
            <AppSelector
                primaryKey="appId"
                primaryValue="name"
                matchedKeys={[]}
                api={getAppListMin}
                apiPrimaryKey="id"
                onChange={handleAppChange}
            />
        </h1>
        <ul role="tablist" className="tab-list">
            <li className="tab-list__tab ellipsis-right">
                <NavLink activeClassName="active"
                    to={`/app/${appId}/${URLS.APP_DETAILS}`}
                    className="tab-list__tab-link">App Details
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active"
                    to={`/app/${appId}/${URLS.APP_TRIGGER}`}
                    className="tab-list__tab-link">Trigger
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active"
                    to={`/app/${appId}/${URLS.APP_CI_DETAILS}`}
                    className="tab-list__tab-link">Build History
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active"
                    to={`/app/${appId}/${URLS.APP_CD_DETAILS}`}
                    className="tab-list__tab-link">Deployment History
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active"
                    to={`/app/${appId}/${URLS.APP_DEPLOYMENT_METRICS}`}
                    className="tab-list__tab-link">Deployment Metrics
                </NavLink>
            </li>
            <li className="tab-list__tab">
                <NavLink activeClassName="active"
                    to={`/app/${appId}/tests`}
                    className="tab-list__tab-link"> Tests
                </NavLink>
            </li>
        </ul>
        <div className="flex page-header__cta-container">
            <button type="button"
                className="cta flex cancel"
                onClick={handleEditApp}
                disabled={configStatusLoading}>
                {configStatusLoading ? <Progressing /> : <><Settings className="icon-dim-20 mr-5" /> Configure</>}
            </button>
        </div>
    </div>
}

function getTestSuiteDate(date) {
    if (date) {
        return <div>{moment(date).format('ddd, DD MMM YYYY, HH:mma')}</div>
    }
    return null;
}

export function AppHeaderTestsTrigger() {
    const { appId, pipelineId, triggerId } = useParams<{ appId, pipelineId, triggerId }>();
    const [testSuitesData, setTestSuitesData] = useState(null);
    const [configSourceData, setConfigSourceData] = useState(null);
    useEffect(() => {
        async function fetchTestSuitesData () {
            const response = await getTestSuites(appId, pipelineId, triggerId, {});
            setTestSuitesData(response.result.result)
        }
        fetchTestSuitesData();
        async function fetchSourceConfig() {
            const response = await getSourceConfig(appId);
            setConfigSourceData(response.result)
        }
        fetchSourceConfig();
    }, []);
    const { pathname } = useLocation()
    const currentPathname = useRef("")
    useEffect(() => {
        currentPathname.current = pathname
    }, [pathname])

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                app: {
                    component: <span className="cn-7 fs-12">Apps</span>,
                    linked: true,
                },
                ':appId(\\d+)': {
                    component: <span className="cn-7 fs-12">{configSourceData?.appName}</span>,
                    linked: true,
                },
                tests: null,
                ':pipelineId(\\d+)': {
                    component: <span className="cn-7 fs-12">Test Reports</span>,
                    linked: true,
                },
                ':triggerId(\\d+)': {
                    component: <span className="cn-7 fs-12">Execution Detail</span>,
                    linked: true,
                }
            },
        },
        [appId, configSourceData],
    );


    return <div className="page-header page-header--tabs" style={{"gridTemplateColumns": "1fr", "gridTemplateRows": "1fr 0.9fr"}}>
        <div className="flex left">
            <BreadCrumb breadcrumbs={breadcrumbs} />
        </div>
        <div className="trigger-header-time">
            {getTestSuiteDate(testSuitesData?.createdOn)}
        </div>
    </div>
}