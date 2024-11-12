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

import { DeploymentAppTypes, post, put, trash, Host, HandleDownloadProps } from '@devtron-labs/devtron-fe-common-lib'
import { CUSTOM_LOGS_FILTER, Routes } from '../../../../../config'
import { AppDetails, AppType, SelectedResourceType } from '../../appDetails.type'
import {
    AppDetailsAppIdentifierProps,
    EphemeralContainerProps,
    GetResourceRequestPayloadParamsType,
    ParamsType,
} from './nodeDetail.type'
import { getDeploymentType, getK8sResourcePayloadAppType } from './nodeDetail.util'
import { FluxCDTemplateType } from '@Components/app/list-new/AppListType'
import { importComponentFromFELibrary } from '@Components/common'

const getDesiredAndLiveManifest = importComponentFromFELibrary('getDesiredAndLiveManifest', null, 'function')

export const getAppId = ({ clusterId, namespace, appName, templateType }: AppDetailsAppIdentifierProps) => {
    if (templateType) {
        return `${clusterId}|${namespace}|${appName}|${templateType === FluxCDTemplateType.KUSTOMIZATION}`
    }
    return `${clusterId}|${namespace}|${appName}`
}
export const generateDevtronAppIdentiferForK8sRequest = (clusterId: number, appId: number, envId: number) => {
    return `${clusterId}|${appId}|${envId}`
}

export const generateAppIdentifier = (appDetails: AppDetails, appName: string) =>
    appDetails.appType === AppType.DEVTRON_APP
        ? generateDevtronAppIdentiferForK8sRequest(appDetails.clusterId, appDetails.appId, appDetails.environmentId)
        : getAppId({
              clusterId: appDetails.clusterId,
              namespace: appDetails.namespace,
              appName,
              templateType: appDetails.fluxTemplateType ?? null,
          })

