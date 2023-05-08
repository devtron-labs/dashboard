import { Routes } from '../../../config/constants'
import { get, post, trash } from '@devtron-labs/devtron-fe-common-lib'
import { AppType, DeploymentAppType } from './appDetails.type'
import { getAppId } from '../appDetails/k8Resource/nodeDetail/nodeDetail.api'

export const getInstalledChartDetail = (_appId: number, _envId: number) => {
  return get(`${Routes.APP_STORE_INSTALLED_APP}/detail/v2?installed-app-id=${_appId}&env-id=${_envId}`)
}

export const getInstalledChartResourceTree = (_appId: number, _envId: number) => {
    return get(`${Routes.APP_STORE_INSTALLED_APP}/detail/resource-tree?installed-app-id=${_appId}&env-id=${_envId}`)
}

export const getInstalledChartNotesDetail = (_appId: number, _envId: number) => {
    return get(`${Routes.APP_STORE_INSTALLED_APP}/notes?installed-app-id=${_appId}&env-id=${_envId}`)
}

export const getInstalledChartDetailWithResourceTree = (_appId: number, _envId: number) => {
    return get(`${Routes.APP_STORE_INSTALLED_APP}/resource/hibernate?installed-app-id=${_appId}&env-id=${_envId}`)
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

    const { appName, clusterId, namespace, environmentName, appType, deploymentAppType, appId } = appDetails
    const { group, version, kind, name } = nodeDetails
    const appDetailsName =
        deploymentAppType === DeploymentAppType.helm && appType === AppType.DEVTRON_APP
            ? `${appName}-${environmentName}`
            : appName
    
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
        ClusterId: clusterId,
        acdAppIdentifier: deploymentAppType === DeploymentAppType.argo_cd ? {
            appId,
            envId: Number(envId),
        } : undefined,
    }
    return post(Routes.DELETE_RESOURCE, data)
}

export const getAppOtherEnvironment = (appId) => {
    const URL = `${Routes.APP_OTHER_ENVIRONMENT}?app-id=${appId}`
    return get(URL)
}
