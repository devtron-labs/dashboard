import { Routes, SourceTypeMap, TriggerType, ViewType } from '../../config'
import { get, post } from '../../services/api'
import { getSourceConfig, getWebhookDataMetaConfig } from '../../services/service'
import { CiPipelineSourceTypeBaseOptions } from '../CIPipelineN/ciPipeline.utils'
import { MaterialType, Githost, PatchAction, ScriptType, PluginType, BuildStageType, RefVariableType } from './types'

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

export function getInitData(appId: string | number, includeWebhookData: boolean = false): Promise<any> {
    return Promise.all([
        getCIPipelineNameSuggestion(appId),
        getPipelineMetaConfiguration(appId.toString(), includeWebhookData, true),
    ]).then(([pipelineNameRes, pipelineMetaConfig]) => {
        const scanEnabled =
            window._env_ && (window._env_.RECOMMEND_SECURITY_SCANNING || window._env_.FORCE_SECURITY_SCANNING)
        return {
            result: {
                form: {
                    name: pipelineNameRes.result,
                    args: [{ key: '', value: '' }],
                    materials: pipelineMetaConfig.result.materials,
                    gitHost: pipelineMetaConfig.result.gitHost,
                    webhookEvents: pipelineMetaConfig.result.webhookEvents,
                    ciPipelineSourceTypeOptions: pipelineMetaConfig.result.ciPipelineSourceTypeOptions,
                    webhookConditionList: pipelineMetaConfig.result.webhookConditionList,
                    triggerType: TriggerType.Auto,
                    beforeDockerBuildScripts: [],
                    afterDockerBuildScripts: [],
                    preBuildStage: emptyStepsData(),
                    postBuildStage: emptyStepsData(),
                    scanEnabled: scanEnabled,
                    ciPipelineEditable: true,
                },
                loadingData: false,
                isAdvanced: false,
            },
        }
    })
}

export function getCIPipeline(appId: string, ciPipelineId: string): Promise<any> {
    const URL = `${Routes.CI_CONFIG_GET}/${appId}/${ciPipelineId}`
    return get(URL)
}

function getPipelineBaseMetaConfiguration(appId: string): Promise<any> {
    return getSourceConfig(appId).then((response) => {
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
                materials: materials,
                gitHost: undefined,
                webhookEvents: undefined,
                webhookConditionList: undefined,
                ciPipelineSourceTypeOptions: _baseCiPipelineSourceTypeOptions,
            },
        }
    })
}

export function getPipelineMetaConfiguration(
    appId: string,
    includeWebhookData: boolean = false,
    isNewPipeline: boolean = true,
): Promise<any> {
    return getPipelineBaseMetaConfiguration(appId).then((baseResponse) => {
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
        getPipelineMetaConfiguration(appId, includeWebhookData, false),
    ]).then(([ciPipelineRes, pipelineMetaConfig]) => {
        const ciPipeline = ciPipelineRes?.result
        const pipelineMetaConfigResult = pipelineMetaConfig?.result
        return parseCIResponse(
            pipelineMetaConfig.code,
            ciPipeline,
            pipelineMetaConfigResult.materials,
            pipelineMetaConfigResult.gitHost,
            pipelineMetaConfigResult.webhookEvents,
            pipelineMetaConfigResult.ciPipelineSourceTypeOptions,
        )
    })
}

export function saveLinkedCIPipeline(parentCIPipeline, params: { name: string; appId: number; workflowId: number }) {
    delete parentCIPipeline['beforeDockerBuildScripts']
    delete parentCIPipeline['afterDockerBuildScripts']
    const request = {
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
        },
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
) {
    const ci = createCIPatchRequest(ciPipeline, formData, isExternalCI, webhookConditionList)
    const request = {
        appId: appId,
        appWorkflowId: workflowId,
        action: ciPipeline.id ? PatchAction.UPDATE_SOURCE : PatchAction.CREATE,
        ciPipeline: ci,
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
    const ci = createCIPatchRequest(ciPipeline, formData, isExternalCI, webhookConditionList)
    const request = {
        appId: appId,
        appWorkflowId: workflowId,
        action: PatchAction.DELETE,
        ciPipeline: ci,
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
        isManual: formData.triggerType == TriggerType.Manual ? true : false,
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
                        value: _value,
                        regex: mat.regex,
                    },
                }
            }),
        name: formData.name,
        preBuildStage: preBuildStage,
        postBuildStage: postBuildStage,
        scanEnabled: formData.scanEnabled,
        dockerArgs: formData.args
            .filter((arg) => arg.key && arg.key.length && arg.value && arg.value.length)
            .reduce((agg, curr) => {
                agg[curr.key] = curr.value
                return agg
            }, {}),
    }
    return ci
}

