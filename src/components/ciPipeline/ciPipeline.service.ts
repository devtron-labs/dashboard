import { Routes, SourceTypeMap } from '../../config';
import { get, post } from '../../services/api';
import { TriggerType, ViewType } from '../../config';
import { PatchAction } from './types';
import { CiPipelineSourceTypeBaseOptions } from './ciPipeline.util';
import { getSourceConfig, getWebhookDataMetaConfig } from '../../services/service';
import { MaterialType, Githost } from './types';

export function savePipeline(request): Promise<any> {
    const URL = `${Routes.CI_PIPELINE}`;
    return post(URL, request);
}

export function getCIPipelineNameSuggestion(appId: string | number): Promise<any> {
    const URL = `app/pipeline/suggest/ci/${appId}`;
    return get(URL);
}

export function getInitData(appId: string | number, includeWebhookData: boolean = false): Promise<any> {
    return Promise.all([getCIPipelineNameSuggestion(appId), getPipelineMetaConfiguration(appId.toString(), includeWebhookData, true)]).then(([pipelineNameRes, pipelineMetaConfig]) => {
        let scanEnabled = (window._env_ && (window._env_.RECOMMEND_SECURITY_SCANNING || window._env_.FORCE_SECURITY_SCANNING))
        return {
            result: {
                form: {
                    name: pipelineNameRes.result,
                    args: [{ key: "", value: "" }],
                    materials: pipelineMetaConfig.result.materials,
                    gitHost: pipelineMetaConfig.result.gitHost,
                    webhookEvents: pipelineMetaConfig.result.webhookEvents,
                    ciPipelineSourceTypeOptions: pipelineMetaConfig.result.ciPipelineSourceTypeOptions,
                    webhookConditionList: pipelineMetaConfig.result.webhookConditionList,
                    triggerType: TriggerType.Auto,
                    beforeDockerBuildScripts: [],
                    afterDockerBuildScripts: [],
                    scanEnabled: scanEnabled,
                    ciPipelineEditable: true
                },
                loadingData: false,
                isAdvanced: false,
            }
        }
    })
}

function getCIPipeline(appId: string, ciPipelineId: string): Promise<any> {
    const URL = `${Routes.CI_CONFIG_GET}/${appId}/${ciPipelineId}`;
    return get(URL)
}


function getPipelineBaseMetaConfiguration(appId: string): Promise<any> {
    return getSourceConfig(appId).then((response) => {
        let materials = response?.result?.material?.map((mat) => {
            return {
                id: 0,
                gitMaterialId: mat.id,
                name: mat.name,
                type: CiPipelineSourceTypeBaseOptions[0].value,
                value: "",
                isSelected: true,
                gitMaterialName: mat.name,
                gitProviderId: mat.gitProviderId,
                gitHostId: 0
            }
        });
        let _baseCiPipelineSourceTypeOptions = CiPipelineSourceTypeBaseOptions.map(obj => ({ ...obj }));;
        return {
            code: response.code,
            result: {
                materials: materials,
                gitHost: undefined,
                webhookEvents: undefined,
                webhookConditionList: undefined,
                ciPipelineSourceTypeOptions: _baseCiPipelineSourceTypeOptions
            }
        }
    })
}


