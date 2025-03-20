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
    MaterialType,
    Githost,
    ScriptType,
    PluginType,
    RefVariableType,
    PipelineBuildStageType,
    getModuleConfigured,
    ModuleNameMap,
    VariableTypeFormat,
    TriggerType,
    ChangeCIPayloadType,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes, SourceTypeMap, ViewType } from '../../config'
import { getSourceConfig, getWebhookDataMetaConfig } from '../../services/service'
import { CiPipelineSourceTypeBaseOptions } from '../CIPipelineN/ciPipeline.utils'
import { CIPipelineBuildType, PatchAction } from './types'
import { safeTrim } from '../../util/Util'

const emptyStepsData = () => {
    return { id: 0, steps: [] }
}

export function savePipeline(request, isRegexMaterial = false): Promise<any> {
    let url
    if (isRegexMaterial) {
        url = `${Routes.CI_PIPELINE_PATCH}/regex`
    } else {
        url = `${Routes.CI_PIPELINE_PATCH}`
    }
    return post(url, request)
}

export function getCIPipelineNameSuggestion(appId: string | number): Promise<any> {
    const URL = `app/pipeline/suggest/ci/${appId}`
    return get(URL)
}

export function getInitData(
    appId: string | number,
    includeWebhookData: boolean = false,
    isJobCard: boolean
): Promise<any> {
    return Promise.all([
        getCIPipelineNameSuggestion(appId),
        getPipelineMetaConfiguration(appId.toString(), includeWebhookData, true, isJobCard),
        getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
    ]).then(([pipelineNameRes, pipelineMetaConfig, { result: { enabled: isBlobStorageConfigured } }]) => {
        const scanEnabled =
            window._env_ && (window._env_.RECOMMEND_SECURITY_SCANNING || window._env_.FORCE_SECURITY_SCANNING)
        return {
            result: {
                form: {
                    name: !isJobCard ? pipelineNameRes.result : '',
                    args: [{ key: '', value: '' }],
                    materials: pipelineMetaConfig.result.materials,
                    gitHost: pipelineMetaConfig.result.gitHost,
                    webhookEvents: pipelineMetaConfig.result.webhookEvents,
                    ciPipelineSourceTypeOptions: pipelineMetaConfig.result.ciPipelineSourceTypeOptions,
                    webhookConditionList: pipelineMetaConfig.result.webhookConditionList,
                    triggerType: window._env_.DEFAULT_CI_TRIGGER_TYPE_MANUAL ? TriggerType.Manual : TriggerType.Auto,
                    beforeDockerBuildScripts: [],
                    afterDockerBuildScripts: [],
                    preBuildStage: emptyStepsData(),
                    postBuildStage: emptyStepsData(),
                    scanEnabled,
                    ciPipelineEditable: true,
                    workflowCacheConfig: pipelineMetaConfig.result.workflowCacheConfig ?? null
                },
                loadingData: false,
                isAdvanced: false,
                isBlobStorageConfigured,
            },
        }
    })
}

export function getCIPipeline(appId: string, ciPipelineId: string): Promise<any> {
    const URL = `${Routes.CI_CONFIG_GET}/${appId}/${ciPipelineId}`
    return get(URL)
}

function getPipelineBaseMetaConfiguration(
    appId: string,
    queryParams: Record<'pipelineType', CIPipelineBuildType.CI_BUILD | CIPipelineBuildType.CI_JOB>
): Promise<any> {
    return getSourceConfig(appId, queryParams).then((response) => {
        const materials = response?.result?.material?.map((mat) => {
            return {
                id: 0,
                gitMaterialId: mat.id,
                name: mat.name,
                type: CiPipelineSourceTypeBaseOptions[0].value,
                value: '',
                isSelected: true,
                gitMaterialName: mat.name,
                gitProviderId: mat.gitProviderId,
                gitHostId: 0,
            }
        })
        const _baseCiPipelineSourceTypeOptions = CiPipelineSourceTypeBaseOptions.map((obj) => ({ ...obj }))
        return {
            code: response.code,
            result: {
                materials,
                gitHost: undefined,
                webhookEvents: undefined,
                webhookConditionList: undefined,
                ciPipelineSourceTypeOptions: _baseCiPipelineSourceTypeOptions,
                workflowCacheConfig: response?.result?.workflowCacheConfig ?? null
            },
        }
    })
}

