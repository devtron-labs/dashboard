import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { useAsync } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
import { importComponentFromFELibrary } from '@Components/common'
import { CMSecretComponentType } from '@Pages/Shared/ConfigMapSecret/types'
import { getEnvConfig } from '@Pages/Applications/DevtronApps/service'
import { DeploymentTemplate } from '@Pages/Applications'
// TODO: export from index and check at all places
import { EnvConfigurationsNav } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/Navigation/EnvConfigurationsNav'
import { EnvironmentOptionType } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'
import { ConfigMapSecretWrapper } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecret.wrapper'

import './styles.scss'

const useSoftwareDistributionHubRenderContext = importComponentFromFELibrary(
    'useSoftwareDistributionHubRenderContext',
    null,
    'function',
)
const ConfigurationsSideNav = importComponentFromFELibrary('ConfigurationsSideNav', null, 'function')

export const ReleaseConfigMapSecret = () => {
    // HOOKS
    const { path, params } = useRouteMatch<{ appId: string; envId: string }>()
    const { appId, envId } = params

    // CONTEXTS
    const context = useSoftwareDistributionHubRenderContext()
    const environments = context.environments as EnvironmentOptionType[]
    const applications = context.applications as any[]

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

    const appName = applications && applications.find(({ value }) => +appId === value).label
    const selectedEnv = environments?.find(({ id }) => +envId === id)

    return (
        <div className="release-configurations dc__grid h-100 dc__overflow-hidden">
            <div className="flexbox-col min-h-100 bcn-0 dc__border-right">
                <ConfigurationsSideNav />
                <Switch>
                    <Route path={`${path}/:resourceType`}>
                        {environments && envId && (
                            <EnvConfigurationsNav
                                envConfig={envConfig}
                                environments={environments}
                                fetchEnvConfig={fetchEnvConfig}
                                goBackURL={null}
                                showDeploymentTemplate
                                showComparison
                                hideEnvSelector
                            />
                        )}
                    </Route>
                </Switch>
            </div>
            {appName && selectedEnv && (
                <Switch>
                    <Route
                        key={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}
                        path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}/`}
                    >
                        <div className="deployment-template dc__overflow-auto dc__position-rel">
                            <DeploymentTemplate
                                fetchEnvConfig={fetchEnvConfig}
                                isProtected
                                reloadEnvironments={() => {}}
                                environmentName={selectedEnv.name}
                            />
                        </div>
                    </Route>
                    <Route path={`${path}/${URLS.APP_CM_CONFIG}/:name?`}>
                        <div className="dc__overflow-auto">
                            <ConfigMapSecretWrapper
                                key={`${path}/${URLS.APP_CM_CONFIG}`}
                                appName={appName}
                                envName={selectedEnv.name}
                                envConfig={envConfig}
                                fetchEnvConfig={fetchEnvConfig}
                                onErrorRedirectURL=""
                                reloadEnvironments={() => {}}
                                isProtected={selectedEnv.isProtected}
                            />
                        </div>
                    </Route>
                    <Route path={`${path}/${URLS.APP_CS_CONFIG}/:name?`}>
                        <div className="dc__overflow-auto">
                            <ConfigMapSecretWrapper
                                key={`${path}/${URLS.APP_CS_CONFIG}`}
                                componentType={CMSecretComponentType.Secret}
                                appName={appName}
                                envName={selectedEnv.name}
                                envConfig={envConfig}
                                fetchEnvConfig={fetchEnvConfig}
                                onErrorRedirectURL=""
                                reloadEnvironments={() => {}}
                                isProtected={selectedEnv.isProtected}
                            />
                        </div>
                    </Route>
                </Switch>
            )}
        </div>
    )
}
