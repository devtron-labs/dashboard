import React, { useState, useEffect } from 'react';
import ConfigMapOverrides from './ConfigMapOverrides'
import SecretOverrides from './SecretOverrides'
import DeploymentTemplateOverride from './DeploymentTemplateOverride'
import { mapByKey, Progressing, ErrorBoundary, useAppContext, useAsync } from '../common'
import { useParams, useRouteMatch, generatePath, useHistory } from 'react-router'
import './environmentOverride.scss'
import Reload from '../Reload/Reload'
import { getAppOtherEnvironment } from '../../services/service'
import { getAppComposeURL, APP_COMPOSE_STAGE, DOCUMENTATION, URLS } from '../../config';

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
        if (window.location.href.includes(URLS.APP_DEPLOYMENT_CONFIG)) {
            setDeploymentState('loading');
        } else if (window.location.href.includes(URLS.APP_CM_CONFIG)) {
            setConfigMapState('loading');
        } else {
            setSecretState('loading');
        }
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
        <div className={`environment-override ${window.location.href.includes(URLS.APP_DEPLOYMENT_CONFIG) ? '' : 'env-config-container'}`}>
            {window.location.href.includes(URLS.APP_DEPLOYMENT_CONFIG) &&
                <DeploymentTemplateOverride parentState={loading ? 'loading' : deploymentState} setParentState={setDeploymentState} />}
            {window.location.href.includes(URLS.APP_CM_CONFIG) &&
                <ConfigMapOverrides parentState={loading ? 'loading' : configMapState} setParentState={setConfigMapState} />}
            {window.location.href.includes(URLS.APP_CS_CONFIG) &&
                <SecretOverrides parentState={loading ? 'loading' : secretState} setParentState={setSecretState} />}
        </div>
    </ErrorBoundary>
}
