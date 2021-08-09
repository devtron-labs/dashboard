import {Moment12HourFormat, Routes} from '../../config';
import {get, post, trash} from '../../services/api';
import {ResponseType} from '../../services/service.types';
import {createGitCommitUrl, handleUTCTime, ISTTimeModal, sortCallback} from '../common';
import moment from 'moment-timezone';
import {ServerErrors} from '../../modals/commonTypes';
import {History} from './details/cIDetails/types'
import {AppDetails} from './types';
import {CDMdalTabType} from './details/triggerView/types'
import {AppMetaInfo} from './types';

let stageMap = {
    'PRECD': 'PRE',
    'CD': 'DEPLOY',
    'POSTCD': 'POST'
};

export const CDModalTab = {
    Security: <CDMdalTabType>"SECURITY",
    Changes: <CDMdalTabType>"CHANGES",
}

export const getAppList = (request, options?) => {
    const URL = `${Routes.APP_LIST}`;
    return post(URL, request, options);
}

export function getCITriggerInfo(params: { appId: number | string, ciArtifactId: number | string }) {
    const URL = `${Routes.APP}/material-info/${params.appId}/${params.ciArtifactId}`;
    return get(URL);
}

export function getCITriggerInfoModal(params: { appId: number | string, ciArtifactId: number | string }, commit: string) {
    return getCITriggerInfo(params).then((response) => {
        let materials = response?.result?.ciMaterials || [];
        materials = materials.map((mat) => {
            return {
                id: mat.id,
                gitMaterialName: mat.gitMaterialName || "",
                gitMaterialId: mat.gitMaterialId || 0,
                gitURL: mat.url || "",
                type: mat.type || "",
                value: mat.value || "",
                active: mat.active || false,
                history: mat.history.map((hist, index) => {
                    return {
                        commitURL: mat.url ? createGitCommitUrl(mat.url, hist.Commit) : "",
                        commit: hist.Commit || "",
                        author: hist.Author || "",
                        date: hist.Date ? ISTTimeModal(hist.Date, false) : "",
                        message: hist.Message || "",
                        changes: hist.Changes || [],
                        showChanges: index === 0,
                    }
                }),
                isSelected: mat.history.find(h => h.Commit === commit) || false,
                lastFetchTime: mat.lastFetchTime || "",
            }
        })
        return {
            code: response.code,
            result: {
                materials: materials,
                triggeredByEmail: response.result.triggeredByEmail || "",
                lastDeployedTime: response.result.lastDeployedTime ? handleUTCTime(response.result.lastDeployedTime, false) : "",
                environmentName: response.result.environmentName || "",
                environmentId: response.result.environmentId || 0,
                appName: response.result.appName || "",
            }
        }
    })
}

export function deleteResource({appName, env, name, kind, group, namespace, version, appId, envId}) {
    if (!group) group = '';
    const URL = `${Routes.APPLICATIONS}/${appName}-${env}/resource?name=${name}&namespace=${namespace}&resourceName=${name}&version=${version}&group=${group}&kind=${kind}&force=true&appId=${appId}&envId=${envId}`;
    return trash(URL);
}

interface AppDetailsResponse extends ResponseType {
    result?: AppDetails;
}

interface AppMetaInfoResponse extends ResponseType {
    result?: AppMetaInfo;
}

export function fetchAppDetails(appId: number | string, envId: number | string): Promise<AppDetailsResponse> {
    return get(`${Routes.APP_DETAIL}?app-id=${appId}&env-id=${envId}`)
}

export function fetchAppDetailsInTime(appId: number | string, envId: number | string, reloadTimeOut: number): Promise<AppDetailsResponse> {
    return get(`${Routes.APP_DETAIL}?app-id=${appId}&env-id=${envId}`, {timeout: reloadTimeOut});
}

export function getEvents(pathParams) {
    const URL = `${Routes.APPLICATIONS}/${pathParams.appName}-${pathParams.env}/events?resourceNamespace=${pathParams.resourceNamespace}&resourceUID=${pathParams.uid}&resourceName=${pathParams.resourceName}`;
    return URL;
}

