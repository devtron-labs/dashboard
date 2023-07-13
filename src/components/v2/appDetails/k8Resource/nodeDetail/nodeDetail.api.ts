import { Routes } from '../../../../../config';
import { post, put } from '@devtron-labs/devtron-fe-common-lib';
import { AppDetails, AppType, DeploymentAppType, K8sResourcePayloadAppType, K8sResourcePayloadDeploymentType, SelectedResourceType } from '../../appDetails.type'
import IndexStore from '../../index.store'
const appDetails = IndexStore.getAppDetails()

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
        appDetails.deploymentAppType == DeploymentAppType.argo_cd ? `${appDetails.appName}` : appDetails.appName

    const appId =
        appDetails.appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(appDetails.clusterId, appDetails.appId, appDetails.environmentId)
            : getAppId(appDetails.clusterId, appDetails.namespace, applicationObject)

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
        appType: appDetails.appType == AppType.DEVTRON_APP ? K8sResourcePayloadAppType.DEVTRON_APP : K8sResourcePayloadAppType.HELM_APP,
        deploymentType: appDetails.deploymentAppType == DeploymentAppType.helm ? K8sResourcePayloadDeploymentType.HELM_INSTALLED : K8sResourcePayloadDeploymentType.ARGOCD_INSTALLED
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
    isResourceBrowserView?: boolean,
    clusterId?: number,
    namespace?: string,
) => {
    const applicationObject = ad.deploymentAppType == DeploymentAppType.argo_cd ? `${ad.appName}` : ad.appName
    const appId =
        ad.appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(ad.clusterId, ad.appId, ad.environmentId)
            : getAppId(ad.clusterId, ad.namespace, applicationObject)

    let logsURL = `${window.location.protocol}//${window.location.host}${Host}/${Routes.LOGS}/${nodeName}?containerName=${container}&previous=${prevContainerLogs}`

    if (isResourceBrowserView) {
        logsURL += `&clusterId=${clusterId}&namespace=${namespace}`
    } else {
        const appType = ad.appType == AppType.DEVTRON_APP ? K8sResourcePayloadAppType.DEVTRON_APP : K8sResourcePayloadAppType.HELM_APP
        const deploymentType = ad.deploymentAppType == DeploymentAppType.helm ? K8sResourcePayloadDeploymentType.HELM_INSTALLED : K8sResourcePayloadDeploymentType.ARGOCD_INSTALLED
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

export const generateEphemeralUrl = (requestData, clusterId, environmentId, namespace, appName, appId, appType) => {
    const appIds =
        appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(
                  clusterId,
                  appId,
                  environmentId,
              )
            : getAppId(clusterId, namespace, appName)

    let url: string = 'k8s/resources/ephemeralContainers'
    url += `?identifier=${appIds}&appType=0`
  return post(url, requestData)
}