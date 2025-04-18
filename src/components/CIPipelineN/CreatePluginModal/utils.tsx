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
    InlineStepDetailType,
    PluginImageContainer,
    SelectPickerOptionType,
    validateURL,
    ValidationResponseType,
    VariableType,
} from '@devtron-labs/devtron-fe-common-lib'

import { CREATE_PLUGIN_DEFAULT_FORM, MAX_TAG_LENGTH } from './constants'
import {
    CreatePluginFormType,
    CreatePluginPayloadPipelineScriptDTO,
    CreatePluginPayloadPluginStepVariableItemType,
    CreatePluginPayloadType,
    CreatePluginVariableType,
    GetCreatePluginPayloadParamsType,
    GetSelectPickerOptionsFromParentPluginListReturnType,
    ParentPluginListItemType,
    PathPortMappingType,
} from './types'

export const getDefaultPluginFormData = (currentInputVariables: VariableType[]): CreatePluginFormType => ({
    ...structuredClone(CREATE_PLUGIN_DEFAULT_FORM),
    inputVariables: currentInputVariables,
})

export const getIsTagValid = (tag: string): boolean => tag.length <= MAX_TAG_LENGTH

/**
 * Tag length can be maximum of 128 characters
 */
export const validateTags = (tags: string[]): ValidationResponseType => {
    const areTagsInvalid = tags.some((tag) => !getIsTagValid(tag))
    if (areTagsInvalid) {
        return {
            isValid: false,
            message: `Tag name should not exceed ${MAX_TAG_LENGTH} characters`,
        }
    }

    return {
        isValid: true,
    }
}

/**
 * Doc link can be empty or must be a valid URL
 */
export const validateDocumentationLink = (docLink: string): ValidationResponseType => {
    if (!docLink) {
        return {
            isValid: true,
        }
    }

    return validateURL(docLink)
}

const getCreatePluginPayloadPathArgPortMapping = (
    inlineStepDetail: InlineStepDetailType,
): CreatePluginPayloadPipelineScriptDTO['pathArgPortMapping'] => {
    if (!inlineStepDetail) {
        return []
    }

    const portMapList: CreatePluginPayloadPipelineScriptDTO['pathArgPortMapping'] =
        inlineStepDetail.portMap?.map((portMap) => ({
            typeOfMapping: PathPortMappingType.PORT,
            portOnContainer: portMap.portOnContainer,
            portOnLocal: portMap.portOnLocal,
        })) || []

    const filePathMapList: CreatePluginPayloadPipelineScriptDTO['pathArgPortMapping'] =
        inlineStepDetail.mountPathMap?.map((filePathMap) => ({
            typeOfMapping: PathPortMappingType.FILE_PATH,
            filePathOnDisk: filePathMap.filePathOnDisk,
            filePathOnContainer: filePathMap.filePathOnContainer,
        })) || []

    const dockerArgMapList: CreatePluginPayloadPipelineScriptDTO['pathArgPortMapping'] =
        inlineStepDetail.commandArgsMap?.map((commandArg) => ({
            typeOfMapping: PathPortMappingType.DOCKER_ARG,
            command: commandArg.command,
            args: commandArg.args,
        })) || []

    return portMapList.concat(filePathMapList).concat(dockerArgMapList)
}

const parseInputVariablesIntoCreatePluginPayload = (
    variableList: VariableType[],
    variableType: CreatePluginVariableType,
): CreatePluginPayloadPluginStepVariableItemType[] =>
    variableList?.map((variable) => ({
        id: variable.id,
        name: variable.name,
        format: variable.format,
        description: variable.description,
        allowEmptyValue: variable.allowEmptyValue,
        defaultValue: variable.defaultValue,
        value: variable.value,
        variableType,
        valueType: variable.variableType,
        referenceVariableName: variable.refVariableName,
        isExposed: true,
        fileMountDir: variable.fileMountDir,
        fileReferenceId: variable.fileReferenceId,
    })) || []

export const getCreatePluginPayload = ({
    stepData,
    pluginForm,
    availableTags = [],
}: GetCreatePluginPayloadParamsType): CreatePluginPayloadType => {
    const isCreateView = !pluginForm.id
    const availableTagsMap = availableTags.reduce(
        (acc, tag) => {
            acc[tag] = true
            return acc
        },
        {} as Record<string, boolean>,
    )

    const inlineStepDetail: InlineStepDetailType = stepData.inlineStepDetail || ({} as InlineStepDetailType)

    const pluginInputVariables = parseInputVariablesIntoCreatePluginPayload(
        pluginForm.inputVariables,
        CreatePluginVariableType.INPUT,
    )
    const pluginOutputVariables = parseInputVariablesIntoCreatePluginPayload(
        inlineStepDetail.outputVariables,
        CreatePluginVariableType.OUTPUT,
    )

    return {
        id: pluginForm.id || 0,
        name: isCreateView ? pluginForm.name : null,
        pluginIdentifier: isCreateView ? pluginForm.pluginIdentifier : null,
        icon: isCreateView ? pluginForm.icon : null,
        pluginVersions: {
            detailedPluginVersionData: [
                {
                    tags: pluginForm.tags,
                    description: pluginForm.description,
                    docLink: pluginForm.docLink,
                    pluginVersion: pluginForm.pluginVersion,
                    areNewTagsPresent: pluginForm.tags.some((tag) => !availableTagsMap[tag]),
                    pluginSteps: [
                        {
                            outputDirectoryPath: stepData.outputDirectoryPath,
                            name: stepData.name,
                            description: stepData.description,
                            pluginStepVariable: [...pluginInputVariables, ...pluginOutputVariables],
                            pluginPipelineScript: {
                                script: inlineStepDetail.script,
                                storeScriptAt: inlineStepDetail.storeScriptAt,
                                dockerFileExists: inlineStepDetail.dockerFileExists,
                                mountPath: inlineStepDetail.mountPath,
                                mountCodeToContainer: inlineStepDetail.mountCodeToContainer,
                                mountCodeToContainerPath: inlineStepDetail.mountCodeToContainerPath,
                                mountDirectoryFromHost: inlineStepDetail.mountDirectoryFromHost,
                                containerImagePath: inlineStepDetail.containerImagePath,
                                imagePullSecret: inlineStepDetail.imagePullSecret,
                                type: inlineStepDetail.scriptType,
                                pathArgPortMapping: getCreatePluginPayloadPathArgPortMapping(inlineStepDetail),
                            },
                        },
                    ],
                },
            ],
        },
    }
}

export const getSelectPickerOptionsFromParentPluginList = (
    parentPluginList: ParentPluginListItemType[],
    pluginName: string,
): GetSelectPickerOptionsFromParentPluginListReturnType =>
    parentPluginList?.reduce(
        (acc, plugin) => {
            const option: SelectPickerOptionType = {
                label: plugin.name,
                value: plugin.id,
                startIcon: (
                    <PluginImageContainer
                        fallbackImageClassName="icon-dim-24 p-2"
                        imageProps={{
                            src: plugin.icon,
                            alt: pluginName,
                            width: 20,
                            height: 20,
                            className: 'p-2 dc__no-shrink',
                        }}
                    />
                ),
            }

            acc.options.push(option)
            if (plugin.name === pluginName) {
                acc.selectedOption = option
            }

            return acc
        },
        { options: [] as SelectPickerOptionType[], selectedOption: null as SelectPickerOptionType | null },
    ) || { options: [], selectedOption: null }
