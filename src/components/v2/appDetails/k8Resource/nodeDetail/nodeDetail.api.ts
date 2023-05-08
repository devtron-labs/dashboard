import { Routes } from '../../../../../config';
import { get, post, put } from '@devtron-labs/devtron-fe-common-lib';
import { AppDetails, AppType, DeploymentAppType, SelectedResourceType } from '../../appDetails.type'

export const getAppId = (clusterId: number, namespace: string, appName: string) => {
    return `${clusterId}|${namespace}|${appName}`
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

    const getAppName = (): string => {
        if (appDetails.deploymentAppType === DeploymentAppType.helm && appDetails.appType === AppType.DEVTRON_APP) {
            return `${appDetails.appName}-${appDetails.environmentName}`
        } else {
            return appDetails.appName
        }
    }

    const appId =
        appDetails.deploymentAppType == DeploymentAppType.argo_cd
            ? ''
            : getAppId(appDetails.clusterId, appDetails.namespace, getAppName())

    const requestBody = {
        appId: appId,
        clusterId: appDetails.clusterId,
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
        acdAppIdentifier: appDetails.deploymentAppType === DeploymentAppType.argo_cd ? {
            appId: appDetails.appId,
            envId: appDetails.environmentId,
        } : undefined,
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
    let prefix = `${location.protocol}//${location.host}` // eslint-disable-line

    let logsURL = `${prefix}${Host}/${Routes.LOGS}/${nodeName}?containerName=${container}`

    if (isResourceBrowserView) {
        logsURL += `&clusterId=${clusterId}&namespace=${namespace}`
    } else if (ad.deploymentAppType === DeploymentAppType.argo_cd){
        logsURL += `&clusterId=${ad.clusterId}&namespace=${ad.namespace}&acdAppId=${ad.appId}&envId=${ad.environmentId}`
    } else {
        logsURL += `&appId=${getAppId(
            ad.clusterId,
            ad.namespace,
            ad.deploymentAppType === DeploymentAppType.helm  && ad.appType === AppType.DEVTRON_APP
                ? `${ad.appName}-${ad.environmentName}`
                : ad.appName,
        )}`
    }
    return `${logsURL}&follow=true&tailLines=500`
}

export const getTerminalData = (ad: AppDetails, nodeName: string, terminalType: string) => {
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0]
    const _url = `api/v1/applications/pod/exec/session/${ad.appId}/${ad.environmentId}/${ad.namespace}/${ad.appName}-${ad.environmentName}/${terminalType}/${ad.appName}`
    return get(_url)
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