export const getManifestResource = (
    ad: AppDetails,
    podName: string,
    nodeType: string,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
    signal?: AbortSignal,
) => {
    const requestData = getResourceRequestPayload({
        appDetails: ad,
        nodeName: podName,
        nodeType,
        isResourceBrowserView,
        selectedResource,
    })

    if (window._env_.FEATURE_CONFIG_DRIFT_ENABLE && getDesiredAndLiveManifest && ad.appType === AppType.DEVTRON_APP && !isResourceBrowserView) {
        return getDesiredAndLiveManifest(requestData, signal)
    }

    return post(Routes.MANIFEST, requestData, { signal })
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
        appId: getAppId({
            clusterId: appDetails.clusterId,
            namespace: appDetails.namespace,
            appName: appDetails.appName,
        }),
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

    const appId = generateAppIdentifier(appDetails, applicationObject)

    return {
        appId,
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

export const getResourceRequestPayload = ({
    appDetails,
    nodeName,
    nodeType,
    isResourceBrowserView,
    selectedResource,
    updatedManifest,
}: GetResourceRequestPayloadParamsType) => {
    return isResourceBrowserView
        ? createResourceRequestBody(selectedResource, updatedManifest)
        : createBody(appDetails, nodeName, nodeType, updatedManifest)
}

export const updateManifestResourceHelmApps = (
    ad: AppDetails,
    nodeName: string,
    nodeType: string,
    updatedManifest: string,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
    signal?: AbortSignal,
) => {
    return put(
        Routes.MANIFEST,
        getResourceRequestPayload({
            appDetails: ad,
            nodeName,
            nodeType,
            isResourceBrowserView,
            selectedResource,
            updatedManifest,
        }),
        { signal },
    )
}

const getEventHelmApps = (
    ad: AppDetails,
    nodeName: string,
    nodeType: string,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
) =>
    post(
        Routes.EVENTS,
        getResourceRequestPayload({
            appDetails: ad,
            nodeName,
            nodeType,
            selectedResource,
            isResourceBrowserView,
        }),
    )

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

export const downloadLogs = (
    handleDownload: (handleDownloadProps: HandleDownloadProps) => void,
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
    const selectedNamespace = ad.resourceTree?.nodes?.find((node) => node.name === nodeName)?.namespace
    const isExternalArgoApp = ad.appType === AppType.EXTERNAL_ARGO_APP
    const applicationObject = ad.deploymentAppType == DeploymentAppTypes.GITOPS ? `${ad.appName}` : ad.appName
    const appId = generateAppIdentifier(ad, applicationObject)
    let logsURL = `${Routes.LOGS}/download/${nodeName}?containerName=${container}&previous=${prevContainerLogs}`
    if (isResourceBrowserView) {
        logsURL += `&clusterId=${clusterId}&namespace=${namespace}`
    } else {
        const appType = getK8sResourcePayloadAppType(ad.appType)
        const deploymentType = getDeploymentType(ad.deploymentAppType)
        logsURL += `&appId=${appId}&appType=${appType}&deploymentType=${deploymentType}&namespace=${selectedNamespace}`
        if (isExternalArgoApp) {
            logsURL += `&externalArgoApplicationName=${ad.appName}`
        }
    }
    logsURL += `${filter}`
    handleDownload({ downloadUrl: logsURL, fileName: `podlogs-${nodeName}-${new Date().getTime()}.log` })
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
    const isExternalArgoApp = ad.appType === AppType.EXTERNAL_ARGO_APP
    const appId = generateAppIdentifier(ad, applicationObject)

    let logsURL = `${window.location.protocol}//${window.location.host}${Host}/${Routes.LOGS}/${nodeName}?containerName=${container}&previous=${prevContainerLogs}`
    if (isResourceBrowserView) {
        logsURL += `&clusterId=${clusterId}&namespace=${namespace}`
    } else {
        const appType = getK8sResourcePayloadAppType(ad.appType)
        const deploymentType = getDeploymentType(ad.deploymentAppType)
        logsURL += `&appId=${appId}&appType=${appType}&deploymentType=${deploymentType}&namespace=${selectedNamespace}`
        if (isExternalArgoApp) {
            logsURL += `&externalArgoApplicationName=${ad.appName}`
        }
    }
    return `${logsURL}&follow=true${filter}`
}

export const getPodRestartRBACPayload = (appDetails?: AppDetails) => {
    if (!appDetails) {
        return {}
    }

    const applicationObject =
        appDetails.deploymentAppType == DeploymentAppTypes.GITOPS ? `${appDetails.appName}` : appDetails.appName

    const appId = generateAppIdentifier(appDetails, applicationObject)
    const appType = getK8sResourcePayloadAppType(appDetails.appType)
    const deploymentType = getDeploymentType(appDetails.deploymentAppType)

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
) =>
    post(
        Routes.CREATE_RESOURCE,
        getResourceRequestPayload({
            appDetails: ad,
            nodeName: podName,
            nodeType,
            isResourceBrowserView,
            selectedResource,
        }),
    )

const getEphemeralURL = (isResourceBrowserView: boolean, params: ParamsType, appType: string, appIds: string) => {
    let url: string = Routes.EPHEMERAL_CONTAINERS
    if (isResourceBrowserView) {
        url += `?identifier=${params.clusterId}`
    } else {
        url += `?identifier=${appIds}&appType=${getK8sResourcePayloadAppType(appType)}`
    }
    return url
}

export const generateEphemeralUrl = ({
    requestData,
    clusterId,
    environmentId,
    namespace,
    appName,
    appId,
    appType,
    fluxTemplateType,
    isResourceBrowserView,
    params,
}: EphemeralContainerProps) => {
    const appIds =
        appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(clusterId, appId, environmentId)
            : getAppId({ clusterId, namespace, appName, templateType: fluxTemplateType })

    const url = getEphemeralURL(isResourceBrowserView, params, appType, appIds)
    return post(url, requestData)
}

export const deleteEphemeralUrl = ({
    requestData,
    clusterId,
    environmentId,
    namespace,
    appName,
    appId,
    appType,
    fluxTemplateType,
    isResourceBrowserView,
    params,
}: EphemeralContainerProps) => {
    const appIds =
        appType == AppType.DEVTRON_APP
            ? generateDevtronAppIdentiferForK8sRequest(clusterId, appId, environmentId)
            : getAppId({ clusterId, namespace, appName, templateType: fluxTemplateType })

    const url = getEphemeralURL(isResourceBrowserView, params, appType, appIds)
    return trash(url, requestData)
}
