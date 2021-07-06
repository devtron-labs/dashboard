import { Routes } from '../../config';
import { get, post } from '../../services/api';
import { TriggerType, ViewType } from '../../config';
import { PatchAction } from './types';
import { TagOptions } from './ciPipeline.util';
import { getSourceConfig, getGitProviderList, getGitHostList } from '../../services/service';
import { CiPipelineMonoGit } from './ciPipeline.data';
import { MaterialType } from './types';

export function savePipeline(request): Promise<any> {
    const URL = `${Routes.CI_PIPELINE}`;
    return post(URL, request);
}

export function getCIPipelineNameSuggestion(appId: string | number): Promise<any> {
    const URL = `app/pipeline/suggest/ci/${appId}`;
    return get(URL);
}

export function getInitData(appId: string | number): Promise<any> {
    return Promise.all([getCIPipelineNameSuggestion(appId), getSourceConfigParsed(appId)]).then(([pipelineNameRes, sourceConfigRes]) => {
        return {
            result: {
                form: {
                    name: pipelineNameRes.result,
                    args: [{ key: "", value: "" }],
                    materials: sourceConfigRes.result.materials,
                    triggerType: TriggerType.Auto,
                    beforeDockerBuildScripts: [],
                    afterDockerBuildScripts: [],
                    scanEnabled: false,
                },
                loadingData: false,
                isAdvanced: false,
            }
        }
    })
}

function getCIPipeline(appId: string, ciPipelineId: string): Promise<any> {
    const URL = `${Routes.CI_CONFIG_GET}/${appId}/${ciPipelineId}`;
    // return get(URL)
    return new Promise((resolve, reject) => {
        resolve({ ...CiPipelineMonoGit })
    })
}

export function getSourceConfigParsed(appId): Promise<any> {
    return Promise.all([getSourceConfig(appId), getGitProviderList(), getGitHostList()]).then(([sourceConfigRes, gitProvderRes, gitHostRes]) => {
        let materials: MaterialType = sourceConfigRes?.result?.material?.map((mat) => {
            let gitProvider = gitProvderRes.result?.find(gitProvider => gitProvider.id === mat.gitProviderId);
            return {
                id: 0,
                gitMaterialId: mat.id,
                name: mat.name,
                type: TagOptions[0].value,
                value: "",
                isSelected: true,
                gitMaterialName: mat.name,
                gitHostId: gitProvider.gitHostId,
                gitHostName: gitHostRes.result.find(gitHost => gitHost.id === gitProvider.gitHostId).name,
                gitProviderId: mat.gitProviderId,

            }
        });
        return {
            code: sourceConfigRes.code,
            result: {
                materials
            }
        }
    })
}

export function getInitDataWithCIPipeline(appId: string, ciPipelineId: string): Promise<any> {
    return Promise.all([getCIPipeline(appId, ciPipelineId), getSourceConfigParsed(appId)]).then(([ciPipelineRes, sourceConfigRes]) => {
        let ciPipeline = ciPipelineRes?.result;
        return parseCIResponse(sourceConfigRes.code, ciPipeline, sourceConfigRes.result.materials);
    })
}

export function saveLinkedCIPipeline(parentCIPipeline, params: { name: string, appId: number, workflowId: number }) {
    delete parentCIPipeline['beforeDockerBuildScripts'];
    delete parentCIPipeline['afterDockerBuildScripts'];
    let request = {
        appId: params.appId,
        appWorkflowId: params.workflowId,
        action: PatchAction.CREATE,
        ciPipeline: {
            ...parentCIPipeline,
            isExternal: true,
            name: params.name,
            ciPipelineName: parentCIPipeline.name,
            parentCiPipeline: parentCIPipeline.id,
            id: null,
        }
    }

    return savePipeline(request).then((response) => {
        let ciPipelineFromRes = response?.result?.ciPipelines[0];
        return {
            code: response.code,
            form: {
                parentCiPipeline: ciPipelineFromRes,
                foreignAppId: 0,
            },
            ciPipeline: ciPipelineFromRes,
        }
    })
}

export function saveCIPipeline(formData, ciPipeline, gitMaterials: MaterialType[], appId: number, workflowId: number, isExternalCI) {
    let ci = createCIPatchRequest(ciPipeline, formData, isExternalCI);
    let request = {
        appId: appId,
        appWorkflowId: workflowId,
        action: (ciPipeline.id) ? PatchAction.UPDATE_SOURCE : PatchAction.CREATE,
        ciPipeline: ci,
    }
    return savePipeline(request).then((response) => {
        let ciPipelineFromRes = response.result.ciPipelines[0];
        return parseCIResponse(response.code, ciPipelineFromRes, gitMaterials);
    })
}

export function deleteCIPipeline(formData, ciPipeline, gitMaterials, appId: number, workflowId: number, isExternalCI: boolean) {
    let ci = createCIPatchRequest(ciPipeline, formData, isExternalCI)
    let request = {
        appId: appId,
        appWorkflowId: workflowId,
        action: PatchAction.DELETE,
        ciPipeline: ci,
    }
    return savePipeline(request).then((response) => {
        return parseCIResponse(response.code, response?.result?.ciPipelines[0], gitMaterials)
    })
}

