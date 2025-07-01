import { lazy, useEffect, useMemo, useState } from 'react'
import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import * as Sentry from '@sentry/browser'

import {
    AppListConstants,
    ModuleNameMap,
    ModuleStatus,
    SERVER_MODE,
    URLS as CommonURLS,
    useAsync,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'
import { URLS } from '@Config/routes'
import { AppRouterType } from '@Services/service.types'

import { ExternalFluxAppDetailsRoute } from '../../../Pages/App/Details/ExternalFlux'
import { AppContext } from '../Contexts'
import ErrorBoundary from '../errorBoundary'
import { importComponentFromFELibrary } from '../helpers/Helpers'

const ExternalApps = lazy(() => import('../../external-apps/ExternalApps'))
const ExternalArgoApps = lazy(() => import('../../externalArgoApps/ExternalArgoApp'))
const AppDetailsPage = lazy(() => import('../../app/details/main'))
const NewAppList = lazy(() => import('../../app/list-new/AppList'))
const DevtronChartRouter = lazy(() => import('../../v2/index'))

const NetworkStatusInterface = importComponentFromFELibrary('NetworkStatusInterface', null, 'function')

export const RedirectUserWithSentry = ({ isFirstLoginUser }: { isFirstLoginUser: boolean }) => {
    const { push } = useHistory()
    const { pathname } = useLocation()
    const { serverMode } = useMainContext()
    useEffect(() => {
        if (pathname && pathname !== '/') {
            Sentry.captureMessage(
                `redirecting to ${window._env_.HIDE_NETWORK_STATUS_INTERFACE ? 'app-list' : 'network status interface'} from ${pathname}`,
                'warning',
            )
        }

        if (!window._env_.HIDE_NETWORK_STATUS_INTERFACE && !!NetworkStatusInterface) {
            push(CommonURLS.NETWORK_STATUS_INTERFACE)
            return
        }

        if (window._env_.K8S_CLIENT) {
            push(URLS.RESOURCE_BROWSER)
        } else if (isFirstLoginUser) {
            push(URLS.GETTING_STARTED)
        } else if (serverMode === SERVER_MODE.EA_ONLY && window._env_.FEATURE_DEFAULT_LANDING_RB_ENABLE) {
            push(URLS.RESOURCE_BROWSER)
        } else {
            push(`${URLS.APP}/${URLS.APP_LIST}`)
        }
    }, [])
    return null
}

const RedirectToAppList = () => {
    const { replace } = useHistory()
    const { serverMode } = useMainContext()
    useEffect(() => {
        const baseUrl = `${URLS.APP}/${URLS.APP_LIST}`
        if (serverMode === SERVER_MODE.FULL) {
            replace(`${baseUrl}/${AppListConstants.AppType.DEVTRON_APPS}`)
        } else {
            replace(`${baseUrl}/${AppListConstants.AppType.HELM_APPS}`)
        }
    }, [])
    return null
}

const AppListRouter = ({ isSuperAdmin, appListCount, loginCount }: AppRouterType) => {
    const { path } = useRouteMatch()
    const [, argoInfoData] = useAsync(() => getModuleInfo(ModuleNameMap.ARGO_CD))
    const isArgoInstalled: boolean = argoInfoData?.result?.status === ModuleStatus.INSTALLED

    return (
        <ErrorBoundary>
            <Switch>
                <Route path={`${path}/:appType`} render={() => <NewAppList isArgoInstalled={isArgoInstalled} />} />
                <Route exact path="">
                    <RedirectToAppList />
                </Route>
                <Route>
                    <RedirectUserWithSentry isFirstLoginUser={isSuperAdmin && loginCount === 0 && appListCount === 0} />
                </Route>
            </Switch>
        </ErrorBoundary>
    )
}

export const AppRouter = ({ isSuperAdmin, appListCount, loginCount }: AppRouterType) => {
    const { path } = useRouteMatch()
    const [environmentId, setEnvironmentId] = useState(null)
    const [currentAppName, setCurrentAppName] = useState<string>('')

    const appContextValue = useMemo(
        () => ({ environmentId, setEnvironmentId, currentAppName, setCurrentAppName }),
        [environmentId, currentAppName],
    )

    return (
        <ErrorBoundary>
            <AppContext.Provider value={appContextValue}>
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
                        path={`${path}/${URLS.EXTERNAL_ARGO_APP}/:clusterId(\\d+)/:appName/:namespace`}
                        render={() => <ExternalArgoApps />}
                    />
                    {window._env_.FEATURE_EXTERNAL_FLUX_CD_ENABLE && (
                        <Route path={`${path}/${URLS.EXTERNAL_FLUX_APP}/:clusterId/:appName/:namespace/:templateType`}>
                            <ExternalFluxAppDetailsRoute />
                        </Route>
                    )}
                    <Route
                        path={`${path}/${URLS.DEVTRON_CHARTS}/deployments/:appId(\\d+)/env/:envId(\\d+)`}
                        render={() => <DevtronChartRouter />}
                    />
                    <Route path={`${path}/:appId(\\d+)`} render={() => <AppDetailsPage />} />

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
