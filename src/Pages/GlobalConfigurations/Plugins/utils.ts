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
    ConditionDetails,
    ConditionType,
    InlineStepDetailType,
    PipelineFormType,
    PluginCreationType,
    PluginType,
    RefVariableType,
    ScriptType,
    StepType,
    VariableType,
} from '@devtron-labs/devtron-fe-common-lib'

import { CREATE_PLUGIN_DEFAULT_FORM } from '@Components/CIPipelineN/CreatePluginModal/constants'
import { CreatePluginFormType, CreatePluginFormViewType } from '@Components/CIPipelineN/CreatePluginModal/types'

import {
    CLONED_PLUGIN_NAME_SUFFIX,
    DEFAULT_PLUGIN_SCRIPT,
    getDefaultPluginStep,
    PLUGIN_TASK_STAGE_NAME,
    PluginListURLFilterKeys,
    PLUGINS_ROOT_URL,
} from './constants'
import {
    PluginFormMode,
    PluginListURLFiltersType,
    PluginStepConditionType,
    PluginStepDTO,
    PluginStepType,
    PluginVariableDTO,
    PluginVariableKind,
    PluginVersionDetailDTO,
} from './types'

const PLUGIN_CONDITION_TYPE_MAP: Record<PluginStepConditionType, ConditionType> = {
    [PluginStepConditionType.SKIP]: ConditionType.SKIP,
    [PluginStepConditionType.TRIGGER]: ConditionType.TRIGGER,
    [PluginStepConditionType.SUCCESS]: ConditionType.PASS,
    [PluginStepConditionType.FAIL]: ConditionType.FAIL,
}

export const getPluginVariableFromDTO = (variable: PluginVariableDTO): VariableType => ({
    id: variable.id,
    name: variable.name,
    format: variable.format,
    description: variable.description,
    defaultValue: variable.defaultValue,
    value: variable.value ?? '',
    allowEmptyValue: variable.allowEmptyValue,
    variableType: variable.valueType || RefVariableType.NEW,
    refVariableName: variable.referenceVariableName ?? '',
    refVariableStepIndex: variable.previousStepIndex ?? 0,
    variableStepIndexInPlugin: variable.variableStepIndexInPlugin,
    fileMountDir: variable.fileMountDir ?? '',
    fileReferenceId: variable.fileReferenceId,
    valueConstraint: variable.valueConstraint as VariableType['valueConstraint'],
    isRuntimeArg: !!variable.isRuntimeArg,
    refVariableUsed: false,
})

export const getConditionDetailsFromPluginVariables = (variables: PluginVariableDTO[]): ConditionDetails[] =>
    variables.flatMap((variable) =>
        (variable.pluginStepCondition ?? [])
            .filter((condition) => !condition.deleted)
            .map<ConditionDetails>((condition) => ({
                id: condition.id,
                conditionOnVariable: variable.name,
                conditionOperator: condition.conditionalOperator,
                conditionType: PLUGIN_CONDITION_TYPE_MAP[condition.conditionType],
                conditionalValue: condition.conditionalValue,
            })),
    )

/**
 * Returns the first inline step of the plugin version, since plugins created from the UI always have a single step
 */
export const getPluginInlineStep = (pluginVersionDetail: PluginVersionDetailDTO): PluginStepDTO | null =>
    pluginVersionDetail?.pluginSteps?.find((step) => step.stepType === PluginStepType.INLINE) ?? null

/**
 * Preset plugins are provided by Devtron, new versions can only be created for shared plugins
 */
export const getIsPresetPlugin = (pluginVersionDetail: PluginVersionDetailDTO): boolean =>
    (pluginVersionDetail?.parentPlugin?.type || pluginVersionDetail?.type) === PluginCreationType.PRESET

/**
 * Converts the plugin version detail into a custom (inline) task so that it can be edited using the task editor
 */