export function getPipelineMetaConfiguration(appId: string, includeWebhookData: boolean = false, isNewPipeline: boolean = true ): Promise<any> {
    return getPipelineBaseMetaConfiguration(appId).then((baseResponse) => {
        // if webhook data is not to be included, or materials not found, or multigit new pipeline, then return
        let _materials = baseResponse.result.materials || []
        if (!includeWebhookData || _materials.length == 0 || (isNewPipeline && _materials.length > 1)) {
            return baseResponse;
        }

        // if webhook data to include// assume first git material
        let _material = _materials[0];
        return getWebhookDataMetaConfig(_material.gitProviderId).then((_webhookDataMetaConfig) => {
            let _result = _webhookDataMetaConfig.result;
            let _gitHostId = _result.gitHostId;
            _material.gitHostId = _gitHostId;

            // if git host Id is not set, then return
            if (!_gitHostId || _gitHostId == 0) {
                return baseResponse;
            }

            baseResponse.result.gitHost = _result.gitHost;
            baseResponse.result.webhookEvents = _result.webhookEvents || [];

            baseResponse.result.webhookEvents.forEach((_webhookEvent) => {
                baseResponse.result.ciPipelineSourceTypeOptions.push({ label: _webhookEvent.name, value: 'WEBHOOK', isDisabled: false, isSelected: false, isWebhook: true });
            });

            return baseResponse;

        })
    })

}


