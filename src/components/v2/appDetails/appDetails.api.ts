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

    if (appDetails.appType === AppType.EXTERNAL_HELM_CHART || appDetails.deploymentAppType === DeploymentAppType.helm) {
        const data = {
            appId: getAppId(
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
        }
        return post(Routes.DELETE_RESOURCE, data)
    }
    return trash(
        `${Routes.APPLICATIONS}/${appDetails.appName}-${appDetails.environmentName}/resource?name=${nodeDetails.name}&namespace=${nodeDetails.namespace}&resourceName=${nodeDetails.name}&version=${nodeDetails.version}&group=${nodeDetails.group}&kind=${nodeDetails.kind}&force=${forceDelete}&appId=${appDetails.appId}&envId=${envId}`,
    )
}

export const getAppOtherEnvironment = (appId) => {
    const URL = `${Routes.APP_OTHER_ENVIRONMENT}?app-id=${appId}`
    return get(URL)
}