function formatStages(allStages): any[] {
    allStages = allStages.filter(stage => stage.name && stage.script);
    for (let i = 0; i < allStages.length; i++) {
        allStages[i].index = i + 1;
        if (!allStages[i].id) delete allStages[i].id;
        delete allStages[i].isCollapsed;
    }
    return allStages;
}

function createCIPatchRequest(ciPipeline, formData, isExternalCI: boolean) {
    formData = JSON.parse(JSON.stringify(formData))
    ciPipeline = JSON.parse(JSON.stringify(ciPipeline))
    let beforeDockerBuildScripts = formatStages(formData.beforeDockerBuildScripts || []);
    let afterDockerBuildScripts = formatStages(formData.afterDockerBuildScripts || []);
    let ci = {
        ...ciPipeline,
        id: ciPipeline.id,
        active: ciPipeline.active,
        externalCiConfig: ciPipeline.externalCiConfig,
        linkedCount: ciPipeline.linkedCount,
        isExternal: isExternalCI,
        isManual: formData.triggerType == TriggerType.Manual ? true : false,
        ciMaterial: formData.materials.filter(mat => mat.isSelected)
            .map(mat => {
                return {
                    gitMaterialId: mat.gitMaterialId,
                    id: mat.id,
                    source: { type: mat.type, value: mat.value }
                }
            }),
        name: formData.name,
        beforeDockerBuildScripts: beforeDockerBuildScripts,
        afterDockerBuildScripts: afterDockerBuildScripts,
        scanEnabled: formData.scanEnabled,
        dockerArgs: formData.args.filter(arg => arg.key && arg.key.length && arg.value && arg.value.length)
            .reduce((agg, curr) => {
                agg[curr.key] = curr.value
                return agg
            }, {}),
    }
    return ci;
}

function createMaterialList(ciPipeline, gitMaterials: MaterialType[]): MaterialType[] {
    let materials: MaterialType[] = [];
    let ciMaterialSet = new Set();
    if (ciPipeline) materials = ciPipeline.ciMaterial.map((mat) => {
        ciMaterialSet.add(mat.gitMaterialId);
        let gitM = gitMaterials.find(gm => gm.gitMaterialId === mat.gitMaterialId);
        return {
            id: mat.id,
            gitMaterialId: mat.gitMaterialId,
            name: mat.gitMaterialName,
            type: mat.source.type,
            value: mat.source.value,
            isSelected: true,
            gitHostId: gitM.gitHostId,
            gitHostName: gitM.gitHostName,
            gitProviderId: gitM.gitProviderId,
        }
    })

    if (!!ciPipeline.parentCiPipeline) return materials;

    for (let i = 0; i < gitMaterials.length; i++) {
        let mat = gitMaterials[i];
        if (!ciMaterialSet.has(mat.gitMaterialId)) {
            materials.push({
                id: 0,
                gitMaterialId: mat.gitMaterialId,
                name: mat.name,
                type: TagOptions[0].value,
                value: "",
                isSelected: true,
                gitHostId: mat.gitHostId,
                gitHostName: mat.gitHostName,
                gitProviderId: mat.gitProviderId,
            })
        }
    }
    return materials;
}

function parseCIResponse(responseCode: number, ciPipeline, gitMaterials: MaterialType[]) {

    if (ciPipeline) {
        if (!ciPipeline.beforeDockerBuildScripts) ciPipeline.beforeDockerBuildScripts = [];
        if (!ciPipeline.afterDockerBuildScripts) ciPipeline.afterDockerBuildScripts = [];
        let materials = createMaterialList(ciPipeline, gitMaterials);
        let keys = Object.keys(ciPipeline.dockerArgs);
        let args = keys.map((arg) => {
            return {
                key: arg,
                value: ciPipeline.dockerArgs[arg]
            }
        })
        return {
            code: responseCode,
            view: ViewType.FORM,
            showError: false,
            ciPipeline: ciPipeline,
            form: {
                name: ciPipeline.name,
                triggerType: ciPipeline.isManual ? TriggerType.Manual : TriggerType.Auto,
                materials: materials,
                args: args.length ? args : ciPipeline.parentCiPipeline ? [] : [{ key: "", value: "" }],
                beforeDockerBuildScripts: Array.isArray(ciPipeline.beforeDockerBuildScripts) ? ciPipeline.beforeDockerBuildScripts.map(d => ({ ...d, isCollapsed: true })) : [],
                afterDockerBuildScripts: Array.isArray(ciPipeline.afterDockerBuildScripts) ? ciPipeline.afterDockerBuildScripts.map(d => ({ ...d, isCollapsed: true })) : [],
                externalCiConfig: createCurlRequest(ciPipeline.externalCiConfig),
                scanEnabled: ciPipeline.scanEnabled,
            },
            loadingData: false,
            showPreBuild: ciPipeline.beforeDockerBuildScripts?.length > 0,
            showPostBuild: ciPipeline.afterDockerBuildScripts?.length > 0,
        };
    }
}

function createCurlRequest(externalCiConfig): string {
    if (!externalCiConfig.webhookUrl || !externalCiConfig.payload || !externalCiConfig.accessKey) return "";

    let url = externalCiConfig.webhookUrl;
    let json = externalCiConfig.payload;
    let curl = `curl -X POST -H 'Content-type: application/json' --data '${json}' ${url}/${externalCiConfig.accessKey}`;
    return curl;
}