import { Routes } from '../../../config/constants'
import { get, post } from '@devtron-labs/devtron-fe-common-lib'
import { AppType, DeploymentAppType } from './appDetails.type'
import { getAppId } from '../appDetails/k8Resource/nodeDetail/nodeDetail.api'

export const getInstalledChartDetail = (_appId: number, _envId: number) => {
    return get(`app-store/installed-app/detail?installed-app-id=${_appId}&env-id=${_envId}`)
}
export const getInstalledChartNotesDetail = (_appId: number, _envId: number) => {
    return get(`app-store/installed-app/notes?installed-app-id=${_appId}&env-id=${_envId}`)
}

export const getInstalledAppDetail = (_appId: number, _envId: number) => {
    return get(`app/detail?app-id=${_appId}&env-id=${_envId}`)
}

export const getSaveTelemetry = (appId: string) => {
    return get(`${Routes.HELM_RELEASE_APP_DETAIL_API}/save-telemetry/?appId=${appId}`)
}

export const deleteResource = (nodeDetails: any, appDetails: any, envId: string, forceDelete: boolean) => {
    if (!nodeDetails.group) {
        nodeDetails.group = ''
    }
    const { appName, clusterId, namespace, environmentName, appType, deploymentAppType } = appDetails;
    const { group, version, kind, name } = nodeDetails;
    const appDetailsName = deploymentAppType === DeploymentAppType.helm && appType === AppType.DEVTRON_APP
    ? `${appName}-${environmentName}`
    : appName;

    // removed argocd server api dependencies and routed through k8s methods
    const data = {
        appId: deploymentAppType === DeploymentAppType.argo_cd ? '' : getAppId(
            clusterId,
            namespace,
            appDetailsName
        ),
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: group,
                    Version: version,
                    Kind: kind,
                },
                namespace: namespace,
                name: name,
            },
        },
        ClusterId:  deploymentAppType === DeploymentAppType.argo_cd ? clusterId : null
    }
    return post(Routes.DELETE_RESOURCE, data)
}

export const getAppOtherEnvironment = (appId) => {
    const URL = `${Routes.APP_OTHER_ENVIRONMENT}?app-id=${appId}`
    return get(URL)
}
