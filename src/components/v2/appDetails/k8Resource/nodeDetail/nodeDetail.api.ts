import { Routes } from '../../../../../config';
import { get, post, put } from '@devtron-labs/devtron-fe-common-lib';
import { AppDetails, AppType, DeploymentAppType, SelectedResourceType } from '../../appDetails.type'

export const getAppId = (clusterId: number, namespace: string, appName: string) => {
    return `${clusterId}|${namespace}|${appName}`
}
export const getDevtronAppId = (clusterId: number, appId: number, envId: number) => {
    return `${clusterId}|${appId}|${envId}`
}

export const getManifestResource = (
    ad: AppDetails,
    podName: string,
    nodeType: string,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
) => {
    return getManifestResourceHelmApps(ad, podName, nodeType, isResourceBrowserView, selectedResource)
}

export const getDesiredManifestResource = (appDetails: AppDetails, podName: string, nodeType: string) => {
    const selectedResource = appDetails.resourceTree?.nodes.filter(
        (data) => data.name === podName && data.kind.toLowerCase() === nodeType,
    )[0]
    const requestData = {
        appId: getAppId(appDetails.clusterId, appDetails.namespace, appDetails.appName),
        resource: {
            Group: selectedResource.group ? selectedResource.group : '',
            Version: selectedResource.version ? selectedResource.version : 'v1',
            Kind: selectedResource.kind,
            namespace: selectedResource.namespace,
            name: selectedResource.name,
        },
    }
    return post(Routes.DESIRED_MANIFEST, requestData)
}

export const getEvent = (
    ad: AppDetails,
    nodeName: string,
    nodeType: string,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
) => {
    return getEventHelmApps(ad, nodeName, nodeType, isResourceBrowserView, selectedResource)
}

function createResourceRequestBody(selectedResource: SelectedResourceType, updatedManifest?: string) {
    const requestBody = {
        appId: '',
        clusterId: selectedResource.clusterId,
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: selectedResource.group || '',
                    Version: selectedResource.version || 'v1',
                    Kind: selectedResource.kind,
                },
                namespace: selectedResource.namespace,
                name: selectedResource.name,
            },
        },
    }
    if (updatedManifest) {
        requestBody.k8sRequest['patch'] = updatedManifest
    }
    return requestBody
}

function createBody(appDetails: AppDetails, nodeName: string, nodeType: string, updatedManifest?: string) {
    const selectedResource = appDetails.resourceTree.nodes.filter(
        (data) => data.name === nodeName && data.kind.toLowerCase() === nodeType,
    )[0]

    const appId =
        appDetails.appType == AppType.DEVTRON_APP
            ? getDevtronAppId(appDetails.clusterId, appDetails.appId, appDetails.environmentId)
            : getAppId(
                  appDetails.clusterId,
                  appDetails.namespace,
                  appDetails.deploymentAppType == DeploymentAppType.argo_cd
                      ? `${appDetails.appName}-${appDetails.environmentName}`
                      : appDetails.appName,
              )

    const requestBody = {
        appId: appId,
        k8sRequest: {
            resourceIdentifier: {
                groupVersionKind: {
                    Group: selectedResource.group ? selectedResource.group : '',
                    Version: selectedResource.version ? selectedResource.version : 'v1',
                    Kind: selectedResource.kind,
                },
                namespace: selectedResource.namespace,
                name: selectedResource.name,
            },
        },
        appType: appDetails.appType == AppType.DEVTRON_APP ? 0 : 1,
        deploymentType: appDetails.deploymentAppType == DeploymentAppType.helm ? 0 : 1,
    }
    if (updatedManifest) {
        requestBody.k8sRequest['patch'] = updatedManifest
    }
    return requestBody
}

function getManifestResourceHelmApps(
    ad: AppDetails,
    nodeName: string,
    nodeType: string,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
) {
    const requestData = isResourceBrowserView
        ? createResourceRequestBody(selectedResource)
        : createBody(ad, nodeName, nodeType)
    return post(Routes.MANIFEST, requestData)
}

export const updateManifestResourceHelmApps = (
    ad: AppDetails,
    nodeName: string,
    nodeType: string,
    updatedManifest: string,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
) => {
    const requestData = isResourceBrowserView
        ? createResourceRequestBody(selectedResource, updatedManifest)
        : createBody(ad, nodeName, nodeType, updatedManifest)
    return put(Routes.MANIFEST, requestData)
}

function getEventHelmApps(
    ad: AppDetails,
    nodeName: string,
    nodeType: string,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
) {
    const requestData = isResourceBrowserView
        ? createResourceRequestBody(selectedResource)
        : createBody(ad, nodeName, nodeType)
    return post(Routes.EVENTS, requestData)
}

export const getLogsURL = (
    ad: AppDetails,
    nodeName: string,
    Host: string,
    container: string,
    isResourceBrowserView?: boolean,
    clusterId?: number,
    namespace?: string,
) => {
    //const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0];
    let prefix = `${window.location.protocol}//${window.location.host}` 
    const appId =
        ad.appType == AppType.DEVTRON_APP
            ? getDevtronAppId(ad.clusterId, ad.appId, ad.environmentId)
            : getAppId(ad.clusterId, ad.namespace, ad.deploymentAppType == DeploymentAppType.argo_cd
                ? `${ad.appName}-${ad.environmentName}`
                : ad.appName)

    let logsURL = `${prefix}${Host}/${Routes.LOGS}/${nodeName}?containerName=${container}`

    if (isResourceBrowserView) {
        logsURL += `&clusterId=${clusterId}&namespace=${namespace}`
    } else {
        const appType = ad.appType == AppType.DEVTRON_APP ? 0 : 1
        const deploymentType = ad.deploymentAppType == DeploymentAppType.helm ? 0 : 1
        if (appType  === 0){
            logsURL += `&namespace=${ad.namespace}`
        }
        logsURL += `&appId=${appId}&appType=${appType}&deploymentType=${deploymentType}`
    }
    return `${logsURL}&follow=true&tailLines=500`
}

export const createResource = (
    ad: AppDetails,
    podName: string,
    nodeType: string,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
) => {
    const requestData = isResourceBrowserView
        ? createResourceRequestBody(selectedResource)
        : createBody(ad, podName, nodeType)
    return post(Routes.CREATE_RESOURCE, requestData)
}