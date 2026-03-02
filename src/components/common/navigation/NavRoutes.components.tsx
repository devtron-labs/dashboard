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
import { generatePath, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import * as Sentry from '@sentry/browser'

import {
    BASE_ROUTES,
    InfrastructureManagementAppListType,
    ROUTER_URLS,
    SERVER_MODE,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { ExternalFluxAppDetailsRoute } from '../../../Pages/App/Details/ExternalFlux'
import { AppContext } from '../Contexts'
import ErrorBoundary from '../errorBoundary'
import { importComponentFromFELibrary } from '../helpers/Helpers'

const ExternalApps = lazy(() => import('../../external-apps/ExternalApps'))
const ExternalArgoApps = lazy(() => import('../../externalArgoApps/ExternalArgoApp'))
const AppDetailsPage = lazy(() => import('../../app/details/main'))
const NewAppList = lazy(() => import('../../app/list-new/AppList'))
const DevtronChartRouter = lazy(() => import('../../v2/index'))
const Jobs = lazy(() => import('../../Jobs/Jobs'))

const NetworkStatusInterface = importComponentFromFELibrary('NetworkStatusInterface', null, 'function')

const getDefaultRedirectPath = (isFirstLoginUser: boolean, serverMode: SERVER_MODE) => {
    if (window._env_.K8S_CLIENT) {
        return ROUTER_URLS.RESOURCE_BROWSER.ROOT
    }
    if (!window._env_.HIDE_NETWORK_STATUS_INTERFACE && !!NetworkStatusInterface) {
        return BASE_ROUTES.NETWORK_STATUS_INTERFACE.ROOT
    }
    if (isFirstLoginUser) {
        return BASE_ROUTES.GETTING_STARTED
    }
    if (window._env_.FEATURE_DEFAULT_LANDING_RB_ENABLE) {
        return ROUTER_URLS.RESOURCE_BROWSER.ROOT
    }
    return serverMode === SERVER_MODE.EA_ONLY
        ? ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_APPS
        : ROUTER_URLS.DEVTRON_APP_LIST
}

export const RedirectUserWithSentry = ({ isFirstLoginUser }: { isFirstLoginUser: boolean }) => {
    const { pathname } = useLocation()
    const { serverMode } = useMainContext()
    const redirectPath = getDefaultRedirectPath(isFirstLoginUser, serverMode)

    useEffect(() => {
        Sentry.captureMessage(`redirecting to ${redirectPath} from ${pathname}`, 'warning')
    }, [])

    return <Navigate to={redirectPath} replace />
}

const DEVTRON_APP_ROUTES = BASE_ROUTES.APPLICATION_MANAGEMENT.DEVTRON_APP

export const DevtronAppRouter = () => {
    const [environmentId, setEnvironmentId] = useState(null)
    const [currentAppName, setCurrentAppName] = useState<string>('')

    const appContextValue = useMemo(
        () => ({ environmentId, setEnvironmentId, currentAppName, setCurrentAppName }),
        [environmentId, currentAppName],
    )

    return (
        <ErrorBoundary>
            <AppContext.Provider value={appContextValue}>
                <Routes>
                    <Route path={`${DEVTRON_APP_ROUTES.LIST.ROOT}/*`} element={<NewAppList isDevtronAppList />} />
                    <Route path={`${DEVTRON_APP_ROUTES.DETAIL.ROOT}/*`} element={<AppDetailsPage />} />
                    <Route path="*" element={<Navigate to={DEVTRON_APP_ROUTES.LIST.ROOT} />} />
                </Routes>
            </AppContext.Provider>
        </ErrorBoundary>
    )
}

const INFRASTRUCTURE_MANAGEMENT_APP_ROUTES = BASE_ROUTES.INFRASTRUCTURE_MANAGEMENT.APPS

export const InfraAppsRouter = () => (
    <Routes>
        <Route path={INFRASTRUCTURE_MANAGEMENT_APP_ROUTES.LIST} element={<NewAppList />} />
        <Route path={`${INFRASTRUCTURE_MANAGEMENT_APP_ROUTES.EXTERNAL_HELM_APP}/*`} element={<ExternalApps />} />
        <Route path={`${INFRASTRUCTURE_MANAGEMENT_APP_ROUTES.EXTERNAL_ARGO_APP}/*`} element={<ExternalArgoApps />} />
        {window._env_.FEATURE_EXTERNAL_FLUX_CD_ENABLE && (
            <Route
                path={`${INFRASTRUCTURE_MANAGEMENT_APP_ROUTES.EXTERNAL_FLUX_APP}/*`}
                element={<ExternalFluxAppDetailsRoute />}
            />
        )}
        <Route path={`${INFRASTRUCTURE_MANAGEMENT_APP_ROUTES.DEVTRON_CHART}/*`} element={<DevtronChartRouter />} />
        <Route
            path="*"
            element={
                <Navigate
                    to={generatePath(INFRASTRUCTURE_MANAGEMENT_APP_ROUTES.LIST, {
                        appType: InfrastructureManagementAppListType.HELM,
                    })}
                />
            }
        />
    </Routes>
)

export const AutomationAndEnablementRouter = () => {
    const [environmentId, setEnvironmentId] = useState(null)
    const contextValue = useMemo(() => ({ environmentId, setEnvironmentId }), [environmentId])

    return (
        <Routes>
            <Route
                path={`${BASE_ROUTES.AUTOMATION_AND_ENABLEMENT.JOBS.ROOT}/*`}
                element={
                    <AppContext.Provider value={contextValue}>
                        <Jobs />
                    </AppContext.Provider>
                }
            />
            <Route path="*" element={<Navigate to={BASE_ROUTES.AUTOMATION_AND_ENABLEMENT.JOBS.ROOT} replace />} />
        </Routes>
    )
}
