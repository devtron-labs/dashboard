/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DeploymentAppTypes, post, put, trash, Host } from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import { CUSTOM_LOGS_FILTER, Routes } from '../../../../../config'
import {
    AppDetails,
    AppType,
    K8sResourcePayloadAppType,
    K8sResourcePayloadDeploymentType,
    SelectedResourceType,
} from '../../appDetails.type'
import { ParamsType } from './nodeDetail.type'
import { getDeploymentType, getK8sResourcePayloadAppType } from './nodeDetail.util'

export const getAppId = (clusterId: number, namespace: string, appName: string, templateType?: string) => {
    if (templateType) {
        return `${clusterId}|${namespace}|${appName}|${templateType === 'Kustomization'}`
    }
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
    signal?: AbortSignal,
) => {
    const requestData = isResourceBrowserView
        ? createResourceRequestBody(selectedResource)
        : createBody(ad, podName, nodeType)
    const url =
        Routes.MANIFEST +
        (ad.appType === AppType.EXTERNAL_ARGO_APP && !isResourceBrowserView
            ? `?externalArgoApplicationName=${ad.appName}`
            : '')
    return post(url, requestData, { signal })
}

export const getDesiredManifestResource = (
    appDetails: AppDetails,
    podName: string,
    nodeType: string,
    signal?: AbortSignal,
) => {
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
    return post(Routes.DESIRED_MANIFEST, requestData, { signal })
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

// TODO: This should be moved into common since going to use it in resource-scan
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

export const getAppDetailsForManifest = (appDetails: AppDetails) => {
    const applicationObject =
        appDetails.deploymentAppType === DeploymentAppTypes.GITOPS ? `${appDetails.appName}` : appDetails.appName

    const appId =
        appDetails.appType === AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(appDetails.clusterId, appDetails.appId, appDetails.environmentId)
            : getAppId(appDetails.clusterId, appDetails.namespace, applicationObject, appDetails.fluxTemplateType ?? null)

    return {
        appId: appDetails.appType !== AppType.EXTERNAL_ARGO_APP ? appId : '',
        clusterId: appDetails.appType !== AppType.EXTERNAL_ARGO_APP ? 0 : appDetails.clusterId,
        appType: getK8sResourcePayloadAppType(appDetails.appType),
        deploymentType: getDeploymentType(appDetails.deploymentAppType),
    }
}

export function createBody(appDetails: AppDetails, nodeName: string, nodeType: string, updatedManifest?: string) {
    const selectedResource = appDetails.resourceTree.nodes.filter(
        (data) => data.name === nodeName && data.kind.toLowerCase() === nodeType,
    )[0]

    let requestBody = {
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
        ...getAppDetailsForManifest(appDetails),
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
    const url =
        Routes.EVENTS +
        (ad.appType === AppType.EXTERNAL_ARGO_APP && !isResourceBrowserView
            ? `?externalArgoApplicationName=${ad.appName}`
            : '')
    return post(url, requestData)
}

const getFilterWithValue = (type: string, value: string, unit?: string) => {
    switch (type) {
        case CUSTOM_LOGS_FILTER.DURATION:
            return `&sinceSeconds=${Number(value) * (unit === 'hours' ? 3600 : 60)}`
        case CUSTOM_LOGS_FILTER.LINES:
            return `&tailLines=${value}`
        case CUSTOM_LOGS_FILTER.SINCE:
            return `&sinceTime=${value}`
        case CUSTOM_LOGS_FILTER.ALL:
            return ''
    }
}

export const downloadLogs = async (
    setDownloadInProgress: (downloadInProgress: boolean) => void,
    ad: AppDetails,
    nodeName: string,
    container: string,
    prevContainerLogs: boolean,
    logsOption?: { label: string; value: string; type: CUSTOM_LOGS_FILTER },
    customOption?: { option: string; value: string; unit?: string },
    isResourceBrowserView?: boolean,
    clusterId?: number,
    namespace?: string,
) => {
    let filter = ''
    if (logsOption.value === CUSTOM_LOGS_FILTER.CUSTOM) {
        filter = getFilterWithValue(customOption.option, customOption.value, customOption.unit)
    } else {
        filter = getFilterWithValue(logsOption.type, logsOption.value)
    }
    let logsURL = `${Host}/${Routes.LOGS}/download/${nodeName}?containerName=${container}&previous=${prevContainerLogs}`
    const applicationObject = ad.deploymentAppType == DeploymentAppTypes.GITOPS ? `${ad.appName}` : ad.appName
    const appId =
        ad.appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(ad.clusterId, ad.appId, ad.environmentId)
            : getAppId(ad.clusterId, ad.namespace, applicationObject)
    if (isResourceBrowserView) {
        logsURL += `&clusterId=${clusterId}&namespace=${namespace}`
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
    logsURL += `${filter}`
    setDownloadInProgress(true)
    await fetch(logsURL)
        .then(async (response) => {
            try {
                if (response.status === 204) {
                    toast.error('No logs found')
                    return
                }
                const data = await (response as any).blob()
                // Create a new URL object
                const blobUrl = URL.createObjectURL(data)

                // Create a link element
                const a = document.createElement('a')
                a.href = logsURL
                a.download = `podlogs-${nodeName}-${new Date().getTime()}.log`

                // Append the link element to the DOM
                document.body.appendChild(a)

                // Programmatically click the link to start the download
                a.click()

                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl)
                    document.body.removeChild(a)
                }, 0)
            } catch (e) {
                toast.error(e)
            } finally {
                setDownloadInProgress(false)
            }
        })
        .catch((e) => toast.error(e))
}

