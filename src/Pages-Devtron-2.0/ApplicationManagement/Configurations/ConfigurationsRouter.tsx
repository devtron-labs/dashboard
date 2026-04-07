import { lazy } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import {
    BASE_ROUTES,
    BreadCrumb,
    DOCUMENTATION,
    getApplicationManagementBreadcrumb,
    noop,
    PageHeader,
    ROUTER_URLS,
    SERVER_MODE,
    SideNavigation,
    useBreadcrumb,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import GitOpsConfiguration from '@Components/gitOps/GitOpsConfiguration'
import { APPLICATION_MANAGEMENT_CONFIGURATIONS } from '@Components/Navigation'
import { AddNotification } from '@Components/notifications/AddNotification'

import './styles.scss'

const GitProvider = lazy(() => import('@Components/gitProvider/GitProvider'))

const DeploymentChartsRouter = lazy(() => import('@Pages/GlobalConfigurations/DeploymentCharts'))
const Notifications = lazy(() => import('@Components/notifications/Notifications'))
const ScopedVariables = lazy(() => import('@Components/scopedVariables/ScopedVariables'))
const BuildInfra = lazy(() =>
    import('@Pages/GlobalConfigurations/BuildInfra').then((module) => ({ default: module.BuildInfra })),
)

export const Configurations = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { featureGitOpsFlags: isFeatureGitOpsEnabled, serverMode, isSuperAdmin } = useMainContext()

    const getDefaultRoute = () => {
        if (isFeatureGitOpsEnabled) {
            return BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.GITOPS
        }

        return BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.GIT_ACCOUNTS
    }

    const { breadcrumbs } = useBreadcrumb(
        ROUTER_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS.ROOT,
        {
            alias: {
                ...getApplicationManagementBreadcrumb(),
                configurations: {
                    component: <span className="cn-9 fs-16 fw-6 lh-24">Configurations</span>,
                },
            },
        },
        [],
    )

    const renderBreadcrumbs = () => (
        <BreadCrumb breadcrumbs={breadcrumbs} path={ROUTER_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS.ROOT} />
    )

    return (
        <>
            <PageHeader breadCrumbs={renderBreadcrumbs} isBreadcrumbs docPath={DOCUMENTATION.APP_MANAGEMENT} />
            <div className="application-management-configurations dc__grid flex-grow-1 dc__overflow-auto">
                <div className="py-12 pl-8 pr-7 border__primary--right">
                    <SideNavigation list={APPLICATION_MANAGEMENT_CONFIGURATIONS} />
                </div>
                <div className="bg__secondary dc__overflow-auto">
                    <Routes>
                        {isFeatureGitOpsEnabled && (
                            <Route
                                key={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.GITOPS}
                                path={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.GITOPS}
                                element={<GitOpsConfiguration handleChecklistUpdate={noop} />}
                            />
                        )}
                        <Route
                            key={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.GIT_ACCOUNTS}
                            path={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.GIT_ACCOUNTS}
                            element={<GitProvider isSuperAdmin={isSuperAdmin} />}
                        />
                        <Route
                            key={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.DEPLOYMENT_CHARTS.ROOT}
                            path={`${BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.DEPLOYMENT_CHARTS.ROOT}/*`}
                            element={<DeploymentChartsRouter />}
                        />
                        <Route
                            key={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.NOTIFICATIONS_ADD_NEW}
                            path={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.NOTIFICATIONS_ADD_NEW}
                            element={<AddNotification navigate={navigate} params={{}} location={location} />}
                        />
                        <Route
                            key={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.NOTIFICATIONS}
                            path={`${BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.NOTIFICATIONS}/*`}
                            element={
                                <Notifications
                                    isSuperAdmin={isSuperAdmin}
                                    location={location}
                                    navigate={navigate}
                                    params={{}}
                                />
                            }
                        />
                        {...serverMode === SERVER_MODE.FULL && window._env_.ENABLE_SCOPED_VARIABLES
                            ? [
                                  <Route
                                      key={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.SCOPED_VARIABLES.ROOT}
                                      path={`${BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.SCOPED_VARIABLES.ROOT}/*`}
                                      element={<ScopedVariables isSuperAdmin={isSuperAdmin} />}
                                  />,
                              ]
                            : []}
                        <Route
                            key={BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.BUILD_INFRA.ROOT}
                            path={`${BASE_ROUTES.APPLICATION_MANAGEMENT.CONFIGURATIONS.BUILD_INFRA.ROOT}/*`}
                            element={<BuildInfra isSuperAdmin={isSuperAdmin} />}
                        />
                        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
                    </Routes>
                </div>
            </div>
        </>
    )
}
