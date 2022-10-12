import React, { lazy, Suspense, useEffect, useState, createContext, useContext, useCallback, useRef } from 'react'
import { Route, Switch } from 'react-router-dom'
import { URLS, AppListConstants, ViewType, SERVER_MODE } from '../../../config'
import { ErrorBoundary, Progressing, getLoginInfo, AppContext } from '../../common'
import Navigation from './Navigation'
import { useRouteMatch, useHistory, useLocation } from 'react-router'
import * as Sentry from '@sentry/browser'
import ReactGA from 'react-ga4'
import { Security } from '../../security/Security'
import {
    dashboardLoggedIn,
    getAppListMin,
    getLoginData,
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
import { AppRouterType } from '../../../services/service.types'
import { getUserRole } from '../../userGroups/userGroup.service'
import { LOGIN_COUNT, MAX_LOGIN_COUNT } from '../../onboardingGuide/onboarding.utils'

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
    const [isHelpGettingStartedClicked, setHelpGettingStartedClicked] = useState(false)
    const [loginCount, setLoginCount] = useState(0)
    const [expiryDate, setExpiryDate] = useState(0)
    const [isSuperAdmin, setSuperAdmin] = useState(false)
    const [appListCount, setAppListCount] = useState(0)
    const [loginLoader, setLoginLoader] = useState(true)
    const [isDeployManageCardClicked, setDeployManageCardClicked] = useState(false)
    const [showGettingStartedCard, setShowGettingStartedCard] = useState(true)
    const [isGettingStartedClicked, setGettingStartedClicked] = useState(false)
    const [moduleInInstallingState, setModuleInInstallingState] = useState('')
    const installedModuleMap = useRef<Record<string, boolean>>({})
    const showCloseButtonAfterGettingStartedClicked = () => {
        setHelpGettingStartedClicked(true)
    }

    const getInit = async (_serverMode: string) => {
        setLoginLoader(true)
        const _expDate = localStorage.getItem('clickedOkay')
        setExpiryDate(!!_expDate ? +_expDate : 0)
        try {
            const [userRole, appList, loginData] = await Promise.all([
                getUserRole(),
                _serverMode === SERVER_MODE.FULL ? getAppListMin() : null,
                getLoginData(),
            ])
            const superAdmin = userRole?.result?.roles?.includes('role:super-admin___')
            setSuperAdmin(superAdmin)
            const appCount = appList?.result?.length || 0
            setAppListCount(appCount)
            processLoginData(loginData, superAdmin, appCount)
            setLoginLoader(false)
        } catch (err) {
            setLoginLoader(false)
            showError(err)
        }
    }

     const processLoginData = (response, superAdmin, appListCount) => {
         const count = response.result?.value ? parseInt(response.result.value) : 0
         setLoginCount(count)
          if (
             typeof Storage !== 'undefined' &&
             (localStorage.getItem('isSSOLogin') || localStorage.getItem('isAdminLogin'))
         ) {
             localStorage.removeItem('isSSOLogin')
             localStorage.removeItem('isAdminLogin')
             if (count < MAX_LOGIN_COUNT) {
                 const updatedPayload = {
                     key: LOGIN_COUNT,
                     value: `${count + 1}`,
                 }
                 updateLoginCount(updatedPayload)
             }
         }
         if (!count && superAdmin && appListCount === 0) {
             history.push(`/${URLS.GETTING_STARTED}`)
         }
     }

    useEffect(() => {
        const loginInfo = getLoginInfo()

        if (!loginInfo) return

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
                    gaOptions: {
                        userId: `${email}`,
                    },
                })
                ReactGA.send({ hitType: 'pageview', page: path })
                ReactGA.event({
                    category: `Page ${path}`,
                    action: 'First Land',
                })
                history.listen((location) => {
                    let path = location.pathname
                    path = path.replace(new RegExp('[0-9]', 'g'), '')
                    path = path.replace(new RegExp('//', 'g'), '/')
                    ReactGA.send({ hitType: 'pageview', page: path })
                    ReactGA.event({
                        category: `Page ${path}`,
                        action: 'First Land',
                    })
                })
            }
        }

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
                    getInit(json.result.serverMode)
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

    const onClickedDeployManageCardClicked = () =>{
      setDeployManageCardClicked(true)
    }

    if (pageState === ViewType.LOADING || loginLoader) {
        return <Progressing pageLoader />
    } else if (pageState === ViewType.ERROR) {
        return <Reload />
    } else {
        return (
            <mainContext.Provider
                value={{
                    serverMode,
                    setServerMode,
                    setPageOverflowEnabled,
                    isHelpGettingStartedClicked,
                    showCloseButtonAfterGettingStartedClicked,
                    loginCount,
                    setLoginCount,
                    showGettingStartedCard,
                    setShowGettingStartedCard,
                    isGettingStartedClicked,
                    setGettingStartedClicked,
                    moduleInInstallingState,
                    setModuleInInstallingState,
                    installedModuleMap,
                    currentServerInfo
                }}
            >
                <main className={`${window.location.href.includes(URLS.GETTING_STARTED) ? 'no-nav' : ''}`}>
                    {!window.location.href.includes(URLS.GETTING_STARTED) && (
                        <Navigation
                            history={history}
                            match={match}
                            location={location}
                            serverMode={serverMode}
                            fetchingServerInfo={currentServerInfo.fetchingServerInfo}
                            serverInfo={currentServerInfo.serverInfo}
                            getCurrentServerInfo={getCurrentServerInfo}
                            moduleInInstallingState={moduleInInstallingState}
                            installedModuleMap={installedModuleMap}
                        />
                    )}

                    {serverMode && (
                        <div className={`main ${pageOverflowEnabled ? '' : 'main__overflow-disabled'}`}>
                            <Suspense fallback={<Progressing pageLoader />}>
                                <ErrorBoundary>
                                    <Switch>
                                        <Route
                                            path={URLS.APP}
                                            render={() => (
                                                <AppRouter
                                                    isSuperAdmin={isSuperAdmin}
                                                    appListCount={appListCount}
                                                    loginCount={loginCount}
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
                                        <Route exact path={`/${URLS.GETTING_STARTED}/${URLS.GUIDE}`}>
                                            <DeployManageGuide
                                                isGettingStartedClicked={isGettingStartedClicked}
                                                loginCount={loginCount}
                                            />
                                        </Route>
                                        <Route exact path={`/${URLS.GETTING_STARTED}`}>
                                            <OnboardingGuide
                                                loginCount={loginCount}
                                                isSuperAdmin={isSuperAdmin}
                                                serverMode={serverMode}
                                                onClickedDeployManageCardClicked={onClickedDeployManageCardClicked}
                                                isGettingStartedClicked={isGettingStartedClicked}
                                            />
                                        </Route>

                                        <Route>
                                            <RedirectUserWithSentry
                                                isFirstLoginUser={
                                                    isSuperAdmin && loginCount === 0 && appListCount === 0
                                                }
                                            />
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

export function AppRouter({ isSuperAdmin, appListCount, loginCount }: AppRouterType) {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    return (
        <ErrorBoundary>
            <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
                <Switch>
                    <Route
                        path={`${path}/${URLS.APP_LIST}`}
                        render={() => (
                            <AppListRouter
                                isSuperAdmin={isSuperAdmin}
                                appListCount={appListCount}
                                loginCount={loginCount}
                            />
                        )}
                    />
                    <Route path={`${path}/${URLS.EXTERNAL_APPS}/:appId/:appName`} render={() => <ExternalApps />} />
                    <Route
                        path={`${path}/${URLS.DEVTRON_CHARTS}/deployments/:appId(\\d+)/env/:envId(\\d+)`}
                        render={(props) => <V2Details envType={EnvType.CHART} />}
                    />
                    <Route path={`${path}/:appId(\\d+)`} render={() => <AppDetailsPage isV2={false} />} />
                    <Route path={`${path}/v2/:appId(\\d+)`} render={() => <AppDetailsPage isV2={true} />} />

                    <Route exact path="">
                        <RedirectToAppList />
                    </Route>
                    <Route>
                        <RedirectUserWithSentry
                            isFirstLoginUser={isSuperAdmin && loginCount === 0 && appListCount === 0}
                        />
                    </Route>
                </Switch>
            </AppContext.Provider>
        </ErrorBoundary>
    )
}

export function AppListRouter({ isSuperAdmin, appListCount, loginCount }: AppRouterType) {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    return (
        <ErrorBoundary>
            <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
                <Switch>
                    <Route path={`${path}/:appType`} render={() => <NewAppList isSuperAdmin={isSuperAdmin} appListCount={appListCount}/>} />
                    <Route exact path="">
                        <RedirectToAppList />
                    </Route>
                    <Route>
                        <RedirectUserWithSentry isFirstLoginUser = {isSuperAdmin && loginCount === 0 && appListCount === 0} />
                    </Route>
                </Switch>
            </AppContext.Provider>
        </ErrorBoundary>
    )
}

export function RedirectUserWithSentry({ isFirstLoginUser  }) {
    const { push } = useHistory()
    const { pathname } = useLocation()
    useEffect(() => {
      if (pathname && pathname !== '/') Sentry.captureMessage(`redirecting to app-list from ${pathname}`, 'warning')
        if (isFirstLoginUser) {
            push(`${URLS.GETTING_STARTED}`)
        } else {
            push(`${URLS.APP}/${URLS.APP_LIST}`)
        }
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