export function getCITriggerDetails(params: { appId: number | string, pipelineId: number | string }): Promise<{ code: number, status: string, triggerDetails: any }> {
    const URL = `${Routes.APP}/${params.appId}/ci-pipeline/${params.pipelineId}/workflow/last`;
    return get(URL).then((response) => {
        if (response.result && !response.errors) {
            return {
                code: response.code,
                status: response.status,
                triggerDetails: {
                    id: response.result.id || 0,
                    startedOn: response.result.startedOn,
                    finishedOn: response.result.finishedOn,
                    status: response.result.status || "",
                    name: response.result.name || "",
                    namespace: response.result.namespace || "",
                    podStatus: response.result.podStatus || "",
                    message: response.result.message || "",
                    gitTriggers: response.result.gitTriggers ? gitTriggersModal(response.result.gitTriggers, response.result.ciMaterials) : []
                }
            }
        } else {
            throw new ServerErrors({code: response.code, errors: response.errors})
        }
    })
}

interface CIHistoricalStatus extends ResponseType {
    result?: History;
}

export const getCIHistoricalStatus = (params): Promise<CIHistoricalStatus> => {
    let URL = `${Routes.APP}/${params.appId}/ci-pipeline/${params.pipelineId}/workflow/${params.buildId}`;
    return get(URL)
}

const gitTriggersModal = (triggers, materials) => {
    let ids = Object.keys(triggers);
    return ids.map((key) => {
        const material = materials.find(mat => mat.id === Number(key))
        return {
            id: key,
            gitMaterialName: material?.gitMaterialName || "",
            changes: triggers[key].Changes,
            commit: triggers[key].Commit,
            author: triggers[key].Author,
            message: triggers[key].Message,
            url: material?.url || "",
            date: triggers[key].Date ? ISTTimeModal(triggers[key].Date) : "",
        }
    })
}

export const getCIMaterialList = (params) => {
    let URL = `${Routes.CI_CONFIG_GET}/${params.pipelineId}/material`;
    return get(URL).then((response) => {
        let materials = response?.result ? response?.result?.map((material, index) => {
            return {
                ...material,
                isSelected: index == 0,
                gitURL: material.gitMaterialUrl || "",
                lastFetchTime: material.lastFetchTime ? ISTTimeModal(material.lastFetchTime, true) : "",
                isMaterialLoading: false,
                history: material.history ? material.history.map((history, indx) => {
                    return {
                        commitURL: material.gitMaterialUrl ? createGitCommitUrl(material.gitMaterialUrl, history.Commit) : "",
                        changes: history.Changes || [],
                        author: history.Author,
                        message: history.Message,
                        date: history.Date ? moment(history.Date).format(Moment12HourFormat) : "",
                        commit: history.Commit,
                        isSelected: indx == 0,
                        showChanges: false,
                    }
                }) : []
            }
        }) : [];
        materials.sort((a, b) => {
            sortCallback('id', a, b)
        });
        return {
            code: response.code,
            status: response.status,
            result: materials
        }
    })
}

export function getCDMaterialList(cdMaterialId, stageType: 'PRECD' | 'CD' | 'POSTCD') {
    let URL = `${Routes.CD_MATERIAL_GET}/${cdMaterialId}/material?stage=${stageMap[stageType]}`;
    return get(URL).then(response => {
        return cdMaterialListModal(response.result.ci_artifacts)
    })
}

export function getRollbackMaterialList(cdMaterialId): Promise<ResponseType> {
    let URL = `${Routes.CD_MATERIAL_GET}/${cdMaterialId}/material/rollback`;
    return get(URL).then(response => {
        return {
            code: response.code,
            status: response.status,
            result: cdMaterialListModal(response?.result.ci_artifacts)
        }
    })
}

function cdMaterialListModal(artifacts) {
    if (!artifacts || !artifacts.length) return [];

    let materials = artifacts.map((material, index) => {
        return {
            id: material.id,
            deployedTime: material.deployed_time ? moment(material.deployed_time).format(Moment12HourFormat) : "Not Deployed",
            tab: CDModalTab.Changes,
            image: material.image.split(':')[1],
            showChanges: false,
            vulnerabilities: [],
            buildTime: material.build_time || "",
            isSelected: !material.vulnerable && index === 0,
            showSourceInfo: false,
            deployed: material.deployed || false,
            latest: material.latest || false,
            vulnerabilitiesLoading: true,
            scanned: material.scanned,
            scanEnabled: material.scanEnabled,
            vulnerable: material.vulnerable,
            materialInfo: material.material_info ? material.material_info.map((mat) => {
                return {
                    modifiedTime: mat.modifiedTime ? moment(mat.modifiedTime).format(Moment12HourFormat) : "",
                    commitLink: createGitCommitUrl(mat.url, mat.revision),
                    author: mat.author || "",
                    message: mat.message || "",
                    revision: mat.revision || "",
                    tag: mat.tag || "",
                }
            }) : [],
        }
    })
    materials.sort((a, b) => {
        sortCallback('id', a, b)
    });
    return materials;
}

