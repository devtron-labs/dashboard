import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

import { BASE_ROUTES } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { InfraAppsRouter } from '@Components/common/navigation/NavRoutes.components'
import ResourceBrowserRouter from '@Components/ResourceBrowser/ResourceBrowserRouter'

import { InfraOverview } from './Overview'

const Charts = lazy(() => import('@Components/charts/Charts'))
const ResourceWatcherRouter = importComponentFromFELibrary('ResourceWatcherRouter')

const INFRASTRUCTURE_MANAGEMENT_ROUTES = BASE_ROUTES.INFRASTRUCTURE_MANAGEMENT

const InfrastructureManagementRouter = ({ isSuperAdmin }: { isSuperAdmin: boolean }) => (
    <Routes>
        <Route
            key={INFRASTRUCTURE_MANAGEMENT_ROUTES.OVERVIEW}
            path={INFRASTRUCTURE_MANAGEMENT_ROUTES.OVERVIEW}
            element={<InfraOverview />}
        />
        <Route
            key={INFRASTRUCTURE_MANAGEMENT_ROUTES.RESOURCE_BROWSER.ROOT}
            path={`${INFRASTRUCTURE_MANAGEMENT_ROUTES.RESOURCE_BROWSER.ROOT}/*`}
            element={<ResourceBrowserRouter />}
        />
        <Route
            key={INFRASTRUCTURE_MANAGEMENT_ROUTES.APPS.ROOT}
            path={`${INFRASTRUCTURE_MANAGEMENT_ROUTES.APPS.ROOT}/*`}
            element={<InfraAppsRouter />}
        />
        <Route
            key={INFRASTRUCTURE_MANAGEMENT_ROUTES.CHART_STORE.ROOT}
            path={`${INFRASTRUCTURE_MANAGEMENT_ROUTES.CHART_STORE.ROOT}/*`}
            element={<Charts isSuperAdmin={isSuperAdmin} />}
        />
        {window._env_.FEATURE_RESOURCE_WATCHER_ENABLE && ResourceWatcherRouter && (
            <Route
                key={INFRASTRUCTURE_MANAGEMENT_ROUTES.RESOURCE_WATCHER.ROOT}
                path={`${INFRASTRUCTURE_MANAGEMENT_ROUTES.RESOURCE_WATCHER.ROOT}/*`}
                element={<ResourceWatcherRouter />}
            />
        )}
    </Routes>
)

export default InfrastructureManagementRouter
