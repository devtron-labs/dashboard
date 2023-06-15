import { Routes, Moment12HourFormat, SourceTypeMap, NO_COMMIT_SELECTED } from '../../config'
import {
    get,
    post,
    trash,
    ServerErrors,
    ResponseType,
    sortCallback,
    DeploymentNodeType,
    CDModalTab,
    CDMaterialResponseType,
} from '@devtron-labs/devtron-fe-common-lib'
import { createGitCommitUrl, handleUTCTime, ISTTimeModal } from '../common'
import moment from 'moment-timezone'
import { History } from './details/cicdHistory/types'
import { AppDetails, CreateAppLabelsRequest } from './types'
import { DeploymentWithConfigType } from './details/triggerView/types'
import { AppMetaInfo } from './types'

let stageMap = {
    PRECD: 'PRE',
    CD: 'DEPLOY',
    POSTCD: 'POST',
    APPROVAL: 'APPROVAL',
}

export const getAppList = (request, options?) => {
    let URL = Routes.APP_LIST
    if (window._env_.USE_V2) {
        URL += `/${Routes.APP_LIST_V2}`
    } else {
        URL += `/${Routes.APP_LIST_V1}`
    }
    return post(URL, request, options)
}

export function getCITriggerInfo(params: { envId: number | string; ciArtifactId: number | string }) {
    const URL = `${Routes.APP}/material-info/${params.envId}/${params.ciArtifactId}`
    return get(URL)
}

export function getCITriggerInfoModal(
    params: { envId: number | string; ciArtifactId: number | string },
    commit: string,
) {
    return getCITriggerInfo(params).then((response) => {
        let materials = response?.result?.ciMaterials || []
        let appReleaseTags = response?.result?.imageTaggingData?.appReleaseTags
        let tagsEditable = response?.result?.imageTaggingData?.tagsEditable
        let imageComment = response?.result?.imageTaggingData?.imageComment
        let imageReleaseTags = response?.result?.imageTaggingData?.imageReleaseTags
        let image = response?.result?.image
        materials = materials.map((mat) => {
            return {
                id: mat.id,
                gitMaterialName: mat.gitMaterialName || '',
                gitMaterialId: mat.gitMaterialId || 0,
                gitURL: mat.url || '',
                type: mat.type || '',
                value: mat.value || '',
                active: mat.active || false,
                history: mat.history.map((hist, index) => {
                    return {
                        commitURL: mat.url ? createGitCommitUrl(mat.url, hist.Commit) : '',
                        commit: hist.Commit || '',
                        author: hist.Author || '',
                        date: hist.Date ? ISTTimeModal(hist.Date, false) : '',
                        message: hist.Message || '',
                        changes: hist.Changes || [],
                        showChanges: index === 0,
                        webhookData: hist.WebhookData,
                    }
                }), 
                isSelected:
                    mat.history.find((h) =>
                        mat.type != SourceTypeMap.WEBHOOK ? h.Commit === commit : h.WebhookData.id == commit,
                    ) || false,
                lastFetchTime: mat.lastFetchTime || '',
            }
        })
        if (materials.length > 0 && !materials.find((mat) => mat.isSelected)) {
            materials[0].isSelected = true
        }
        return {
            code: response.code,
            result: {
                materials: materials,
                triggeredByEmail: response.result.triggeredByEmail || '',
                lastDeployedTime: response.result.lastDeployedTime
                    ? handleUTCTime(response.result.lastDeployedTime, false)
                    : '',
                environmentName: response.result.environmentName || '',
                environmentId: response.result.environmentId || 0,
                appName: response.result.appName || '',
                appReleaseTags: appReleaseTags,
                imageComment: imageComment,
                imageReleaseTags: imageReleaseTags,
                image: image,
                tagsEditable: tagsEditable,
            },
        }
    })
}