export const getLogsURL = (
    ad: AppDetails,
    nodeName: string,
    Host: string,
    container: string,
    prevContainerLogs: boolean,
    podName?: string,
    logsOption?: { label: string; value: string; type: CUSTOM_LOGS_FILTER },
    customOption?: { option: string; value: string; unit?: string },
    isResourceBrowserView?: boolean,
    clusterId?: number,
    namespace?: string,
) => {
    // similar logic exists in downloadLogs function also, recheck changes there also or extract this logic in a common function
    let filter = ''
    if (logsOption.value === CUSTOM_LOGS_FILTER.CUSTOM) {
        filter = getFilterWithValue(customOption.option, customOption.value, customOption.unit)
    } else {
        filter = getFilterWithValue(logsOption.type, logsOption.value)
    }
    const applicationObject = ad.deploymentAppType == DeploymentAppTypes.GITOPS ? `${ad.appName}` : ad.appName
    const selectedNamespace = ad.resourceTree?.nodes?.find(
        (nd) => nd.name === podName || nd.name === nodeName,
    )?.namespace

    const appId =
        ad.appType === AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(ad.clusterId, ad.appId, ad.environmentId)
            : getAppId(ad.clusterId, ad.namespace, applicationObject, ad.fluxTemplateType ?? null)

    let logsURL = `${window.location.protocol}//${window.location.host}${Host}/${Routes.LOGS}/${nodeName}?containerName=${container}&previous=${prevContainerLogs}`
    if (isResourceBrowserView) {
        logsURL += `&clusterId=${clusterId}&namespace=${namespace}`
    } else if (ad.appType === AppType.EXTERNAL_ARGO_APP) {
        logsURL += `&clusterId=${ad.clusterId}&appType=${K8sResourcePayloadAppType.EXTERNAL_ARGO_APP}&namespace=${selectedNamespace}&externalArgoApplicationName=${ad.appName}`
    } else {
        const appType = getK8sResourcePayloadAppType(ad.appType)
        const deploymentType = getDeploymentType(ad.deploymentAppType)
        if (appType === 0) {
            logsURL += `&namespace=${ad.namespace}`
        }
        logsURL += `&appId=${appId}&appType=${appType}&deploymentType=${deploymentType}`
    }
    return `${logsURL}&follow=true${filter}`
}

export const getPodRestartRBACPayload = (appDetails?: AppDetails) => {
    if (!appDetails) {
        return {}
    }

    const applicationObject =
        appDetails.deploymentAppType == DeploymentAppTypes.GITOPS ? `${appDetails.appName}` : appDetails.appName

    const appId =
        appDetails.appType === AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(appDetails.clusterId, appDetails.appId, appDetails.environmentId)
            : getAppId(appDetails.clusterId, appDetails.namespace, applicationObject)

    const appType = getK8sResourcePayloadAppType(appDetails.appType)
    const deploymentType =
        appDetails.deploymentAppType === DeploymentAppTypes.HELM
            ? K8sResourcePayloadDeploymentType.HELM_INSTALLED
            : K8sResourcePayloadDeploymentType.ARGOCD_INSTALLED

    return {
        appId,
        appType,
        deploymentType,
    }
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

const getEphemeralURL = (
    isResourceBrowserView: boolean,
    params: ParamsType,
    appType: string,
    appIds: string,
    appName: string,
) => {
    let url: string = Routes.EPHEMERAL_CONTAINERS
    if (isResourceBrowserView) {
        url += `?identifier=${params.clusterId}`
    } else if (appType === AppType.EXTERNAL_ARGO_APP) {
        url += `?identifier=${params.clusterId}&clusterId=${params.clusterId}&appType=${K8sResourcePayloadAppType.EXTERNAL_ARGO_APP}&externalArgoApplicationName=${appName}`
    } else {
        url += `?identifier=${appIds}&appType=${getK8sResourcePayloadAppType(appType)}`
    }
    return url
}

export const generateEphemeralUrl = (
    requestData,
    clusterId: number,
    environmentId: number,
    namespace: string,
    appName: string,
    appId: number,
    appType: string,
    fluxTemplateType: string,
    isResourceBrowserView: boolean,
    params: ParamsType,
) => {
    const appIds =
        appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(clusterId, appId, environmentId)
            : getAppId(clusterId, namespace, appName, fluxTemplateType)

    const url = getEphemeralURL(isResourceBrowserView, params, appType, appIds, appName)
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
    fluxTemplateType: string,
    isResourceBrowserView: boolean,
    params: ParamsType,
) => {
    const appIds =
        appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(clusterId, appId, environmentId)
            : getAppId(clusterId, namespace, appName, fluxTemplateType)

    const url = getEphemeralURL(isResourceBrowserView, params, appType, appIds, appName)
    return trash(url, requestData)
}
