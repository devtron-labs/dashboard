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

import React, { useState, useEffect } from 'react'
import { Reload } from '@devtron-labs/devtron-fe-common-lib'
import { useParams, useRouteMatch, useHistory, useLocation } from 'react-router'
import { Redirect, Route, Switch, generatePath } from 'react-router-dom'
import DeploymentTemplateOverride from './DeploymentTemplateOverride'
import { mapByKey, ErrorBoundary, useAppContext } from '../common'
import { APP_COMPOSE_STAGE, URLS, getAppComposeURL } from '../../config'
import { ComponentStates, EnvironmentOverrideComponentProps } from './EnvironmentOverrides.type'
import ConfigMapList from '../ConfigMapSecret/ConfigMap/ConfigMapList'
import SecretList from '../ConfigMapSecret/Secret/SecretList'
import './environmentOverride.scss'

export default function EnvironmentOverride({
    appList,
    isJobView,
    environments,
    reloadEnvironments,
    envName,
}: EnvironmentOverrideComponentProps) {
    const params = useParams<{ appId: string; envId: string }>()
    const [viewState, setViewState] = useState<ComponentStates>(null)
    const { path, url } = useRouteMatch()
    const { push } = useHistory()
    const location = useLocation()
    const { environmentId, setEnvironmentId } = useAppContext()
    const [isDeploymentOverride, setIsDeploymentOverride] = useState(false)
    const environmentsMap = mapByKey(environments || [], 'environmentId')
    const appMap = mapByKey(appList || [], 'id')
    const isProtected =
        environmentsMap.get(+params.envId)?.isProtected ?? appMap.get(+params.appId)?.isProtected ?? false
    useEffect(() => {
        if (params.envId) {
            setEnvironmentId(+params.envId)
        }
    }, [params.envId])

    useEffect(() => {
        if (!location.pathname.includes(URLS.APP_CM_CONFIG) && !location.pathname.includes(URLS.APP_CS_CONFIG)) {
            setIsDeploymentOverride(true)
        }
    }, [location.pathname])

    useEffect(() => {
        if (params.envId) {
            return
        }
        if (environmentsMap.has(environmentId)) {
            const newUrl = generatePath(path, { appId: params.appId, envId: environmentId })
            push(newUrl)
        } else {
            const workflowUrl = getAppComposeURL(params.appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR)
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
                reload={(event) => {
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

    return (
        <ErrorBoundary>
            <div className={isDeploymentOverride ? 'deployment-template-override' : ''}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                        <DeploymentTemplateOverride
                            key={`deployment-${params.appId}-${params.envId}`}
                            parentState={viewState}
                            setParentState={setViewState}
                            environments={environments}
                            environmentName={getEnvName()}
                            isProtected={isProtected}
                            reloadEnvironments={reloadEnvironments}
                        />
                    </Route>
                    <Route path={`${path}/${URLS.APP_CM_CONFIG}/:name?`}>
                        <ConfigMapList
                            key={`config-map-${params.appId}-${params.envId}`}
                            isOverrideView
                            isProtected={isProtected}
                            parentState={viewState}
                            parentName={getParentName()}
                            setParentState={setViewState}
                            isJobView={isJobView}
                            reloadEnvironments={reloadEnvironments}
                            clusterId={environmentsMap.get(+params.envId)?.clusterId?.toString()}
                        />
                    </Route>
                    <Route path={`${path}/${URLS.APP_CS_CONFIG}/:name?`}>
                        <SecretList
                            key={`secret-${params.appId}-${params.envId}`}
                            isOverrideView
                            parentState={viewState}
                            isProtected={isProtected}
                            parentName={getParentName()}
                            setParentState={setViewState}
                            isJobView={isJobView}
                            reloadEnvironments={reloadEnvironments}
                            clusterId={environmentsMap.get(+params.envId)?.clusterId?.toString()}
                        />
                    </Route>
                    <Redirect to={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`} />
                </Switch>
            </div>
        </ErrorBoundary>
    )
}
