import React, { lazy, Suspense, useCallback, useRef, useEffect, useState } from 'react'
import { Switch, Route, Redirect, NavLink } from 'react-router-dom'
import { ErrorBoundary } from '../../common'
import { showError, Progressing, BreadCrumb, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'
import { useParams, useRouteMatch, useHistory, generatePath, useLocation } from 'react-router'
import { URLS } from '../../../config'
import { AppSelector } from '../../AppSelector'
import ReactGA from 'react-ga4'
import AppConfig from './appConfig/AppConfig'
import './appDetails/appDetails.scss'
import './app.css'
import { getAppMetaInfo } from '../service'
import { AppMetaInfo } from '../types'
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg'
import { EnvType } from '../../v2/appDetails/appDetails.type'
import PageHeader from '../../common/header/PageHeader'
import { AppDetailsProps } from './triggerView/types'
import AppOverview from './appOverview/AppOverview'

const TriggerView = lazy(() => import('./triggerView/TriggerView'))
const DeploymentMetrics = lazy(() => import('./metrics/DeploymentMetrics'))
const CIDetails = lazy(() => import('./cIDetails/CIDetails'))
const AppDetails = lazy(() => import('./appDetails/AppDetails'))
const IndexComponent = lazy(() => import('../../v2/index'))

const CDDetails = lazy(() => import('./cdDetails/CDDetails'))
const TestRunList = lazy(() => import('./testViewer/TestRunList'))

export default function AppDetailsPage({ isV2 }: AppDetailsProps) {
    const { path } = useRouteMatch()
    const { appId } = useParams<{ appId }>()
    const [appName, setAppName] = useState('')
    const [appMetaInfo, setAppMetaInfo] = useState<AppMetaInfo>()

    useEffect(() => {
        getAppMetaInfoRes()
    }, [appId])

    const getAppMetaInfoRes = async (): Promise<AppMetaInfo> => {
        try {
            const { result } = await getAppMetaInfo(Number(appId))
            if (result) {
                setAppName(result.appName)
                setAppMetaInfo(result)
                return result
            }
        } catch (err) {
            showError(err)
        }
    }

    return (
        <div className="app-details-page">
            {!isV2 && <AppHeader appName={appName} />}
            <ErrorBoundary>
                <Suspense fallback={<Progressing pageLoader />}>
                    <Switch>
                        {isV2 ? (
                            <Route
                                path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`}
                                render={(props) => <IndexComponent envType={EnvType.APPLICATION} />}
                            />
                        ) : (
                            <Route
                                path={`${path}/${URLS.APP_DETAILS}/:envId(\\d+)?`}
                                render={(props) => <AppDetails />}
                            />
                        )}
                        <Route path={`${path}/${URLS.APP_OVERVIEW}`}>
                            <AppOverview appMetaInfo={appMetaInfo} getAppMetaInfoRes={getAppMetaInfoRes} />
                        </Route>
                        <Route path={`${path}/${URLS.APP_TRIGGER}`} render={(props) => <TriggerView />} />
                        <Route path={`${path}/${URLS.APP_CI_DETAILS}/:pipelineId(\\d+)?/:buildId(\\d+)?`}>
                            <CIDetails key={appId} />
                        </Route>
                        <Route
                            path={`${path}/${URLS.APP_DEPLOYMENT_METRICS}/:envId(\\d+)?`}
                            component={DeploymentMetrics}
                        />
                        <Route
                            path={`${path}/${URLS.APP_CD_DETAILS}/:envId(\\d+)?/:pipelineId(\\d+)?/:triggerId(\\d+)?`}
                        >
                            <CDDetails key={appId} />
                        </Route>
                        <Route path={`${path}/${URLS.APP_CONFIG}`}>
                            <AppConfig appName={appName} />
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
    )
}

export function AppHeader({ appName }: { appName: string }) {
    const { appId } = useParams<{ appId }>()
    const match = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const currentPathname = useRef('')

    useEffect(() => {
        currentPathname.current = location.pathname
    }, [location.pathname])

    const handleAppChange = useCallback(
        ({ label, value }) => {
            const tab = currentPathname.current.replace(match.url, '').split('/')[1]
            const newUrl = generatePath(match.path, { appId: value })
            history.push(`${newUrl}/${tab}`)
            ReactGA.event({
                category: 'App Selector',
                action: 'App Selection Changed',
                label: tab,
            })
        },
        [location.pathname],
    )

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':appId(\\d+)': {
                    component: <AppSelector onChange={handleAppChange} appId={appId} appName={appName} />,
                    linked: false,
                },
                app: {
                    component: <span className="cb-5 fs-16 dc__capitalize">devtron apps</span>,
                    linked: true,
                },
            },
        },
        [appId, appName],
    )

    const renderAppDetailsTabs = () => {
        return (
            <ul role="tablist" className="tab-list">
                <li className="tab-list__tab dc__ellipsis-right">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_OVERVIEW}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Overview Clicked',
                            })
                        }}
                    >
                        Overview
                    </NavLink>
                </li>
                <li className="tab-list__tab dc__ellipsis-right">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_DETAILS}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'App Details Clicked',
                            })
                        }}
                    >
                        App Details
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_TRIGGER}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Build & Deploy Clicked',
                            })
                        }}
                    >
                        Build & Deploy
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CI_DETAILS}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Build History Clicked',
                            })
                        }}
                    >
                        Build History
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CD_DETAILS}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Deployment History Clicked',
                            })
                        }}
                    >
                        Deployment History
                    </NavLink>
                </li>
                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_DEPLOYMENT_METRICS}`}
                        className="tab-list__tab-link"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'Deployment Metrics Clicked',
                            })
                        }}
                    >
                        Deployment Metrics
                    </NavLink>
                </li>

                <li className="tab-list__tab">
                    <NavLink
                        activeClassName="active"
                        to={`${match.url}/${URLS.APP_CONFIG}`}
                        className="tab-list__tab-link flex"
                        onClick={(event) => {
                            ReactGA.event({
                                category: 'App',
                                action: 'App Configuration Clicked',
                            })
                        }}
                    >
                        <Settings className="tab-list__icon icon-dim-16 fcn-9 mr-4" />
                        App Configuration
                    </NavLink>
                </li>
            </ul>
        )
    }

    const renderBreadcrumbs = () => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    return (
        <PageHeader
            breadCrumbs={renderBreadcrumbs}
            isBreadcrumbs={true}
            showTabs={true}
            renderHeaderTabs={renderAppDetailsTabs}
        />
    )
}