export function getPipelineMetaConfiguration(
    appId: string,
    includeWebhookData: boolean = false,
    isNewPipeline: boolean = true,
    isJobCard = false,
): Promise<any> {
    return getPipelineBaseMetaConfiguration(appId, {
        // NOTE: need to send pipelineType to get corresponding workflowCacheConfig;
        // this queryParam will be ignored in oss
        pipelineType: isJobCard ? CIPipelineBuildType.CI_JOB : CIPipelineBuildType.CI_BUILD
    }).then((baseResponse) => {
        // if webhook data is not to be included, or materials not found, or multigit new pipeline, then return
        const _materials = baseResponse.result.materials || []
        if (!includeWebhookData || _materials.length == 0 || (isNewPipeline && _materials.length > 1)) {
            return baseResponse
        }

        // if webhook data to include// assume first git material
        const _material = _materials[0]
        return getWebhookDataMetaConfig(_material.gitProviderId).then((_webhookDataMetaConfig) => {
            const _result = _webhookDataMetaConfig.result
            const _gitHostId = _result.gitHostId
            _material.gitHostId = _gitHostId

            // if git host Id is not set, then return
            if (!_gitHostId || _gitHostId == 0) {
                return baseResponse
            }

            baseResponse.result.gitHost = _result.gitHost
            baseResponse.result.webhookEvents = _result.webhookEvents || []

            baseResponse.result.webhookEvents.forEach((_webhookEvent) => {
                baseResponse.result.ciPipelineSourceTypeOptions.push({
                    label: _webhookEvent.name,
                    value: 'WEBHOOK',
                    isDisabled: false,
                    isSelected: false,
                    isWebhook: true,
                })
            })

            return baseResponse
        })
    })
}

export function getInitDataWithCIPipeline(
    appId: string,
    ciPipelineId: string,
    includeWebhookData: boolean = false,
): Promise<any> {
    return Promise.all([
        getCIPipeline(appId, ciPipelineId),
        // NOTE: isJobCard parameter does not matter in this case
        // isJobCard is only relevant to fetch workflowCacheConfig in meta config
        // by default BE will send global cache config for that pipelineType (JOB or CI_BUILD)
        getPipelineMetaConfiguration(appId, includeWebhookData, false, false),
        getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
    ]).then(([ciPipelineRes, pipelineMetaConfig, { result: { enabled: isBlobStorageConfigured } }]) => {
        const ciPipeline = ciPipelineRes?.result
        const pipelineMetaConfigResult = pipelineMetaConfig?.result
        return parseCIResponse(
            pipelineMetaConfig.code,
            ciPipeline,
            pipelineMetaConfigResult.materials,
            pipelineMetaConfigResult.gitHost,
            pipelineMetaConfigResult.webhookEvents,
            pipelineMetaConfigResult.ciPipelineSourceTypeOptions,
            isBlobStorageConfigured,
        )
    })
}