export function getInitDataWithCIPipeline(appId: string, ciPipelineId: string, includeWebhookData: boolean = false): Promise<any> {
    return Promise.all([getCIPipeline(appId, ciPipelineId), getPipelineMetaConfiguration(appId, includeWebhookData, false)]).then(([ciPipelineRes, pipelineMetaConfig]) => {
        let ciPipeline = ciPipelineRes?.result;
        let pipelineMetaConfigResult = pipelineMetaConfig?.result;
        return parseCIResponse(pipelineMetaConfig.code, ciPipeline, pipelineMetaConfigResult.materials,
            pipelineMetaConfigResult.gitHost, pipelineMetaConfigResult.webhookEvents, pipelineMetaConfigResult.ciPipelineSourceTypeOptions);
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

export function saveCIPipeline(formData, ciPipeline, gitMaterials: MaterialType[], appId: number, workflowId: number, isExternalCI, webhookConditionList, ciPipelineSourceTypeOptions) {
    let ci = createCIPatchRequest(ciPipeline, formData, isExternalCI, webhookConditionList);
    let request = {
        appId: appId,
        appWorkflowId: workflowId,
        action: (ciPipeline.id) ? PatchAction.UPDATE_SOURCE : PatchAction.CREATE,
        ciPipeline: ci,
    }
    return savePipeline(request).then((response) => {
        let ciPipelineFromRes = response.result.ciPipelines[0];
        return parseCIResponse(response.code, ciPipelineFromRes, gitMaterials, undefined, undefined, ciPipelineSourceTypeOptions);
    })
}

export function deleteCIPipeline(formData, ciPipeline, gitMaterials, appId: number, workflowId: number, isExternalCI: boolean, webhookConditionList) {
    let ci = createCIPatchRequest(ciPipeline, formData, isExternalCI, webhookConditionList)
    let request = {
        appId: appId,
        appWorkflowId: workflowId,
        action: PatchAction.DELETE,
        ciPipeline: ci,
    }
    return savePipeline(request).then((response) => {
        return parseCIResponse(response.code, response?.result?.ciPipelines[0], gitMaterials, undefined, undefined, undefined)
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

function createCIPatchRequest(ciPipeline, formData, isExternalCI: boolean, webhookConditionList) {
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
                let _value = mat.value;
                if (mat.type === SourceTypeMap.WEBHOOK) {
                    let _condition = {};
                    webhookConditionList.forEach((webhookCondition) => {
                        _condition[webhookCondition.selectorId] = webhookCondition.value;
                    })
                    let _eventId = getEventIdFromMaterialValue(_value);
                    _value = JSON.stringify({ eventId: _eventId, condition: _condition });
                }
                return {
                    gitMaterialId: mat.gitMaterialId,
                    id: mat.id,
                    source: {
                        type: mat.type,
                        value: _value,
                    }
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

function createMaterialList(ciPipeline, gitMaterials: MaterialType[], gitHost: Githost): MaterialType[] {
    let materials: MaterialType[] = [];
    let ciMaterialSet = new Set();
    if (ciPipeline) materials = ciPipeline.ciMaterial.map((mat) => {
        ciMaterialSet.add(mat.gitMaterialId);
        return {
            id: mat.id,
            gitMaterialId: mat.gitMaterialId,
            name: mat.gitMaterialName,
            type: mat.source.type,
            value: mat.source.value,
            isSelected: true,
            gitHostId: gitHost ? gitHost.id : 0,
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
                type: CiPipelineSourceTypeBaseOptions[0].value,
                value: "",
                isSelected: true,
                gitHostId: mat.gitHostId,
                gitProviderId: mat.gitProviderId
            })
        }
    }
    return materials;
}

function parseCIResponse(responseCode: number, ciPipeline, gitMaterials, gitHost, webhookEvents, ciPipelineSourceTypeOptions) {

    if (ciPipeline) {
        if (!ciPipeline.beforeDockerBuildScripts) ciPipeline.beforeDockerBuildScripts = [];
        if (!ciPipeline.afterDockerBuildScripts) ciPipeline.afterDockerBuildScripts = [];
        let materials = createMaterialList(ciPipeline, gitMaterials, gitHost);

        let _isCiPipelineEditable = true;
        if(materials.length > 1 && materials.some(_material => _material.type == SourceTypeMap.WEBHOOK)){
            _isCiPipelineEditable = false;
        }

        // do webhook event specific
        let _webhookConditionList = [];
        if (webhookEvents && webhookEvents.length > 0) {
            // assume single git material
            let _material = materials[0];
            let _materialValue = _material.value;

            if (_material.type == SourceTypeMap.WEBHOOK) {
                _webhookConditionList = createWebhookConditionList(_materialValue);

                let _eventId = getEventIdFromMaterialValue(_materialValue);
                let _webhookEvent = webhookEvents.find(i => i.id === _eventId);
                ciPipelineSourceTypeOptions.forEach((_ciPipelineSourceTypeOption) => {
                    _ciPipelineSourceTypeOption.isSelected = (_ciPipelineSourceTypeOption.label === _webhookEvent.name);
                })
            }
        }

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
                gitHost: gitHost,
                webhookEvents: webhookEvents,
                ciPipelineSourceTypeOptions: ciPipelineSourceTypeOptions,
                webhookConditionList: _webhookConditionList,
                ciPipelineEditable : _isCiPipelineEditable
            },
            loadingData: false,
            showPreBuild: ciPipeline.beforeDockerBuildScripts?.length > 0,
            showPostBuild: ciPipeline.afterDockerBuildScripts?.length > 0,
        };
    }
}

export function createWebhookConditionList(materialJsonValue: string) {
    let conditions = [];
    if (!materialJsonValue) {
        conditions = [];
        conditions.push({ "selectorId": 0, "value": "" })
        return conditions;
    }

    let _materialValue = JSON.parse(materialJsonValue);
    let _selectedEventId = _materialValue.eventId;
    let _selectedEventCondition = _materialValue.condition;

    if (!_selectedEventCondition || Object.keys(_selectedEventCondition).length == 0) {
        conditions = [];
        conditions.push({ "selectorId": 0, "value": "" })
        return conditions;
    }

    // iterate in map
    Object.keys(_selectedEventCondition).forEach((_selectorId) => {
        conditions.push({ "selectorId": _selectorId, "value": _selectedEventCondition[_selectorId] });
    })

    return conditions;
}

function getEventIdFromMaterialValue(materialJsonValue: string) {
    if (!materialJsonValue) {
        return 0;
    }

    let _materialValue = JSON.parse(materialJsonValue);
    return _materialValue.eventId;
}

function createCurlRequest(externalCiConfig): string {
    if (!externalCiConfig.webhookUrl || !externalCiConfig.payload || !externalCiConfig.accessKey) return "";

    let url = externalCiConfig.webhookUrl;
    let json = externalCiConfig.payload;
    let curl = `curl -X POST -H 'Content-type: application/json' --data '${json}' ${url}/${externalCiConfig.accessKey}`;
    return curl;
}
