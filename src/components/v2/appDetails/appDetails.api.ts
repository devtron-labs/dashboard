import { Routes } from '../../../config/constants'
import { get, post, trash } from '../../../services/api'
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

    const data = {
        appId: appDetails.deploymentAppType === DeploymentAppType.argo_cd ? '' : getAppId(
            appDetails.clusterId,
            appDetails.namespace,
            appDetails.deploymentAppType === DeploymentAppType.helm && appDetails.appType === AppType.DEVTRON_APP
                ? `${appDetails.appName}-${appDetails.environmentName}`
                : appDetails.appName,
        ),
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: nodeDetails.group,
                    Version: nodeDetails.version,
                    Kind: nodeDetails.kind,
                },
                namespace: nodeDetails.namespace,
                name: nodeDetails.name,
            },
        },
        ClusterId:  appDetails.deploymentAppType === DeploymentAppType.argo_cd ? appDetails.clusterId : null
    }
    return post(Routes.DELETE_RESOURCE, data)
    
}

export const getAppOtherEnvironment = (appId) => {
    const URL = `${Routes.APP_OTHER_ENVIRONMENT}?app-id=${appId}`
    return get(URL)
}
