import React, { lazy, Suspense, useEffect, useState, createContext, useContext, useCallback } from 'react'
import { Route, Switch } from 'react-router-dom'
import { URLS, AppListConstants, ViewType, SERVER_MODE } from '../../../config'
import { ErrorBoundary, Progressing, getLoginInfo, AppContext } from '../../common'
import Navigation from './Navigation'
import { useRouteMatch, useHistory, useLocation } from 'react-router'
import * as Sentry from '@sentry/browser'
import ReactGA from 'react-ga'
import { Security } from '../../security/Security'
import {
    dashboardLoggedIn,
    getAppListMin,
    getLoginData,
    getUserRole,
    getVersionConfig,
    updateLoginCount,
} from '../../../services/service'
import Reload from '../../Reload/Reload'
import { EnvType } from '../../v2/appDetails/appDetails.type'
import DevtronStackManager from '../../v2/devtronStackManager/DevtronStackManager'
import { ServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.type'
import { getServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import ClusterNodeContainer from '../../ClusterNodes/ClusterNodeContainer'
import DeployManageGuide from '../../onboardingGuide/DeployManageGuide'
import { showError } from '../helpers/Helpers'
import GettingStartedCard from '../gettingStartedCard/GettingStarted'

const Charts = lazy(() => import('../../charts/Charts'))
const ExternalApps = lazy(() => import('../../external-apps/ExternalApps'))
const AppDetailsPage = lazy(() => import('../../app/details/main'))
const NewAppList = lazy(() => import('../../app/list-new/AppList'))
const V2Details = lazy(() => import('../../v2/index'))
const GlobalConfig = lazy(() => import('../../globalConfigurations/GlobalConfiguration'))
const BulkActions = lazy(() => import('../../deploymentGroups/BulkActions'))
const BulkEdit = lazy(() => import('../../bulkEdits/BulkEdits'))
const OnboardingGuide = lazy(() => import('../../onboardingGuide/OnboardingGuide'))

export const mainContext = createContext(null)

export default function NavigationRoutes() {
    const history = useHistory()
    const location = useLocation()
    const match = useRouteMatch()
    const [serverMode, setServerMode] = useState(undefined)
    const [pageState, setPageState] = useState(ViewType.LOADING)
    const [pageOverflowEnabled, setPageOverflowEnabled] = useState<boolean>(true)
    const [currentServerInfo, setCurrentServerInfo] = useState<{ serverInfo: ServerInfo; fetchingServerInfo: boolean }>(
        {
            serverInfo: undefined,
            fetchingServerInfo: false,
        },
    )
    const [isHelpGettingStartedClicked, setIsHelpGettingStartedClicked] = useState(false)
    const [loginCount, setLoginCount] = useState(0)
    const [isSuperAdmin, setSuperAdmin] = useState(false)
    const [actionTakenOnOnboarding, setActionTakenOnboarding] = useState(false)
    const [isGettingStartedClicked, setIsGettingStartedButtonClicked] = useState(false)
    const [showGettingStartedCard, setShowGettingStartedCard] = useState(true)
    const [appListCount, setAppListCount] = useState(undefined)
    const [expiryDate, setExpiryDate] = useState(0)

    const hideGettingStartedCard = () => {
        setShowGettingStartedCard(false)
    }


    const showCloseButtonAfterGettingStartedClicked = () => {
        setIsHelpGettingStartedClicked(true)
    }

    useEffect(() => {
        const expDate = localStorage.getItem('clickedOkay')
        setExpiryDate(+expDate)
    }, [])

    useEffect(() => {
        try {
            getUserRole().then((response) => {
                setSuperAdmin(response.result?.superAdmin)
            })
        } catch (err) {
            showError(err)
        }
    }, [])

    useEffect(() => {
        const loginInfo = getLoginInfo()
        getAppListMin().then((response) => {
            setAppListCount(response.result?.length)
        })
        if (process.env.NODE_ENV === 'production' && window._env_) {
            if (window._env_.SENTRY_ERROR_ENABLED) {
                Sentry.configureScope(function (scope) {
                    scope.setUser({ email: loginInfo['email'] || loginInfo['sub'] })
                })
            }
            if (window._env_.GA_ENABLED) {
                let email = loginInfo ? loginInfo['email'] || loginInfo['sub'] : ''
                let path = location.pathname
                ReactGA.initialize(window._env_.GA_TRACKING_ID, {
                    debug: false,
                    titleCase: false,
                    gaOptions: {
                        userId: `${email}`,
                    },
                })
                ReactGA.pageview(`${path}`)
                ReactGA.event({
                    category: `Page ${path}`,
                    action: 'First Land',
                })
                history.listen((location) => {
                    let path = location.pathname
                    path = path.replace(new RegExp('[0-9]', 'g'), '')
                    path = path.replace(new RegExp('//', 'g'), '/')
                    ReactGA.pageview(`${path}`)
                    ReactGA.event({
                        category: `Page ${path}`,
                        action: 'First Land',
                    })
                })
            }
        }

        //Only For the first time login user(with superadmin permission)
        if (!loginInfo) return

        getLoginData().then((response) => {
            const count = response.result.value ? parseInt(response.result.value) : 0
            setLoginCount(count || 1)
            if (count < 5) {
                const updatedPayload = {
                    key: 'login-count',
                    // value: `${count + 1}`,
                    value: `${count + 1}`,
                }
                updateLoginCount(updatedPayload)
            }
        })

        if (typeof Storage !== 'undefined') {
            if (localStorage.isDashboardLoggedIn) return
            dashboardLoggedIn()
                .then((response) => {
                    if (response.result) {
                        localStorage.isDashboardLoggedIn = true
                    }
                })
                .catch((errors) => {})
        }
    }, [])

    useEffect(() => {
        async function getServerMode() {
            try {
                const response = getVersionConfig()
                const json = await response
                if (json.code == 200) {
                    setServerMode(json.result.serverMode)
                    setPageState(ViewType.FORM)
                }
            } catch (err) {
                setPageState(ViewType.ERROR)
            }
        }
        getServerMode()
        getCurrentServerInfo()
    }, [])

    const getCurrentServerInfo = async (section?: string) => {
        if (
            currentServerInfo.fetchingServerInfo ||
            (section === 'navigation' && currentServerInfo.serverInfo && location.pathname.includes('/stack-manager'))
        ) {
            return
        }

        setCurrentServerInfo({
            serverInfo: currentServerInfo.serverInfo,
            fetchingServerInfo: true,
        })

        try {
            const { result } = await getServerInfo()
            setCurrentServerInfo({
                serverInfo: result,
                fetchingServerInfo: false,
            })
        } catch (err) {
            setCurrentServerInfo({
                serverInfo: currentServerInfo.serverInfo,
                fetchingServerInfo: false,
            })
            console.error('Error in fetching server info')
        }
    }

    if (pageState === ViewType.LOADING) {
        return <Progressing pageLoader />
    } else if (pageState === ViewType.ERROR) {
        return <Reload />
    } else {
        const onClickSetActionButtonToTrue = () => {
            setActionTakenOnboarding(true)
        }

        const showOnboardingPage = isSuperAdmin && !actionTakenOnOnboarding

        const getExpired = (): boolean => {
            // Render Getting started tippy card if the time gets expired
            const now = new Date().valueOf()
            if (now > expiryDate) {
                return true
            }
            return false
        }

        return (
            <mainContext.Provider
                value={{
                    serverMode,
                    setServerMode,
                    setPageOverflowEnabled,
                    isHelpGettingStartedClicked,
                    showCloseButtonAfterGettingStartedClicked,
                }}
            >
                <main>
                    <Navigation
                        history={history}
                        match={match}
                        location={location}
                        serverMode={serverMode}
                        fetchingServerInfo={currentServerInfo.fetchingServerInfo}
                        serverInfo={currentServerInfo.serverInfo}
                        getCurrentServerInfo={getCurrentServerInfo}
                    />
                    {showGettingStartedCard && loginCount > 0 && loginCount < 5 && getExpired() && (
                        <GettingStartedCard
                            className={'w-300'}
                            showHelpCard={false}
                            hideGettingStartedCard={hideGettingStartedCard}
                            loginCount={loginCount}
                        />
                    )}
                    {serverMode && (
                        <div
                            className={`main ${pageOverflowEnabled ? '' : 'main__overflow-disabled'} ${
                                showOnboardingPage ? 'main__onboarding-page' : 'main'
                            }`}
                        >
                            {/* {console.log(showOnboardingPage, appListCount < 1, 'isGettingStartedClicked', isGettingStartedClicked)} */}
                            <Suspense fallback={<Progressing pageLoader />}>
                                <ErrorBoundary>
                                    <Switch>
                                        <Route
                                            path={URLS.APP}
                                            render={() => (
                                                <AppRouter
                                                    isSuperAdmin={isSuperAdmin}
                                                />
                                            )}
                                        />
                                        <Route path={URLS.CHARTS} render={() => <Charts />} />
                                        <Route
                                            path={URLS.DEPLOYMENT_GROUPS}
                                            render={(props) => <BulkActions {...props} />}
                                        />
                                        <Route
                                            path={URLS.GLOBAL_CONFIG}
                                            render={(props) => <GlobalConfig {...props} />}
                                        />
                                        <Route path={URLS.CLUSTER_LIST}>
                                            <ClusterNodeContainer />
                                        </Route>
                                        <Route
                                            path={URLS.BULK_EDITS}
                                            render={(props) => <BulkEdit {...props} serverMode={serverMode} />}
                                        />
                                        <Route
                                            path={URLS.SECURITY}
                                            render={(props) => <Security {...props} serverMode={serverMode} />}
                                        />
                                        <Route path={URLS.STACK_MANAGER}>
                                            <DevtronStackManager
                                                serverInfo={currentServerInfo.serverInfo}
                                                getCurrentServerInfo={getCurrentServerInfo}
                                            />
                                        </Route>
                                        {(showOnboardingPage || appListCount === 0) && (
                                            <>
                                                <Route path={`/${URLS.GUIDE}`} render={() => <DeployManageGuide />} />

                                                <Route
                                                    exact
                                                    path={'/'}
                                                    render={() => (
                                                        <OnboardingGuide
                                                            onClickSetActionButtonToTrue={onClickSetActionButtonToTrue}
                                                        />
                                                    )}
                                                />
                                            </>
                                        )}

                                        <Route>
                                            <RedirectWithSentry />
                                        </Route>
                                    </Switch>
                                </ErrorBoundary>
                            </Suspense>
                        </div>
                    )}
                </main>
            </mainContext.Provider>
        )
    }
}

export interface AppRouterType {
    isSuperAdmin?: boolean
    onClickShowGettingStartedCard?: () => void
}
export function AppRouter({ isSuperAdmin, onClickShowGettingStartedCard }: AppRouterType) {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    return (
        <ErrorBoundary>
            <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
                <Switch>
                    <Route
                        path={`${path}/${URLS.APP_LIST}`}
                        render={() => <AppListRouter isSuperAdmin={isSuperAdmin} />}
                    />
                    <Route path={`${path}/${URLS.EXTERNAL_APPS}/:appId/:appName`} render={() => <ExternalApps />} />
                    <Route
                        path={`${path}/${URLS.DEVTRON_CHARTS}/deployments/:appId(\\d+)/env/:envId(\\d+)`}
                        render={(props) => <V2Details envType={EnvType.CHART} />}
                    />
                    <Route
                        path={`${path}/:appId(\\d+)`}
                        render={() => (
                            <AppDetailsPage
                                isV2={false}
                            />
                        )}
                    />
                    <Route
                        path={`${path}/v2/:appId(\\d+)`}
                        render={() => (
                            <AppDetailsPage isV2={true} />
                        )}
                    />

                    <Route exact path="">
                        <RedirectToAppList />
                    </Route>
                    <Route>
                        <RedirectWithSentry />
                    </Route>
                </Switch>
            </AppContext.Provider>
        </ErrorBoundary>
    )
}

export function AppListRouter({ isSuperAdmin }: AppRouterType) {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    return (
        <ErrorBoundary>
            <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
                <Switch>
                    <Route path={`${path}/:appType`} render={() => <NewAppList isSuperAdmin={isSuperAdmin} />} />
                    <Route exact path="">
                        <RedirectToAppList />
                    </Route>
                    <Route>
                        <RedirectWithSentry />
                    </Route>
                </Switch>
            </AppContext.Provider>
        </ErrorBoundary>
    )
}

export function RedirectWithSentry() {
    const { push } = useHistory()
    const { pathname } = useLocation()
    useEffect(() => {
        if (pathname && pathname !== '/') Sentry.captureMessage(`redirecting to app-list from ${pathname}`, 'warning')
        push(`${URLS.APP}/${URLS.APP_LIST}`)
    }, [])
    return null
}

export function RedirectToAppList() {
    const { push } = useHistory()
    const { serverMode } = useContext(mainContext)
    useEffect(() => {
        let baseUrl = `${URLS.APP}/${URLS.APP_LIST}`
        if (serverMode == SERVER_MODE.FULL) {
            push(`${baseUrl}/${AppListConstants.AppType.DEVTRON_APPS}`)
        } else {
            push(`${baseUrl}/${AppListConstants.AppType.HELM_APPS}`)
        }
    }, [])
    return null
}
