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
    post,
    trash,
    ServerErrors,
    ResponseType,
    sortCallback,
    put,
    DATE_TIME_FORMAT_STRING,
    History,
    noop,
    handleUTCTime,
    createGitCommitUrl,
    PromiseAllStatusType,
    ApiQueuingWithBatch,
    APIOptions,
    CIMaterialType,
} from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import { Routes, Moment12HourFormat, NO_COMMIT_SELECTED } from '../../config'
import { AppDetails, ArtifactsCiJob, EditAppRequest, AppMetaInfo } from './types'
import { BulkResponseStatus, BULK_VIRTUAL_RESPONSE_STATUS } from '../ApplicationGroup/Constants'

export const getAppList = (request, options?: APIOptions) => post(Routes.APP_LIST, request, options)

export function deleteResource({ appName, env, name, kind, group, namespace, version, appId, envId }) {
    if (!group) {
        group = ''
    }
    const URL = `${Routes.APPLICATIONS}/${appName}-${env}/resource?name=${name}&namespace=${namespace}&resourceName=${name}&version=${version}&group=${group}&kind=${kind}&force=true&appId=${appId}&envId=${envId}`
    return trash(URL)
}

interface AppDetailsResponse extends ResponseType {
    result?: AppDetails
}

interface AppMetaInfoResponse extends ResponseType {
    result?: AppMetaInfo
}

export interface ArtifactCiJobResponse extends ResponseType {
    result?: ArtifactsCiJob
}

export function fetchAppDetails(appId: number | string, envId: number | string): Promise<AppDetailsResponse> {
    return get(`${Routes.APP_DETAIL}?app-id=${appId}&env-id=${envId}`)
}

export function fetchAppDetailsInTime(
    appId: number | string,
    envId: number | string,
    reloadTimeOut: APIOptions['timeout'],
    abortControllerRef: APIOptions['abortControllerRef'],
): Promise<AppDetailsResponse> {
    return get(`${Routes.APP_DETAIL}/v2?app-id=${appId}&env-id=${envId}`, {
        timeout: reloadTimeOut,
        abortControllerRef,
    })
}

export function fetchResourceTreeInTime(
    appId: number | string,
    envId: number | string,
    reloadTimeOut: APIOptions['timeout'],
    abortControllerRef: APIOptions['abortControllerRef'],
): Promise<AppDetailsResponse> {
    return get(`${Routes.APP_DETAIL}/resource-tree?app-id=${appId}&env-id=${envId}`, {
        timeout: reloadTimeOut,
        abortControllerRef,
    })
}

interface CIHistoricalStatus extends ResponseType {
    result?: History
}

export const getCIHistoricalStatus = (params): Promise<CIHistoricalStatus> => {
    const URL = `${Routes.APP}/${params.appId}/ci-pipeline/${params.pipelineId}/workflow/${params.buildId}`
    return get(URL)
}

export const getTagDetails = (params) => {
    const URL = `${Routes.IMAGE_TAGGING}/${params.pipelineId}/${params.artifactId}`
    return get(URL)
}

const processMaterialHistoryAndSelectionError = (material) => {
    const data = {
        isMaterialSelectionError: true,
        materialSelectionErrorMsg: NO_COMMIT_SELECTED,
        history: [],
    }
    if (material.history) {
        let selectedIndex = -1
        for (let index = 0; index < material.history.length; index++) {
            const history = material.history[index]
            if (selectedIndex === -1 && !history.Excluded) {
                selectedIndex = index
            }
            data.history.push({
                commitURL: material.gitMaterialUrl ? createGitCommitUrl(material.gitMaterialUrl, history.Commit) : '',
                changes: history.Changes || [],
                author: history.Author,
                message: history.Message,
                date: history.Date ? moment(history.Date).format(Moment12HourFormat) : '',
                commit: history?.Commit,
                isSelected: index === selectedIndex,
                showChanges: false,
                webhookData: history.WebhookData
                    ? {
                          id: history.WebhookData.id,
                          eventActionType: history.WebhookData.eventActionType,
                          data: history.WebhookData.data,
                      }
                    : null,
                excluded: history.Excluded,
            })
        }
        if (selectedIndex >= 0) {
            data.isMaterialSelectionError = false
            data.materialSelectionErrorMsg = ''
        }
    }
    return data
}

const processCIMaterialResponse = (response): CIMaterialType[] => {
    if (Array.isArray(response?.result)) {
        const sortedCIMaterials = response.result.sort((a, b) => sortCallback('id', a, b))
        return sortedCIMaterials.map((material, index) => {
            return {
                ...material,
                isSelected: index == 0,
                gitURL: material.gitMaterialUrl || '',
                lastFetchTime: material.lastFetchTime ? handleUTCTime(material.lastFetchTime, true) : '',
                isMaterialLoading: false,
                showAllCommits: false,
                ...processMaterialHistoryAndSelectionError(material),
            } satisfies CIMaterialType
        })
    }

    return []
}

export const getCIMaterialList = (
    params: {
        pipelineId: string
        materialId?: number
        showExcluded?: boolean
    },
    abortControllerRef: APIOptions['abortControllerRef'],
) => {
    let url = `${Routes.CI_CONFIG_GET}/${params.pipelineId}/material`
    if (params.materialId) {
        url += `/${params.materialId}${params.showExcluded ? '?showAll=true' : ''} `
    }
    return get(url, {
        abortControllerRef,
    }).then((response) => {
        const materials = processCIMaterialResponse(response)
        return {
            code: response.code,
            status: response.status,
            result: materials,
        }
    })
}

