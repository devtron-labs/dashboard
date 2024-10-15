import { useMemo } from 'react'
import { generatePath, Route, Switch, useRouteMatch } from 'react-router-dom'

import { EnvResourceType, GenericEmptyState, useAsync } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
import { importComponentFromFELibrary } from '@Components/common'
import { ConfigMapSecretWrapper, CMSecretComponentType } from '@Pages/Shared/ConfigMapSecret'
import { DeploymentConfigCompare, DeploymentTemplate } from '@Pages/Applications'
import { getEnvConfig } from '@Pages/Applications/DevtronApps/service'
import { EnvConfigurationsNav } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/Navigation/EnvConfigurationsNav'
import { EnvironmentOptionType } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'

import './styles.scss'

const useReleaseConfigurationContext = importComponentFromFELibrary('useReleaseConfigurationContext', null, 'function')
const ConfigurationsAppEnvSelector = importComponentFromFELibrary('ConfigurationsAppEnvSelector', null, 'function')

const renderNullState = () => (
    <div className="bcn-0">
        <GenericEmptyState
            title="No application x environment selected"
            subTitle="Select application and environment to view configurations"
        />
    </div>
)

export const Configurations = () => {
    // HOOKS
    const { path, params } = useRouteMatch<{ appId: string; envId: string }>()
    const { appId, envId } = params

    // CONTEXTS
    const context = useReleaseConfigurationContext()
    const environments = context.environments as EnvironmentOptionType[]
    const applications = context.applications as any[]
    const reloadEnvironments = context.reloadEnvironments as () => void
    const isAppListLoading = context.isAppListLoading as boolean
    const isEnvListLoading = context.isEnvListLoading as boolean

    // ASYNC CALLS
    const [envConfigResLoading, envConfigRes, , fetchEnvConfig] = useAsync(
        () => getEnvConfig(+appId, +envId),
        [appId, envId],
        !!(appId && envId),
    )

    // CONSTANTS
    const envConfig = {
        config: envConfigRes,
        isLoading: envConfigResLoading,
    }
    const selectedApp = useMemo(
        () => (applications ? applications.find(({ value }) => +appId === value) : null),
        [applications, appId, isAppListLoading],
    )
    const selectedEnv = useMemo(
        () => (environments ? environments.find(({ id }) => +envId === id) : null),
        [environments, envId, isEnvListLoading],
    )
    const showConfig = !!selectedApp && !!selectedEnv

    // RENDERERS
    const renderConfigSideNav = () => (
        <Switch>
            <Route path={`${path}/:resourceType(${Object.values(EnvResourceType).join('|')})`}>
                <EnvConfigurationsNav
                    envConfig={envConfig}
                    environments={environments}
                    fetchEnvConfig={fetchEnvConfig}
                    goBackURL={null}
                    compareWithURL={path}
                    showDeploymentTemplate
                    showComparison
                    hideEnvSelector
                />
            </Route>
        </Switch>
    )

    const renderConfig = () => (
        <Switch>
            <Route key={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`} path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                <div className="deployment-template dc__overflow-auto dc__position-rel">
                    <DeploymentTemplate
                        fetchEnvConfig={fetchEnvConfig}
                        isProtected
                        reloadEnvironments={reloadEnvironments}
                        environmentName={selectedEnv.name}
                        clusterId={null}
                    />
                </div>
            </Route>
            <Route key={`${path}/${URLS.APP_CM_CONFIG}`} path={`${path}/${URLS.APP_CM_CONFIG}/:name?`}>
                <div className="dc__overflow-auto">
                    <ConfigMapSecretWrapper
                        appName={selectedApp.label}
                        envName={selectedEnv.name}
                        envConfig={envConfig}
                        fetchEnvConfig={fetchEnvConfig}
                        onErrorRedirectURL=""
                        reloadEnvironments={reloadEnvironments}
                        isProtected={selectedEnv.isProtected}
                        clusterId={null}
                    />
                </div>
            </Route>
            <Route key={`${path}/${URLS.APP_CS_CONFIG}`} path={`${path}/${URLS.APP_CS_CONFIG}/:name?`}>
                <div className="dc__overflow-auto">
                    <ConfigMapSecretWrapper
                        componentType={CMSecretComponentType.Secret}
                        appName={selectedApp.label}
                        envName={selectedEnv.name}
                        envConfig={envConfig}
                        fetchEnvConfig={fetchEnvConfig}
                        onErrorRedirectURL=""
                        reloadEnvironments={reloadEnvironments}
                        isProtected={selectedEnv.isProtected}
                        clusterId={null}
                    />
                </div>
            </Route>
        </Switch>
    )

    const renderCompareView = () => (
        <Route
            key={`${path}/${URLS.APP_ENV_CONFIG_COMPARE}`}
            path={`${path}/${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo?/:resourceType(${Object.values(EnvResourceType).join('|')})/:resourceName?`}
        >
            {({ match, location }) => {
                const basePath = generatePath(path, match.params)
                // Set the resourceTypePath based on the resourceType from the URL parameters.
                // If the resourceType is 'Manifest', use 'deployment-template' as the back URL.
                // Otherwise, use the actual resourceType from the URL, which could be 'deployment-template', 'configmap', or 'secrets'.
                const resourceTypePath = `/${match.params.resourceType === EnvResourceType.Manifest ? EnvResourceType.DeploymentTemplate : match.params.resourceType}`
                const resourceNamePath = match.params.resourceName ? `/${match.params.resourceName}` : ''

                const goBackURL = `${basePath}${resourceTypePath}${resourceNamePath}`

                return (
                    <DeploymentConfigCompare
                        type="app"
                        appName={selectedApp.label}
                        environments={environments}
                        goBackURL={goBackURL}
                        getNavItemHref={(resourceType, resourceName) =>
                            `${generatePath(match.path, { ...match.params, resourceType, resourceName })}${location.search}`
                        }
                    />
                )
            }}
        </Route>
    )

    return (
        <Switch>
            {showConfig ? renderCompareView() : null}
            <Route>
                <div className="release-configurations dc__grid h-100 dc__overflow-hidden">
                    <div className="flexbox-col min-h-100 bcn-0 dc__border-right">
                        <ConfigurationsAppEnvSelector />
                        {showConfig ? renderConfigSideNav() : null}
                    </div>
                    {showConfig ? renderConfig() : renderNullState()}
                </div>
            </Route>
        </Switch>
    )
}
