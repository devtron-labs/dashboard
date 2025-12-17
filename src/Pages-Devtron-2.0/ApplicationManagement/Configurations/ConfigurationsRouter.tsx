import { lazy } from 'react'
import { Redirect, Route, Switch, useLocation } from 'react-router-dom'

import {
    BreadCrumb,
    DOCUMENTATION,
    getApplicationManagementBreadcrumb,
    noop,
    PageHeader,
    SERVER_MODE,
    SideNavigation,
    URLS as COMMON_URLS,
    useBreadcrumb,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import ChartRepo from '@Components/chartRepo/ChartRepo'
import { APPLICATION_MANAGEMENT_CONFIGURATIONS } from '@Components/Navigation'
import { AddNotification } from '@Components/notifications/AddNotification'
import { URLS } from '@Config/routes'

import './styles.scss'

const GitOpsConfiguration = lazy(() => import('@Components/gitOps/GitOpsConfiguration'))
const GitProvider = lazy(() => import('@Components/gitProvider/GitProvider'))
const ExternalLinks = lazy(() => import('@Components/externalLinks/ExternalLinks'))
const DeploymentChartsRouter = lazy(() => import('@Pages/GlobalConfigurations/DeploymentCharts'))
const Notifications = lazy(() => import('@Components/notifications/Notifications'))
const ScopedVariables = lazy(() => import('@Components/scopedVariables/ScopedVariables'))
const BuildInfra = lazy(() =>
    import('@Pages/GlobalConfigurations/BuildInfra').then((module) => ({ default: module.BuildInfra })),
)

export const Configurations = () => {
    const { pathname } = useLocation()
    const { featureGitOpsFlags: isFeatureGitOpsEnabled, serverMode, isSuperAdmin } = useMainContext()

    const getDefaultRoute = () => {
        if (isFeatureGitOpsEnabled) {
            return URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_GITOPS
        }

        return URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_EXTERNAL_LINKS
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ...getApplicationManagementBreadcrumb(),
                configurations: {
                    component: <span className="cn-9 fs-16 fw-6 lh-24">Configurations</span>,
                },
            },
        },
        [pathname],
    )

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    return (
        <>
            <PageHeader breadCrumbs={renderBreadcrumbs} isBreadcrumbs docPath={DOCUMENTATION.APP_CONFIGURATION} />
            <div className="application-management-configurations dc__grid flex-grow-1 dc__overflow-auto">
                <div className="py-12 pl-8 pr-7 border__primary--right">
                    <SideNavigation list={APPLICATION_MANAGEMENT_CONFIGURATIONS} />
                </div>
                <div className="bg__secondary dc__overflow-auto">
                    <Switch>
                        {isFeatureGitOpsEnabled && (
                            <Route
                                key={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_GITOPS}
                                path={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_GITOPS}
                            >
                                {(props) => <GitOpsConfiguration handleChecklistUpdate={noop} {...props} />}
                            </Route>
                        )}
                        {serverMode !== SERVER_MODE.EA_ONLY && (
                            <Route
                                key={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_GIT_ACCOUNTS}
                                path={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_GIT_ACCOUNTS}
                                render={(props) => <GitProvider {...props} isSuperAdmin={isSuperAdmin} />}
                            />
                        )}
                        <Route
                            key={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_EXTERNAL_LINKS}
                            path={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_EXTERNAL_LINKS}
                        >
                            <ExternalLinks />
                        </Route>
                        <Route
                            key={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_CHART_REPO}
                            path={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_CHART_REPO}
                        >
                            {(props) => <ChartRepo {...props} isSuperAdmin={isSuperAdmin} />}
                        </Route>
                        {serverMode !== SERVER_MODE.EA_ONLY && (
                            <Route
                                key={COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_DEPLOYMENT_CHARTS}
                                path={COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_DEPLOYMENT_CHARTS}
                            >
                                <DeploymentChartsRouter />
                            </Route>
                        )}
                        <Route
                            key={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_NOTIFICATIONS_ADD_NEW}
                            path={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_NOTIFICATIONS_ADD_NEW}
                        >
                            {(props) => <AddNotification {...props} />}
                        </Route>
                        <Route
                            key={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_NOTIFICATIONS}
                            path={URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_NOTIFICATIONS}
                        >
                            {(props) => <Notifications {...props} isSuperAdmin={isSuperAdmin} />}
                        </Route>
                        {...serverMode !== SERVER_MODE.EA_ONLY && window._env_.ENABLE_SCOPED_VARIABLES
                            ? [
                                  <Route
                                      key={COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_SCOPED_VARIABLES}
                                      path={COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_SCOPED_VARIABLES}
                                  >
                                      <ScopedVariables isSuperAdmin={isSuperAdmin} />
                                  </Route>,
                                  <Route
                                      key={COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_BUILD_INFRA}
                                      path={COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_BUILD_INFRA}
                                  >
                                      <BuildInfra isSuperAdmin={isSuperAdmin} />
                                  </Route>,
                              ]
                            : []}
                        <Redirect to={getDefaultRoute()} />
                    </Switch>
                </div>
            </div>
        </>
    )
}
