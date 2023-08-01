import { Routes } from '../../../../../config';
import { DeploymentAppTypes, post, put, trash } from '@devtron-labs/devtron-fe-common-lib';
import { AppDetails, AppType, K8sResourcePayloadAppType, K8sResourcePayloadDeploymentType, SelectedResourceType } from '../../appDetails.type'
import { ParamsType } from './nodeDetail.type';

export const getAppId = (clusterId: number, namespace: string, appName: string) => {
    return `${clusterId}|${namespace}|${appName}`
}
export const generateDevtronAppIdentiferForK8sRequest = (clusterId: number, appId: number, envId: number) => {
    return `${clusterId}|${appId}|${envId}`
}

export const getManifestResource = (
    ad: AppDetails,
    podName: string,
    nodeType: string,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
) => {
    const requestData = isResourceBrowserView
        ? createResourceRequestBody(selectedResource)
        : createBody(ad, podName, nodeType)
    return post(Routes.MANIFEST, requestData)
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
    const applicationObject =
        appDetails.deploymentAppType == DeploymentAppTypes.GITOPS ? `${appDetails.appName}` : appDetails.appName

    const appId =
        appDetails.appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(appDetails.clusterId, appDetails.appId, appDetails.environmentId)
            : getAppId(appDetails.clusterId, appDetails.namespace, applicationObject)

    let requestBody = {
        appId: '',
        clusterId: 0,
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
        appType:
            appDetails.appType == AppType.DEVTRON_APP
                ? K8sResourcePayloadAppType.DEVTRON_APP
                : appDetails.appType === AppType.EXTERNAL_ARGO_APP
                ? K8sResourcePayloadAppType.EXTERNAL_ARGO_APP
                : K8sResourcePayloadAppType.HELM_APP,
        deploymentType:
            appDetails.deploymentAppType == DeploymentAppTypes.HELM
                ? K8sResourcePayloadDeploymentType.HELM_INSTALLED
                : K8sResourcePayloadDeploymentType.ARGOCD_INSTALLED,
    }
    if (appDetails.appType === AppType.EXTERNAL_ARGO_APP) {
        requestBody = {
            ...requestBody,
            clusterId: appDetails.clusterId,
        }
    } else {
        requestBody = {
            ...requestBody,
            appId: appId,
        }
    }
    if (updatedManifest) {
        requestBody.k8sRequest['patch'] = updatedManifest
    }
    return requestBody
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
    podName?: string,
    isResourceBrowserView?: boolean,
    clusterId?: number,
    namespace?: string,
) => {
    const applicationObject = ad.deploymentAppType == DeploymentAppTypes.GITOPS ? `${ad.appName}` : ad.appName
    const appId =
        ad.appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(ad.clusterId, ad.appId, ad.environmentId)
            : getAppId(ad.clusterId, ad.namespace, applicationObject)

    let logsURL = `${window.location.protocol}//${window.location.host}${Host}/${Routes.LOGS}/${nodeName}?containerName=${container}&previous=${prevContainerLogs}`
    const selectedNamespace = ad.resourceTree.nodes.find((nd) => nd.name === podName).namespace
    if (isResourceBrowserView) {
        logsURL += `&clusterId=${clusterId}&namespace=${namespace}`
    } else if (ad.appType === AppType.EXTERNAL_ARGO_APP) {
        logsURL += `&clusterId=${ad.clusterId}&appType=${K8sResourcePayloadAppType.EXTERNAL_ARGO_APP}&namespace=${selectedNamespace}`
    } else {
        const appType =
            ad.appType == AppType.DEVTRON_APP
                ? K8sResourcePayloadAppType.DEVTRON_APP
                : K8sResourcePayloadAppType.HELM_APP
        const deploymentType =
            ad.deploymentAppType == DeploymentAppTypes.HELM
                ? K8sResourcePayloadDeploymentType.HELM_INSTALLED
                : K8sResourcePayloadDeploymentType.ARGOCD_INSTALLED
        if (appType === 0) {
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

export const generateEphemeralUrl = (
    requestData,
    clusterId: number,
    environmentId: number,
    namespace: string,
    appName: string,
    appId: number,
    appType: string,
    isResourceBrowserView: boolean,
    params: ParamsType,
) => {
    const appIds =
        appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(clusterId, appId, environmentId)
            : getAppId(clusterId, namespace, appName)
    let url: string = Routes.EPHEMERAL_CONTAINERS
    if (isResourceBrowserView) {
        url += `?identifier=${params.clusterId}`
    } else if (appType === AppType.EXTERNAL_ARGO_APP) {
        url += `?clusterId=${params.clusterId}&appType=2`
    }else {
        url += `?identifier=${appIds}&appType=${appType === AppType.DEVTRON_APP ? '0' : '1'}`
    }

    return post(url, requestData)
}

export const deleteEphemeralUrl = (
    requestData,
    clusterId: number,
    environmentId: number,
    namespace: string,
    appName: string,
    appId: number,
    appType: string,
    isResourceBrowserView: boolean,
    params: ParamsType,
) => {
    const appIds =
        appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(clusterId, appId, environmentId)
            : getAppId(clusterId, namespace, appName)

    let url: string = Routes.EPHEMERAL_CONTAINERS
    const appTypes = appType === AppType.DEVTRON_APP ? '0' : appType === AppType.EXTERNAL_ARGO_APP ? '2' : '1'
    if (isResourceBrowserView) {
        url += `?identifier=${params.clusterId}`
    } else if (appType === AppType.EXTERNAL_ARGO_APP) {
        url += `?clusterId=${params.clusterId}`
    } else {
        url += `?identifier=${appIds}&appType=${appTypes}`
    }
    return trash(url, requestData)
}
