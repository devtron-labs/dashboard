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

import {
    get,
    put,
    trash,
    ResponseType,
    AppType,
    getUrlWithSearchParams,
    getAPIOptionsWithTriggerTimeout,
    APIOptions,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'
import { HelmApp, AppEnvironmentDetail } from '../app/list-new/AppListType'
import { ResourceTree } from '../v2/appDetails/appDetails.type'
import { getK8sResourcePayloadAppType } from '@Components/v2/appDetails/k8Resource/nodeDetail/nodeDetail.util'

export interface ReleaseInfoResponse extends ResponseType {
    result?: ReleaseAndInstalledAppInfo
}

export interface HelmAppDetailResponse extends ResponseType {
    result?: HelmAppDetailAndInstalledAppInfo
}

export interface UninstallReleaseResponse extends ResponseType {
    result?: ActionResponse
}

export interface UpdateReleaseResponse extends ResponseType {
    result?: ActionResponse
}

export interface HelmAppDetailAndInstalledAppInfo {
    appDetail: HelmAppDetail
    installedAppInfo: InstalledAppInfo
}

export interface ReleaseAndInstalledAppInfo {
    releaseInfo: ReleaseInfo
    installedAppInfo: InstalledAppInfo
}

export interface ReleaseInfo {
    deployedAppDetail: HelmApp
    defaultValues: string
    overrideValues: string
    mergedValues: string
    readme: string
    valuesSchemaJson?: string
}

export interface InstalledAppInfo {
    appId: number
    installedAppId: number
    installedAppVersionId: number
    environmentId: number
    environmentName: string
    appOfferingMode: string
    appStoreChartId: number
    appStoreChartName: string
    appStoreChartRepoName: string
    clusterId: number
    teamId: number
    teamName: string
    deploymentType?: string
}

export interface HelmAppDetail {
    applicationStatus: string
    releaseStatus: HelmReleaseStatus
    lastDeployed: DeployedAt
    chartMetadata: ChartMetadata
    resourceTreeResponse: ResourceTree
    environmentDetails: AppEnvironmentDetail
}

export interface ActionResponse {
    success: boolean
}

export interface DeployedAt {
    seconds: number
    nanos: number
}

export interface ChartMetadata {
    chartName: string
    chartVersion: string
    home: string
    sources: string[]
    description: string
    notes?: string
}

export interface HelmReleaseStatus {
    status: string
    message: string
    description: string
}

export interface UpdateAppReleaseWithoutLinkingRequest {
    appId: string
    valuesYaml: string
}

export interface LinkToChartStoreRequest {
    appId: string
    valuesYaml: string
    appStoreApplicationVersionId: number
    referenceValueId: number
    referenceValueKind: string
}

export interface UpdateAppReleaseRequest {
    id: string
    valuesOverrideYaml: string
    installedAppId: number
    appStoreVersion: number
    referenceValueId: number
    referenceValueKind: string
    isManifestScanEnabled?: boolean
}

export const getReleaseInfo = (appId: string): Promise<ReleaseInfoResponse> => {
    const url = `${Routes.HELM_RELEASE_INFO_API}?appId=${appId}`
    return get(url)
}

export const getAppDetail = async (
    appId: string,
    abortControllerRef?: APIOptions['abortControllerRef'],
): Promise<HelmAppDetailResponse> => {
    const url = `${Routes.HELM_RELEASE_APP_DETAIL_API}?appId=${appId}`
    return get(url, { abortControllerRef })
}

export const getArgoAppDetail = async (
    appName: string,
    clusterId: string,
    namespace: string,
    abortControllerRef?: APIOptions['abortControllerRef'],
) =>
    get(`${Routes.ARGO_APPLICATION}?name=${appName}&clusterId=${clusterId}&namespace=${namespace}`, {
        abortControllerRef,
    })

export const deleteApplicationRelease = (appId: string): Promise<UninstallReleaseResponse> => {
    const url = `${Routes.HELM_RELEASE_APP_DELETE_API}?appId=${appId}`
    return trash(url)
}

export const updateAppReleaseWithoutLinking = (
    requestPayload: UpdateAppReleaseWithoutLinkingRequest,
): Promise<UpdateReleaseResponse> => {
    const options = getAPIOptionsWithTriggerTimeout()
    return put(Routes.HELM_RELEASE_APP_UPDATE_WITHOUT_LINKING_API, requestPayload, options)
}

export const updateAppRelease = (requestPayload: UpdateAppReleaseRequest, abortSignal?: AbortSignal): Promise<any> => {
    const options = getAPIOptionsWithTriggerTimeout()
    options.signal = abortSignal
    return put(Routes.UPDATE_APP_API, requestPayload, options)
}

export const linkToChartStore = (request: LinkToChartStoreRequest): Promise<UpdateReleaseResponse> => {
    const options = getAPIOptionsWithTriggerTimeout()
    return put(Routes.HELM_LINK_TO_CHART_STORE_API, request, options)
}

export const getManifestUrlInfo = (appId: string, appType: AppType): Promise<ResponseType> => {
    const params = {
        appId,
        appType: getK8sResourcePayloadAppType(appType),
    }
    const url = getUrlWithSearchParams(Routes.EA_INGRESS_SERVICE_MANIFEST, params)
    return get(url)
}
