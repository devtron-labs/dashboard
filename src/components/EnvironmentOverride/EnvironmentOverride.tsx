import React, { useState, useEffect } from 'react'
import ConfigMapOverrides from './ConfigMapOverrides'
import SecretOverrides from './SecretOverrides'
import DeploymentTemplateOverride from './DeploymentTemplateOverride'
import { mapByKey, ErrorBoundary, useAppContext, useAsync } from '../common'
import { Progressing, Reload } from '@devtron-labs/devtron-fe-common-lib'
import { useParams, useRouteMatch, generatePath, useHistory, useLocation } from 'react-router'
import './environmentOverride.scss'
import { getAppComposeURL, APP_COMPOSE_STAGE, URLS } from '../../config'
import { Redirect, Route, Switch } from 'react-router-dom'
import {
    ComponentStates,
    EnvironmentOverrideComponentProps,
    SectionHeadingType,
    SECTION_HEADING_INFO,
} from './EnvironmentOverrides.type'
import { ReactComponent as Arrow } from '../../assets/icons/ic-arrow-left.svg'
import { getAppOtherEnvironmentMin } from '../../services/service'
import ConfigMapList from '../ConfigMapSecret/ConfigMap/ConfigMapList'
import SecretList from '../ConfigMapSecret/Secret/SecretList'

export default function EnvironmentOverride({
    appList,
    environments,
    setEnvironments,
}: EnvironmentOverrideComponentProps) {
    const params = useParams<{ appId: string; envId: string }>()
    const [viewState, setViewState] = useState<ComponentStates>(null)
    const { path } = useRouteMatch()
    const { push } = useHistory()
    const location = useLocation()
    const { environmentId, setEnvironmentId } = useAppContext()
    const [headingData, setHeadingData] = useState<SectionHeadingType>()
    const [environmentsLoading, environmentResult, error, reloadEnvironments] = useAsync(
        () => getAppOtherEnvironmentMin(params.appId),
        [params.appId],
        !!params.appId,
    )

    const environmentsMap = mapByKey(environments || [], 'environmentId')
    const appMap = mapByKey(appList || [], 'id')

    useEffect(() => {
        if (params.envId) setEnvironmentId(+params.envId)
        setViewState(ComponentStates.loading)
    }, [params.envId])

    useEffect(() => {
        if (location.pathname.includes(URLS.APP_CM_CONFIG)) {
            setHeadingData(SECTION_HEADING_INFO[URLS.APP_CM_CONFIG])
        } else if (location.pathname.includes(URLS.APP_CS_CONFIG)) {
            setHeadingData(SECTION_HEADING_INFO[URLS.APP_CS_CONFIG])
        } else {
            setHeadingData(null)
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

    const formTitle = () => {
        return appMap.has(+params.appId) || environmentsMap.has(+params.envId) ? (
            <>
                {appList ? appMap.get(+params.appId).name : environmentsMap.get(+params.envId).environmentName}
                <Arrow className="icon-dim-20 fcn-6 rotateBy-180 mr-4 ml-4" />
            </>
        ) : (
            ''
        )
    }

    return (
        <ErrorBoundary>
            <div className={headingData ? 'environment-override mb-24' : 'deployment-template-override h-100'}>
                {headingData && (
                    <>
                        <h1 className="form__title form__title--artifacts flex left" data-testid="environment-override-header">
                            {formTitle()}
                            {headingData.title}
                        </h1>
                        <div className="form__subtitle">
                            {headingData.subtitle}&nbsp;
                            <a
                                className="dc__link"
                                rel="noreferre noopener"
                                href={headingData.learnMoreLink}
                                target="blank"
                            >
                                Learn more
                            </a>
                        </div>
                    </>
                )}
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
                        {/* <ConfigMapOverrides parentState={viewState} setParentState={setViewState} /> */}
                        <ConfigMapList isOverrideView={true} parentState={viewState} setParentState={setViewState} />
                    </Route>
                    <Route path={`${path}/${URLS.APP_CS_CONFIG}`}>
                        {/* <SecretOverrides parentState={viewState} setParentState={setViewState} /> */}
                        <SecretList isOverrideView={true} parentState={viewState} setParentState={setViewState} />
                    </Route>
                    <Redirect to={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`} />
                </Switch>
            </div>
        </ErrorBoundary>
    )
}
