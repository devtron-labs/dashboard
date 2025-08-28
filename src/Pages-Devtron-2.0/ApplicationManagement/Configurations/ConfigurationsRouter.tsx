import { lazy } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import { noop, PageHeader, SERVER_MODE, URLS as COMMON_URLS, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

import ChartRepo from '@Components/chartRepo/ChartRepo'
import { importComponentFromFELibrary } from '@Components/common'
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

const CatalogFramework = importComponentFromFELibrary('CatalogFramework')

export const Configurations = () => {
    const { featureGitOpsFlags: isFeatureGitOpsEnabled, serverMode, isSuperAdmin } = useMainContext()

    const getDefaultRoute = () => {
        if (isFeatureGitOpsEnabled) {
            return URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_GITOPS
        }

        return URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_EXTERNAL_LINKS
    }

    return (
        <>
            {/* TODO Rohit: Update with Application Management Header */}
            <PageHeader headerName="Application Management / Configurations" />
            <div className="application-management-configurations dc__grid flex-grow-1 dc__overflow-auto">
                <div className="border__primary--right">SidePanel</div>
                <div className="bg__secondary">
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
                        {CatalogFramework && (
                            <Route
                                key={COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_CATALOG_FRAMEWORK}
                                path={COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_CATALOG_FRAMEWORK}
                            >
                                <CatalogFramework isSuperAdmin={isSuperAdmin} />
                            </Route>
                        )}
                        {...serverMode !== SERVER_MODE.EA_ONLY &&
                            window._env_.ENABLE_SCOPED_VARIABLES && [
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
                            ]}
                        <Redirect to={getDefaultRoute()} />
                    </Switch>
                </div>
            </div>
        </>
    )
}
