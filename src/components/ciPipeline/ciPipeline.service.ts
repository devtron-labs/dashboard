import { Routes } from '../../config';
import { get, post } from '../../services/api';
import { TriggerType, ViewType, TagOptions } from '../../config';
import { PatchAction } from './types';
import { getSourceConfig } from '../../services/service';

export function savePipeline(request): Promise<any> {
    const URL = `${Routes.CI_PIPELINE}`;
    return post(URL, request);
}

export function getCIPipelineNameSuggestion(appId: string | number): Promise<any> {
    const URL = `app/pipeline/suggest/ci/${appId}`;
    return get(URL);
}

function getCIPipeline(appId: string, ciPipelineId: string): Promise<any> {
    const URL = `${Routes.CI_CONFIG_GET}/${appId}/${ciPipelineId}`;
    return get(URL)
}

export function getSourceConfigParsed(appId): Promise<any> {
    return getSourceConfig(appId).then((response) => {
        let materials = response?.result?.material?.map((mat) => {
            return {
                id: 0,
                gitMaterialId: mat.id,
                name: mat.name,
                type: TagOptions[0].value,
                value: "",
                isSelected: true
            }
        });
        let gitMaterials = response.result.material.map((mat) => {
            return {
                gitMaterialId: mat.id,
                materialName: mat.name,
            }
        });
        return {
            code: response.code,
            result: {
                materials,
                gitMaterials,
            }
        }
    })
}

export function getCIPipelineParsed(appId: string, ciPipelineId: string): Promise<any> {
    return Promise.all([getSourceConfig(appId), getCIPipeline(appId, ciPipelineId)]).then(([sourceConfigRes, ciPipelineRes]) => {
        let ciPipeline = ciPipelineRes?.result;
        let gitMaterials = sourceConfigRes?.result?.material || [];
        gitMaterials = gitMaterials.map((mat) => {
            return {
                gitMaterialId: mat.id,
                materialName: mat.name,
            }
        })
        return parseCIResponse(sourceConfigRes.code, ciPipeline, gitMaterials);
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

export function saveCIPipeline(formData, ciPipeline, gitMaterials: { gitMaterialId: number; materialName: string }[], appId: number, workflowId: number, isExternalCI) {
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

function createMaterialList(ciPipeline, gitMaterials: { gitMaterialId: number; materialName: string }[]) {
    let materials = [];
    let ciMaterialSet = new Set();
    if (ciPipeline) materials = ciPipeline.ciMaterial.map((mat) => {
        ciMaterialSet.add(mat.gitMaterialId);
        return {
            id: mat.id,
            gitMaterialId: mat.gitMaterialId,
            name: mat.gitMaterialName,
            type: mat.source.type,
            value: mat.source.value,
            isSelected: true
        }
    })

    if (!!ciPipeline.parentCiPipeline) return materials;

    for (let i = 0; i < gitMaterials.length; i++) {
        let mat = gitMaterials[i];
        if (!ciMaterialSet.has(mat.gitMaterialId)) {
            materials.push({
                id: 0,
                gitMaterialId: mat.gitMaterialId,
                name: mat.materialName,
                type: TagOptions[0].value,
                value: "",
                isSelected: true
            })
        }
    }
    return materials;
}

function parseCIResponse(responseCode: number, ciPipeline, gitMaterials: { gitMaterialId: number; materialName: string }[]) {

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
            gitMaterials,
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