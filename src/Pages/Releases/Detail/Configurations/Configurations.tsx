import { useMemo } from 'react'
import { generatePath, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import {
    ApprovalConfigDataKindType,
    DeploymentHistoryBaseParamsType,
    EnvResourceType,
    GenericEmptyState,
    getIsApprovalPolicyConfigured,
    Progressing,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
import { importComponentFromFELibrary } from '@Components/common'
import { ConfigMapSecretWrapper, CMSecretComponentType } from '@Pages/Shared/ConfigMapSecret'
import { DeploymentConfigCompare, DeploymentTemplate } from '@Pages/Applications'
import { getEnvConfig } from '@Pages/Applications/DevtronApps/service'
import { EnvConfigurationsNav } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/Navigation/EnvConfigurationsNav'

import { ReleaseConfigurationContextType } from './types'

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
    const { path, params } = useRouteMatch<Pick<DeploymentHistoryBaseParamsType, 'appId' | 'envId'>>()
    const { appId, envId } = params

    // CONTEXTS
    const {
        environments,
        applications,
        reloadEnvironments,
        isAppListLoading,
        isEnvListLoading,
        envIdToEnvApprovalConfigMap,
    }: ReleaseConfigurationContextType = useReleaseConfigurationContext()

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
    const approvalConfigForEnv = envIdToEnvApprovalConfigMap[selectedEnv?.id]?.approvalConfigurationMap
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
                    envIdToEnvApprovalConfigMap={envIdToEnvApprovalConfigMap}
                />
            </Route>
        </Switch>
    )

    const renderConfig = () => (
        <Switch>
            <Route key={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`} path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                <div className="dc__overflow-auto">
                    <DeploymentTemplate
                        key={`${appId}/${envId}`}
                        fetchEnvConfig={fetchEnvConfig}
                        isApprovalPolicyConfigured={getIsApprovalPolicyConfigured(
                            approvalConfigForEnv?.[ApprovalConfigDataKindType.deploymentTemplate],
                        )}
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
                        isApprovalPolicyConfigured={getIsApprovalPolicyConfigured(
                            approvalConfigForEnv?.[ApprovalConfigDataKindType.configMap],
                        )}
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
                        isApprovalPolicyConfigured={getIsApprovalPolicyConfigured(
                            approvalConfigForEnv?.[ApprovalConfigDataKindType.configSecret],
                        )}
                        clusterId={null}
                    />
                </div>
            </Route>
            <Redirect to={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`} />
        </Switch>
    )

    return (
        <Switch>
            <Route
                key={`${path}/${URLS.APP_ENV_CONFIG_COMPARE}`}
                path={`${path}/${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo?/:resourceType(${Object.values(EnvResourceType).join('|')})/:resourceName?`}
            >
                {({ match, location }) => {
                    const basePath = generatePath(path, match.params)
                    // Set the resourceTypePath based on the resourceType from the URL parameters.
                    // If the resourceType is 'Manifest' or 'PipelineStrategy', use 'deployment-template' as the back URL.
                    // Otherwise, use the actual resourceType from the URL, which could be 'deployment-template', 'configmap', or 'secrets'.
                    const resourceTypePath = `/${match.params.resourceType === EnvResourceType.Manifest || match.params.resourceType === EnvResourceType.PipelineStrategy ? EnvResourceType.DeploymentTemplate : match.params.resourceType}`
                    const resourceNamePath = match.params.resourceName ? `/${match.params.resourceName}` : ''

                    const goBackURL = `${basePath}${resourceTypePath}${resourceNamePath}`

                    return showConfig ? (
                        <DeploymentConfigCompare
                            type="app"
                            appName={selectedApp.label}
                            environments={environments}
                            goBackURL={goBackURL}
                            overwriteNavHeading={`Comparing ${selectedApp.label}`}
                            getNavItemHref={(resourceType, resourceName) =>
                                `${generatePath(match.path, { ...match.params, resourceType, resourceName })}${location.search}`
                            }
                            appOrEnvIdToAppOrEnvApprovalConfigMap={envIdToEnvApprovalConfigMap}
                        />
                    ) : (
                        <Progressing fullHeight pageLoader />
                    )
                }}
            </Route>
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