export const getStepFromPluginVersionDetail = (pluginVersionDetail: PluginVersionDetailDTO): StepType => {
    const defaultStep = getDefaultPluginStep()
    const pluginStep = getPluginInlineStep(pluginVersionDetail)

    if (!pluginStep) {
        return defaultStep
    }

    const { pluginPipelineScript: script } = pluginStep
    const stepVariables = pluginStep.pluginStepVariable ?? []
    const inputVariables = stepVariables.filter((variable) => variable.variableType === PluginVariableKind.INPUT)
    const outputVariables = stepVariables.filter((variable) => variable.variableType === PluginVariableKind.OUTPUT)
    const pathArgPortMapping = script?.pathArgPortMapping ?? []

    const commandArgsMap: InlineStepDetailType['commandArgsMap'] = pathArgPortMapping
        .filter((mapping) => mapping.typeOfMapping === 'DOCKER_ARG')
        .map(({ command, args }) => ({ command: command ?? '', args: args ?? [] }))

    const inlineStepDetail: InlineStepDetailType = {
        ...defaultStep.inlineStepDetail,
        scriptType: script?.type || ScriptType.SHELL,
        script: script?.script ?? DEFAULT_PLUGIN_SCRIPT,
        storeScriptAt: script?.storeScriptAt ?? '',
        dockerFileExists: !!script?.dockerfileExists,
        mountPath: script?.mountPath ?? '',
        mountCodeToContainer: !!script?.mountCodeToContainer,
        mountCodeToContainerPath: script?.mountCodeToContainerPath ?? '',
        mountDirectoryFromHost: !!script?.mountDirectoryFromHost,
        containerImagePath: script?.containerImagePath ?? '',
        imagePullSecret: script?.imagePullSecret ?? '',
        commandArgsMap: commandArgsMap.length ? commandArgsMap : defaultStep.inlineStepDetail.commandArgsMap,
        portMap: pathArgPortMapping
            .filter((mapping) => mapping.typeOfMapping === 'PORT')
            .map(({ portOnLocal, portOnContainer }) => ({ portOnLocal, portOnContainer })),
        mountPathMap: pathArgPortMapping
            .filter((mapping) => mapping.typeOfMapping === 'FILE_PATH')
            .map(({ filePathOnDisk, filePathOnContainer }) => ({
                filePathOnDisk: filePathOnDisk ?? '',
                filePathOnContainer: filePathOnContainer ?? '',
            })),
        inputVariables: inputVariables.map(getPluginVariableFromDTO),
        outputVariables: outputVariables.map(getPluginVariableFromDTO),
        conditionDetails: getConditionDetailsFromPluginVariables(stepVariables),
    }

    return {
        ...defaultStep,
        name: pluginStep.name || defaultStep.name,
        description: pluginStep.description ?? '',
        stepType: PluginType.INLINE,
        outputDirectoryPath: pluginStep.outputDirectoryPath ?? [],
        inlineStepDetail,
    }
}

/**
 * Returns the create plugin form prefilled from the given plugin version for clone / new version flows
 */
export const getPluginFormFromPluginVersionDetail = (
    pluginVersionDetail: PluginVersionDetailDTO,
    mode: PluginFormMode.CLONE | PluginFormMode.NEW_VERSION,
): CreatePluginFormType => {
    const { parentPlugin, name, icon, description, docLink, tags } = pluginVersionDetail
    const commonFormFields: Pick<CreatePluginFormType, 'description' | 'docLink' | 'tags' | 'pluginVersion'> = {
        description,
        docLink,
        tags: tags ?? [],
        pluginVersion: '',
    }

    if (mode === PluginFormMode.NEW_VERSION) {
        return {
            ...structuredClone(CREATE_PLUGIN_DEFAULT_FORM),
            ...commonFormFields,
            id: parentPlugin?.id ?? 0,
            name: parentPlugin?.name || name,
            icon: parentPlugin?.icon || icon || '',
            pluginIdentifier: parentPlugin?.pluginIdentifier ?? '',
            currentTab: CreatePluginFormViewType.EXISTING_PLUGIN,
        }
    }

    return {
        ...structuredClone(CREATE_PLUGIN_DEFAULT_FORM),
        ...commonFormFields,
        id: 0,
        name: `${parentPlugin?.name || name}${CLONED_PLUGIN_NAME_SUFFIX}`,
        icon: parentPlugin?.icon || icon || '',
        pluginIdentifier: '',
        currentTab: CreatePluginFormViewType.NEW_PLUGIN,
    }
}

export const parsePluginListSearchParams = (searchParams: URLSearchParams): PluginListURLFiltersType => ({
    [PluginListURLFilterKeys.TAG]: searchParams.getAll(PluginListURLFilterKeys.TAG),
})

export const getPluginDetailURL = (pluginVersionId: number | string) => `${PLUGINS_ROOT_URL}/${pluginVersionId}`

export const getPluginTaskFormData = (step: StepType): PipelineFormType => ({
    name: '',
    triggerType: '',
    [PLUGIN_TASK_STAGE_NAME]: { id: 0, steps: [step] },
})
