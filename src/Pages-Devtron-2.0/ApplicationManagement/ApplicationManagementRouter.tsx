import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { BASE_ROUTES } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { DevtronAppRouter } from '@Components/common/navigation/NavRoutes.components'
import AppConfig from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig'
import { OffendingPipelineModalAppView } from '@Pages/GlobalConfigurations/PluginPolicy/OffendingPipelineModal'

import { Configurations } from './Configurations'
import { ApplicationManagementOverview } from './Overview'

const BulkEdit = lazy(() => import('@Components/bulkEdits/BulkEdits'))
const AppGroupRoute = lazy(() => import('@Components/ApplicationGroup/AppGroupRoute'))

const DevtronAppTemplates = importComponentFromFELibrary('DevtronAppTemplates', null, 'function')
const Policies = importComponentFromFELibrary('Policies', null, 'function')

const ApplicationManagementRouter = ({ isSuperAdmin }: { isSuperAdmin: boolean }) => (
    <Routes>
        <Route path={BASE_ROUTES.APPLICATION_MANAGEMENT.OVERVIEW} element={<ApplicationManagementOverview />} />
        <Route path={`${BASE_ROUTES.APPLICATION_MANAGEMENT.DEVTRON_APP.ROOT}/*`} element={<DevtronAppRouter />} />
        <Route
            path={`${BASE_ROUTES.APPLICATION_MANAGEMENT.APPLICATION_GROUP.ROOT}/*`}
            element={<AppGroupRoute isSuperAdmin={isSuperAdmin} />}
        />
        <Route path={BASE_ROUTES.APPLICATION_MANAGEMENT.BULK_EDIT} element={<BulkEdit />} />
        {DevtronAppTemplates && window._env_.FEATURE_APPLICATION_TEMPLATES_ENABLE && (
            <Route
                path={`${BASE_ROUTES.APPLICATION_MANAGEMENT.APPLICATION_TEMPLATES.ROOT}/*`}
                element={<DevtronAppTemplates AppConfig={AppConfig} />}
            />
        )}
        <Route path={`${BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.ROOT}/*`} element={<Configurations />} />
        {Policies && (
            <Route
                path={`${BASE_ROUTES.APPLICATION_MANAGEMENT.POLICIES.ROOT}/*`}
                element={<Policies OfflinePipelineModalAppView={OffendingPipelineModalAppView} />}
            />
        )}
        <Route path="*" element={<Navigate to={BASE_ROUTES.APPLICATION_MANAGEMENT.DEVTRON_APP.ROOT} replace />} />
    </Routes>
)

export default ApplicationManagementRouter
