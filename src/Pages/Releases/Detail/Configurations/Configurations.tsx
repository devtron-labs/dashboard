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

import { useEffect, useMemo, useState } from 'react'
import { generatePath, Route, Switch, useRouteMatch } from 'react-router-dom'

import {
    ApprovalConfigDataKindType,
    DeploymentHistoryBaseParamsType,
    EnvResourceType,
    GenericEmptyState,
    getIsApprovalPolicyConfigured,
    Progressing,
    CMSecretComponentType,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
import { importComponentFromFELibrary } from '@Components/common'
import { ConfigMapSecretWrapper } from '@Pages/Shared/ConfigMapSecret'
import { DeploymentConfigCompare, DeploymentTemplate } from '@Pages/Applications'
import { getEnvConfig } from '@Pages/Applications/DevtronApps/service'
import { EnvConfigurationsNav } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/Navigation/EnvConfigurationsNav'

import { EnvConfigType } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'
import { DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE } from '@Config/constants'
import { ReleaseConfigurationContextType } from './types'

import './styles.scss'

const useReleaseConfigurationContext = importComponentFromFELibrary('useReleaseConfigurationContext', null, 'function')
const ConfigurationsAppEnvSelector = importComponentFromFELibrary('ConfigurationsAppEnvSelector', null, 'function')

const renderNullState = () => (
    <div className="bg__primary">
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
        envIdToEnvApprovalConfigurationMap,
    }: ReleaseConfigurationContextType = useReleaseConfigurationContext()

    const [envConfigResLoading, setEnvConfigResLoading] = useState<boolean>(false)
    const [envConfigRes, setEnvConfigRes] = useState<EnvConfigType>(null)

    const fetchEnvConfig = async (propEnvId?: number, callback?: Parameters<typeof getEnvConfig>[2]) => {
        if (!appId || !envId) {
            return
        }

        try {
            setEnvConfigResLoading(true)
            const res = await getEnvConfig(+appId, +envId, callback)
            setEnvConfigRes(res)
        } catch {
            // Do nothing
        } finally {
            setEnvConfigResLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchEnvConfig()
    }, [appId, envId])

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
    const approvalConfigForEnv = envIdToEnvApprovalConfigurationMap?.[selectedEnv?.id]?.approvalConfigurationMap
    const showConfig = !!selectedApp && !!selectedEnv

    // RENDERERS
    const renderConfigSideNav = () => (
        <Switch>
            <Route path={`${path}/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}?`}>
                <EnvConfigurationsNav
                    envConfig={envConfig}
                    environments={environments}
                    fetchEnvConfig={fetchEnvConfig}
                    goBackURL={null}
                    compareWithURL={path}
                    showDeploymentTemplate
                    showComparison
                    hideEnvSelector
                    appOrEnvIdToResourceApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                />
            </Route>
        </Switch>
    )

    const renderConfig = () => (
        <Switch>
            <Route path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                <div key={`${appId}-${envId}-${URLS.APP_DEPLOYMENT_CONFIG}`} className="dc__overflow-auto">
                    <DeploymentTemplate
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
            <Route path={`${path}/${URLS.APP_CM_CONFIG}/:name?`}>
                <div key={`${appId}-${envId}-${URLS.APP_CM_CONFIG}`} className="dc__overflow-auto">
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
            <Route path={`${path}/${URLS.APP_CS_CONFIG}/:name?`}>
                <div key={`${appId}-${envId}-${URLS.APP_CS_CONFIG}`} className="dc__overflow-auto">
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
        </Switch>
    )

    return (
        <Switch>
            <Route
                key={`${path}/${URLS.APP_ENV_CONFIG_COMPARE}`}
                path={`${path}/${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo?/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}/:resourceName?`}
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
                            appOrEnvIdToResourceApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                        />
                    ) : (
                        <Progressing fullHeight pageLoader />
                    )
                }}
            </Route>
            <Route>
                <div className="release-configurations dc__grid h-100 dc__overflow-hidden">
                    <div className="flexbox-col min-h-100 bg__primary dc__border-right">
                        <ConfigurationsAppEnvSelector />
                        {showConfig ? renderConfigSideNav() : null}
                    </div>
                    {showConfig ? renderConfig() : renderNullState()}
                </div>
            </Route>
        </Switch>
    )
}
