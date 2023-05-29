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
    if (
        ad.appType === AppType.EXTERNAL_HELM_CHART ||
        ad.deploymentAppType === DeploymentAppType.helm ||
        isResourceBrowserView
    ) {
        return getManifestResourceHelmApps(ad, podName, nodeType, isResourceBrowserView, selectedResource)
    }
    const cn = ad.resourceTree.nodes.filter((node) => node.name === podName && node.kind.toLowerCase() === nodeType)[0]

    return get(
        `api/v1/applications/${ad.appName}-${ad.environmentName}/resource?version=${cn.version}&namespace=${
            cn.namespace || ''
        }&group=${cn.group || ''}&kind=${cn.kind}&resourceName=${cn.name}`,
    )
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
    if (
        ad.appType === AppType.EXTERNAL_HELM_CHART ||
        ad.deploymentAppType === DeploymentAppType.helm ||
        isResourceBrowserView
    ) {
        return getEventHelmApps(ad, nodeName, nodeType, isResourceBrowserView, selectedResource)
    }
    const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName && node.kind.toLowerCase() === nodeType)[0]
    return get(
        `api/v1/applications/${ad.appName}-${ad.environmentName}/events?resourceNamespace=${
            cn.namespace || ''
        }&resourceUID=${cn.uid}&resourceName=${cn.name}`,
    )
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
    prevContainerLogs: boolean,
    isResourceBrowserView?: boolean,
    clusterId?: number,
    namespace?: string,
) => {
    //const cn = ad.resourceTree.nodes.filter((node) => node.name === nodeName)[0];
    let prefix = ''
    if (process.env.NODE_ENV === 'production') {
        prefix = `${location.protocol}//${location.host}` // eslint-disable-line
    } else {
        prefix = `${location.protocol}//${location.host}` // eslint-disable-line
    }

    if (
        ad.appType === AppType.EXTERNAL_HELM_CHART ||
        ad.deploymentAppType === DeploymentAppType.helm ||
        isResourceBrowserView
    ) {
        let logsURL = `${prefix}${Host}/${Routes.LOGS}/${nodeName}?containerName=${container}&prevContainerLogs=${prevContainerLogs}`

        if (isResourceBrowserView) {
            logsURL += `&clusterId=${clusterId}&namespace=${namespace}`
        } else {
            logsURL += `&appId=${getAppId(
                ad.clusterId,
                ad.namespace,
                ad.deploymentAppType === DeploymentAppType.helm && ad.appType === AppType.DEVTRON_APP
                    ? `${ad.appName}-${ad.environmentName}`
                    : ad.appName,
            )}`
        }
        return `${logsURL}&follow=true&tailLines=500`
    }
    return `${prefix}${Host}/api/v1/applications/${ad.appName}-${ad.environmentName}/pods/${nodeName}/logs?container=${container}&follow=true&namespace=${ad.namespace}&tailLines=500`
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