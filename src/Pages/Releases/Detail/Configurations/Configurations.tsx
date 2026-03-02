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
import { generatePath, Route, Routes, useParams } from 'react-router-dom'

import {
    ApprovalConfigDataKindType,
    CMSecretComponentType,
    DeploymentHistoryBaseParamsType,
    GenericEmptyState,
    getIsApprovalPolicyConfigured,
    Progressing,
    ROUTER_URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE } from '@Config/constants'
import { URLS } from '@Config/routes'
import { DeploymentTemplate } from '@Pages/Applications'
import { EnvConfigType } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'
import { DeploymentConfigCompareWrapper } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/DeploymentConfigCompare'
import { EnvConfigurationsNav } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/Navigation/EnvConfigurationsNav'
import { getEnvConfig } from '@Pages/Applications/DevtronApps/service'
import { ConfigMapSecretWrapper } from '@Pages/Shared/ConfigMapSecret'

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

export const ReleaseConfigurations = () => {
    // HOOKS
    const { appId, envId, releaseTrack, releaseVersion } = useParams<
        Pick<DeploymentHistoryBaseParamsType, 'appId' | 'envId'> & { releaseTrack: string; releaseVersion: string }
    >()

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

    const fetchEnvConfig = async (propEnvId?: number, callback?: Parameters<typeof getEnvConfig>[3]) => {
        if (!appId || !envId) {
            return
        }

        try {
            setEnvConfigResLoading(true)
            const res = await getEnvConfig(+appId, +envId, false, callback)
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
        <Routes>
            <Route
                key={appId}
                path={`${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}?/*`}
                element={
                    <EnvConfigurationsNav
                        envConfig={envConfig}
                        environments={environments}
                        fetchEnvConfig={fetchEnvConfig}
                        goBackURL={null}
                        compareWithURL={ROUTER_URLS.RELEASES.DETAIL.CONFIGURATIONS}
                        showDeploymentTemplate
                        showComparison
                        hideEnvSelector
                        appOrEnvIdToResourceApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                        isTemplateView={false}
                        path={`${ROUTER_URLS.RELEASES.DETAIL.CONFIGURATIONS}/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}?`}
                    />
                }
            />
        </Routes>
    )

    const renderConfig = () => (
        <Routes>
            <Route
                path={URLS.APP_DEPLOYMENT_CONFIG}
                element={
                    <div key={`${appId}-${envId}-${URLS.APP_DEPLOYMENT_CONFIG}`} className="dc__overflow-auto">
                        <DeploymentTemplate
                            fetchEnvConfig={fetchEnvConfig}
                            isApprovalPolicyConfigured={getIsApprovalPolicyConfigured(
                                approvalConfigForEnv?.[ApprovalConfigDataKindType.deploymentTemplate],
                            )}
                            reloadEnvironments={reloadEnvironments}
                            environmentName={selectedEnv.name}
                            clusterId={null}
                            isExceptionUser={
                                approvalConfigForEnv?.[ApprovalConfigDataKindType.deploymentTemplate].isExceptionUser
                            }
                            isTemplateView={false}
                        />
                    </div>
                }
            />
            <Route
                path={`${URLS.APP_CM_CONFIG}/:name?`}
                element={
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
                            isExceptionUser={
                                approvalConfigForEnv?.[ApprovalConfigDataKindType.configMap].isExceptionUser
                            }
                            isTemplateView={false}
                            routePath={`${ROUTER_URLS.RELEASES.DETAIL.CONFIGURATIONS}/${URLS.APP_CM_CONFIG}/:name?`}
                        />
                    </div>
                }
            />
            <Route
                path={`${URLS.APP_CS_CONFIG}/:name?`}
                element={
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
                            isExceptionUser={
                                approvalConfigForEnv?.[ApprovalConfigDataKindType.configSecret].isExceptionUser
                            }
                            isTemplateView={false}
                            routePath={`${ROUTER_URLS.RELEASES.DETAIL.CONFIGURATIONS}/${URLS.APP_CS_CONFIG}/:name?`}
                        />
                    </div>
                }
            />
        </Routes>
    )

    return (
        <Routes>
            <Route
                key={URLS.APP_ENV_CONFIG_COMPARE}
                path={`${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo?/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}/:resourceName?`}
                element={
                    showConfig ? (
                        <DeploymentConfigCompareWrapper
                            type="app"
                            appName={selectedApp.label}
                            environments={environments}
                            routePath={`${ROUTER_URLS.RELEASES.DETAIL.CONFIGURATIONS}/${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo?/${DEPLOYMENT_CONFIGURATION_RESOURCE_TYPE_ROUTE}/:resourceName?`}
                            baseGoBackURL={generatePath(ROUTER_URLS.RELEASES.DETAIL.CONFIGURATIONS, {
                                appId,
                                envId,
                                releaseTrack,
                                releaseVersion,
                            })}
                            overwriteNavHeading={`Comparing ${selectedApp.label}`}
                            appOrEnvIdToResourceApprovalConfigurationMap={envIdToEnvApprovalConfigurationMap}
                        />
                    ) : (
                        <Progressing fullHeight pageLoader />
                    )
                }
            />
            <Route
                index
                path="/*"
                element={
                    <div className="deploy-config-collapsible-layout dc__grid release-config-layout h-100 dc__overflow-hidden">
                        <div className="collapsible-sidebar flexbox-col min-h-100 bg__primary dc__border-right">
                            <ConfigurationsAppEnvSelector />
                            {showConfig ? renderConfigSideNav() : null}
                        </div>
                        {showConfig ? renderConfig() : renderNullState()}
                    </div>
                }
            />
        </Routes>
    )
}