export function deleteResource({ appName, env, name, kind, group, namespace, version, appId, envId }) {
    if (!group) group = ''
    const URL = `${Routes.APPLICATIONS}/${appName}-${env}/resource?name=${name}&namespace=${namespace}&resourceName=${name}&version=${version}&group=${group}&kind=${kind}&force=true&appId=${appId}&envId=${envId}`
    return trash(URL)
}

interface AppDetailsResponse extends ResponseType {
    result?: AppDetails
}

interface AppMetaInfoResponse extends ResponseType {
    result?: AppMetaInfo
}

export function fetchAppDetails(appId: number | string, envId: number | string): Promise<AppDetailsResponse> {
    return get(`${Routes.APP_DETAIL}?app-id=${appId}&env-id=${envId}`)
}

export function fetchAppDetailsInTime(
    appId: number | string,
    envId: number | string,
    reloadTimeOut: number,
): Promise<AppDetailsResponse> {
    return get(`${Routes.APP_DETAIL}/v2?app-id=${appId}&env-id=${envId}`, { timeout: reloadTimeOut })
}

export function fetchResourceTreeInTime(
    appId: number | string,
    envId: number | string,
    reloadTimeOut: number,
): Promise<AppDetailsResponse> {
    return get(`${Routes.APP_DETAIL}/resource-tree?app-id=${appId}&env-id=${envId}`, { timeout: reloadTimeOut })
}

export function getEvents(pathParams) {
    const URL = `${Routes.APPLICATIONS}/${pathParams.appName}-${pathParams.env}/events?resourceNamespace=${pathParams.resourceNamespace}&resourceUID=${pathParams.uid}&resourceName=${pathParams.resourceName}`
    return URL
}

export function getCITriggerDetails(params: {
    appId: number | string
    pipelineId: number | string
}): Promise<{ code: number; status: string; triggerDetails: any }> {
    const URL = `${Routes.APP}/${params.appId}/ci-pipeline/${params.pipelineId}/workflow/last`
    return get(URL).then((response) => {
        if (response.result && !response.errors) {
            return {
                code: response.code,
                status: response.status,
                triggerDetails: {
                    id: response.result.id || 0,
                    startedOn: response.result.startedOn,
                    finishedOn: response.result.finishedOn,
                    status: response.result.status || '',
                    name: response.result.name || '',
                    namespace: response.result.namespace || '',
                    podStatus: response.result.podStatus || '',
                    message: response.result.message || '',
                    gitTriggers: response.result.gitTriggers
                        ? gitTriggersModal(response.result.gitTriggers, response.result.ciMaterials)
                        : [],
                },
            }
        } else {
            throw new ServerErrors({ code: response.code, errors: response.errors })
        }
    })
}

interface CIHistoricalStatus extends ResponseType {
    result?: History
}

export const getCIHistoricalStatus = (params): Promise<CIHistoricalStatus> => {
    let URL = `${Routes.APP}/${params.appId}/ci-pipeline/${params.pipelineId}/workflow/${params.buildId}`
    return get(URL)
}