export function extractImage(image: string): string {
    return image ? image.split(':').pop() : ''
}

export const triggerCINode = (request, abortSignal?: AbortSignal) => {
    const URL = `${Routes.CI_PIPELINE_TRIGGER}`
    const options = {
        signal: abortSignal,
    }
    return post(URL, request, options)
}

export const triggerBranchChange = (appIds: number[], envId: number, value: string) => {
    return new Promise((resolve) => {
        ApiQueuingWithBatch(
            appIds.map(
                (appId) => () =>
                    put(Routes.CI_PIPELINE_SOURCE_BULK_PATCH, {
                        appIds: [appId],
                        environmentId: envId,
                        value: value,
                    }),
            ),
        )
            .then((results: any[]) => {
                // Adding for legacy code since have move API Queueing to generics with unknown as default response
                resolve(
                    results.map((result, index) => {
                        if (result.status === PromiseAllStatusType.FULFILLED) {
                            return result.value?.result.apps[0]
                        }
                        const response = {
                            appId: appIds[index],
                            status: '',
                            message: '',
                        }
                        const errorReason = result.reason
                        switch (errorReason.code) {
                            case 403:
                            case 422:
                                response.status = BulkResponseStatus.UNAUTHORIZE
                                response.message = BULK_VIRTUAL_RESPONSE_STATUS[response.status]
                                break
                            case 409:
                            default:
                                response.status = BulkResponseStatus.FAIL
                                response.message = BULK_VIRTUAL_RESPONSE_STATUS[response.status]
                        }
                        return response
                    }),
                )
            })
            .catch(noop)
    })
}

export const getWorkflowStatus = (appId: string) => {
    const URL = `${Routes.APP_WORKFLOW_STATUS}/${appId}/${Routes.APP_LIST_V2}`
    return get(URL)
}

export const getCIPipelines = (appId, filteredEnvIds?: string, callback?: (...args) => void) => {
    let filteredEnvParams = ''
    if (filteredEnvIds) {
        filteredEnvParams = `?envIds=${filteredEnvIds}`
    }
    const URL = `${Routes.APP}/${appId}/${Routes.APP_CI_PIPELINE}${filteredEnvParams}`
    return get(URL).catch((error) => {
        if (callback) {
            callback(error)
        }

        return {
            code: error.code,
            status: error.status,
            result: [],
        }
    })
}

export function refreshGitMaterial(gitMaterialId: string, abortSignal: AbortSignal) {
    const URL = `${Routes.REFRESH_MATERIAL}/${gitMaterialId}`
    return get(URL, {
        signal: abortSignal,
    }).then((response) => {
        return {
            code: response.code,
            result: {
                message: response.result.message || '',
                errorMsg: response.result.errorMsg || '',
                lastFetchTime: response.result.lastFetchTime ? handleUTCTime(response.result.lastFetchTime, true) : '',
            },
        }
    })
}

export function getGitMaterialByCommitHash(materialId: string, commitHash: string, abortSignal?: AbortSignal) {
    return get(`${Routes.COMMIT_INFO}/${materialId}/${commitHash}`, abortSignal ? { signal: abortSignal } : null)
}

export function getTriggerHistory(pipelineId, params) {
    const URL = `${Routes.CI_CONFIG_GET}/${pipelineId}/workflows?offset=${params.offset}&size=${params.size}`
    return get(URL)
}
export function setImageTags(request, pipelineId: number, artifactId: number) {
    return post(`${Routes.IMAGE_TAGGING}/${pipelineId}/${artifactId}`, request)
}


export function getArtifactForJobCi(pipelineId, workflowId): Promise<ArtifactCiJobResponse> {
    const URL = `${Routes.CI_CONFIG_GET}/${pipelineId}/workflow/${workflowId}/ci-job/artifacts`
    return get(URL)
}

export function getNodeStatus({ appName, envName, version, namespace, group, kind, name }) {
    if (!group) {
        group = ''
    }
    return get(
        `api/v1/applications/${appName}-${envName}/resource?version=${version}&namespace=${namespace}&group=${group}&kind=${kind}&resourceName=${name}`,
    )
}

export function getAppMetaInfo(appId: number): Promise<AppMetaInfoResponse> {
    return get(`${Routes.APP_META_INFO}/${appId}`)
}

export function getHelmAppMetaInfo(appId: string): Promise<AppMetaInfoResponse> {
    return get(`${Routes.HELM_APP_META_INFO}/${appId}`)
}

export function getHelmAppOverviewInfo(installedAppId: string): Promise<AppMetaInfoResponse> {
    return get(`${Routes.HELM_APP_OVERVIEW}?installedAppId=${installedAppId}`)
}

export const editApp = (request: EditAppRequest): Promise<ResponseType> => {
    return post(Routes.APP_EDIT, request)
}

export const getIngressServiceUrls = (params: {
    appId?: string
    envId: string
    installedAppId?: string
}): Promise<ResponseType> => {
    const urlParams = Object.entries(params).map(([key, value]) => {
        if (!value) {
            return
        }
        return `${key}=${value}`
    })
    return get(`${Routes.INGRESS_SERVICE_MANIFEST}?${urlParams.filter((s) => s).join('&')}`)
}

export function getManualSync(params: { appId: string; envId: string }): Promise<ResponseType> {
    return get(`${Routes.MANUAL_SYNC}/${params.appId}/${params.envId}`)
}