export const cancelCiTrigger = (params) => {
    let URL = `${Routes.CI_CONFIG_GET}/${params.pipelineId}/workflow/${params.workflowId}`;
    return trash(URL);
}

export const cancelPrePostCdTrigger = (pipelineId, workflowRunner) => {
    const URL = `${Routes.CD_CONFIG}/${pipelineId}/workflowRunner/${workflowRunner}`;
    return trash(URL);
}

export const triggerCINode = (request) => {
    let URL = `${Routes.CI_PIPELINE_TRIGGER}`;
    return post(URL, request);
}
// stageType: 'PRECD' | 'CD' | 'POSTCD'
export const triggerCDNode = (pipelineId, ciArtifactId, appId, stageType: string) => {
    let URL = `${Routes.CD_TRIGGER_POST}`;
    return post(URL, {
        pipelineId: parseInt(pipelineId),
        appId: parseInt(appId),
        ciArtifactId: parseInt(ciArtifactId),
        cdWorkflowType: stageMap[stageType]
    });
}

export const getPrePostCDTriggerStatus = (params) => {
    const URL = `${Routes.APP}/cd-pipeline/workflow/status/${params.appId}/${params.environmentId}/${params.pipelineId}`;
    return get(URL);
}


export const getWorkflowStatus = (appId: string) => {
    const URL = `${Routes.APP_WORKFLOW_STATUS}/${appId}`;
    return get(URL);
}

export const getCIPipelines = (appId) => {
    let URL = `${Routes.APP}/${appId}/${Routes.APP_CI_PIPELINE}`;
    return get(URL);
}

export function refreshGitMaterial(gitMaterialId: string) {
    const URL = `${Routes.REFRESH_MATERIAL}/${gitMaterialId}`;
    return get(URL).then((response) => {
        return {
            code: response.code,
            result: {
                message: response.result.message || "",
                errorMsg: response.result.errorMsg || "",
                lastFetchTime: response.result.lastFetchTime ? handleUTCTime(response.result.lastFetchTime, true) : ""
            }
        }
    })
}

export const getCDTriggerStatus = (appId) => {
    let URL = `${Routes.CD_TRIGGER_STATUS}?app-id=${appId}`;
    return get(URL, {timeout: 3 * 60000}).then(response => {
        return response.result ? response?.result?.map(status => {
            return {
                ciPipelineId: status.ciPipelineId,
                ciPipelineName: status.ciPipelineName,
                cdPipelineId: status.cdPipelineId,
                cdPipelineName: status.cdPipelineName,
                status: status.status,
                environmentName: status.environmentName,
                materialInfo: status.materialInfo,
                lastDeployedBy: status.lastDeployedBy,
                lastDeployedTime: status.lastDeployedTime ? handleUTCTime(status.lastDeployedTime, true) : ""
            }
        }) : []
    });
}

export function getTriggerHistory(pipelineId, params) {
    let URL = `${Routes.CI_CONFIG_GET}/${pipelineId}/workflows?offset=${params.offset}&size=${params.size}`;
    return get(URL)
}

function handleTime(ts: string) {
    let timestamp = "";
    try {
        if (ts && ts.length) {
            let date = moment(ts).utc(true).subtract(5, "hours").subtract(30, "minutes");
            timestamp = date.format("ddd DD MMM YYYY HH:mm:ss");
        }
    } catch (error) {
        console.error("Error Parsing Date:", ts);
    }
    return timestamp;
}

export function handleTimeWithOffset(ts: string) {
    let timestamp = "";
    try {
        if (ts && ts.length) {
            let date = moment(ts).add(5, 'hours').add(30, 'minutes');
            timestamp = date.format("ddd DD MMM YYYY HH:mm:ss");
        }
    } catch (error) {
        console.error("Error Parsing Date:", ts);
    }
    return timestamp;
}


export function getArtifact(pipelineId, workflowId) {
    const URL = `${Routes.CI_CONFIG_GET}/${pipelineId}/artifacts/${workflowId}`;
    return get(URL).then((response) => {
        return response;
    })
}

export function getNodeStatus({appName, envName, version, namespace, group, kind, name}) {
    if (!group) group = '';
    return get(`api/v1/applications/${appName}-${envName}/resource?version=${version}&namespace=${namespace}&group=${group}&kind=${kind}&resourceName=${name}`)
}

export function fetchAppMetaInfo(appId: number | string, reloadTimeOut: number): Promise<AppMetaInfoResponse> {
    return get(`${Routes.APP_META_INFO}/${appId}`, {timeout: reloadTimeOut});
}