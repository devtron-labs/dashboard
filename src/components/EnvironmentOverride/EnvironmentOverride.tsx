import React, { useState, useEffect } from 'react'
import DeploymentTemplateOverride from './DeploymentTemplateOverride'
import { mapByKey, ErrorBoundary, useAppContext, useAsync } from '../common'
import { Progressing, Reload } from '@devtron-labs/devtron-fe-common-lib'
import { useParams, useRouteMatch, generatePath, useHistory, useLocation } from 'react-router'
import { getAppComposeURL, APP_COMPOSE_STAGE, URLS } from '../../config'
import { Redirect, Route, Switch } from 'react-router-dom'
import {
    ComponentStates,
    EnvironmentOverrideComponentProps,
} from './EnvironmentOverrides.type'
import ConfigMapList from '../ConfigMapSecret/ConfigMap/ConfigMapList'
import SecretList from '../ConfigMapSecret/Secret/SecretList'
import { getAppOtherEnvironmentMin, getJobOtherEnvironmentMin } from '../../services/service'
import './environmentOverride.scss'

export default function EnvironmentOverride({
    appList,
    environments,
    setEnvironments,
    isJobView,
    envList
}: EnvironmentOverrideComponentProps) {
    const params = useParams<{ appId: string; envId: string }>()
    const [viewState, setViewState] = useState<ComponentStates>(null)
    const { path } = useRouteMatch()
    const { push } = useHistory()
    const location = useLocation()
    const { environmentId, setEnvironmentId } = useAppContext()
    const [isDeploymentOverride, setIsDeploymentOverride] = useState(false)
    const [environmentsLoading, environmentResult, error, reloadEnvironments] = useAsync(
        () => (!isJobView ? getAppOtherEnvironmentMin(params.appId) : getJobOtherEnvironmentMin(params.appId)),
        [params.appId],
        !!params.appId,
    )

    const environmentsMap = mapByKey(envList || [], 'id')
    const appMap = mapByKey(appList || [], 'id')

    useEffect(() => {
        if (params.envId) setEnvironmentId(+params.envId)
        setViewState(ComponentStates.loading)
    }, [params.envId])

    useEffect(() => {
        if (!location.pathname.includes(URLS.APP_CM_CONFIG) && !location.pathname.includes(URLS.APP_CS_CONFIG)) {
            setIsDeploymentOverride(true)
        }
    }, [location.pathname])

    const envMissingRedirect = () => {
        if (params.envId || environmentsLoading) return
        if (environmentsMap.has(environmentId)) {
            const newUrl = generatePath(path, { appId: params.appId, envId: environmentId })
            push(newUrl)
        } else {
            const workflowUrl = getAppComposeURL(params.appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR)
            push(workflowUrl)
        }
    }
    useEffect(envMissingRedirect, [environmentsLoading])

    useEffect(() => {
        if (viewState === ComponentStates.reloading) {
            reloadEnvironments()
        }
    }, [viewState])

    useEffect(() => {
        if (!environmentsLoading && environmentResult?.result) {
            setEnvironments(environmentResult.result)
        }
    }, [environmentsLoading, environmentResult])

    if (!params.envId) {
        return null
    } else if (environmentsLoading && viewState !== ComponentStates.reloading) {
        return <Progressing pageLoader />
    } else if (viewState === ComponentStates.failed) {
        return (
            <Reload
                reload={(event) => {
                    setViewState(ComponentStates.loading)
                }}
            />
        )
    }

    const getParentName = (): string => {
        if (appList?.length) {
            return appMap.get(+params.appId).name
        } else if (environments?.length) {
            return environmentsMap.get(+params.envId).environmentName
        } else {
            return ''
        }
    }

    return (
        <ErrorBoundary>
            <div className={isDeploymentOverride ?'deployment-template-override h-100': ''}>

                <Switch>
                    <Route path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}>
                        <DeploymentTemplateOverride
                            parentState={viewState}
                            setParentState={setViewState}
                            environments={environments}
                            environmentName={
                                environmentsMap.has(+params.envId)
                                    ? environmentsMap.get(+params.envId).environmentName
                                    : ''
                            }
                        />
                    </Route>
                    <Route path={`${path}/${URLS.APP_CM_CONFIG}`}>
                        <ConfigMapList
                            isOverrideView={true}
                            isProtected={environmentsMap.get(+params.envId)?.isProtected}
                            parentState={viewState}
                            parentName={getParentName()}
                            setParentState={setViewState}
                            isJobView={isJobView}
                        />
                    </Route>
                    <Route path={`${path}/${URLS.APP_CS_CONFIG}`}>
                        <SecretList
                            isOverrideView={true}
                            parentState={viewState}
                            isProtected={environmentsMap.get(+params.envId)?.isProtected}
                            parentName={getParentName()}
                            setParentState={setViewState}
                            isJobView={isJobView}
                        />
                    </Route>
                    <Redirect to={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`} />
                </Switch>
            </div>
        </ErrorBoundary>
    )
}