function createMaterialList(ciPipeline, gitMaterials: MaterialType[], gitHost: Githost): MaterialType[] {
    let materials: MaterialType[] = []
    const ciMaterialSet = new Set()

    if (ciPipeline) {
        materials = ciPipeline.ciMaterial?.map((mat) => {
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

    for (let i = 0; i < gitMaterials.length; i++) {
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
): BuildStageType {
    const commonFields = {
        value: '',
        format: 'STRING',
        description: '',
        defaultValue: '',
        variableType: RefVariableType.GLOBAL,
        refVariableStepIndex: 0,
    }
    const updatedData = {
        id: 0,
        steps: oldDataArr.map((data) => {
            return {
                id: data.id,
                name: data.name,
                description: '',
                outputDirectoryPath: [data.outputLocation],
                index: data.index,
                stepType: PluginType.INLINE,
                inlineStepDetail: {
                    scriptType: ScriptType.SHELL,
                    script: data.script,
                    conditionDetails: [],
                    outputDirectoryPath: [],
                    //Default variable introduced as these could be present in some old script
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
) {
    if (ciPipeline) {
        if (ciPipeline.beforeDockerBuildScripts) {
            ciPipeline.preBuildStage = migrateOldData(ciPipeline.beforeDockerBuildScripts)
        }
        if (ciPipeline.afterDockerBuildScripts) {
            ciPipeline.postBuildStage = migrateOldData(ciPipeline.afterDockerBuildScripts)
        }
        const materials = createMaterialList(ciPipeline, gitMaterials, gitHost)

        let _isCiPipelineEditable = true
        if (materials.length > 1 && materials.some((_material) => _material.type == SourceTypeMap.WEBHOOK)) {
            _isCiPipelineEditable = false
        }

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
                    _ciPipelineSourceTypeOption.isSelected = _ciPipelineSourceTypeOption.label === _webhookEvent.name
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
            ciPipeline: ciPipeline,
            form: {
                name: ciPipeline.name,
                triggerType: ciPipeline.isManual ? TriggerType.Manual : TriggerType.Auto,
                materials: materials,
                args: args.length ? args : ciPipeline.parentCiPipeline ? [] : [{ key: '', value: '' }],
                externalCiConfig: createCurlRequest(ciPipeline.externalCiConfig),
                scanEnabled: ciPipeline.scanEnabled,
                gitHost: gitHost,
                webhookEvents: webhookEvents,
                ciPipelineSourceTypeOptions: ciPipelineSourceTypeOptions,
                webhookConditionList: _webhookConditionList,
                ciPipelineEditable: _isCiPipelineEditable,
                preBuildStage: ciPipeline.preBuildStage || emptyStepsData(),
                postBuildStage: ciPipeline.postBuildStage || emptyStepsData(),
            },
            loadingData: false,
            showPreBuild: ciPipeline.beforeDockerBuildScripts?.length > 0,
            showPostBuild: ciPipeline.afterDockerBuildScripts?.length > 0,
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

export function getPluginsData(appId: number): Promise<any> {
    return get(`${Routes.PLUGIN_LIST}?appId=${appId}`)
}

export function getPluginDetail(pluginID: number, appId: number): Promise<any> {
    return get(`${Routes.PLUGIN_DETAIL}/${pluginID}?appId=${appId}`)
}

export function getGlobalVariable(appId: number): Promise<any> {
    return get(`${Routes.GLOBAL_VARIABLES}?appId=${appId}`)
}
