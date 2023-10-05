import React, { useState, useEffect } from 'react'
import DeploymentTemplateOverride from './DeploymentTemplateOverride'
import { mapByKey, ErrorBoundary, useAppContext } from '../common'
import { Reload } from '@devtron-labs/devtron-fe-common-lib'
import { useParams, useRouteMatch, useHistory, useLocation } from 'react-router'
import { APP_COMPOSE_STAGE, URLS, getAppComposeURL } from '../../config'
import { Redirect, Route, Switch, generatePath } from 'react-router-dom'
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
        if (params.envId) return
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
    } else if (viewState === ComponentStates.failed) {
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
        } else if (environments?.length) {
            return environmentsMap.get(+params.envId)?.environmentName || ''
        } else {
            return ''
        }
    }

    const getEnvName = (): string => {
        if (envName) {
            return envName
        } else if (environmentsMap.has(+params.envId)) {
            return environmentsMap.get(+params.envId).environmentName
        } else {
            return ''
        }
    }

    return (
        <ErrorBoundary>
            <div className={isDeploymentOverride ? 'deployment-template-override' : ''}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                        <DeploymentTemplateOverride
                            parentState={viewState}
                            setParentState={setViewState}
                            environments={environments}
                            environmentName={getEnvName()}
                            isProtected={isProtected}
                            reloadEnvironments={reloadEnvironments}
                        />
                    </Route>
                    <Route path={`${path}/${URLS.APP_CM_CONFIG}`}>
                        <ConfigMapList
                            isOverrideView={true}
                            isProtected={isProtected}
                            parentState={viewState}
                            parentName={getParentName()}
                            setParentState={setViewState}
                            isJobView={isJobView}
                            reloadEnvironments={reloadEnvironments}
                        />
                    </Route>
                    <Route path={`${path}/${URLS.APP_CS_CONFIG}`}>
                        <SecretList
                            isOverrideView={true}
                            parentState={viewState}
                            isProtected={isProtected}
                            parentName={getParentName()}
                            setParentState={setViewState}
                            isJobView={isJobView}
                            reloadEnvironments={reloadEnvironments}
                        />
                    </Route>
                    <Redirect to={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`} />
                </Switch>
            </div>
        </ErrorBoundary>
    )
}