const gitTriggersModal = (triggers, materials) => {
    let ids = Object.keys(triggers)
    return ids.map((key) => {
        const material = materials.find((mat) => mat.id === Number(key))
        return {
            id: key,
            gitMaterialName: material?.gitMaterialName || '',
            changes: triggers[key].Changes,
            commit: triggers[key].Commit,
            author: triggers[key].Author,
            message: triggers[key].Message,
            url: material?.url || '',
            date: triggers[key].Date ? ISTTimeModal(triggers[key].Date) : '',
        }
    })
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

const processCIMaterialResponse = (response) => {
    if (Array.isArray(response?.result)) {
        const sortedCIMaterials = response.result.sort((a, b) => sortCallback('id', a, b))
        return sortedCIMaterials.map((material, index) => {
            return {
                ...material,
                isSelected: index == 0,
                gitURL: material.gitMaterialUrl || '',
                lastFetchTime: material.lastFetchTime ? ISTTimeModal(material.lastFetchTime, true) : '',
                isMaterialLoading: false,
                showAllCommits: false,
                ...processMaterialHistoryAndSelectionError(material),
            }
        })
    }

    return []
}

export const getCIMaterialList = (params, abortSignal: AbortSignal) => {
    let url = `${Routes.CI_CONFIG_GET}/${params.pipelineId}/material`
    if (params.materialId) {
        url += `/${params.materialId}${params.showExcluded ? '?showAll=true' : ''} `
    }
    return get(url, {
        signal: abortSignal,
    }).then((response) => {
        const materials = processCIMaterialResponse(response)
        return {
            code: response.code,
            status: response.status,
            result: materials,
        }
    })
}

export function getCDMaterialList(
    cdMaterialId,
    stageType: DeploymentNodeType,
    abortSignal: AbortSignal,
    isApprovalNode?: boolean,
): Promise<CDMaterialResponseType> {
    const URL = `${Routes.CD_MATERIAL_GET}/${cdMaterialId}/material?stage=${
        isApprovalNode ? stageMap.APPROVAL : stageMap[stageType]
    }`
    return get(URL, {
        signal: abortSignal,
    }).then((response) => {
        if (!response.result) {
            return {
                approvalUsers: [],
                materials: [],
                userApprovalConfig: null,
                requestedUserId: 0,
                tagsEditable: false,
                appReleaseTagNames: [],
            }
        } else if (stageType === DeploymentNodeType.CD || stageType === DeploymentNodeType.APPROVAL) {
            return {
                approvalUsers: response.result.approvalUsers,
                materials: cdMaterialListModal(
                    response.result.ci_artifacts,
                    true,
                    response.result.latest_wf_artifact_id,
                    response.result.latest_wf_artifact_status,
                    response.result.appReleaseTagNames,
                    response.result.tagsEditable,
                ),
                userApprovalConfig: response.result.userApprovalConfig,
                requestedUserId: response.result.requestedUserId,
                appReleaseTagNames: response.result.appReleaseTagNames,
                tagsEditable: response.result.tagsEditable,
            }
        } else {
            return {
                approvalUsers: [],
                materials: cdMaterialListModal(
                    response.result.ci_artifacts,
                    true,
                    response.result.latest_wf_artifact_id,
                    response.result.latest_wf_artifact_status,
                    response.result.appReleaseTagNames,
                    response.result.tagsEditable,
                ),
                userApprovalConfig: null,
                requestedUserId: 0,
                appReleaseTagNames: response.result.appReleaseTagNames,
                tagsEditable: response.result.tagsEditable,
            }
        }
    })
}

export function getRollbackMaterialList(
    cdMaterialId,
    offset: number,
    size: number,
    abortSignal: AbortSignal,
): Promise<ResponseType> {
    let URL = `${Routes.CD_MATERIAL_GET}/${cdMaterialId}/material/rollback?offset=${offset}&size=${size}`
    return get(URL, {
        signal: abortSignal,
    }).then((response) => {
        return {
            code: response.code,
            status: response.status,
            result: {
                materials: cdMaterialListModal(response.result?.ci_artifacts, offset === 1 ? true : false),
                requestedUserId: response.result?.requestedUserId,
            },
        }
    })
}

export function extractImage(image: string): string {
    return image ? image.split(':').pop() : ''
}

function cdMaterialListModal(
    artifacts: any[],
    markFirstSelected: boolean,
    artifactId?: number,
    artifactStatus?: string,
    appReleaseTagNames?: string[],
    tagsEditable?: boolean
) {
    if (!artifacts || !artifacts.length) return []

    const materials = artifacts.map((material, index) => {
        let artifactStatusValue = ''
        if (artifactId && artifactStatus && material.id === artifactId) {
            artifactStatusValue = artifactStatus
        }

        return {
            index,
            id: material.id,
            deployedTime: material.deployed_time
                ? moment(material.deployed_time).format(Moment12HourFormat)
                : 'Not Deployed',
            deployedBy: material.deployedBy,
            wfrId: material.wfrId,
            tab: CDModalTab.Changes,
            image: extractImage(material.image),
            showChanges: false,
            vulnerabilities: [],
            buildTime: material.build_time || '',
            isSelected: markFirstSelected ? !material.vulnerable && index === 0 : false,
            showSourceInfo: false,
            deployed: material.deployed || false,
            latest: material.latest || false,
            vulnerabilitiesLoading: true,
            scanned: material.scanned,
            scanEnabled: material.scanEnabled,
            vulnerable: material.vulnerable,
            runningOnParentCd: material.runningOnParentCd,
            artifactStatus: artifactStatusValue,
            userApprovalMetadata: material.userApprovalMetadata,
            triggeredBy: material.triggeredBy,
            imageComment: material.imageComment,
            imageReleaseTags: material.imageReleaseTags,
            materialInfo: material.material_info
                ? material.material_info.map((mat) => {
                      return {
                          modifiedTime: mat.modifiedTime ? moment(mat.modifiedTime).format(Moment12HourFormat) : '',
                          commitLink: createGitCommitUrl(mat.url, mat.revision),
                          author: mat.author || '',
                          message: mat.message || '',
                          revision: mat.revision || '',
                          tag: mat.tag || '',
                          webhookData: mat.webhookData || '',
                          url: mat.url || '',
                          branch:
                              (material.ciConfigureSourceType === SourceTypeMap.WEBHOOK
                                  ? material.ciConfigureSourceValue
                                  : mat.branch) || '',
                          type: material.ciConfigureSourceType || '',
                      }
                  })
                : [],
        }
    })
    return materials
}

export const cancelCiTrigger = (params) => {
    let URL = `${Routes.CI_CONFIG_GET}/${params.pipelineId}/workflow/${params.workflowId}`
    return trash(URL)
}

export const cancelPrePostCdTrigger = (pipelineId, workflowRunner) => {
    const URL = `${Routes.CD_CONFIG}/${pipelineId}/workflowRunner/${workflowRunner}`
    return trash(URL)
}

export const getRecentDeploymentConfig = (appId: number, pipelineId: number) => {
    return get(`${Routes.RECENT_DEPLOYMENT_CONFIG}/${appId}/${pipelineId}`)
}

export const getLatestDeploymentConfig = (appId: number, pipelineId: number) => {
    return get(`${Routes.LATEST_DEPLOYMENT_CONFIG}/${appId}/${pipelineId}`)
}

export const getSpecificDeploymentConfig = (appId: number, pipelineId: number, wfrId: number) => {
    return get(`${Routes.SPECIFIC_DEPLOYMENT_CONFIG}/${appId}/${pipelineId}/${wfrId}`)
}

export const triggerCINode = (request) => {
    let URL = `${Routes.CI_PIPELINE_TRIGGER}`
    return post(URL, request)
}

export const triggerCDNode = (
    pipelineId: any,
    ciArtifactId: any,
    appId: string,
    stageType: DeploymentNodeType,
    deploymentWithConfig?: string,
    wfrId?: number,
) => {
    const request = {
        pipelineId: parseInt(pipelineId),
        appId: parseInt(appId),
        ciArtifactId: parseInt(ciArtifactId),
        cdWorkflowType: stageMap[stageType],
    }

    if (deploymentWithConfig) {
        request['deploymentWithConfig'] =
            deploymentWithConfig === DeploymentWithConfigType.LAST_SAVED_CONFIG
                ? deploymentWithConfig
                : DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG

        if (deploymentWithConfig !== DeploymentWithConfigType.LAST_SAVED_CONFIG) {
            request['wfrIdForDeploymentWithSpecificTrigger'] = wfrId
        }
    }
    return post(Routes.CD_TRIGGER_POST, request)
}

export const getPrePostCDTriggerStatus = (params) => {
    const URL = `${Routes.APP}/cd-pipeline/workflow/status/${params.appId}/${params.environmentId}/${params.pipelineId}`
    return get(URL)
}

export const getWorkflowStatus = (appId: string) => {
    const URL = `${Routes.APP_WORKFLOW_STATUS}/${appId}/${Routes.APP_LIST_V2}`
    return get(URL)
}

export const getCIPipelines = (appId) => {
    let URL = `${Routes.APP}/${appId}/${Routes.APP_CI_PIPELINE}`
    return get(URL)
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

export function getGitMaterialByCommitHash(gitMaterialId: string, commitHash: string) {
    return get(`${Routes.COMMIT_INFO}/${gitMaterialId}/${commitHash}`)
}

export const getCDTriggerStatus = (appId) => {
    let URL = `${Routes.CD_TRIGGER_STATUS}?app-id=${appId}`
    return get(URL, { timeout: 3 * 60000 }).then((response) => {
        return response.result
            ? response?.result?.map((status) => {
                  return {
                      ciPipelineId: status.ciPipelineId,
                      ciPipelineName: status.ciPipelineName,
                      cdPipelineId: status.cdPipelineId,
                      cdPipelineName: status.cdPipelineName,
                      status: status.status,
                      environmentName: status.environmentName,
                      materialInfo: status.materialInfo,
                      lastDeployedBy: status.lastDeployedBy,
                      lastDeployedTime: status.lastDeployedTime ? handleUTCTime(status.lastDeployedTime, true) : '',
                  }
              })
            : []
    })
}

export function getTriggerHistory(pipelineId, params) {
    let URL = `${Routes.CI_CONFIG_GET}/${pipelineId}/workflows?offset=${params.offset}&size=${params.size}`
    return get(URL)
}
export function setImageTags(request, pipelineId: number, artifactId: number){
    return post(`${Routes.IMAGE_TAGGING}/${pipelineId}/${artifactId}`,request )
}

export function getImageTags(pipelineId: number, artifactId: number){
    return get (`${Routes.IMAGE_TAGGING}/${pipelineId}/${artifactId}`)
}


function handleTime(ts: string) {
    let timestamp = ''
    try {
        if (ts && ts.length) {
            let date = moment(ts).utc(true).subtract(5, 'hours').subtract(30, 'minutes')
            timestamp = date.format('ddd DD MMM YYYY HH:mm:ss')
        }
    } catch (error) {
        console.error('Error Parsing Date:', ts)
    }
    return timestamp
}

export function handleTimeWithOffset(ts: string) {
    let timestamp = ''
    try {
        if (ts && ts.length) {
            let date = moment(ts).add(5, 'hours').add(30, 'minutes')
            timestamp = date.format('ddd DD MMM YYYY HH:mm:ss')
        }
    } catch (error) {
        console.error('Error Parsing Date:', ts)
    }
    return timestamp
}

export function getArtifact(pipelineId, workflowId) {
    const URL = `${Routes.CI_CONFIG_GET}/${pipelineId}/artifacts/${workflowId}`
    return get(URL).then((response) => {
        return response
    })
}

export function getNodeStatus({ appName, envName, version, namespace, group, kind, name }) {
    if (!group) group = ''
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

export const createAppLabels = (request: CreateAppLabelsRequest): Promise<ResponseType> => {
    return post(Routes.APP_LABELS, request)
}

export const getIngressServiceUrls = (params: {
    appId?: string
    envId: string
    installedAppId?: string
}): Promise<ResponseType> => {
    const urlParams = Object.entries(params).map(([key, value]) => {
        if (!value) return
        return `${key}=${value}`
    })
    return get(`${Routes.INGRESS_SERVICE_MANIFEST}?${urlParams.filter((s) => s).join('&')}`)
}

export function getManualSync(params: { appId: string; envId: string }): Promise<ResponseType> {
    return get(`${Routes.MANUAL_SYNC}/${params.appId}/${params.envId}`)
}
