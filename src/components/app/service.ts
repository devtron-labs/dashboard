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

import moment from 'moment'

import {
    ACTION_STATE,
    APIOptions,
    ApiQueuingWithBatch,
    AppDetails,
    AppType,
    CIMaterialType,
    createGitCommitUrl,
    DEPLOYMENT_STATUS,
    DeploymentStatusDetailsType,
    DeploymentWindowProfileMetaData,
    get,
    getUrlWithSearchParams,
    handleUTCTime,
    History,
    IndexStore,
    noop,
    numberComparatorBySortOrder,
    post,
    PromiseAllStatusType,
    put,
    ReleaseMode,
    ResponseType,
    sortCallback,
    useQuery,
    useQueryClient,
    WFR_STATUS_DTO_TO_DEPLOYMENT_STATUS_MAP,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { getExternalLinks } from '@Components/externalLinks/ExternalLinks.service'
import {
    ExternalLinkIdentifierType,
    ExternalLinkResponse,
    ExternalLinksAndToolsType,
} from '@Components/externalLinks/ExternalLinks.type'
import { sortByUpdatedOn } from '@Components/externalLinks/ExternalLinks.utils'

import { Moment12HourFormat, NO_COMMIT_SELECTED, Routes } from '../../config'
import { BULK_VIRTUAL_RESPONSE_STATUS, BulkResponseStatus } from '../ApplicationGroup/Constants'
import { getDeploymentStatusDetail } from './details/appDetails/appDetails.service'
import { DeploymentStatusCardType } from './details/appDetails/appDetails.type'
import {
    AppMetaInfo,
    ArtifactsCiJob,
    DeploymentWindowParsedMetaData,
    EditAppRequest,
    UseGetDTAppDetailsParams,
    UseGetDTAppDetailsReturnType,
} from './types'

const DEPLOYMENT_STATUS_QUERY_KEY = 'deployment-status-detail'

const getDeploymentWindowProfileMetaData: (appId: string, envId: string) => DeploymentWindowProfileMetaData =
    importComponentFromFELibrary('getDeploymentWindowProfileMetaData', null, 'function')

export const getAppList = (request, options?: APIOptions) => post(Routes.APP_LIST, request, options)

// Hook to fetch app details, resource tree and publish to IndexStore
export const useGetDTAppDetails = ({ appId, envId }: UseGetDTAppDetailsParams): UseGetDTAppDetailsReturnType => {
    const queryClient = useQueryClient()
    const resourceTreeQueryKey = 'dt-app-resource-tree'

    const {
        data: appDetails,
        isFetching: isFetchingAppDetails,
        error: appDetailsError,
        refetch: refetchAppDetails,
        status: appDetailsQueryStatus,
    } = useQuery<AppDetails>({
        queryKey: ['dt-app-details', appId, envId],
        queryFn: ({ signal }) =>
            get<AppDetails>(getUrlWithSearchParams(`${Routes.APP_DETAIL}/v2`, { 'app-id': appId, 'env-id': envId }), {
                signal,
            }),
        select: ({ result }) => result,
        enabled: !!appId && !!envId,
        refetchInterval: (data, query) =>
            // In case query failed and no data is available previously, stop polling and show error state
            !data && query.state.status === 'error' ? false : window._env_.DEVTRON_APP_DETAILS_POLLING_INTERVAL,
        onSuccess: async (data) => {
            // Publish app details to IndexStore if there is resource tree is not to be fetched
            if (!data?.isPipelineTriggered && data?.releaseMode === ReleaseMode.NEW_DEPLOYMENT) {
                IndexStore.publishAppDetails(
                    {
                        ...data,
                    },
                    AppType.DEVTRON_APP,
                )
            }

            // Refetch resource tree to get latest data after app details fetch
            await queryClient.refetchQueries({ queryKey: [resourceTreeQueryKey, appId, envId] })
        },
    })

    const {
        data: resourceTree,
        isFetching: isFetchingResourceTree,
        error: resourceTreeError,
        refetch: refetchResourceTree,
        status: resourceTreeQueryStatus,
    } = useQuery<AppDetails['resourceTree']>({
        queryKey: [resourceTreeQueryKey, appId, envId],
        queryFn: ({ signal }) =>
            get<AppDetails['resourceTree']>(
                getUrlWithSearchParams(`${Routes.APP_DETAIL}/resource-tree`, { 'app-id': appId, 'env-id': envId }),
                { signal },
            ),
        select: ({ result }) => result,
        enabled:
            !!appId &&
            !!envId &&
            !!appDetails &&
            (appDetails.isPipelineTriggered || appDetails.releaseMode === ReleaseMode.MIGRATE_EXTERNAL_APPS), // Fetch resource tree for pipelines which are not triggered only in case of migrate external apps
        onSuccess: async (data) => {
            IndexStore.publishAppDetails(
                {
                    ...appDetails,
                    resourceTree: data,
                },
                AppType.DEVTRON_APP,
            )
            await queryClient.invalidateQueries({ queryKey: [DEPLOYMENT_STATUS_QUERY_KEY] })
        },
    })

    // Returning appDetails, resourceTree as null if it doesn't exist, to form loading and error states properly
    const mergedAppDetails: AppDetails = appDetails
        ? { ...appDetails, appType: AppType.DEVTRON_APP, resourceTree }
        : appDetails

    return {
        appDetails: mergedAppDetails,
        isFetchingAppDetails,
        isFetchingResourceTree,
        appDetailsError,
        resourceTreeError,
        refetchAppDetails,
        refetchResourceTree,
        appDetailsQueryStatus,
        resourceTreeQueryStatus,
    }
}

export const useGetExternalLinksAndTools = (appId: string, clusterId: number) =>
    useQuery<ExternalLinkResponse['result'], ExternalLinksAndToolsType>({
        queryKey: ['dt-app-external-links', appId, clusterId],
        queryFn: () => getExternalLinks(clusterId, appId, ExternalLinkIdentifierType.DevtronApp),
        select: (data) => ({
            externalLinks: (data.result?.ExternalLinks ?? []).sort(sortByUpdatedOn) || [],
            monitoringTools:
                (data.result?.Tools ?? [])
                    .map((tool) => ({
                        label: tool.name,
                        value: tool.id,
                        icon: tool.icon,
                    }))
                    .sort((a, b) => numberComparatorBySortOrder(a.value, b.value)) || [],
        }),
        enabled: !!appId && !!clusterId,
    })

export const useGetDeploymentWindowProfileMetaData = (appId: string, envId: string) =>
    useQuery<DeploymentWindowProfileMetaData, DeploymentWindowParsedMetaData, string[], false>({
        queryKey: ['deployment-window-profile-metadata', appId, envId],
        queryFn: () => getDeploymentWindowProfileMetaData(appId, envId),
        enabled: !!appId && !!envId && !!getDeploymentWindowProfileMetaData,
        select: (data) => {
            const userActionState = data?.userActionState || ACTION_STATE.ALLOWED
            const isDeploymentBlocked =
                userActionState === ACTION_STATE.PARTIAL || userActionState === ACTION_STATE.BLOCKED

            return {
                isDeploymentBlocked,
                userActionState,
            }
        },
    })

export const useGetDTAppDeploymentStatusDetail = (appId: string, envId: string, enabled: boolean, triggerId?: string) =>
    useQuery<DeploymentStatusDetailsType, DeploymentStatusCardType['deploymentStatusDetailsBreakdownData']>({
        queryKey: [DEPLOYMENT_STATUS_QUERY_KEY, appId, envId, triggerId],
        queryFn: () => getDeploymentStatusDetail(appId, envId, triggerId),
        select: ({ result }) => {
            const { deploymentStartedOn, wfrStatus, triggeredBy } = result
            return {
                triggeredBy,
                deploymentTriggerTime: deploymentStartedOn,
                deploymentStatus: WFR_STATUS_DTO_TO_DEPLOYMENT_STATUS_MAP[wfrStatus] || DEPLOYMENT_STATUS.INPROGRESS,
            }
        },
        enabled: enabled && !!appId && !!envId,
        refetchInterval: (data) => (data?.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS ? 10000 : false),
        meta: {
            showToastError: false,
        },
    })

export const getCIHistoricalStatus = (params): Promise<ResponseType<History>> => {
    const URL = `${Routes.APP}/${params.appId}/ci-pipeline/${params.pipelineId}/workflow/${params.buildId}`
    return get<History>(URL)
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
        return sortedCIMaterials.map(
            (material, index) =>
                ({
                    ...material,
                    isSelected: index === 0,
                    gitURL: material.gitMaterialUrl || '',
                    lastFetchTime: material.lastFetchTime ? handleUTCTime(material.lastFetchTime, true) : '',
                    isMaterialLoading: false,
                    showAllCommits: false,
                    ...processMaterialHistoryAndSelectionError(material),
                }) satisfies CIMaterialType,
        )
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

export const triggerBranchChange = (appIds: number[], envId: number, value: string) =>
    new Promise((resolve) => {
        ApiQueuingWithBatch(
            appIds.map(
                (appId) => () =>
                    put(Routes.CI_PIPELINE_SOURCE_BULK_PATCH, {
                        appIds: [appId],
                        environmentId: envId,
                        value,
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

export const getWorkflowStatus = (appId: number, options: APIOptions) => {
    const URL = `${Routes.APP_WORKFLOW_STATUS}/${appId}/${Routes.APP_LIST_V2}`
    return get(URL, options)
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
    }).then((response) => ({
        code: response.code,
        result: {
            message: response.result.message || '',
            errorMsg: response.result.errorMsg || '',
            lastFetchTime: response.result.lastFetchTime ? handleUTCTime(response.result.lastFetchTime, true) : '',
        },
    }))
}

export function getGitMaterialByCommitHash(materialId: string, commitHash: string, abortSignal?: AbortSignal) {
    return get(`${Routes.COMMIT_INFO}/${materialId}/${commitHash}`, abortSignal ? { signal: abortSignal } : null)
}

export function getTriggerHistory(pipelineId, params) {
    const URL = `${Routes.CI_CONFIG_GET}/${pipelineId}/workflows?offset=${params.offset}&size=${params.size}`
    return get(URL)
}

export function getArtifactForJobCi(pipelineId, workflowId): Promise<ResponseType<ArtifactsCiJob>> {
    const URL = `${Routes.CI_CONFIG_GET}/${pipelineId}/workflow/${workflowId}/ci-job/artifacts`
    return get<ArtifactsCiJob>(URL)
}

export function getAppMetaInfo(appId: number): Promise<ResponseType<AppMetaInfo>> {
    return get<AppMetaInfo>(`${Routes.APP_META_INFO}/${appId}`)
}

export function getHelmAppMetaInfo(appId: string): Promise<ResponseType<AppMetaInfo>> {
    return get<AppMetaInfo>(`${Routes.HELM_APP_META_INFO}/${appId}`)
}

export function getHelmAppOverviewInfo(installedAppId: string): Promise<ResponseType<AppMetaInfo>> {
    return get<AppMetaInfo>(`${Routes.HELM_APP_OVERVIEW}?installedAppId=${installedAppId}`)
}

export const editApp = (request: EditAppRequest): Promise<ResponseType> => post(Routes.APP_EDIT, request)

export const getIngressServiceUrls = (params: {
    appId?: string
    envId: string
    installedAppId?: string
}): Promise<ResponseType> => get(getUrlWithSearchParams(Routes.INGRESS_SERVICE_MANIFEST, params))

export function getManualSync(params: { appId: string; envId: string }): Promise<ResponseType> {
    return get(`${Routes.MANUAL_SYNC}/${params.appId}/${params.envId}`)
}
