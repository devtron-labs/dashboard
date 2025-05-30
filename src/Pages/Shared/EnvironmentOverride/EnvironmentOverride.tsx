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

import { useEffect, useState } from 'react'
import { generatePath, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'

import {
    ApprovalConfigDataKindType,
    CMSecretComponentType,
    getIsApprovalPolicyConfigured,
    Reload,
} from '@devtron-labs/devtron-fe-common-lib'

import { ErrorBoundary, mapByKey, useAppContext } from '@Components/common'
import { APP_COMPOSE_STAGE, getAppComposeURL, URLS } from '@Config/index'
import { DeploymentTemplate } from '@Pages/Applications'
import { ConfigMapSecretWrapper } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecret.wrapper'

import { ComponentStates, EnvironmentOverrideComponentProps } from './EnvironmentOverrides.types'

import './environmentOverride.scss'

const EnvironmentOverride = ({
    appList,
    isJob,
    environments,
    reloadEnvironments,
    envName,
    appName,
    onErrorRedirectURL,
    envConfig,
    fetchEnvConfig,
    appOrEnvIdToResourceApprovalConfigurationMap,
    isTemplateView,
}: EnvironmentOverrideComponentProps) => {
    const isAppGroupView = !!envName
    const params = useParams<{ appId: string; envId: string }>()
    const [viewState, setViewState] = useState<ComponentStates>(null)
    const { path, url } = useRouteMatch()
    const { push } = useHistory()
    const location = useLocation()
    const { environmentId, setEnvironmentId } = useAppContext()
    const environmentsMap = mapByKey(environments || [], 'environmentId')
    const appMap = mapByKey(appList || [], 'id')
    const approvalConfigMap =
        appOrEnvIdToResourceApprovalConfigurationMap?.[+(isAppGroupView ? params.appId : params.envId)]
            ?.approvalConfigurationMap
    const isDeploymentOverride = !!location.pathname.includes(URLS.APP_DEPLOYMENT_CONFIG)

    useEffect(() => {
        if (params.envId && setEnvironmentId) {
            setEnvironmentId(+params.envId)
        }
    }, [params.envId])

    useEffect(() => {
        if (params.envId) {
            return
        }
        if (environmentsMap.has(environmentId)) {
            const newUrl = generatePath(path, { appId: params.appId, envId: environmentId })
            push(newUrl)
        } else {
            const workflowUrl = getAppComposeURL(params.appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR, null, isTemplateView)
            push(workflowUrl)
        }
    }, [])

    useEffect(() => {
        if (viewState === ComponentStates.reloading) {
            reloadEnvironments()
        }
    }, [viewState])

    if (!params.envId) {
        return null
    }
    if (viewState === ComponentStates.failed) {
        return (
            <Reload
                reload={() => {
                    setViewState(ComponentStates.reloading)
                }}
            />
        )
    }

    if (params.envId && !environmentsMap.has(+params.envId) && environments.length) {
        const newUrl = url.replace(
            `${URLS.APP_ENV_OVERRIDE_CONFIG}/${params.envId}`,
            `${URLS.APP_ENV_OVERRIDE_CONFIG}/${environments[0].environmentId}`,
        )
        push(newUrl)
    }

    const getParentName = (): string => {
        if (appList?.length) {
            return appMap.get(+params.appId).name
        }
        if (environments?.length) {
            return environmentsMap.get(+params.envId)?.environmentName || ''
        }
        return ''
    }

    const getEnvName = (): string => {
        if (envName) {
            return envName
        }
        if (environmentsMap.has(+params.envId)) {
            return environmentsMap.get(+params.envId).environmentName
        }
        return ''
    }

    const getAppName = (): string => {
        if (appName) {
            return appName
        }
        if (appMap.has(+params.appId)) {
            return appMap.get(+params.appId).name
        }
        return ''
    }

    const clusterId = environmentsMap.get(+params.envId)?.clusterId?.toString()

    return (
        <ErrorBoundary>
            <div className={`h-100 ${isDeploymentOverride ? 'deployment-template-override' : ''}`}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                        <DeploymentTemplate
                            key={`deployment-${params.appId}-${params.envId}`}
                            environmentName={getEnvName()}
                            isApprovalPolicyConfigured={getIsApprovalPolicyConfigured(
                                approvalConfigMap?.[ApprovalConfigDataKindType.deploymentTemplate],
                            )}
                            reloadEnvironments={reloadEnvironments}
                            clusterId={clusterId}
                            fetchEnvConfig={fetchEnvConfig}
                            isExceptionUser={
                                approvalConfigMap?.[ApprovalConfigDataKindType.deploymentTemplate].isExceptionUser
                            }
                            isTemplateView={isTemplateView}
                        />
                    </Route>
                    <Route path={`${path}/${URLS.APP_CM_CONFIG}/:name?`}>
                        <ConfigMapSecretWrapper
                            key={`configmap-${params.appId}-${params.envId}`}
                            isApprovalPolicyConfigured={getIsApprovalPolicyConfigured(
                                approvalConfigMap?.[ApprovalConfigDataKindType.configMap],
                            )}
                            parentState={viewState}
                            parentName={getParentName()}
                            setParentState={setViewState}
                            clusterId={clusterId}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={onErrorRedirectURL}
                            reloadEnvironments={reloadEnvironments}
                            isJob={isJob}
                            appName={getAppName()}
                            envName={getEnvName()}
                            isExceptionUser={approvalConfigMap?.[ApprovalConfigDataKindType.configMap].isExceptionUser}
                            isTemplateView={isTemplateView}
                        />
                    </Route>
                    <Route path={`${path}/${URLS.APP_CS_CONFIG}/:name?`}>
                        <ConfigMapSecretWrapper
                            key={`secret-${params.appId}-${params.envId}`}
                            isApprovalPolicyConfigured={getIsApprovalPolicyConfigured(
                                approvalConfigMap?.[ApprovalConfigDataKindType.configSecret],
                            )}
                            parentState={viewState}
                            parentName={getParentName()}
                            setParentState={setViewState}
                            clusterId={environmentsMap.get(+params.envId)?.clusterId?.toString()}
                            componentType={CMSecretComponentType.Secret}
                            envConfig={envConfig}
                            fetchEnvConfig={fetchEnvConfig}
                            onErrorRedirectURL={onErrorRedirectURL}
                            reloadEnvironments={reloadEnvironments}
                            isJob={isJob}
                            appName={getAppName()}
                            envName={getEnvName()}
                            isExceptionUser={
                                approvalConfigMap?.[ApprovalConfigDataKindType.configSecret].isExceptionUser
                            }
                            isTemplateView={isTemplateView}
                        />
                    </Route>
                </Switch>
            </div>
        </ErrorBoundary>
    )
}

export default EnvironmentOverride
