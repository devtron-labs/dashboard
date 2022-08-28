import React, { useState, useEffect } from 'react'
import ConfigMapOverrides from './ConfigMapOverrides'
import SecretOverrides from './SecretOverrides'
import DeploymentTemplateOverride from './DeploymentTemplateOverride'
import { mapByKey, Progressing, ErrorBoundary, useAppContext, useAsync } from '../common'
import { useParams, useRouteMatch, generatePath, useHistory, useLocation } from 'react-router'
import './environmentOverride.scss'
import Reload from '../Reload/Reload'
import { getAppOtherEnvironment } from '../../services/service'
import { getAppComposeURL, APP_COMPOSE_STAGE, URLS } from '../../config'
import { Route, Switch } from 'react-router-dom'
import { ComponentStates, SectionHeadingType, SECTION_HEADING_INFO } from './EnvironmentOverrides.type'
import { ReactComponent as Arrow } from '../../assets/icons/ic-arrow-left.svg'

export default function EnvironmentOverride() {
    const params = useParams<{ appId: string; envId: string }>()
    const [appEnvironmentsLoading, appEnvironmentResult] = useAsync(
        () => getAppOtherEnvironment(params.appId),
        [params.appId],
        !!params.appId,
    )

    const [viewState, setViewState] = useState<ComponentStates>(null)
    const { path } = useRouteMatch()
    const { push } = useHistory()
    const location = useLocation()
    const { environmentId, setEnvironmentId } = useAppContext()
    const [headingData, setHeadingData] = useState<SectionHeadingType>()

    const environments = mapByKey(appEnvironmentResult?.result || [], 'environmentId')

    useEffect(() => {
        if (params.envId) setEnvironmentId(+params.envId)
        setViewState('loading')
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
        if (params.envId || appEnvironmentsLoading) return
        if (environments.has(environmentId)) {
            const newUrl = generatePath(path, { appId: params.appId, envId: environmentId })
            push(newUrl)
        } else {
            const workflowUrl = getAppComposeURL(params.appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR)
            push(workflowUrl)
        }
    }
    useEffect(envMissingRedirect, [appEnvironmentsLoading])

    if (!params.envId) {
        return null
    } else if (appEnvironmentsLoading) {
        return <Progressing pageLoader />
    } else if (viewState === 'failed') {
        return (
            <Reload
                reload={(event) => {
                    setViewState('loading')
                }}
            />
        )
    }

    return (
        <ErrorBoundary>
            <div className={headingData ? 'environment-override mb-24' : 'deployment-template-override h-100'}>
                {environments.size && headingData && (
                    <>
                        <h1 className="form__title form__title--artifacts flex left">
                            {environments.has(+params.envId) ? (
                                <>
                                    {environments.get(+params.envId).environmentName}
                                    <Arrow className="icon-dim-20 fcn-6 rotateBy-180 mr-4 ml-4" />
                                </>
                            ) : (
                                ''
                            )}
                            {headingData.title}
                        </h1>
                        <div className="form__subtitle">
                            {headingData.subtitle}&nbsp;
                            <a
                                className="learn-more__href"
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
                    <Route
                        path={`${path}/${URLS.APP_DEPLOYMENT_CONFIG}`}
                        render={(props) => (
                            <DeploymentTemplateOverride
                                parentState={viewState}
                                setParentState={setViewState}
                                environments={appEnvironmentResult?.result}
                                environmentName={
                                    environments.has(+params.envId)
                                        ? environments.get(+params.envId).environmentName
                                        : ''
                                }
                            />
                        )}
                    />
                    <Route
                        path={`${path}/${URLS.APP_CM_CONFIG}`}
                        render={(props) => <ConfigMapOverrides parentState={viewState} setParentState={setViewState} />}
                    />
                    <Route
                        path={`${path}/${URLS.APP_CS_CONFIG}`}
                        render={(props) => <SecretOverrides parentState={viewState} setParentState={setViewState} />}
                    />
                </Switch>
            </div>
        </ErrorBoundary>
    )
}
