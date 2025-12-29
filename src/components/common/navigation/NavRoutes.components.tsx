/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { lazy, useEffect, useMemo, useState } from 'react'
import { generatePath, Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom'
import * as Sentry from '@sentry/browser'

import {
    InfrastructureManagementAppListType,
    SERVER_MODE,
    URLS as CommonURLS,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

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
            push(CommonURLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER)
        } else if (isFirstLoginUser) {
            push(URLS.GETTING_STARTED)
        } else if (serverMode === SERVER_MODE.EA_ONLY) {
            push(
                window._env_.FEATURE_DEFAULT_LANDING_RB_ENABLE
                    ? CommonURLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER
                    : CommonURLS.INFRASTRUCTURE_MANAGEMENT_APP_LIST,
            )
        } else {
            push(CommonURLS.APPLICATION_MANAGEMENT_APP_LIST)
        }
    }, [])
    return null
}

export const AppRouter = () => {
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
                    <Route path={CommonURLS.APPLICATION_MANAGEMENT_APP_LIST}>
                        <NewAppList isDevtronAppList />
                    </Route>

                    <Route path={`${CommonURLS.APPLICATION_MANAGEMENT_APP}/:appId(\\d+)`}>
                        <AppDetailsPage />
                    </Route>
                    <Redirect to={CommonURLS.APPLICATION_MANAGEMENT_APP_LIST} />
                </Switch>
            </AppContext.Provider>
        </ErrorBoundary>
    )
}

export const InfraAppsRouter = () => (
    <Switch>
        <Route path={CommonURLS.INFRASTRUCTURE_MANAGEMENT_APP_LIST} render={() => <NewAppList />} />
        <Route
            path={`${CommonURLS.INFRASTRUCTURE_MANAGEMENT_APP}/${URLS.EXTERNAL_APPS}/:appId/:appName`}
            render={() => <ExternalApps />}
        />
        <Route
            path={`${CommonURLS.INFRASTRUCTURE_MANAGEMENT_APP}/${URLS.EXTERNAL_ARGO_APP}/:clusterId(\\d+)/:appName/:namespace`}
            render={() => <ExternalArgoApps />}
        />
        {window._env_.FEATURE_EXTERNAL_FLUX_CD_ENABLE && (
            <Route
                path={`${CommonURLS.INFRASTRUCTURE_MANAGEMENT_APP}/${URLS.EXTERNAL_FLUX_APP}/:clusterId/:appName/:namespace/:templateType`}
            >
                <ExternalFluxAppDetailsRoute />
            </Route>
        )}
        <Route
            path={`${CommonURLS.INFRASTRUCTURE_MANAGEMENT_APP}/${URLS.DEVTRON_CHARTS}/deployments/:appId(\\d+)/env/:envId(\\d+)`}
            render={() => <DevtronChartRouter />}
        />
        <Redirect
            to={generatePath(CommonURLS.INFRASTRUCTURE_MANAGEMENT_APP_LIST, {
                appType: InfrastructureManagementAppListType.HELM,
            })}
        />
    </Switch>
)
