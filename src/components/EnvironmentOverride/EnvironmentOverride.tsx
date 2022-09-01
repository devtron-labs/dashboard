import React, { useState, useEffect } from 'react';
import ConfigMapOverrides from './ConfigMapOverrides'
import SecretOverrides from './SecretOverrides'
import DeploymentTemplateOverride from './DeploymentTemplateOverride'
import { mapByKey, Progressing, ErrorBoundary, useAppContext, useAsync } from '../common'
import { useParams, useRouteMatch, generatePath, useHistory } from 'react-router'
import './environmentOverride.scss'
import Reload from '../Reload/Reload'
import { getAppOtherEnvironment } from '../../services/service'
import { getAppComposeURL, APP_COMPOSE_STAGE, DOCUMENTATION } from '../../config';

type ComponentStates = 'loading' | 'success' | 'failed'
export default function EnvironmentOverride() {
    const params = useParams<{ appId: string, envId: string }>();
    const [
        appEnvironmentsLoading,
        appEnvironmentResult
    ] = useAsync(() => getAppOtherEnvironment(params.appId), [params.appId], !!params.appId);

    const [deploymentState, setDeploymentState] = useState<ComponentStates>(null)
    const [configMapState, setConfigMapState] = useState<ComponentStates>(null);
    const [secretState, setSecretState] = useState<ComponentStates>(null);
    const { path } = useRouteMatch()
    const { push } = useHistory()
    const { environmentId, setEnvironmentId } = useAppContext()

    const environments = mapByKey(appEnvironmentResult?.result || [], 'environmentId')

    useEffect(() => {
        if (params.envId) setEnvironmentId(+params.envId)
        setDeploymentState('loading');
        setConfigMapState('loading');
        setSecretState('loading');
    }, [params.envId])

    const envMissingRedirect = () => {
        if (params.envId || appEnvironmentsLoading) return;
        if (environments.has(environmentId)) {
            const newUrl = generatePath(path, { appId: params.appId, envId: environmentId });
            push(newUrl);
        } else {
            const workflowUrl = getAppComposeURL(params.appId, APP_COMPOSE_STAGE.WORKFLOW_EDITOR);
            push(workflowUrl);
        }
    }
    useEffect(envMissingRedirect, [appEnvironmentsLoading])

    if (appEnvironmentsLoading) return <Progressing pageLoader />
    if (deploymentState === 'failed' || configMapState === 'failed' || secretState === 'failed') {
        return <Reload reload={event => { setConfigMapState('loading'); setSecretState('loading'); setDeploymentState('loading') }} />
    }
    if (!params.envId) return null
    const loading = (deploymentState === 'loading' || configMapState === 'loading' || secretState === 'loading')
    return <ErrorBoundary>
        {loading && <Progressing pageLoader />}
        <div className="environment-override mb-24">
            {environments.size && !loading && <>
                <h1 className="form__title form__title--artifacts">Environment Overrides</h1>
                <div className="form__title">{environments.has(+params.envId) ? environments.get(+params.envId).environment_name : ''}</div>
                <div className="form__subtitle">Manage environment configurations for this application.&nbsp;
                        <a className="learn-more__href" rel="noreferre noopener" href={DOCUMENTATION.APP_CREATE_ENVIRONMENT_OVERRIDE} target="blank">Learn about Environment Overrides</a>
                </div>
            </>}
            <DeploymentTemplateOverride parentState={loading ? 'loading' : deploymentState} setParentState={setDeploymentState} />
            <ConfigMapOverrides parentState={loading ? 'loading' : configMapState} setParentState={setConfigMapState} />
            <SecretOverrides parentState={loading ? 'loading' : secretState} setParentState={setSecretState} />
        </div>
    </ErrorBoundary>
}