export function saveLinkedCIPipeline(
    parentCIPipeline,
    params: { name: string; appId: number; workflowId: number },
    changeCIPayload?: ChangeCIPayloadType,
) {
    delete parentCIPipeline['beforeDockerBuildScripts']
    delete parentCIPipeline['afterDockerBuildScripts']
    const request: any = {
        appId: changeCIPayload?.appId ?? params.appId,
        appWorkflowId: changeCIPayload?.appWorkflowId ?? params.workflowId,
        action: PatchAction.CREATE,
        ciPipeline: {
            ...parentCIPipeline,
            isExternal: true,
            name: params.name,
            ciPipelineName: parentCIPipeline.name,
            parentCiPipeline: parentCIPipeline.id,
            id: null,
        },
    }

    if (changeCIPayload?.switchFromCiPipelineId) {
        request.switchFromCiPipelineId = changeCIPayload.switchFromCiPipelineId
    } else if (changeCIPayload?.switchFromExternalCiPipelineId) {
        request.switchFromExternalCiPipelineId = changeCIPayload.switchFromExternalCiPipelineId
    }

    return savePipeline(request).then((response) => {
        const ciPipelineFromRes = response?.result?.ciPipelines[0]
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

export function saveCIPipeline(
    formData,
    ciPipeline,
    gitMaterials: MaterialType[],
    appId: number,
    workflowId: number,
    isExternalCI,
    webhookConditionList,
    ciPipelineSourceTypeOptions,
    changeCIPayload?: ChangeCIPayloadType,
) {
    const ci = createCIPatchRequest(ciPipeline, formData, isExternalCI, webhookConditionList)

    const request: any = {
        appId: changeCIPayload?.appId ?? appId,
        appWorkflowId: changeCIPayload?.appWorkflowId ?? workflowId,
        action: ciPipeline.id ? PatchAction.UPDATE_SOURCE : PatchAction.CREATE,
        ciPipeline: ci,
    }

    if (changeCIPayload?.switchFromCiPipelineId) {
        request.switchFromCiPipelineId = changeCIPayload.switchFromCiPipelineId
    } else if (changeCIPayload?.switchFromExternalCiPipelineId) {
        request.switchFromExternalCiPipelineId = changeCIPayload.switchFromExternalCiPipelineId
    }

    return savePipeline(request).then((response) => {
        const ciPipelineFromRes = response.result.ciPipelines[0]
        return parseCIResponse(
            response.code,
            ciPipelineFromRes,
            gitMaterials,
            undefined,
            undefined,
            ciPipelineSourceTypeOptions,
        )
    })
}

export function deleteCIPipeline(
    formData,
    ciPipeline,
    gitMaterials,
    appId: number,
    workflowId: number,
    isExternalCI: boolean,
    webhookConditionList,
) {
    const updatedCI = {
        id: ciPipeline.id,
        name: formData.name,
    }
    const request = {
        appId,
        appWorkflowId: workflowId,
        action: PatchAction.DELETE,
        ciPipeline: updatedCI,
    }
    return savePipeline(request).then((response) => {
        return parseCIResponse(
            response.code,
            response?.result?.ciPipelines[0],
            gitMaterials,
            undefined,
            undefined,
            undefined,
        )
    })
}

function createCIPatchRequest(ciPipeline, formData, isExternalCI: boolean, webhookConditionList) {
    formData = JSON.parse(JSON.stringify(formData))
    ciPipeline = JSON.parse(JSON.stringify(ciPipeline))
    const preBuildStage = formData.preBuildStage?.steps?.length > 0 ? formData.preBuildStage : {}
    const postBuildStage = formData.postBuildStage?.steps?.length > 0 ? formData.postBuildStage : {}
    const ci = {
        ...ciPipeline,
        id: ciPipeline.id,
        active: ciPipeline.active,
        externalCiConfig: ciPipeline.externalCiConfig,
        linkedCount: ciPipeline.linkedCount,
        isExternal: isExternalCI,
        isManual: formData.triggerType == TriggerType.Manual,
        ...(formData.workflowCacheConfig ? {
            workflowCacheConfig: formData.workflowCacheConfig,
        } : {}),
        ciMaterial: formData.materials
            .filter((mat) => mat.isSelected)
            .map((mat) => {
                let _value = mat.value
                if (mat.type === SourceTypeMap.BranchRegex) {
                    _value = ''
                } else if (mat.type === SourceTypeMap.WEBHOOK) {
                    const _condition = {}
                    webhookConditionList.forEach((webhookCondition) => {
                        _condition[webhookCondition.selectorId] = webhookCondition.value
                    })
                    const _eventId = getEventIdFromMaterialValue(_value)
                    _value = JSON.stringify({ eventId: _eventId, condition: _condition })
                }
                return {
                    gitMaterialId: mat.gitMaterialId,
                    id: mat.id,
                    source: {
                        type: mat.type,
                        value: safeTrim(_value),
                        regex: safeTrim(mat.regex),
                    },
                }
            }),
        name: formData.name,
        preBuildStage,
        postBuildStage,
        scanEnabled: formData.scanEnabled,
        dockerArgs: formData.args
            .filter((arg) => arg.key && arg.key.length && arg.value && arg.value.length)
            .reduce((agg, curr) => {
                agg[curr.key] = curr.value
                return agg
            }, {}),
        isDockerConfigOverridden: formData.isDockerConfigOverridden,
        dockerConfigOverride: formData.isDockerConfigOverridden ? formData.dockerConfigOverride : {},
        defaultTag: formData.defaultTag,
        customTag: {
            tagPattern: formData.customTag ? formData.customTag.tagPattern : '',
            counterX: formData.customTag ? +formData.customTag.counterX : 0,
        },
        enableCustomTag: formData.enableCustomTag,
    }
    return ci
}

function createMaterialList(ciPipeline, gitMaterials: MaterialType[], gitHost: Githost): MaterialType[] {
    let materials: MaterialType[] = []
    const ciMaterialSet = new Set()

    if (ciPipeline) {
        materials =
            ciPipeline.ciMaterial?.map((mat) => {
                ciMaterialSet.add(mat.gitMaterialId)
                return {
                    id: mat.id,
                    gitMaterialId: mat.gitMaterialId,
                    name: mat.gitMaterialName,
                    type: mat.source.type,
                    value: mat.source.value,
                    isSelected: true,
                    gitHostId: gitHost ? gitHost.id : 0,
                    regex: mat.source.regex,
                    isRegex: mat.isRegex,
                }
            }) || []
    }

    if (ciPipeline.parentCiPipeline) {
        return materials
    }

    for (let i = 0; i < gitMaterials?.length; i++) {
        const mat = gitMaterials[i]
        if (!ciMaterialSet.has(mat.gitMaterialId)) {
            materials.push({
                id: 0,
                gitMaterialId: mat.gitMaterialId,
                name: mat.name,
                type: CiPipelineSourceTypeBaseOptions[0].value,
                value: '',
                isSelected: true,
                gitHostId: mat.gitHostId,
                gitProviderId: mat.gitProviderId,
                isRegex: mat.isRegex,
            })
        }
    }
    return materials
}

function migrateOldData(
    oldDataArr: {
        id: number
        name: string
        outputLocation: string
        script: string
        isCollapsed: boolean
        index: number
    }[],
): PipelineBuildStageType {
    const commonFields = {
        value: '',
        format: VariableTypeFormat.STRING,
        description: '',
        defaultValue: '',
        variableType: RefVariableType.GLOBAL,
        refVariableStepIndex: 0,
        allowEmptyValue: false,
        fileMountDir: null,
        fileReferenceId: null,
        valueConstraintId: null,
        valueConstraint: null,
        isRuntimeArg: null,
        refVariableUsed: null,
    }

    const updatedData = {
        id: 0,
        steps: oldDataArr.map((data) => {
            return {
                id: data.id,
                name: data.name,
                description: '',
                triggerIfParentStageFail: false,
                outputDirectoryPath: [data.outputLocation],
                index: data.index,
                stepType: PluginType.INLINE,
                inlineStepDetail: {
                    scriptType: ScriptType.SHELL,
                    script: data.script,
                    conditionDetails: [],
                    outputDirectoryPath: [],
                    // Default variable introduced as these could be present in some old script
                    inputVariables: [
                        {
                            id: 4,
                            name: 'DOCKER_IMAGE',
                            refVariableName: 'DOCKER_IMAGE',
                            ...commonFields,
                        },
                        {
                            id: 3,
                            name: 'DOCKER_REGISTRY_URL',
                            refVariableName: 'DOCKER_REGISTRY_URL',
                            ...commonFields,
                        },
                        {
                            id: 2,
                            name: 'DOCKER_REPOSITORY',
                            refVariableName: 'DOCKER_REPOSITORY',
                            ...commonFields,
                        },
                        {
                            id: 1,
                            name: 'DOCKER_IMAGE_TAG',
                            refVariableName: 'DOCKER_IMAGE_TAG',
                            ...commonFields,
                        },
                    ],
                    outputVariables: [],
                },
            }
        }),
    }
    return updatedData
}

function parseCIResponse(
    responseCode: number,
    ciPipeline,
    gitMaterials,
    gitHost,
    webhookEvents,
    ciPipelineSourceTypeOptions,
    isBlobStorageConfigured?: boolean,
) {
    if (ciPipeline) {
        if (ciPipeline.beforeDockerBuildScripts) {
            ciPipeline.preBuildStage = migrateOldData(ciPipeline.beforeDockerBuildScripts)
        }
        if (ciPipeline.afterDockerBuildScripts) {
            ciPipeline.postBuildStage = migrateOldData(ciPipeline.afterDockerBuildScripts)
        }
        const materials = createMaterialList(ciPipeline, gitMaterials, gitHost)
        // do webhook event specific
        let _webhookConditionList = []
        if (webhookEvents && webhookEvents.length > 0) {
            // assume single git material
            const _material = materials[0]
            const _materialValue = _material.value

            if (_material.type == SourceTypeMap.WEBHOOK) {
                _webhookConditionList = createWebhookConditionList(_materialValue)

                const _eventId = getEventIdFromMaterialValue(_materialValue)
                const _webhookEvent = webhookEvents.find((i) => i.id === _eventId)
                ciPipelineSourceTypeOptions.forEach((_ciPipelineSourceTypeOption) => {
                    _ciPipelineSourceTypeOption.isSelected = _ciPipelineSourceTypeOption.label === _webhookEvent?.name
                })
            }
        }

        const keys = Object.keys(ciPipeline.dockerArgs)
        const args = keys.map((arg) => {
            return {
                key: arg,
                value: ciPipeline.dockerArgs[arg],
            }
        })

        return {
            code: responseCode,
            view: ViewType.FORM,
            showError: false,
            ciPipeline,
            form: {
                name: ciPipeline.name,
                triggerType: ciPipeline.isManual ? TriggerType.Manual : TriggerType.Auto,
                materials,
                args: args.length ? args : [],
                externalCiConfig: createCurlRequest(ciPipeline.externalCiConfig),
                scanEnabled: ciPipeline.scanEnabled,
                gitHost,
                webhookEvents,
                ciPipelineSourceTypeOptions,
                webhookConditionList: _webhookConditionList,
                ciPipelineEditable: true,
                preBuildStage: ciPipeline.preBuildStage || emptyStepsData(),
                postBuildStage: ciPipeline.postBuildStage || emptyStepsData(),
                isDockerConfigOverridden: ciPipeline.isDockerConfigOverridden,
                dockerConfigOverride: ciPipeline.isDockerConfigOverridden ? ciPipeline.dockerConfigOverride : {},
                isCITriggerBlocked: ciPipeline.isCITriggerBlocked,
                isOffendingMandatoryPlugin: ciPipeline.isOffendingMandatoryPlugin,
                defaultTag: ciPipeline.defaultTag,
                customTag: {
                    tagPattern: ciPipeline.customTag?.tagPattern || '',
                    counterX: +ciPipeline.customTag?.counterX || 0,
                },
                enableCustomTag: ciPipeline.enableCustomTag,
                workflowCacheConfig: ciPipeline.workflowCacheConfig ?? null,
            },
            loadingData: false,
            showPreBuild: ciPipeline.beforeDockerBuildScripts?.length > 0,
            showPostBuild: ciPipeline.afterDockerBuildScripts?.length > 0,
            isBlobStorageConfigured: isBlobStorageConfigured ?? false,
        }
    }
}

export function createWebhookConditionList(materialJsonValue: string) {
    let conditions = []
    if (!materialJsonValue) {
        conditions = []
        conditions.push({ selectorId: 0, value: '' })
        return conditions
    }

    const _materialValue = JSON.parse(materialJsonValue)
    const _selectedEventCondition = _materialValue.condition

    if (!_selectedEventCondition || Object.keys(_selectedEventCondition).length == 0) {
        conditions = []
        conditions.push({ selectorId: 0, value: '' })
        return conditions
    }

    // iterate in map
    Object.keys(_selectedEventCondition).forEach((_selectorId) => {
        conditions.push({ selectorId: _selectorId, value: _selectedEventCondition[_selectorId] })
    })

    return conditions
}

function getEventIdFromMaterialValue(materialJsonValue: string) {
    if (!materialJsonValue) {
        return 0
    }

    const _materialValue = JSON.parse(materialJsonValue)
    return _materialValue.eventId
}

function createCurlRequest(externalCiConfig): string {
    if (!externalCiConfig.webhookUrl || !externalCiConfig.payload || !externalCiConfig.accessKey) {
        return ''
    }

    const url = externalCiConfig.webhookUrl
    const json = externalCiConfig.payload
    const curl = `curl -X POST -H 'Content-type: application/json' --data '${json}' ${url}/${externalCiConfig.accessKey}`
    return curl
}
